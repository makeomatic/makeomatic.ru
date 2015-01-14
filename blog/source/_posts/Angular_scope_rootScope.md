title: Разбираемся с системой событий $emit, $broadcast и $on в $scope и $rootScope Ангуляра
date: 2014-10-07
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
cover: http://makeomatic.ru/blog/images/angular_scope.png
coverWidth: 623
coverHeight: 416
url: hhttps://makeomatic.ru/blog/2014/07/10/Angular_scope_rootScope/
tags: [Javascript, AngularJS]
---
![Иллюстрация блокнота](/blog/images/angular_scope.png)

$emit, $broadcast и $on Ангуляра попадают под общий концепт "publish/subscribe", так же называемый “могу сделать”, в которой вы публикуете событие и подписываетесь/отписываетесь от него еще где-то. Система событий в AngularJS великолепна, что делает вещи безупречными и легкими в исполнении (как и следовало ожидать!), но концепт, который стоит за этой простотой не так легок для освоения в совершенстве, поэтому очень часто у вас будет возникать недоумение по поводу того, почему все работает не так, как вы думаете.
<!-- more -->

Для тех, кому работа с Ангуляром в новинку, и кто не использовал или не видел `$emit`, `$broadcast`или `$on`, поясним, что они делают, перед тем, как мы рассмотрим `$scope` и `$rootScope`отношения событий, областей видимости и того, как корректно применить данную систему событий, а так же поймем, что же действительно происходит.

###$scope.$emit вверх, $scope.$broadcast вниз
Используя `$scope.$emit`- событие запускается вверх по области видимости. Используя `$scope.$broadcast`- событие запускается вниз по области видимости. Когда мы используем `$scope.$on` - мы “подписываемся” на прослушивание данных событий. Быстрый пример:

```js
// запускаем событие вверх
$scope.$emit('myCustomEvent', 'Data to send');

// запускаем событие вниз
$scope.$broadcast('myCustomEvent', {
  someProp: 'Sending you an Object!' // посылайте что хотите
});

// слушаем событие в нужном нам $scope
$scope.$on('myCustomEvent', function (event, data) {
  console.log(data); // Данные, которые нам прислали
});
```

###$scope.($emit/$broadcast)
Ключевой момент для запоминания при использовании `$scope` для запуска ваших событий - это то, что они будут коммуницировать только с непосредственной родительской областью видимости или с ближайшими потомками! При этом области видимости не всегда потомки или родители: у нас могут быть “братские” области видимости, к примеру, с одним и тем же родителем. Используя `$scope` для запуска, мы пропустим такие области видимости и запустим его лишь вниз или вверх, но никогда не по сторонам.

Самый простой путь имитации родительских и дочерних областей видимости - использовать контроллеры. Каждый контроллер создает новый `$scope`, который Ангуляр аккуратно выводит для нас в виде класса `ng-scope` на элементах, с новыми областями видимости:

```html
<div ng-controller="ParentCtrl as parent" class="ng-scope">
  { { parent.data } }
  <div ng-controller="SiblingOneCtrl as sib1" class="ng-scope">
      { { sib1.data } }
  </div>
</div>
```

Мы могли бы запустить событие вниз из `ParentCtrl` в `SiblingOneCtrl`, используя `$broadcast`:

```js
app.controller('ParentCtrl',
  function ParentCtrl ($scope) {

  $scope.$broadcast('parent', 'Some data'); // идет вниз!

});
```

```js
app.controller('SiblingOneCtrl',
  function SiblingOneCtrl ($scope) {

  $scope.$on('parent', function (event, data) {
    console.log(data); // ‘Some data’
  });
});
```

Если бы мы захотели передать сигнал вверх, из `SiblingOneCtrl` в `ParentCtrl`, как вы уже догадались, вы можете использовать `$emit`.

```js
app.controller('ParentCtrl',
  function ParentCtrl ($scope) {
  $scope.$on('child', function (event, data) {
    console.log(data); // 'Some data'
  });
});
```

```js
app.controller('SiblingOneCtrl',
  function SiblingOneCtrl ($scope) {

  $scope.$emit('child', 'Some data'); // идем наверх!

});
```

