title: Data service для работы с API в AngularJS
date: 2014-04-22
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
tags: [Javascript, AngularJS]
---

![Иллюстрация локального сайта](/blog/images/module.png)

Я много думал о службах для работы с данными и этот аспект Ангуляра, вызывает у меня наибольшее беспокойство. С тех пор я понял, что мое беспокойство было вызвано всего-лишь тем, что Angular.js не диктует и даже не советует как лучше управлять вашей работой с данными. 
<!-- more -->

В итоге, при работе с данными я всегда сомневаюсь в своем решении  и спрашиваю себя: «Все ли я делаю правильно?» Ответ на этот вопрос прост: если решение работает для тебя, тогда оно верно, так как Ангуляру все равно. Этот подход работал до сих пор, но он приводил к захламлению кода, которой, в итоге, было сложно перемещать в другие проекты.

Итак, мы вернулись обратно к доске для проектирования и начали думать.
После чтения разных постов и просматривания видео о моделировании данных в ангуляре, многие решения все еще казались для меня громоздкими. Я не уверен, что мы создали идеальное решение, но оно хорошо работает для наших нужд и кажется вполне приличным подходом, которого не стоит бояться. Я решил опубликовать код для всех, кто чувствовал себя так же по отношению к проблеме дата менеджмента в ангуляре.

##services.js
Это основной сервис, который мы используем. Он позволяет нам внедрять один модуль в наше приложение, чтобы прикреплять все требуемые сервисы для взаимодействия с Mallzee API. Классная вещь заключается в том, что это позволяет нам создать вызовы API для каждого сервиса, который расширяет его и позволяет поддерживать наш код не повторяющимся (DRY). 

Мы можем создать много общих вызовов к данными именно здесь, таких как `fetch`, `fetchOne`, `query` и тд. Основным двигателем этого подхода стало то, что мы повторялись в написании кода для слияния кеша в наших сервисах. Мы хотим иметь возможность получать наши данные сначала из `LocalStorage`, потом делать запрос для получения “живых” данных и обновлять любые изменения. Подробнее об этом в другом посте. Эта техника позволяет нам делать это единожды в наших общих вызовах.

Мы так же создаем провайдер так, чтобы этот сервис и использование модуля `restangular` могло быть соединено с другими сервисами без возникновения проблем с базовым URL и тому подобных вещей.

```javascript
angular.module('mallzee.services', [
  'restangular',
  'mallzee.services.brands',
  'mallzee.services.products'
]).provider('MallzeeService', function MallzeeServiceProvider() {

    var baseUrl = 'https://api.mallzee.com';

    var scope = this;
    this.$get = ['MallzeeRestangular', function (MallzeeRestangular) {

      MallzeeRestangular.setBaseUrl(baseUrl);

      var MallzeeService = function () { };
      MallzeeService.prototype = {
        scope: this,
        initialise: function () {
          scope = this;

          if (scope.key) {
            this[scope.key] = [];
          }
          if (scope.key && scope.model) {
            // Extend any objects sourced from Local Storage
            angular.forEach(scope[scope.key], function (obj) {
              angular.extend(obj, scope.model);
            });

            // Extend any future objects we retrieve with Restangular
            MallzeeRestangular.extendModel(scope.key, function (model) {
              return angular.extend(model, scope.model);
            });
          }
        },
        fetch: function () {
          scope = this;
          MallzeeRestangular.all(scope.key).getList().then(function (data) {
            angular.extend(scope[scope.key], data);
          });
        },
        fetchOne: function() {} // Removed to keep things short
        query: function () {} // Removed to keep things short
      };

      return {
        getInstance: function () {
          return new MallzeeService();
        }
      }
    }];

    this.setBaseUrl = function (url) {
      baseUrl = url;
    };

  }).factory('MallzeeRestangular', ['Restangular', function (Restangular) {
    return Restangular.withConfig(function(RestangularConfigurator) {
      // Configure the version of Restangular used for this API
      // i.e. set headers, object transforms etc
    });
  }]);
```

##services/brands.js

Когда мы создаем наш сервис, мы просто внедряем наш базовый сервис MallzeeService и расширяем его экземпляр, чтобы обеспечить нас АПИ.
Мы используем factory для того, чтобы придавать возвращающимся элементами структуру модели, и фактори - это идеальное место, чтобы расположить здесь бизнес логику и не допускать ее до контроллеров.

```javascript
angular.module('mallzee.services.brands', [])
    // This will act as the model for each brand item received from the API
    .factory('Brand', [function () {
      return {
        toggle: function () {
          this.enabled = !this.enabled;
          return this.enabled;
        }
        // Add model specific API function here
      };
    }])
    .factory('BrandsService', ['MallzeeService', 'Brand', function (MallzeeService, Brand) {

      var brandsService = angular.extend(MallzeeService.getInstance(), {
        key: 'brands',
        model: Brand

        // Add any specific collection API functions to this object
      });
      brandsService.initialise();

      return brandsService;
    }]);

```

##controllers/brands.js

Затем мы можем использовать ее очень просто в наших контроллерах.

```javascript
angular.module('mallzee.controllers.brands', [])
    .controller('BrandCtrl', [
    '$scope',
    'BrandsService',
    function ($scope, $state, BrandsService) {

      $scope.brands = BrandsService.brands;

      $scope.$on('$viewContentLoaded', function (event, view) {
        if (view.stateName === 'brands') {
          BrandsService.fetch();
        }
      });
    }]);
```

##app.js

Наконец мы всего лишь включаем высокоуровневый сервис и настраиваем его, если мы хотим указать на другой URL, скажем, во время разработки.

```javascript
angular.module('mallzee', [
    'mallzee.services'
).config(['MallzeeServiceProvider', function (MallzeeServiceProvider) {
    MallzeeServiceProvider.setBaseUrl('https://dev.mallzee.com');
});
```
 
Мне это нравится, потому что мы можем использовать этот код в любом проекте на Ангуляре и чувствовать себя комфортно, зная, что наши обращения к апи останутся стабильными. Он так же настроен для хорошей работы с вашим кешем и localStorage.
Мне бы очень хотелось услышать, что вы думаете по этому поводу.

