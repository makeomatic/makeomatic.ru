title: "AngularJS: а вам нужен заголовок?"
subtitle: Меняем заголовок, основанный на пути браузерной строки
date: 2013-12-2
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
cover: https://makeomatic.ru/blog/images/title.png
coverWidth: 581
coverHeight: 281
url: https://makeomatic.ru/blog/2013/12/02/Title/
tags: [AngularJS, Javascript]
---

![Иллюстрация блокнота](/blog/images/title.png)

AngularJS используется для написания одностраничных веб приложений.  Принимая во внимание сущность одностраничных приложений, заголовок устанавливается 1 раз при первичной загрузке данных, и даже если вы перейдете на страницу с продуктом или на информацию о сайте, вы будете видеть все тот же заголовок в браузере.

<!-- more -->
Мы покажем вам одно из возможных решений данной проблемы:

В вашем `html` шаблоне, поменяйте тэг `title` и добавьте в него атрибут `ng-bind`:

```
<title ng-bind="'MyApp - ' + $root.title">Мое приложение - Привет!</title>
```

В вашем app.js:

```javascript
$routeProvider
      .when('/product', {templateUrl: '/partials/product.html',  controller: 'ProductCtrl', title: 'Наши продукт'})
      .when('/about', {templateUrl: '/partials/about.html', controller: 'AboutCtrl', title: 'О нас'});
```

В вашем вызове функции `app.module(..).run` добавьте  `$rootScope.$on`

```js
angular.module("...").run(function(){
      $rootScope.$on("$routeChangeSuccess", function(currentRoute, previousRoute){
            //Change page title, based on Route information
            $rootScope.title = $route.current.title;
      });
});
```

##### На заметку
Причина, по которой я использую `ng-bind` вместо прямого привязывания к шаблону с помощью `{ { expression } }` описана в документации:

Предпочтительно использовать `ngBind` вместо `{ { expression } }`, потому что шаблон на мгновение показывается в браузере не компилированным.
