title: Совместное использование модулей между NodeJS и AngularJS
date: 2014-03-17
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
cover: http://makeomatic.ru/blog/images/modules.jpg
coverWidth: 623
coverHeight: 467
url: http://makeomatic.ru/blog/2014/03/17/Sharing_modules/
tags: [AngularJS, Node.js]
---

![Иллюстрация блокнота](/blog/images/modules.jpg)
Gist: https://gist.github.com/sevcsik/9207267

Они говорят, что одно из преимуществ в NodeJs в том, что вы работаете с один языком как в бэкэнде, так и во фронтэнде, поэтому проще использовать один и тот же код между ними.  В теории звучит классно, но на практике синхронная обработка зависимостей в Node.js работает совершенно не так, как в любом клиентском фреймворке (они асинхронны).

<!-- more -->
Обычно это означает, что вы заканчиваете копи-пастом вашего кода между NodeJS и клиентской частью приложения или вы используете великолепные инструменты типа Browserify, но они добавляют дополнительный шаг в процессе сборки и вероятно будут конфликтовать с обработкой зависимостей в выбранном вами фреймворке (как AnularJS DI). Мне было бы стыдно называть это общим кодом (code sharing).

К счастью, с парой строчек шаблонного кода вы можете написать модуль, который работает как в NodeJS, так и в AngularJS без каких-либо изменений.

```js
// We will pass these to the wrapper function at the end of the file
(function(isNode, isAngular) {

// This wrapper function returns the contents of your module, 
// with dependencies
var SilverBulletModule = function(Bullet, Silver) {
  var SilverBullet = function() {
    // something awesome happens here
  };
  return SilverBullet;    
};

if (isAngular) {
  // AngularJS module definition
  angular.module('app.silverbullet', ['app.silver', 'app.bullet']).
    factory('SilverBullet', ['Bullet', 'Silver', SilverBulletModule]);
} else if (isNode) {
  // NodeJS module definition
  module.exports = SilverBulletModule(
    require('bullet.js'), 
    require('silver.js')
  );
}

})(typeof module !== 'undefined' && module.exports,
  typeof angular !== 'undefined');   
  ```
Вот и все. Без глобальных переменных во фронтэнде и с работающими зависимостями. Переменные `isNode` и `isAngular` находятся в замыкании, поэтому они могут быть использованы для переключения между платформо-зависимыми блоками кода (такими как angular.extend и node.extend). Так как вам понадобятся ветви `isAngular` и `isNode` в любом случае, то нам потребуется сделать функцию-обертку на фронт-энде. Всего 4 дополнительных строчки кода требуются, чтобы сделать ваш модуль совместимым с клиентом и с сервером.
Портирование в RequireJS будет аналогичным, так как он в том числе использует функции-обертки и зависимости как аргументы функции.

Читайте так же статьи по теме:

* [Data service для работы с API в AngularJS](http://makeomatic.ru/blog/2014/04/22/Module_in_AngularJS/)


