title: Блог джуниора. CRUD операции, Mongoose ODM
subtitle:  небольшие инсайты и техники для SPA
author: Горшунов Владимир
date: 2013-08-16
gravatarMail: gorshunov.vladimir@gmail.com
tags: [Для новичков, jQuery, Mongoose]
---

#### Задачи

В прошлый раз мы сделали небольшое приложение, которое позволяет регистрироваться пользователям. У близких к веб-программированию
людей все операции, описанные в предыдущем посте заняли бы минут 15. Этот пост продолжает серию обучающих статей для джуниоров и будет
полезен лишь им.

Итак, задачи на сегодня:
1. Добавить `API endpoint` для модели `User`, используя конвенцию `RESTful`
2. Добавить суперюзера для работы в админке
3. Добавить админку
4. Добавить листинг зарегистрированных пользователей и возможность их удаления

<!-- more -->

#### Организация API-endpoint

Есть несколько технологий по созданию API используя `Mongoose`. Можно использовать готовые модули, но нам нужно разобраться как же это работает,
поэтому сделаем все с нули сами. *Здесь следует отметить, что можно просто дать прямой доступ ко всем API интерфейсу Mongoose, и в целом это неплохая методика,
которая позволит легче использовать один и тот же код на клиенте и на сервере, но об этом в других постах.*
Итак, начнем мы с простого. Добавляем методы в `models/User.js` и настраиваем соответствующие руты:

```javascript routes.js
...
// у нас есть доступ к app, так код выполняется внутри соответствующей функции
// маунтим все запросы по /api/v.1/:model/: и добавляем обработчик
// саму функцию можно вынести в контроллеры, но пока этого не делаем, чтобы сохранить наглядность
app.all('/api/v.1/:model/*', function(req,res,next){
    var method = req.method.toLowerCase(),
        modelName  = req.params.model,
        getParams = req.path.split("/").splice(0,4); // убираем 4 параметра, как нерелевантные для нас, остальное передаем

    try {
        var model = require("./models/"+modelName);

        // добавляем getParams
        req.getParams = getParams;
        model[method](req,res,next);
    } catch (e) {
        // если модуля или метода нет, то возвращаем ошибку
        next(e);
    }
}, function(err,req,res,next){
   // здесь ловим ошибки

   if ( err ) {
        // произошла ошибка - вернем ее, в дальнейшем лучше не возвращать ошибки пользователю напрямую
        res.json({error: err}, 400);
   } else {
        //  все хорошо, но пользователю решили ничего не отдавать
        res.json({success: true});
   }
});

...
```

```javascript models.User.js
...

User.statics.get = function(req,res,next){

    // Следует отметить, что таким образом у всех пользователей есть доступ ко ВСЕМ
    // данным объекта, поэтому следует добавить разграничение доступа и/или убирать данные, которые не должны
    // быть доступны всем

    var id = req.getParams[0];

    if ( id != null ) {
        this.findById(id, function callback(err, user){
           // если ошибка
           if (err) return next(err);
           if (!user) return res.send(404);

           // TODO: не безопасно, но пока сойдет
           res.json(user);
        });
    } else {
        try {
            var query = JSON.parse(req.query.q || "{}"),
                options = JSON.parse(req.query.o || "{}");

            this.find(query, options, function callback(err, users){
                if (err) return next(err);

                // TODO: не безопасно, но пока сойдет
                res.json(users || []);
            }
        } catch (e) {
            next(e);
        }
    }

};

User.statics.post = function(req,res,next){

    var userData = req.body;

    // не делаем валидацию, этим займется Mongoose
    // в дальнейшем можно добавить кастомные проверки помимо валидации и уникальных индексов
    this.create(userData, function callback(err, user){
        if (err) return next(err);
        res.json(user);
    });
};

User.statics.delete = function(req,res,next){

    // здесь для примера добавлю проверку кто же есть наш пользователь
    if ( !req.session.user || req.session.user.isAdmin !== true) {
        return res.send(403);
    }

    var id = req.getParams[0];

    if ( id != null ) {
        this.remove(id, function callback(err){
           // если ошибка
           if (err) return next(err);
           res.send(200);
        });
    } else {
        try {
            var query = JSON.parse(req.query.q || "{}");

            this.remove(query, function callback(err){
                if (err) return next(err);
                res.send(200);
            }

        } catch (e) {
            next(e);
        }
    }
};

...
```
<br/>
По аналогии можно будет организовывать API и для других моделей

