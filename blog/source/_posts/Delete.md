title: Удаление анонимного слушателя событий (anonymous event listeners) в JavaScript
date: 2013-11-20
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
tags: [Javascript]
---

Одна вещь, которую я люблю в JavaScript- это поддержка замыканий 'closure in action'.

```
1	function alertOnClick(message)
2	{
3	    var btn = document.getElementById('btnAlert');
4	    btn.addEventListener('click', function() {
5	        alert(message);
6	    }, false);
7	}
8	 
9	alertOnClick('You have clicked the button!');
```

##alertOnClick

`alertOnClick` функция добавляет анонимного обработчика событий в 
кнопку, которая была определена в HTML как страница, которая обрабатывает script. Обработчик событий не имеет собственных локальных переменных, но используется как ‘cообщение' переменной, обнаруженной во внешней функции. Это пример замыкания JS. Вложенная анонимная функция имеет доступ к аргументам (ссылка) и к функции, содержащей эти переменные. Другими словами, внутренняя функция содержит область видимости внешней функции. Примите к сведению, что внешняя функция не может использовать аргументы и переменные внутренней функции.

Часто мне хочется удалить обработчик событий сразу после того, как случилось это событие. Гораздо проще когда обработчик событий не анонимный, но определить его следует вместо глобальной функции как:

```
01	var message = null;
02	 
03	function clickHandler()
04	{
05	    alert(message);
06	    // Remove the event listener, we no longer need it.
07	    // Note that 'this' refers to the event source: the button.
08	    this.removeEventListener('click', clickHandler, false);
09	}
10	 
11	function alertOnClick()
12	{
13	    var btn = document.getElementById('btnAlert');
14	    btn.addEventListener('click', clickHandler, false);
15	}
16	 
17	message = 'You have clicked the button!';
18	alertOnClick();
```

В данном примере удалить слушатель событий достаточно просто, но этот способ создания слушателя событий имеет недостатки. Для того чтобы обработчик кликов имел доступ к переменной сообщений, мы должны объявить переменную в глобальной области видимости. А это, с технической точки зрения, не так здорово.

##Arguments

Вернемся к нашему первому JS примеру, с которым нет проблем. В этом примере слушатель событий и есть анонимная функция. Для  того, чтобы удалить обработчик событий такого рода, внутри самого обработчика нам потребуется получить ссылку на эту функцию. Для этого мы будем использовать переменную `arguments`, которая возможна в любой функции атоматически. Это содержит не только аргументы, переданные функции, но так же и ссылку на саму функцию: `arguments.callee`. Мы можем так же использовать эту ссылку для удаления анонимного обработчика события после того, как он был вызван.

Здесь первый пример кода с одной дополнительной строкой для удаления ананимного слушателя событий.

```
01	function alertOnClick(message)
02	{
03	    var btn = document.getElementById('btnAlert');
04	    btn.addEventListener('click', function() {
05	        alert(message);
06	        // Remove the event listener, we no longer need it.
07	        // Note that 'this' refers to the event source: the button, and
08	        // arguments.callee contains a reference to the function itself.
09	        this.removeEventListener(e.type,arguments.callee,e.eventPhase);
10	    }, false);
11	}
12	 
13	alertOnClick('You have clicked the button!');
```

В коде используется `e.type` как тип события и `eventPhase` как фаза событий.

Переменная `arguments.callee` довольна полезна в таких случаях.

