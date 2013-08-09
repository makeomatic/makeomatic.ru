title: Блог джуниора. Веб-программированию с нуля
subtitle:  Идея курса и первый шаг
author: Горшунов Владимир
tags: [Блог джуниора, Node.js, MVC архитектура]
---

#### Что такое блог джуниора?
{% blockquote Виталий Аминев %}
Острая нехватка специалистов на рынке сподвигла компанию Makeomatic создать свой собственный корпоративный университет.
Первый поток обучающихся будет пробным, на нем мы будем формировать материал для дальнейшего изучения.
Курс расчитан на фактическое отсутствие знаний у новичков. Важно лишь системное мышление и желание обучаться.
В целом мы будем охватывать весь материал, который так или иначе связан с HTML5, Javascript, Шаблонизаторами, различными базами данных,
а также плавно перейдем к разработке мобильных приложений, используя PhoneGap.
{% endblockquote %}

#### Практика обучения
Все обучение будет строиться на наборе сквозных проектов, которые имеют применение в реальной жизни. Смею заметить, что все проекты
достаточно простые, и можно найти множество аналогов в опен сорсе.

Первой практической задачей будет ознакомление со стеком `Node.js`, `MongoDB`, `Express.js`, `Less`, `MVC архитектурой`.
Потребуется реализовать следующий простенький функционал: регистрация пользователя, работа с `MongoDB` через ODM `Mongoose`,
хранение пароля в зашифрованном виде, используя `blowfish` как метод шифрования.
<!-- more -->

#### Express.js, MongoDB, Mongoose ODM

##### Краткий экскурс в `Model-View-Controller`

* Модель - используется для работы с данными. Получает их, преобразовывает и отдает в контроллеры
* Контроллер - связующее звено между моделями и видами, агрегирует данные, виды и отдает все это пользователю
* Вид - некий шаблон, которые в совокупности с данными дает в нашем случае на выходе дает разметку HTML5

Зачем и почему используют эту концепцию вы благополучно можете загуглить или захабрить.

##### Express.js - базовый фреймворк для вашего приложения на все времена

{% codeblock app.js lang:js %}
var express = require('express'),
    app = express();

/*
    здесь конфигурируем приложение, добавляем Middleware -- это различные функции, которые выполняются в
    процессе жизненного цикла запроса
*/
var secret = "somesecretforcookie";

app.configure(function(){

        app.set('views', __dirname + "/views");

        app.use(express.compress()); //gzip-сжатие
        app.use(express.bodyParser({limit: '5mb'})); // парсим POST запросы
        app.use(express.cookieParser(secret)); // парсинг кук
        app.use(express.session()); // сессия с хранилищем в памяти
        app.use(express.methodOverride());

        app.use('/static', express.static(__dirname+'/static', { maxAge: oneDay*5 }));
        app.use(app.router);


        app.use(function(err,req,res,next){
          console.error(err);
          res.send("Critical error", 500);
        });

});

require("./routes"); // здесь подключим руты

app.listen(8080);
{% endcodeblock %}
<br/>
Так мы поднимаем веб-сервер на порту 8080, и на все запросы он будет выводить **Hello World!**

Базовая структура проекта:
```
|- models/..
|- views/..
|- controllers/..
|- middleware/..
|- static/.. // различные статичные ассеты (less, js, imgs, etc)
|- package.json // здесь указываем все зависимости
|- app.js // entry-point для нашего проекта
|- config.js // подключения к БД, и тп вещи
|- routes.js // для формирования рутов
```

##### Работа с БД, моделями

``` javascript config.js
var mongoose = require('mongoose');

// инициализируем подключение к БД
exports.db = mongoose.connect(process.ENV.MongoURI || "mongodb://localhost/junior");
```

``` javascript models/User.js
var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

var User = new Schema({
       username: {
        type: String,
        unique: true,
        required: true
       },
       password: {
        type: String,
        required: true
       }
    });

/*
 здесь отдаем модель для дальнейшего использования, альтернативно возможно
 получить эту модель после инициализации через mongoose.model("User");
*/
module.exports = mongoose.model("User", User);
```
<br/>
Далее мы создадим страницу для регистрации - там будет два инпута - username и password. Они будут передавать данные
по руту `POST /register`
Как создать саму страницу - гугл в помощь.
1. Добавим обработчик

``` javascript routes.js

module.exports = function(app){

    app.post("/register", require("./controllers/auth.js").post);

    app.get("/*", function(req,res,next){
       res.send("Hello World!");
    });

}
```

``` javascript controllers/auth.js
var User = require("../models/User.js");


exports.post = function(req,res,next){

   User.genPassword(req.body.password, function(err, hash){
        // обрабатываем возможные ошибки
        if (err) return next(err);

        // создаем пользователя
        User.create({user: req.body.user, password: hash}, function(err, user){
            if (err) return next(err);

            // сохраняем пользователя в сессию, может быть понадобится
            req.session.user = user;

            // говорим что все хорошо
            res.json({success: true});
        });
   });

}
```
<br/>
Добавляем генерацию пароля
``` javascript models/User.js
...
var bcrypt = require('bcrypt'); // отвечает за шифрование паролей, т.к. в базе данных они хранятся зашифрованными. Дополнительно: https://github.com/ncb000gt/node.bcrypt.js/
...

User.statics.genPassword = function(password, callback){
    if (!password) return callback("Не указан пароль");

    bcrypt.hash(password, 10, callback);
};

...
```

На текущий момент мы можем создавать пользователей. Добавим страничку, доступ к которой будет только у зарегистрированного пользователя:

``` javascript middleware/session.js

exports.userOnly = function(req,res,next){
  // если есть юзер в сессии - все хорошо
  if (req.session.user) return next();

  // если нет доступа - то так
  res.send("Нет доступа", 403);
};

```

``` javascript routes.js
var sessionMiddleware = require("./middleware/session");
...

app.get('/secretPage', sessionMiddleware.userOnly, require("./controllers/secretPage").get);

...
```

``` javascript controllers/secretPage.js
exports.get = function (req, res, next) { //для возможности вызова  из другого файла
    res.send("Some secret page");
}
```
<br/>
На сегодня рабочий день подходит к концу, поэтому продолжение следует...
Спасибо за внимание, задавайте вопросы и спрашивайте о топиках, которые интересны.