title: Полезное сквозное тестирование с Protractor
subtitle: Часть 2
date: 2015-01-17
author: Eleonora Pavlova
gravatarMail: koko@reevlodge.com
tags: [Javascript, AngularJS]
---

![Иллюстрация блокнота](/blog/images/Protractor_testing2.jpg)

###Тестируем список issues

От тестов работы элемента `<input>` перейдём к тестам функционала нашего списка.

![Иллюстрация блокнота](/blog/images/Plisting.png)

Поскольку все остальные тесты будут совершаться на странице списка, поместим их внутрь отдельного блока `describe()`. Это позволит добавить ещё один блок с `beforeEach()`. Для тестов возьмём репозиторий на гитхабе `angular/angular.js`.

<!-- more -->

Блок `describe()` будет вести себя, как пользователь, который заходит на главную страницу, заполняет поле ввода и жмёт enter. Вам может показаться излишним такой тест, но не забывайте, что сквозное тестирование и предполагает автоматизацию взаимодействия пользователя с системой.

```js
describe('listing page', function() {
  beforeEach(function() {
    element(by.input('repo.name')).sendKeys('angular/angular.js\n');
  });
  // ...
  // тест списка будет здесь
});
```

На странице со списком `issues` будет ряд элементов, которые мы будем перебирать с помощью `ng-repeat`. Используя API GitHub, по умолчанию загрузим 30 issues. Соответственно, необходимо убедиться, что на странице реально появляется 30 вопросов.

Чтобы выбрать элемент в `ng-repeat`, воспользуемся опцией  `by.repeater()`. Этот метод перебирает директивы `ng-repeat` на странице и находит те, которые соответствуют заданному выражению. В данном случае мы задаём Angular выражение `d in data | orderBy:created_at:false` . 

Соответственно, запускаем цикл:

```js
by.repeater('d in data | orderBy:created_at:false')
```

Можно как детально прописывать фильтры (что мы сделали выше), так и задать более общее выражение:

```js
by.repeater('d in data');
```

Метод `by.repeater()` не возвращает никаких элементов, только указывает на метод извлечения этих элементов. Поэтому если мы попытаемся установить ожидания в отношении объекта, возвращенного методом `by.repeater()`,  просто получим ошибку. В Protractor элементы работают через промисы, поэтому мы должны использовать функцию `element.all()`, чтобы получить доступ к выделенному элементу:

```js
var elems = element.all(by.repeater('d in data'));
```

Найдя элемент, чтобы подсчитать количество, применяем `count()` к объекту `element.all()`, и задаём ожидаемое количество — 30 элементов:

```js
it('should have 30 issues', function() {
  var elems = element.all(by.repeater('d in data'));
  expect(elems.count()).toBe(30);
});
```

Отлично, копнём глубже и убедимся, что для каждого из повторяющихся элементов отображается аватар. Логично предположить, что каждый элемент это, по сути, повтор предыдущего, поэтому создадим тест и проверим лишь один элемент.

Для получения элементов со страницы воспользуемся уже знакомым методом `by.repeater()`. Метод `element.all()` возвращает объект, содержащий несколько методов, которые  можем использовать для взаимодействия с повторяющимися элементами списка. В нашем случае, применим метод `first()` для нахождения первого элемента списка. 

Поскольку список ещё не появился на странице, метод `first()` получает промис, который будет выполнен с появлением первого элемента. 

```js
it('includes a user gravatar per-element', function() {
  var elems = element.all(by.repeater('d in data'));
  elems.first().then(function(elm) {
    // elm – первый элемент
  });
});
```

Так как нам нужен конкретный дочерний элемент, применим метод `findElement()` для нахождения элемента `<img>`. Получить этот элемент можно разными методами, мы воспользуемся `by.tagName()`.  Как и в случае с методом `first()`, метод `findElement()` возвращает промис. 

```js
it('includes a user gravatar per-element', function() {
  var elems = element.all(by.repeater('d in data'));
  elems.first().then(function(elm) {
    elm.findElement(by.tagName('img')).then(function(img) {
      // img - элемент <img> 
    });
  });
});
```

