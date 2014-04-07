title: Последовательная асинхронная инициализация AngularJS приложений с использованием промисов
date: 2014-04-04
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
tags: [AngularJS, Javascript]
---


![Иллюстрация блокнота](/blog/images/Initialization.jpg)

AngularJS помогает загружать ваше приложение путем внедрения зависимостей, основываясь на упорядоченном создании экземпляров классов. Тем не менее, иногда вам нужно знать завершился ли один из текущих запросов или вызовов функций для того, чтобы инициализировать ваши контроллеры, `$scope` или сервисы. Эта статья описывает наше решение, которое разбивает жизненный цикл приложения на несколько фраз, названных “instantiation” (начальное создание экземпляров классов), “initialization” (их инициализация) и “running” (работающий режим). Вы можете найти в GitHub загрузочный код и работающую в jsfiddle демо версию.

<!-- more -->
### Наивная реализация

Пример внизу демонстрирует как вы даете Angularjs внедрять другие сервисы в ваш контроллер или сервис:
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

Вы можете представить, что добавление большего количества сервисов в дерево зависимостей и добавление большего количества `$watches` или слушателей событий все еще ухудшает. Пример сверху не имеет значительных проблем, но у нас есть большее и более сложное приложение с большим количеством зависимостей в течение его жизненного цикла и некоторых предположений о валидном состоянии в $scope.


### Реализация с учетом стадии инициализации

Мы пришли к ситуации, которая показала, что всего лишь одно добавление `$watches` в одном месте запустило поток несвоевременных действий в различных частях вашего приложения, что не позволило вашим контроллерам или сервисам правильно инициализироваться. Эти события необходимо было или отфильтровать или отключать на такой ранней фазе. Мы предпочли не создавать полную машину состояний или использовать фреймворк, имеющий ее в своем ядре, потому что мы рассматриваем нашу фазу инициализации лишь как маленькую частью нашего жизненного цикла приложения - не говоря о том, что ее влияние является не таким значительным.
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

Нам нужно, чтобы и `$watch`, и `$on` оказались инкапсулированы `init` сервисом. Вот как выглядит наша текущая реализация:
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

Обе функции `watchAfterInit` и `onAfterInit` отделены от остальной части сервиса инициализации, кроме флага `initialized`, который отвечает за состояние сервиса инициализации.
Функция `AfterInit` решает две проблемы, упомянутые выше: 

