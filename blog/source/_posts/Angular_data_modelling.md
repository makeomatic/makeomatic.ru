title: Моделирование данных в AngularJS
subtitle: Взаимодействие с API и получение данных
date: 2014-18-09
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
tags: [AngularJS, Javascript]
---

Когда я впервые коснулся Ангуляра, у меня уже был опыт работы с EmberJS и BackboneJS, а так же были определенные представленияожидания относительно клиентских фреймворков. На первый взгляд, порог вхождения был ниже, чем у других фреймворков. Это хорошо, так как за короткий срок вы можете добиться значительных результатов в его освоении. Это полезно, поскольку в течении короткого периода времени у вас может появиться значительный прогресс.

Для меня большой проблемой стала модель данных. Ангуляр позволяет вам самим решать этот вопрос.  С одной стороны, это хорошо, так как дает нам достаточную свободу, но за свободу всегда приходится чем-то платить. 

Для меня большой дырой было моделирование данных. Ангуляр полностью оставляет это решение за тобой. С одной стороны это хорошо, потому что оно дает тебе больше свободы, но свобода всегда чего-то стоит.

EmberJS и BackboneJS имеют свои их собственныеую Model/Store (по теории Ember) и Model/Collection (по теории Backbone) решенияя, итак давайте посмотрим как я справился с этой необходимостью в Angular.
Для начала я приведу достаточно простой пример взаимодействия с API, с помощью которого мы получаем данные в виде JSON. Первм делом я дам вам реально простое решение для взаимодействия с API, чтобы получить объекты данных через JSON.

```js
app.factory('Article', function($http, $q) {
  // Сохраняем адресс API
 var apiUrl = 'http://api.example.local';
 
 // Объявляем класс модели данных
 var ArticleModel = function(data){
   if (data) {
     this.setData(data);
   }
 };
  // Добавляем prototype методы каждому объекту
 ArticleModel.prototype = {
   setData: function(data) {
     angular.extend(this, data);
   },
   delete: function() {
     $http.delete(apiUrl + '/articles/' + this._id).success(function() {
       // Как-нибудь обрабатываем успешный запрос
     }).error(function(data, status, headers, config) {
       // Что-нибудь делаем в случае ошибки
     });
   },
   update: function() {
     return $http.put(apiUrl + '/articles/' + this._id, this).success(function() {
       // Как-нибудь обрабатываем успешный запрос
     }).error(function(data, status, headers, config) {
         // Что-нибудь делаем в случае ошибки
     });
   },
   create: function() {
     $http.post(apiUrl + '/articles/', this).success(function(r) {
       // Как-нибудь обрабатываем успешный запрос
     }).error(function(data, status, headers, config) {
       // Что-нибудь делаем в случае ошибки 
     });
   }
 };
  // Объявляем класс, который делаем запрос к API и возвращает объект модели с промисами
 var article = {
   findAll: function() {
     var deferred = $q.defer();
     var scope = this;
     var articles = [];
     $http.get(apiUrl + '/articles').success(function(array) {
       array.forEach(function(data) {
         articles.push(new ArticleModel(data)); 
       });
       deferred.resolve(articles);
     }).error(function() {
       deferred.reject();
     });
     return deferred.promise;
   },
   findOne: function(id) {
     var deferred = $q.defer();
     var scope = this;
     var data = {};
     $http.get(apiUrl + '/articles/' + id).success(function(data) {
       deferred.resolve(new ArticleModel(data));
     })
     .error(function() {
       deferred.reject();
     });
     return deferred.promise;
   },
   createEmpty: function() {
     return new ArticleModel({});
   }
 };
 
 return article;
});
```
Сейчас вы легко можете использовать ваши данные в контроллере, выводить в шаблоне, одним словом, делать с ними все, что хотите.

Используйте IndexController.js , чтобы загрузить все объекты из  API. Используйт Check Show Controller.js, для загрузки одного объекта из API:

```js
app.controller('IndexController', function($scope, Article) {
  // Получаем все статьиGet all articles
 Articles.findAll().then(function(articles) {
   $scope.articles = articles;
 });
 });
```
Это только один из примеров применения. Существует несколько, а может и бесконечное количество вариантов получения данных с сервера, но данный вариант хорошо подошел для моего проекта. Это только пример реализации. Существует, может быть, несколько неограниченных версий взаимодействия с API и получении данных, но с моим проектом это сработало на отлично.

В следующей части, я приведу более подробные и сложные примеры обработки данных в Ангуляр. 