Нам важно, чтобы атрибут src содержал URL граватара. Поэтому протестируем ещё глубже структуру элемента. Применим метод `getAttribute()` для нахождения атрибута src. Как и в двух предыдущих случаях, мы имеем дело с промисом:

```js
it('includes a user gravatar per-element', function() {
  var elems = element.all(by.repeater('d in data'));
  elems.first().then(function(elm) {
    elm.findElement(by.tagName('img')).then(function(img) {
      img.getAttribute('src').then(function(src) {
        // src - источник текста
      });
    });
  });
});
```

Получив атрибут src, зададим ожидание, что он соответствует `gravatar.com`, поскольку на гитхабе используется именно Gravatar.  
```js
it('includes a user gravatar per-element', function() {
  var elems = element.all(by.repeater('d in data'));
  elems.first().then(function(elm) {
    elm.findElement(by.tagName('img')).then(function(img) {
      img.getAttribute('src').then(function(src) {
        expect(src).toMatch(/gravatar\.com\/avatar/);
      });
    })
  });
});
```

### Тестируем навигацию

Последняя часть функционала, которую необходимо протестировать — навигация. Как и прежде, мы привяжем наши тесты к действиям, совершаемым на странице. В данном случае, протестируем ссылку `/about`, используя CSS и click по ссылке.

Наш HTML выглядит следующим образом:

```js
<div class="header">
  <ul class="nav">
    <li ng-class="{'active': isCurrentPage('')}"><a id="homelink" ng-href="#">Home</a></li>
    <li ng-class="{'active': isCurrentPage('about')}"><a id='aboutlink' ng-href="#/about">About</a></li>
  </ul>
  <h3 class="text-muted">protractorer</h3>
</div>
```

Ссылка `/about` — второй элемент в списке `header.nav`. Наиболее просто выбрать список с помощью селектора CSS и метода `by.css()`. 

```js
it('should navigate to the /about page when clicking', function() {
  var link = element(by.css('.header ul li:nth-child(2)'))
});
```

Теперь у нас есть ссылка, на которую можно кликнуть, чтобы попасть на новую страницу. Переместившись на страницу `/about`, следует убедиться, что содержание страницы отображается или что url содержит путь `/about`. Поскольку мы подразумеваем, что Angular роутер работает как положено, очевидно, что страница будет грузиться, если url страницы ведёт на `/about`. Поэтому просто проверяем последнее условие. Получим url с помощью метода `getCurrentUrl()`:

```js
it('should navigate to the /about page when clicking', function() {
  element(by.css('.header ul li:nth-child(2)')).click();
  expect(ptor.getCurrentUrl()).toMatch(/\/about/);
});
```

Наконец, тк мы тестируем клиентский интерфейс, ожидаем, что к ссылке будет добавляться класс `active`, который вешает на кнопку новый стиль color.

Запускаем то же действие, что и раньше — клик по ссылке `/about`. Всякий раз, когда мы дублируем код, разумно вложить тесты в отдельный блок `describe()`, и переместить туда дублируемый код. Переместим наши тесты в блок `describe()`:

```js
describe('page navigation', function() {
  var link;
  beforeEach(function() {
    link = element(by.css('.header ul li:nth-child(2)'));
    link.click();
  });

  it('should navigate to the /about page when clicking', function() {
    expect(ptor.getCurrentUrl()).toMatch(/\/about/);
  });

  it('should add the active class when at /about', function() {
    // должен иметь класс active
  });
});
```

Последний тест проверяет, что список классов содержит строку `active`:

```js
expect(link.getAttribute('class')).toMatch(/active/);`
```

###Ещё аргументы?

Protractor – очень мощный инструмент для e2e тестирования, активно развивающийся на гитхабе. Вскоре он заменит Karma, став официальным фреймворком для Angular. 

Исходный код тестов доступен по [ссылке](http://j.mp/1m4xdma). 
Если вам было интересно, загляните и [сюда](ng-book.com). 
Спасибо за внимание, и продуктивного тестирования! 