Чтобы продемонстрировать как `$scope`работает, в момент запуска события, вот простая иерархия:

```js
<div ng-controller="ParentCtrl as parent" class="ng-scope">
  <div ng-controller="SiblingOneCtrl as sib1" class="ng-scope"></div>
  <div ng-controller="SiblingTwoCtrl as sib2" class="ng-scope"></div>
</div>
```

Если `SiblingTwoCtrl` запустил `$scope.$broadcast`, тогда `SiblingOneCtrl` никогда не узнает, что случилось. Это может быть помехой, ее можно исправить, поставив небольшой костыль:

`$scope.$parent.$broadcast('myevent', 'Some data');`

Данный код обращается к `ParentCtrl` и уже оттуда запускает событие через`$broadcast`

###$rootScope.($emit/$broadcast)
Если вам все еще просто, то давайте добавим `$rootScope`. `$rootScope` - родительский элемент всех областей видимости, который делает каждый вновь созданный ` $scope` его потомком! Выше я упомянул о том, как  `$scope`ограничен в направлениях распространения событий, а вот`$rootScope`- это то, как мы можем с легкостью передавать сигнал через все области видимостей. Данный подход будет решать некоторые проблемы с большей легкостью. К сожалению, все не настолько просто, как с передачей событий вверх или вниз...

####$rootScope.$emit против $rootScope.$broadcast

Объект $rootScope имеет аналогичные методы `$emit`, `$broadcast`и `$on`, но они работают немного иначе, нежели в `$scope`. Так как `$rootScope` не имеет `$parent` (родительской области видимости), использование $emit  было бы бессмысленным. Вместо этого `$rootScope.$emit` запустит событие только для слушателей, подписанных через `$rootScope.$on`. Самое интересное в том, что `$rootScope.$broadcast`уведомит как все `$rootScope.$on`, так и `$scope.$on` слушателей и это тонкое, но очень важное отличие, которое поможет избежать проблем с вашим приложением.

####$rootScope примеры

Давайте рассмотрим еще более глубокую иерархию:
```html
<div ng-controller="ParentCtrl as parent" class="ng-scope">
  // ParentCtrl
  <div ng-controller="SiblingOneCtrl as sib1" class="ng-scope">
    // SiblingOneCtrl
  </div>
  <div ng-controller="SiblingTwoCtrl as sib2" class="ng-scope">
    // SiblingTwoCtrl
    <div ng-controller="ChildCtrl as child" class="ng-scope">
      // ChildCtrl
    </div>
  </div>
</div>
```

В примере выше есть 3 лексические области видимости (где родительские области видимости доступны в текущей области видимости, несколько разрывает голову при мысли об этом с точки зрения определения областей видимостей в DOM, но концептуально то что нам нужно там) и 4 области видимости в Ангуляре: `ParentCtrl`, `SiblingOneCtrl`, `SiblingTwoCtrl` и `ChildCtrl`. Две “братские” области видимости.

Используя `$scope.$emit`внутри `ChildCtrl` выльется в то,  что только `SiblingTwoCtrl` и `ParentCtrl` получат уведомления, так как событие вообще не распространилось на сиблингов, и затронуло лишь прямых предков (полностью игнорируя `SiblingOneCtrl`). Если бы мы использовали `$rootScope`, тогда бы мы могли затронуть и слушателей событий в  `$rootScope`.

```js
app.controller('SiblingOneCtrl',
  function SiblingOneCtrl ($rootScope) {

  $rootScope.$on('rootScope:emit', function (event, data) {
    console.log(data); // 'Emit!'
  });


  $scope.$on('rootScope:broadcast', function (event, data) {
    console.log(data); // 'Broadcast!'
  });

 $rootScope.$on('rootScope:broadcast', function (event, data) {
    console.log(data); // 'Broadcast!'
  });

});
```

```js
app.controller('ChildCtrl',
  function ChildCtrl ($rootScope) {
  $rootScope.$emit('rootScope:emit', 'Emit!'); // $rootScope.$on
  $rootScope.$broadcast('rootScope:broadcast', 'Broadcast'); // $rootScope.$on && $scope.$on

});
```

