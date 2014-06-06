title: Все о пользовательских фильтрах в AngularJS

date: 2014-06-06
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
tags: [Angular.JS, Javascript]
---

![Иллюстрация блокнота](/blog/images/custom_filters.jpg)
Фильтры Ангуляра - одни из самых концептуально сложных элементов в нем. Они немного неправильно поняты и от них мой мозг практически вскипал, пока я изучал их. Фильтры безумно классные, они очень мощны для легкой трансформации наших данных в повторно используемые и масштабируемые кусочки. 

<!-- more -->
Перво-наперво лучше всего понять, что мы вообще хотим изучить. Чтобы сделать это, нам нужно понять, что из себя представляют фильтры и как мы можем их использовать. Я считаю, что есть 4 типа фильтров. Да, 4, но конечно могут быть и другие варианты. Давайте побыстрее с ними справимся.

## Фильтр 1: Фильтр для однократного использования (статичный)

Фильтр 1 обрабатывает только один кусок модели данных (не в цикле или чем-нибудь еще более фантастичным) и выплевывает результат в наш вид. Это может быть чем-то типа даты:

`<p>{ { 1400956671914 | date: 'dd-MM-yyyy' } }</p>`

После преобразования, DOM будет выглядеть так:

`<p>24-05-2014</p>`

Итак, как нам создать такой же фильтр или нечто похожее?
Давайте возьмем, к примеру, мое полное имя. Если мне нужно быстро применить фильтр и сделать имя заглавными буквами, какое бы решение вы применили?

У Ангуляра есть метод `.filter()` для каждого модуля, что для нас означает возможность создания собственных фильтров. Давайте посмотрим на урезанный код фильтра: 

```js
app.filter('', function () {
  return function () {
    return;
  };
});
```

Как вы видите, мы можем назвать наш фильтр и возвратить функцию. Что, черт возьми, происходит? Возвращенная функция вызывается, в то время, когда Ангуляр вызывает фильтры, которые означают двустороннее связывание для наших фильтров. 

Пользователь вносит изменения, фильтр снова обрабатывает данные и обновляет их при необходимости. Имя нашего фильтра - это то, как мы можем на него ссылаться внутри биндингов Ангуляра.

Давайте заполним его некоторыми данными:

```js
app.filter('makeUppercase', function () {
  return function (item) {
    return item.toUpperCase();
  };
});
```

Итак, что же это значит? Я прокомментирую:
```js
// filter method, creating `makeUppercase` a globally
// available filter in our `app` module
app.filter('makeUppercase', function () {
  // function that's invoked each time Angular runs $digest()
  // pass in `item` which is the single Object we'll manipulate
  return function (item) {
    // return the current `item`, but call `toUpperCase()` on it
    return item.toUpperCase();
  };
});
```

В качестве примера приложения:

```js
var app = angular.module('app', []);

app.filter('makeUppercase', function () {
  return function (item) {
      return item.toUpperCase();
  };
});
```
```js
app.controller('PersonCtrl', function () {
  this.username = 'Todd Motto';
});
```

