title: Дебаггинг приложения на AngularJS через консоль
subtitle: Изучение и контроль запущенного приложения через браузерную консоль в Chrome, Firefox или Internet Explorer
date: 2014-08-12
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
cover: https://makeomatic.ru/blog/images/debugging.jpg
coverWidth: 623
coverHeight: 455
url: https://makeomatic.ru/blog/2014/12/08/debugging_AngularJS_app/
tags: [AngularJS, Javascript]
---


![Иллюстрация блокнота](/blog/images/debugging.jpg)

При разработке приложений на AngularJS, сложно получить доступ к данным и сервисам, глубоко спрятанным в вашем приложении через JS консоль в Chrome, Firefox или Internet Explorer. Вот несколько простых фокусов, которые мы можем использовать, чтобы внимательно изучать и контролировать запущенное приложение через браузерную консоль, упрощая тестирование, видоизменение и даже программирования нашего приложения в реальном времени:

<!-- more -->

#### 1. Доступ к областям видимости

Мы можем получать доступ к любым областям видимости (даже к изолированным) на странице всего одной строчкой js кода:
```js
> angular.element(targetNode).scope()
-> ChildScope {$id: "005", this: ChildScope, $$listeners: Object, $$listenerCount: Object, $parent: Scope…}
```

Или для изолированных областей видимости:
```js
> angular.element(targetNode).isolateScope()
-> Scope {$id: "009", $$childTail: ChildScope, $$childHead: ChildScope, $$prevSibling: ChildScope, $$nextSibling: Scope…}
```

Где ` targetNode `- ссылка на `HTML Node`. Вы можете легко получить ссылку на одну из них через `document.querySelector()`.

#### 2. Исследование иерархии областей видимости 

Иногда нам нужно увидеть как области видимости выглядят на странице, чтобы эффективно дебажить наше приложение. [AngularJS Batarang](https://chrome.google.com/webstore/detail/angularjs-batarang/ighdmehidhipcmcojjgiloacoafjmpfk?hl=en) - это Chrome расширение, которое показывает иерархию областей видимости в реальном времени и имеет некоторые другие полезные функции.

#### 3. Использование любого сервиса

Мы можем получить ссылку на любой сервис, используя функцию элемента `injector`, где `ngApp` определен, или косвенно, через любой элемент с `ng-scope` классом: 
```js
> angular.element(document.querySelector('html')).injector().get('MyService')
-> Object {undo: function, redo: function, _pushAction: function, newDocument: function, init: function…}
// Or slightly more generic
> angular.element(document.querySelector('.ng-scope')).injector().get('MyService')
```
Тогда мы можем вызывать методы в этом сервисе, как если бы мы внедрили его как зависимость.

#### 4. Доступ к контроллеру директивы

Некоторые директивы определяют контроллер с дополнительной (часто общей) функциональностью. Чтобы получить доступ к экземпляру контроллера для данной директивы из консоли, просто используйте функцию `controller()`:
```js
> angular.element('my-pages').controller()
-> Constructor {}
```
Следующий пример более продвинут и не используется так часто

#### 5. Функции Chrome консоли 

У Chrome есть множество [удобных фич](https://developer.chrome.com/devtools/docs/commandline-api) для поиска ошибок браузерных приложений из консоли. Здесь несколько лучших из них для Angular разработки:
$0 - $4: Доступ к 5 последним выбранным DOM элементам в окне инспектора. Это удобно для получения доступа к областям видимости выбранных элементов:  
`angular.element($0).scope()`
`$(selector) ` и `$$(selector)`: быстрая замена для `querySelector() ` и `querySelectorAll`, соответственно.

##### Заключение

С несколькими простыми фокусами мы можем получить доступ к данным для любой области видимости на странице, изучить иерархию области видимости, внедрять сервисы и контролировать директивы.
Так что в следующий раз, когда вы захотите внести небольшие корректировки, проверьте вашу работу или проконтролируйте AngularJS приложение через консоль, я надеюсь вы вспомните эти команды и найдете их полезными как и я!

По мотивам [Max Lynch](http://ionicframework.com/blog/angularjs-console/)