###Отписываемся от событий в Angular.JS
`unsubscribe` - часто системы событий в AngularJS. Вы можете прекратить прослушку событий в любое время со слушателем `$on`. В отличие от других библиотек, здесь нет `$off` метода. Документация Ангуляра не особо внятно объясняет нам то, как правильно “прекращать прослушку”, она говорит, что `$on` "Возвращает функцию отмены регистрации для слушателя событий." Мы можем предположить, что под этим они подразумевают замыкание, которое позволит нам прекращать прослушку событий.

Внутри исходного кода v1.3.0-beta.11, мы можем определить местонахождение $on метода и подтвердить подозрения на наличие замыкания:

```js
$on: function(name, listener) {
  var namedListeners = this.$$listeners[name];
  if (!namedListeners) {
    this.$$listeners[name] = namedListeners = [];
  }
  namedListeners.push(listener);

  var current = this;
  do {
    if (!current.$$listenerCount[name]) {
      current.$$listenerCount[name] = 0;
    }
    current.$$listenerCount[name]++;
  } while ((current = current.$parent));

  var self = this;
  return function() {
    namedListeners[indexOf(namedListeners, listener)] = null;
    decrementListenerCount(self, 1, name);
  };
}
```

Мы можем подписать и прекратить прослушку событий очень простым способом:

```js
app.controller('ParentCtrl',
  function ParentCtrl ($scope) {

  // подписываемся...
  var myListener = $scope.$on('child', function (event, data) {
    // что-нибудь делаем
  });


  // отписываемся...
  // помещаем этот код куда-нибудь в колбэк или что-то подобное
  myListener();

});
```

###$scope.$on $destroy
Когда мы используем `$rootScope.$on`,  нам нужно отключать этих слушателей каждый раз, когда `$scope` уничтожается. Слушатели `$scope.$on` автоматически высвобождаются, но нам понадобится вызывать вышеупомянутое замыкание вручную в событии `$destroy`:

```js
app.controller('ParentCtrl',
  function ParentCtrl ($scope) {

  // $rootScope $on
  var myListener = $rootScope.$on('child', function (event, data) {
    //
  });

  // $scope $destroy
  $scope.$on('$destroy', myListener);
});
```

###Отмена событий

Если вы выбрали использование `$emit`, один из слушателей событий в `$scope ` может отменить его, и предотвратить распространение события вверх по цепочке. При использовании `$broadcast`событие не может быть отменено! Отмена события, которое было отправлено через `$emit` выглядит следующим образом:

```js
$scope.$on('myCustomEvent', function (event, data) {
  event.stopPropagation();
});
```

###$rootScope.$$listeners

У каждого объекта AngularJS есть некоторые свойства, мы можем покопаться в них и наблюдать за тем, что случается “под капотом”. Мы можем взглянуть на `$rootScope.$$listeners`, чтобы наблюдать за жизненным циклом слушателей.
Мы так же можем прекратить прослушку событий с его помощью (но я бы не советовал вам этого делать):

`$rootScope.$$listeners.myEventName = [];`

###Распределение событий по пространствам имен

Обычно, если я работаю над конкретной фабрикой, я коммуницирую с другими директивами, контроллерами или даже фабриками, используя выделенное пространство имен для более чистой имплементации `pub/sub`, что делает код последовательным и позволяет избегать конфликтов имен.
Если бы я строил email приложение с ящиком входящих сообщений, то мы могли бы использовать пространство имен `inbox`для этого специального раздела. Это легко иллюстрируется несколькими простыми примерами:

```js
$scope.$emit('inbox:send'[, data]);
$scope.$on('inbox:send', function (event, data) {...});
```

```js
$scope.$broadcast('inbox:delete'[, data]);
$scope.$on('inbox:delete', function (event, data) {...});
```

```js
$scope.$emit('inbox:save'[, data]);
$scope.$on('inbox:save', function (event, data) {...});
```

По мотивам [Todd Motto](http://toddmotto.com/)