Когда мы объявляем его в HTML:
```js
<div ng-app="app">
  <div ng-controller="PersonCtrl as person">
    <p>
      { { person.username | makeUppercase } }
    </p>
  </div>
</div>
```
Вот и все,  [jsFiddle link](http://jsfiddle.net/toddmotto/xz39g/)

## Фильтр 2: Фильтры для ng-repeat

Фильтры отлично подходят для потоковой обработки данных и без какой-либо дополнительной работы мы можем сделать именно это.

Синтаксис достаточно похож с предыдущим фильтром, когда мы фильтруем `ng-repeat`, возьмем немного данных для примера:

```js
app.controller('PersonCtrl', function () {
  this.friends = [{
    name: 'Andrew'        
  }, {
    name: 'Will'
  }, {
    name: 'Mark'
  }, {
    name: 'Alice'
  }, {
    name: 'Todd'
  }];
});
```

Мы можем установить обычный  `ng-repeat` в него:

```js
<ul>
  <li ng-repeat="friend in person.friends">
    {{ friend }}
  </li>
</ul>
```

Добавьте фильтр, названный `startsWithA`, где мы только хотим показать имена в Array массиве, начинающиеся с А:

```js
<ul>
  <li ng-repeat="friend in person.friends | startsWithA">
    {{ friend }}
  </li>
</ul>
```

Давайте создадим новый фильтр:

```js
app.filter('startsWithA', function () {
  return function (items) {
    var filtered = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (/a/i.test(item.name.substring(0, 1))) {
        filtered.push(item);
      }
    }
    return filtered;
  };
});
```

Итак, здесь происходят 2 разных вещи! 
Во-первых, предыдущий `item`- теперь `items`, являющийся нашим массивом из `ng-repeat`. 
Вторая вещь - это то, что нам нужно вернуть НОВЫЙ массив.

Откомментированный код:
```js
app.filter('startsWithA', function () {
  // function to invoke by Angular each time
  // Angular passes in the `items` which is our Array
  return function (items) {
    // Create a new Array
    var filtered = [];
    // loop through existing Array
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      // check if the individual Array element begins with `a` or not
      if (/a/i.test(item.name.substring(0, 1))) {
        // push it into the Array if it does!
        filtered.push(item);
      }
    }
    // boom, return the Array after iteration's complete
    return filtered;
  };
});
```

В Версия ES5, используя `Array.prototype.filter ` для супер чистого кода фильтра:
```js
app.filter('startsWithA', function () {
  return function (items) {
    return items.filter(function (item) {
      return /a/i.test(item.name.substring(0, 1));
    });
  };
});
```
Вот и все,  [jsFiddle link](http://jsfiddle.net/toddmotto/xz39g/)

##Фильтр 3: Фильтры для ng-repeat с аргументами

Все тоже самое, что и выше, но мы можем передать аргументы в функции из других моделей. Давайте создадим пример того, что вместо “фильтрации по букве А”, мы можем дать пользователю возможность решать. 
```js
<input type="text" ng-model="letter">
<ul>
  <li ng-repeat="friend in person.friends | startsWithLetter:letter">
    {{ friend }}
  </li>
</ul>
```

Здесь я передаю в фильтр значение модели `letter` из `ng-model="letter"`. Как он привязывается внутри пользовательского фильтра?

```js
app.filter('startsWithLetter', function () {
  return function (items, letter) {
    var filtered = [];
    var letterMatch = new RegExp(letter, 'i');
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (letterMatch.test(item.name.substring(0, 1))) {
        filtered.push(item);
      }
    }
    return filtered;
  };
});
```

Самое главное - это запомнить как мы передаем в аргументы! Обратите внимание: `letter` сейчас существует внутри  `return function (items, letter) {}`? Это непосредственно соответствует части `:letterpart`. Это значит, что мы можем передавать ровно столько аргументов, сколько нужно (пример):

```js
<input type="text" ng-model="letter">
<ul>
  <li ng-repeat="friend in person.friends | startsWithLetter:letter:number:somethingElse:anotherThing">
    {{ friend }}
  </li>
</ul>
```

Мы бы получили что-то вроде этого:

```js
app.filter('startsWithLetter', function () {
  return function (items, letter, number, somethingElse, anotherThing) {
    // do a crazy loop
  };
});
```
Вот и все,  [jsFiddle link](http://jsfiddle.net/toddmotto/xz39g/)

## Фильтр 4: Controller/$scope Фильтр

Этот вариант немного хитрый и я бы использовал его только, если вам на самом деле просто НЕОБХОДИМО его использовать. Мы пользуемся синтаксисом `:arg` и передаем функцию `$scope` в `filter` объект Ангуляра!

Разница этого типа фильтров в том, что объявленные функции и являются тем, что передается внутрь функции фильтра, так что мы, технически, пишем функцию, которая передается в нашу возвращаемую функцию. Мы не получаем доступ к нашему массиву, только в индивидуальному элементу. Важно это запомнить!

Давайте создадим другую функцию, которая фильтрует по букве `W`. Для начала, давайте определим функцию в контроллере:

```js 
app.controller('PersonCtrl', function () {
  // here's our filter, just a simple function
  this.startsWithW = function (item) {
    // note, that inside a Controller, we don't return
    // a function as this acts as the returned function!
    return /w/i.test(item.name.substring(0, 1));
  };
  this.friends = [{
    name: 'Andrew'        
  }, {
    name: 'Will'
  }, {
    name: 'Mark'
  }, {
    name: 'Alice'
  }, {
    name: 'Todd'
  }];
});
```

Затем повтор:
```js
<div ng-controller="PersonCtrl as person">
  <ul>
    <li ng-repeat="friend in person.friends | filter:person.startsWithW">
      {{ friend }}
    </li>
  </ul>
</div>
```

Эти функции, очевидно, ограничены областью видимости и не могут повторно использоваться в других местах. Если это имеет смысл, тогда используйте эту конструкцию, иначе не надо.

Вот и все,  [jsFiddle link](http://jsfiddle.net/toddmotto/xz39g/)