#### Добавление суперюзера в SPA

Проделаем данную операцию при инициализации модели `User`

```javascript models/User.js
...

var model = mongoose.model("User", User);
var superUser = {
    username: "root",
    password: "<заранее генерированный хеш>",
    isAdmin: true
};
// так как у нас есть уникальный индекс, то при рестарте приложения новый юзер не будет создаваться,
// а будет возвращаться ошибка - это не существенно
model.create(superUser);

module.exports = model;
```

#### Админка

То как сверстать шаблоны я описывать не буду - это достаточно простое занятие.
Мы добавим рут и соответствующий контроллер. Вход будет разрешен только супер-пользователю.
Он сможет просматривать список зарегистрированных пользователей и удалять их.


``` javascript middleware/session.js

exports.adminOnly = function(req,res,next){
  if (req.session.user && req.session.user.isAdmin) return next();

  // если доступа нет
  res.send("Нет доступа", 403);
};

```

Модифицируем старую страницу, здесь есть пример того как ограничивать доступ к определенным частям приложений только администратору.
Нам следует добавить аналогичные ограничения в `GET`, `DELETE` запросы у модели `Users`.

``` javascript routes.js
var sessionMiddleware = require("./middleware/session");
...

app.get('/admin', sessionMiddleware.adminOnly, require("./controllers/admin").get);

...
```

``` javascript controllers/admin.js
var User = require("../models/User.js");

exports.get = function (req, res, next) { //для возможности вызова  из другого файла
    // отдадим в страничку для рендера
    var context = {};

    // получаем весь список сразу, если он будет большим, можно добавить лимит, инфинит
    // скроллинг, добавить стриминг (здорово экономит память - полезно, когда нужно обработать несколько тысяч объектов)
    User.find({}, function userCallback(err, users){
        if (err) return next(err);

        context.users = users;

        // очередная полезная функция express.js
        // передает контекст в template engine -- тут мы можем выбрать все что нашей душе угодно
        // я пропагандирую DoT.JS - лучшего решения пока не нашел
        res.render("<шаблон для рендера>", context);
    });
}
```

{% codeblock admin.dot lang:html %}
<!-- привожу только вырезку интересных моментов -->
<head>

    <!-- не забываем подключить jquery, до фреймворков пока не доходит дело -->
    <script type="text/javascript" src="/path/to/jquery"></script>

</head>
<body>
    <!-- partials пока не используем, лэйаутов базовых тоже нет -->

    <!-- выводим список юзеров -->
    <!-- использую одинарные { }, дабы статический генератор не пытался обработать их,
         в реальности по умолчанию используются двойные фигурные скобки -->
    <ul>
        {~ it.users: user }
        <li>
            {= user.username }
            <button data-id='{ = user._id }' class='delete'>[x]</button>
        </li>
        {~}
    </ul>


    <script>
        $(function() { //Когда DOM готов
          $(".delete").click(function(event){ // отслеживаем ивент по нажатию на кнопку delete
        	  var $this = $(this); // создаем ссылку на $this
        	  $.ajax({
        	     url: "/api/v.1/Users/"+$this.data("id"),
        	     type: "DELETE",
        	     success: function(response){
                    $this.parent().remove();
        	     },
        	     error: function(response){
        	        alert("ошибка");
        	     }
        	  });
        	});
        });
    </script>
</body>
{% endcodeblock %}


#### Выводы

На примере данных задач мы научились делать следующие вещи:
1. Создавать `RESTful API`
2. Разграничивать доступ к функционалу приложения
3. Вешать обработчики событий и отправлять запросы к серверу
4. Немного манипуляций с DOM
