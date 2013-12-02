title: AngularJS: а вам нужен заголовок?
subtitle: Меняем заголовок, основанный на пути браузерной строчки. 
date: 2013-12-2
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
tags: [Javascript, HTML5]
---

![Иллюстрация блокнота](/blog/images/title.jpg)

AngularJS используется для написания одностраничных веб приложений.  Принимая во внимание сущность одностраничных приложений, то заголовок устанавливается 1 раз при первичной загрузке данных, и даже если вы перейдете на страницу с продуктом, или на информацию о сайте, вы будете видеть все тот же заголовок в браузере…
Мы покажем вам одно  из возможных решений данной пролемы:

В вашем `html` шаблоне, поменяйте тэг `title` и добавьте в него атрибут `ng-bind`:
`<title ng-bind="'MyApp - ' + $root.title">MyApp - Welcome</title>`

В вашем app.js:
```javascript
$routeProvider
      .when('/product', {templateUrl: '/partials/product.html',  controller: 'ProductCtrl', title: 'Discover our Product'})
      .when('/about', {templateUrl: '/partials/about.html', controller: 'AboutCtrl', title: 'About US'});
```
в вашем вызове функции `app.module(..).run` добавьте  `$rootScope.$on`
`angular.module("...").run(function(){

```javascript
$rootScope.$on("$routeChangeSuccess", function(currentRoute, previousRoute){
    //Change page title, based on Route information
    		$rootScope.title = $route.current.title;
});

});
```

**На заметку**: причина, по которой я использую `ng-bind` вместо прямого привязывания к шаблону с помощью `{{ expression }}` описано в документации:

Предпочтительно использовать `ngBind` вместо `{{ expression }}`, потому что шаблон на мгновение показывается не компилированным в браузере.
