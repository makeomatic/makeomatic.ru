title: Как использовать ngMessages в AngularJS
date: 2014-05-21
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
cover: http://makeomatic.ru/blog/images/ngmassage.jpg
coverWidth: 395
coverHeight: 304
url: hhttps://makeomatic.ru/blog/2014/05/21/ngMessage/
tags: [AngularJS, Javascript]
---
![Иллюстрация блокнота](/blog/images/ngmassage.jpg)

##Что за ngMessage?

`ngMessages` - новая возможность в AngularJS 1.3 для отображения сообщений об ошибках в формах. Работа с формами в Ангуляре является сказкой, так как она основана на взаимодействии с базовыми формами HTML, и их органичном расширении. Директива `ngModel` без проблем работает со всеми полями ввода, а состояние формы может быть получено в любой момент времени, используя имя формы или конкретного поля ввода данных. 
<!-- more -->

Но как на счет показа сообщений об ошибках? Поскольку нет утвержденного алгоритма для этого действия - существует много противоречивых путей для достижения нужного результата в AngularJS. Если мы показываем или скрываем сообщение - то проще использовать `ngIf` или `ngSwitch`, но если мы пытаемся отобразить множество разных сообщений во всем приложении, то код начинает становиться громоздким. Должны ли вы на самом деле использовать `ngIf`  больше 20 раз для формы только для того, чтобы показать горстку сообщений? Можем ли мы повторно использовать шаблон сообщений в других частях приложения? Действительно ли формы так сложны? 

Новый модуль `ngMessages` представленный в AngularJS 1.3-beta.8, предназначен для отображения сообщений об ошибках с возможностью их повторного использования и легкости в поддержке. Вместо того, чтобы потрошить ваш код шаблонов размещением бесконечного числа `ngIf`, `ngMessages` смотрит на изменения объекта `model.$error` и затем решает какие сообщения показать, базируясь на том, какие ошибки описаны в шаблоне.

Заинтересованы? Давайте исследуем директивы `ngMessages` и `ngMessage` более детально.

## AngularJS 1.3.0-beta.8 и выше

Имейте ввиду, что `ngMessages` доступы только для AngularJS 1.3.0-beta.8 или выше. К сожалению, этот функционал не доступен для 1.2 версии.

### Демо версия приложения

В дополнение к данному руководству, эта статья так же предоставляет ссылку на  приложение демонстрационной формы, которая использует модуль `ngMessages`. Демо  не отправляет данные на сервер, но она содержит контроль вводимых данных, и отображает сообщения о многих типах  ошибок. Так же, обязательно введите имя пользователя в поле `username`, чтобы увидеть как применяется асинхронная проверка.


## Адская работа с сообщениями об ошибках 

Настоящая проблема с управлением сообщениями об ошибках в Ангуляре - это код, требующийся для определения того, что отображается в шаблоне. Шаблон становится слишком тяжеловесным если вся эта логика встраивается в HTML код.
Но хватит жаловаться. Вместо этого давайте сразу же посмотрим на пример, который показывает email адрес в форме, управляемой Ангуляром. 

Plunkr

```html
<form name="userForm">
<div class="field">
<label for="emailAddress">Enter your email address:</label>
<input type="email" name="emailAddress" ng-model="data.email" required />
<!-- this stuff is WAY too complex --> 	
<div ng-if="userForm.emailAddress.$error.required" class="error">
You forgot to enter your email address…
</div>
<div ng-if="!userForm.emailAddress.$error.required &&                  userForm.emailAddress.$error.email" class="error">
You did not enter your email address correctly... 	</div>
</div>
<input type="submit" />
</form>
```

Код для организации ввода данных прост, а вот для обработки сообщений об ошибках нереально сложный. Для того, чтобы сначала показать требующееся сообщение об ошибках и после показать следующую ошибку, нам нужно установить сложную булево структуру, чтобы это сделать. Как только нам требуется отобразить больше пары сообщений об ошибках, то в теории нам надо установить все больше и больше блоков кода для обработки таких сообщений. Чтобы справиться с этой проблемой мы можем убрать логику в контроллер...

```html
<div ng-if="onlyHasError('required', myForm.emailAddress)" class="error">   You forgot to enter your email address... </div> 
<div ng-if="onlyHasError('email', myForm.emailAddress)" class="error">   You did not enter your email address correctly... </div>
```

Но теперь код нашего шаблона сильно зависит от контроллера и его области видимости. Помимо этого, мы не можем повторно использовать этот код, так как `ng-if` выражения относятся к конкретному полю ввода email. Давайте остановимся на минутку, ведь код уже выходит из-под нашего контроля. Попробуем найти другой подход.

Вместо того, что полагаться на сложную обработку сообщений об ошибках, используя `ng-if` выражения, давайте использовать директиву `ngMessages`. Перво-наперво, давайте добавим `ngMessages` в наше приложение и прикрепим модуль `ngMessages` к нашему модулю приложения как зависимость.

