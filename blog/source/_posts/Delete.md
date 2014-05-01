title: Удаление анонимного слушателя событий (anonymous event listeners) в JavaScript
date: 2013-11-20
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
tags: [Javascript]
---

![Иллюстрация блокнота](/blog/images/cub.jpg)

## Поддержка замыканий

Одна вещь, которую я люблю в JavaScript- это поддержка замыканий 'closure'.

```javascript
function alertOnClick(message)
{
	    var btn = document.getElementById('btnAlert');
	    btn.addEventListener('click', function() {
	        alert(message);
	    }, false);
}
 
alertOnClick('You have clicked the button!');
```
<!-- more -->

## Анонимный обработчик событий

`alertOnClick` функция добавляет анонимного обработчика событий в кнопку, которая была определена в HTML как страница, которая обрабатывает script. Обработчик событий не имеет собственных локальных переменных, но используется как ‘ сообщение' переменной, обнаруженной во внешней функции. Это пример замыкания JS. Вложенная анонимная функция имеет доступ к аргументам (ссылка) и к функции, содержащей эти переменные. Другими словами, внутренняя функция содержит область видимости внешней функции. Примите к сведению, что внешняя функция не может использовать аргументы и переменные внутренней функции.

### Глобальная функция

Часто мне хочется удалить обработчик событий сразу после того, как случилось это событие. Гораздо проще когда обработчик событий не анонимный, но определить его следует вместо глобальной функции как:

```javascript
var message = null;
	 
function clickHandler()
{
	    alert(message);
	    // Remove the event listener, we no longer need it.
	    // Note that 'this' refers to the event source: the button.
	    this.removeEventListener('click', clickHandler, false);
}
	 
function alertOnClick()
{
	    var btn = document.getElementById('btnAlert');
	    btn.addEventListener('click', clickHandler, false);
}
	 
message = 'You have clicked the button!';
alertOnClick();
```

В данном примере удалить слушатель событий достаточно просто, но этот способ создания слушателя событий имеет недостатки. Для того чтобы обработчик кликов имел доступ к переменной сообщений, мы должны объявить переменную в глобальной области видимости. А это, с технической точки зрения, не так здорово.

### Arguments

Вернемся к нашему первому JS примеру, с которым нет проблем. В этом примере слушатель событий и есть анонимная функция. Для  того, чтобы удалить обработчик событий такого рода, внутри самого обработчика нам потребуется получить ссылку на эту функцию. Для этого мы будем использовать переменную `arguments`, которая возможна в любой функции автоматически. Это содержит не только аргументы, переданные функции, но так же и ссылку на саму функцию: `arguments.callee`. Мы можем так же использовать эту ссылку для удаления анонимного обработчика события после того, как он был вызван.

### Удаление анонимного слушателя событий

Здесь первый пример кода с одной дополнительной строкой для удаления анонимного слушателя событий.

```javascript
function alertOnClick(message)
{
	    var btn = document.getElementById('btnAlert');
	    btn.addEventListener('click', function() {
        alert(message);
	        // Remove the event listener, we no longer need it.
	        // Note that 'this' refers to the event source: the button, and
	        // arguments.callee contains a reference to the function itself.
	        this.removeEventListener(e.type,arguments.callee,e.eventPhase);
	    }, false);
}
	 
alertOnClick('You have clicked the button!');
```

В коде используется `e.type` как тип события и `e.eventPhase` как фаза событий.

Переменная `arguments.callee` довольна полезна в таких случаях.

Данные плохо документированные свойства функции являются удобными в использовании. Включайте их в свой арсенал.

Читайте так же статьи по теме: [Стилистические требования к написанию программного кода] (http://en.makeomatic.ru/blog/2013/10/03/StyleGuide/)

