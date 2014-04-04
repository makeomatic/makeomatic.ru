title: Последовательная асинхронная инициализация AngularJS приложений с использованием промисов
date: 2014-04-04
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
tags: [AngularJS, Javascript]
---

AngularJS помогает загружать ваше приложение путем внедрения зависимостей, основываясь на упорядоченном создании экземпляров классов. Тем не менее, иногда вам нужно знать завершился ли один из текущих запросов или вызовов функций для того, чтобы инициализировать ваши контроллеры, `$scope` или сервисы. Эта статья описывает наше решение, которое разбивает жизненный цикл приложения на несколько фраз, названных “instantiation” (начальное создание экземпляров классов), “initialization” (их инициализация) и “running” (работающий режим). Вы можете найти в GitHub загрузочный код и работающую в jsfiddle демо версию.

<!-- more -->
### Наивная реализация

Пример внизу демонстрируюет как вы даете Angularjs внедрять другие сервисы в ваш контроллер или сервис:
```js
myModule.service('myService', function() {
   this.getOptions = function() {
       return [{name:'entry1', value:0},
               {name:'entry2', value:1}];
   };
});
myModule.controller('simpleController', function($scope, myService) {
   $scope.options = myService.getOptions();
   $scope.selectedOption = $scope.options[0];
});
```
Вы видите `simpleController`, использующий некоторые переменные, переданные из `myService`. Реализация `getOptions` возвращает статичный список строк, который в конце концов используется в контроллере, для конфигурирования его `$scope`.
Теперь давайте предположим что мы не можем просто вернуть статичный список строк, но нам нужно выполнить http-вызов к бекэнду. В добавление к запросу, давайте добавим `$watch` к `selectedOption`, так как он привязан к выпадающему меню и мы хотим обрабатывать любое нажатие пользователя, приводящего к изменению текущего состояния (посмотрите  [jsfiddle demo 1](http://jsfiddle.net/gesellix/r2xWm/))


```js
var myModule = angular.module('myModule', []);
myModule.service('myService', function($http) {
   this.getOptions = function() {
       return $http({
           "method": "get",
           "url": 'http://www.example.com/echo/json/'
       });
   };
});
myModule.controller('simpleController', function($scope, myService) {
   $scope.selectedOption = null;
   $scope.options = [];
   myService.getOptions().then(function(result) {
       $scope.options = result.data.options;
       $scope.selectedOption = 0;
   });
   $scope.$watch('selectedOption', function(newValue, oldValue) {
       // handle selection change ...
       console.log("selection: " + $scope.selectedOption);
   });
});
```

При запуске кода вы дважды заметите вызов `console.log`. Первый вывод в лог был вызван Ангуляром из-за добавления `$watch`, второй вывод запущен успешно отработанным промисом, когда мы присваиваем `selectedOption` ноль.  Обе записи в лог иллюстрируют ситуацию, в которой не пользователь кликнул на что-то,  а само приложение внесло изменение в течение фазы загрузки. Пример всего лишь логирует информацию в консоль, но вы, конечно, будете реализовывать более сложную логику и можете предпочесть, чтобы вас уведомляли только когда сам пользователь менял какие-либо значения. Код добавляющий `$watch` на `selectedOption`, можно переместить внутрь обработчика успешного промиса, но один из триггеров все еще будет срабатывать, поэтому такой подход не является оптимальным решением.

Вы можете представить, что добавление большего количества сервисов в дерево зависимостей и добавление большего количества `$watche`s или слушателей событий все еще ухудшает. Пример сверху не имеет значительных проблем, но у нас есть большее и более сложное приложение с большим количеством зависимостей в течение его жизненного цикла и некоторых предположений о валидном состоянии в $scope.


### Реализация с учетом стадии инициализации

Мы пришли к ситуации, которая показала, что всего лишь одно добавление  `$watch`es  в одном месте запустило поток несвоевременных действий в различных частях вашего приложения, что не позволило вашим контроллерам или сервисам правильно инициализироваться. Эти события необходимо было или отфильтровать или отключать на такой ранней фазе. Мы предпочли не создавать полную машину состояний или использовать фреймворк, имеющий ее в своем ядре, потому что мы рассматриваем нашу фазу инициализации лишь как маленькую частью нашего жизненного цикла приложения - не говоря о том, что ее влияние является не таким значительным.
Наш подход заключался в том, что мы разрешили контроллерам объявлять их задачи для инициализации и решили создать сервис, который будет координировать каждый из этих задач. Более того, нам не нравятся `$watch` триггеры при их инициализации,  так что мы решили избавиться и от них.
Пример внизу показывает контроллер с выделенным местом для инициализирующего кода:

```js
var myModule = angular.module('myModule', []);
myModule.service('myService', function($http) {
   this.getOptions = function() {
       return $http({
           "method": "get",
           "url": 'http://www.example.com/echo/json/'
       });
   };
});
myModule.controller('simpleController', function($scope, myService, init) {
   $scope.selectedOption = null;
   $scope.options = [];
   init('simpleController', [myService.getOptions()], function(result) {
       $scope.options = result.data.options;
       $scope.selectedOption = 0;
   });
   init.watchAfterInit($scope, 'selectedOption', function(newValue, oldValue) {
       // handle selection change ...
       console.log("selection: " + $scope.selectedOption);
   });
});
```

Код не сильно отличается от исходного примера, потому что самая важная часть спрятана в `init` сервисе, который был введен как новая зависимость. Мы изменили вызов к `myService.getOptions()` так, что init сервис может решать когда доставить результат вызова к бекэнду в `simpleController`. Кроме того мы завернули вызов $watch так, что init  сервис тоже мог решать какие $watch триггеры могут поступить в `callback` функцию `simpleController`.


### Сервис инициализации в AngularJS
Нас нужно, чтобы и `$watch`, и  `$on` оказались инкапсулированы `init` сервисом. Вот как выглядит наша текущая реализация:
```js
.factory('init', function () {
  var initialized = false;
  var init = function () {
    // ...
  };
  init.watchAfterInit = function (scope, expression, listener, deepEqual) {
    scope.$watch(expression, function (newValue, oldValue, listenerScope) {
      if (initialized) {
        listener(newValue, oldValue, listenerScope);
      }
    }, deepEqual);
  };
  init.onAfterInit = function (scope, event, listener) {
    scope.$on(event, function (event) {
      if (initialized) {
        listener(event);
      }
    });
  };
  return  init;
});
```

