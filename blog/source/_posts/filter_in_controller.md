title: Angular JS: внедрение фильтра в контроллер
date: 2014-27-02
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
tags: [Angular.JS]
---
Предположим вы переработали функцию, находящуюся в `$scope` в фильтр:

```javascript
// Counts char number excluding spaces. Three dots count as one. // TODO: refactor text transformation in a separate filter editor.filter("numChar", function() {     return function(theText) {         return theText             .replace(/\n/g, "")             .replace(/\.\.\./g,"\u2026")             .length;      }; }); 
```
И теперь вы можете использовать ее в своем приложении для обработки текста:
<span class="char-num" id="numChar">     {{data.myText | numChar}} </span> 

Но, как ни странно, другая функция стала выполняться с ошибкой:
```javascript
function ReportController($scope, Data) {      // The text is valid if its length is less or equal to maxChar     $scope.isValid = function() {         var numCh = $scope.numChar(); // OUCH! What now?!?         return numCh <= Data.maxChar;      };   }; 
``` 
Этот метод полагается на функцию `numChar()`, которая сейчас вне области видимости. 

Как же исправить ошибку? 

Способ первый: внедряем фильтр обратно в контроллер, где находятся выполняющийся с ошибками метод:
```javascript
// Inject numChar Filter into Report Controller function ReportController($scope, Data, numCharFilter) {    $scope.isValid = function() {         // Call the filter directly (name + filter)         var numCh = numCharFilter($scope.data.myText);         return numCh <= Data.maxChar;    };  } 
```

Примите во внимание: суффикс `Filter` добавлен к названию фильтра, мы получаем `numCharFilter` и это, собственно, и есть название функции, которую вы будете использовать для доступа к этому фильтру.
Способ второй: внедряем сервис `$filter` в ваш контроллер:
```javascript
// Inject $filter into Report Controller function ReportController($scope, Data, $filter) {      $scope.isValid = function() {         // Call the desired filter by selecting it from $filter         var numCh = $filter("numChar")($scope.data.myText); // <- meh         return numCh <= Data.maxChar;     };  } 
```
Это позволяет вам вызывать любой фильтр, но код становится немного корявым. 
Но так или иначе, код теперь выполняется. Время подумать о том, что вы можете улучшить в своих программах, используя полученные знания. А может быть вы придумаете и еще что-нибудь поинтереснее?