```js
<script type="text/javascript" src="angular.js"></script>
<script type="text/javascript" src="angular-messages.js"></script>
<script type="text/javascript">   angular.module('myApp', ['ngMessages']); </script>
```

Сейчас мы можем переделать наш пример с email. Давайте вырежем наши `ngIf` сообщения и завернем все внутрь `div` элемента с директивой `ngMessages` и каждым сообщением об ошибке во вложенных `div`, используя директивы `ngMessage`.

```
<form name="userForm"> 
<div class="field">
<label for="emailAddress">Enter your email address:</label>
<input type="email" name="emailAddress" ng-model="data.email" required />
<div ng-messages="userForm.emailAddress.$error">
<div ng-message="required">You forgot to enter your email address...</div>
<div ng-message="email">You did not enter your email address correctly...</div>
</div>
</div>
<input type="submit" />
</form>
```

И это весь код, который нам нужен!

## Как же работает `ngMessage`?

Внешняя директива (`ng-messages`) смотрит за изменениями в объекте `userForm.emailAddress.$error`  (который содержит ключ/значение списка всех ошибках, представленных в моделе email адреса). Как только состояние этого объекта $error  меняется, директива `ng-messages` исследует его и содержание внутренних директив (директивы `ng-message`) и выбирает первый элемент директивы, для которого проверка на ошибку выдала `true`.

Давайте расширим наши проверки и добавим валидацию минимальной и максимальной длины в наш элемент email поля. Как мы теперь структурируем наш код сообщения?

```html
<form name="userForm">
<div class="field">
<label for="emailAddress">Enter your email address:</label> 	
<input type="email"        	name="emailAddress"            ng-model="data.email"        	ng-minlength="5"        	ng-maxlength="30"        	required />
<div ng-messages="userForm.emailAddress.$error">
<!-- the required message is displayed first... →
<div ng-message="required">You forgot to enter your email address...</div>
<!-- then, incase the message is too short, show the message right after →
<div ng-message="minlength">Your email address is too short...</div> 
<!-- of if is too long then let us know --> 
<div ng-message="maxlength">Your email address is too long...</div>
<!-- otherwise let us know if the email itself is invalid -->   	
<div ng-message="email">You did not enter your email address correctly...</div>
</div>
</div>
<input type="submit" />
</form>
```

Этот интуитивный подход к порядку демонстрации ошибок полностью контролируется порядок отображения в `DOM`. Вместо того, чтобы полагаться на `ngIf` выражения, для установки сложных логических конструкций, `ngMessages` уважает порядок внутренних ng-message DOM элементов и ведет себя соответственно. Но как насчет того, если мы захотели показать все сообщения, а не по одному? Это может быть сделано путем добавления `ng-messages-multiple` атрибута в контейнер `g-messages`.

```
<!-- now everthing will show up whenever the errors are met →
<div ng-messages="userForm.emailAddress.$error" ng-messages-multiple>
<div ng-message="required">...</div>
<div ng-message="minlength">...</div>
<div ng-message="maxlength">...</div>
<div ng-message="email">...</div>
</div>
```
Так же, имейте в виду, что мы можем использовать директивы элемента вместо аттрибутов.

```html
<!-- now everthing will show up whenever the errors are met →
<ng-messages for="userForm.emailAddress.$error" multiple>
<ng-message when="required">...</ng-message>
<ng-message when="minlength">...</ng-message>
<ng-message when="maxlength">...</ng-message>
<ng-message when="email">...</ng-message>
</ng-messages>
```
Такой подход намного лучше чем множество `ngIf` выражений. Но мы до сих пор мы зависим от выражений, которые жестко привязаны к конкретной моделе в форме. Как мы можем повторно использовать эти сообщения? 

###Повторное использование и переопределение сообщений об ошибке

Сообщения об ошибке могут быть повторно использованы через блок `ngMessages`, путем включения удаленного (или встроенного) шаблона используя `ng-messages-include` аттрибут. Давайте создадим общий шаблон, где необходимая, минимальная и максимальная длина сообщений об ошибке сохранена. Сначала создадим файл удаленного шаблона, который содержит наши сообщения об ошибке. 

```html
<!-- remote file: error-messages.html -->
<div ng-message="required">You left the field blank...</div>
<div ng-message="minlength">Your field is too short</div>
<div ng-message="maxlength">Your field is too long</div>
<div ng-message="email">Your field has an invalid email address</div>
```
А сейчас создадим нашу форму, и воспользуемся шаблоном..
```html
<form name="userForm">
<div class="field">
<label for="emailAddress">Enter your email address:</label>
<input type="email"            name="emailAddress"            ng-model="data.email"            ng-minlength="5"        	ng-maxlength="30"        	required />
<div ng-messages="userForm.emailAddress.$error"          ng-messages-include="error-messages.html"></div>
</div>
</form>
```