1. не пропускает начальный триггер $watch, см [AngularJS docs](http://docs.angularjs.org/api/ng.$rootScope.Scope#$watch)
2. не публикует события и триггеры $watch до полного завершения начальной инициализации приложения 
В добавок к функции `AfterInit`, сервис инициализации управляет несколькими сервисами, где сконфигурирована функция `init (...)`. В примере сверху мы добавили функцию инициализации к `simpleController`, которая реализована как показано ниже. Вы можете найти сравнение первой демо версии и новой реализации в [jsfiddle demo 2](http://jsfiddle.net/gesellix/xxKjw/).

```javascript
.factory('init', function ($q, $rootScope, $browser) {
 var initFunctions = [
   'simpleController',
   'anotherController',
   'thirdController'
 ];
 var registeredInitFunctions = {};
 var initialized = false;
 var initApplication = function () {
   var simpleController = registeredInitFunctions['simpleController'];
   var anotherController = registeredInitFunctions['anotherController'];
   var thirdController = registeredInitFunctions['thirdController'];
   var broadcastAppInitialized = function () {
     $browser.defer(function () {
       initialized = true;
       $rootScope.$apply(function () {
         $rootScope.$broadcast('appInitialized');
       });
     });
   };
   simpleController.init()
     .then(anotherController.init)
     .then(thirdController.init)
     .then(broadcastAppInitialized);
 };
 $rootScope.$on('$routeChangeStart', function () {
   registeredInitFunctions = {};
   initialized = false;
 });
 var initAppWhenReady = function () {
   var registeredInitFunctionNames = _.keys(registeredInitFunctions);
   var isRegistered = _.partial(_.contains, registeredInitFunctionNames);
   if (_.every(initFunctions, isRegistered)) {
     initApplication();
     registeredInitFunctions = null;
   }
 };
 var init = function (name, dependencies, initCallback) {
   registeredInitFunctions[name] = {
     init: function () {
       var internalDependencies = $q.all(dependencies);
       return internalDependencies.then(initCallback);
     }};
   initAppWhenReady();
 };
 init.watchAfterInit = function (scope, expression, listener, deepEqual) {
   // ...
 };
 init.onAfterInit = function (scope, event, listener) {
   // ...
 };
 return  init;
});
```
Чтобы показать вам как согласовать более сложную структуру, мы объявили два дополнительных контроллера `anotherController` и `thirdController`, но базовая идея не зависит от количества инициализированных контроллеров или сервисов.

### Как это работает

Наш сервис инициализации по существу должен решить когда переключить флаг `initialized` на `true`. Существует несколько ступеней, необходимых для достижения запущенного состояния:

1. все `initFunctions` нужно зарегистрировать через init(...)
2. как только все initFunctions зарегистрированы, `initAppWhenReady()` вызывает функцию инициализации `initApplication()`
3. `initApplication()` вызывает каждую `initFunction` в указанном порядке. Используя промисы, она ждет, чтобы каждая `initFunction` завершилась, прежде чем вызвать следующую `initFunction`
4. Наконец,  вызывается `broadcastAppInitialized()`

Первый шаг преобразовывает каждый init(…) вызова путем обертывания возвращаемого значения зависимости (которая, как ожидается, является промисом) в `$q.all(…)` и делает так, что initCallback вызывается только после того, как все промисы будут исполнены. Таким образом, сервис инициализации генерирует функции инициализации и запоминает их во внутреннем объекте `registeredInitFunctions`.

`initAppWhenReady()` проверяется при каждом добавлении к `registeredInitFunctions`, были ли собраны все ожидаемые initFunctions. Ожидаемые initFunctions объявляются во внутреннем списке и будут изменяемой частью сервиса инициализации.


`initApplication()` знает порядок вызовов к `initFunction`, и может получить доступ к каждой зарегистрированной `initFunction` и вызвать их по порядку. Используя промисы, нет необходимости создавать дополнительные коллбэки и код может быть написан в виде простой цепи.


Последняя ступень в цепи переключает `initialized` флаг, так, что будущие события и $watch триггеры не будут скрываться сервисом инициализации. Более того, сервис распространяет событие `appInitialized` таким образом, что другие части нашего приложения могут среагировать на завершение фазы инициализации как можно скорее. Вы заметите `$browser.defer(...)` вокруг вызовов переключения и бродкаста флага. Чтобы понять причины, вам нужно знать об AngularJS [$digest loop](http://docs.angularjs.org/guide/scope#what-are-scopes_integration-with-the-browser-event-loop). Используя `$browser.defer`, мы даем циклу $digest закончиться и поставить в очередь наш завершающий шаг после всех текущих задач. Таким образом мы препятствуем нашему сервису инициализации опубликовывать события `$watch/$on` слишком рано. Так как `$browser.defer` не вызывает нашу функцию обратного вызова во время `$digest` цикла, нам нужно компенсировать это обертыванием `$broadcast()` в вызов `$rootScope.$apply()`. 

###Выводы

После того, как мы явным образом подумали о разделении жизненного цикла приложения на несколько фаз, мы получили более полное представление о том, как интегрироваться с AngularJS и его стандартным жизненным циклом. Наши тесты были улучшены с помощью тестирования инициализации (где это было возможно) и нормальным взаимодействием в выделенных контекстах.
Сервис инициализации совсем не заметен для обычных сервисов и контроллеров. Только когда необходимо, любой контроллер может быть добавлен в цепь инициализации. Как только инициализация завершена, сервис инициализации становится пассивным. Только во время изменений $route и перезапусков контроллеров, сервис инициализации должен быть сброшен, что решается реагированием на `$routeChangeStart` событие.  
Хранение текущего состояния внутри сервиса инициализации может считаться плохим решением, но так как все сервисы AngularJS спроектированы как синглтоны и Javascript - однопоточен, в данный момент у нас нет никаких проблем. 


