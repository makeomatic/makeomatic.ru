title: Создание простых кастомизированных элементов в Angular.js
date: 2014-02-04
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
tags: [Javascript, Angular.JS]
---

![Иллюстрация блокнота](/blog/images/transformation.jpg)

## Трансформируем приложение

Переделывая Rails приложение на Angular, я столкнулся с селектом, который грузил некоторые названия штатов США из yaml файла.

<!-- more -->

```javascript
.control-container= state_selector form, :"#{type}state", {}, :validate => validate, :class => %w(control--full-line) 
```
Эти штаты появляются косвенно из yaml файла не напрямую.

```javascript
def state_selector(form, field_name, options={ }, html_options={ })     states = [['', '']]     states += Countries.us_states.sort.map { |us_state_code, _| [us_state_code, us_state_code] }     form.select field_name, states, options, html_options   end 
```
Я преобразовал yaml в json и встроил его в Angular контроллер для этой формы. Вот первая попытка переделать мое приложение в Angular из Rails хелпера.

```javascript
 <label class="above-field" for="state">State</label> <select class="field" name="state" ng-model="payment.state" ng-options="state.abbreviation as state.name for state in states" required>  
    $scope.states = function(rawStates) {        return _.map(rawStates, function(abbreviation, name) {         return {abbreviation: abbreviation, name: name};       });     }({       "CA": "CALIFORNIA",        // the rest of the states       "NY": "NEW YORK"     }); 
``` 

## Решаем проблему

Процесс внедрения этого кода на каждой странице, где мне понадобится список штатов, утомителен.  Самый быстрый способ решить эту проблему - вынести штаты в провайдер значений.
```javascript
angular.module('canHazApp')   .value('states',      function(rawStates) {        return _.map(rawStates, function(abbreviation, name) {         return {abbreviation: abbreviation, name: name};       });     }({         "AK": "ALASKA",        // the rest of the states       "WY": "WYOMING"     }));  
```
это app/scripts/controllers/contact_form.js
```javascript
angular.module('canHazApp')     .controller('ContactFormCtrl', function($scope, states) { //inject the value        //lots of code        $scope.states = states }); 
```
Теперь наши штаты не будут дублироваться, если мы решим подключить наш селектор штатов в нескольких местах. Однако, нам все же потребуется добавлять `states` в зависимости к каждому контроллеру, где нам потребуется список штатов.
Мы можем пойти дальше и вынести функционал в директиву для того, чтобы нам больше не пришлось указывать `states` в области видимости элемента `select` . Мы удалим упоминание штатов из  `contact_form.js` и переместим зависимость в директиву.
```javascript
angular.module('canHazApp')   .directive('stateOptions', function (states) { //states value injected into directive context     return {       restrict: 'E',       replace: true,       scope: true,  //we want a separate child scope       template: '<select ng-options="state.abbreviation as state.name for state in states"></select>',       require: '^ngModel',       link: function(scope, element, attrs) {         scope.states = states;       }     };   });  
```
Теперь мы можем использовать нашу директиву в любом месте приложения и получать список штатов в виде опций для выбора.
```javascript
<label class="above-field" for="state">State</label> <state-options class="field" name="state" ng-model="payment.state" required></state-options> 
```