Отлично. Сейчас мы можем снова использовать шаблон `error-messages` как основу для наших сообщений об ошибках для других полей ввода в нашей форме. Сейчас наше сообщения об ошибке выглядит как будто оно составлено роботом. Все описано общими словами. В них нет любви. Положительные эмоции от использования форм возникнут тогда, когда каждая ошибка будет специфична каждому куску данных, который собран в форме.  Давайте добавим обратно необходимое сообщение и не будем использовать другое, определенное в шаблоне. Но подождите секундочку! Как, в самом деле, одно сообщение может быть использовано, а остальные нет? Можем ли мы только разместить ту же директиву назад внутрь контейнера `ng-messages`? Да. И делая это так что сообщение, определенное в шаблоне будет заменено любой директивой, присутствующей в контейнере.

```html
<div ng-messages="userForm.emailAddress.$error"  	ng-messages-include="error-messages">
<!-- only the required error message is replaced. The other ones are still there... →
<div ng-message="required">You did not enter an email address</div>
</div>
```

Порядок сообщений до сих пор тот же (с `required` сообщением, появляющимся первым), но вместо того, чтобы показать обобщенное, сформированное "роботом" сообщение об ошибке, будет использовано сообщение сформированное в `ng-messages` директиве. Таким образом мы можем выбрать те сообщения, которые нужно оставить, и те, которые нужно перезаписать.

### Кастомные проверки и сообщения об ошибке
Кастомные проверки могут быть созданы добавлением директив, включением контроллера ngModel и, после, добавлением валидации в массив `$parsers` (массив `$formatters` быть использован в том числе, но `$parsers` лучше подходят для таких проверок). Давайте создадим валидатор, который будет проверять, доступен ли email адрес в нашей базе данных через вызов GET API.

```js
myApp.directive('recordAvailabilityValidator',   ['$http', 
function($http) {	
return { 	
require : 'ngModel', 	
link : function(scope, element, attrs, ngModel) {   	
var apiUrl = attrs.recordAvailabilityValidator;

function setAsLoading(bool) {
ngModel.$setValidity('recordLoading', !bool);   	
}

function setAsAvailable(bool) {
ngModel.$setValidity('recordAvailable', bool);
    	}    	

ngModel.$parsers.push(function(value) {
if(!value || value.length == 0) return;

setAsLoading(true);
setAsAvailable(false);
$http.get(apiUrl, { v : value })
.success(function() {
setAsLoading(false);
setAsAvailable(true);
})
.error(function() {
setAsLoading(false);
setAsAvailable(false);
});
return value;   	
})     
}
} 
}]);
```

Наш валидатор достаточно хорош и может быть использован где нам угодно раз. Мы можем использовать его для проверки, доступен ли email адрес и мы можем даже использовать его для других вещей, типа проверки уникальности имен пользователей или значений `ID` пользователя. После того, как мы использовали метод `ngModel.$setValidity` и предоставили ошибочное имя, ошибка появится в моделе объекта `$error`. Поэтому, чтобы показать 2 сообщения (сообщение о проходящей проверке и сообщение о доступности) - нужно всего лишь расположить их в нужном порядке в директиве `ngMessage`.

```
<!-- now everthing will show up whenever the errors are met →
<div ng-messages="userForm.emailAddress.$error" ng-messages-multiple>
<div ng-message="required">...</div>
<div ng-message="minlength">...</div>
<div ng-message="maxlength">...</div>
<div ng-message="email">...</div>
<div ng-message="recordLoading">Checking database...</div>
<div ng-message="recordAvailable">The email address is already in use...</div>
</div>
```
Сейчас сообщения `recordLoading` и `recordAvailable` показываются каждый раз после изменения email адреса. На текущий момент код валидатора не идеален - он не проверяет на наличие других ошибок, и не завершает предыдущие XHR запросы - оставим это как упражнение читателю.

Если вы мечтаете увидеть пример этого, пожалуйста посмотрите демонстрационное приложение и введите значение имени пользователя.

##Хуки анимации

Так как `ngMessages` и`ngMessage` директивы используют сервис `$animate`, чтобы управлять  DOM операциями, анимации могут быть использованы всякий раз, когда сообщения об ошибке поменялись местами или когда у нас нет сообщений об ошибках вообще. Эти хуки могут позволить нам добавить интересные анимации когда возникают ошибка.

###Анимации с ng-message

Внутренние директивы ng-message добавляют вставку и удаляют себя, которые в свою очередь инициализируют `enter` и `leaveanimation` события.

##Смотря в будущее

`NgMessages` - экспериментальный модуль. Это не говорит о том, что он будет однажды удален, напротив это значит, что API может поменяться, пока он не станет полностью стабильным. Поэтому если существуют некоторые баги или отсутствуют определенные возможности, которые, как вам кажется, идеально подойдут, пожалуйста, создайте задачу в гитхабе!
Спасибо вам, что уделили время моей статье.

 
 

