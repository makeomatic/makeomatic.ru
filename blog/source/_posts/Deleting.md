title: Блог джуниора. Удаление из БД subtitle: Удаление из БД author: Горшунов Владимир tags: [Блог джуниора] <br>
Продолжение предыдущей мини-статьи про удаление из базы данных и странички.
Задача: каждый залогиненный пользователь имеет возможность удалить других из БД<!-- more -->

    $( document ).ready(function() { //Когда DOM готов
      $(".delete").click(function(event){ // отслеживаем ивент по нажатию на кнопку delete
    	  var that = this; // создаем копию переменной this, называем that, для дальнейшего использования
    	  $.post("/delete", { id: $(this).attr("data-id") }, function(data){ // Отправляем post-запрос на сервер, передавая id пользователя
    	  	if (data.success){ // проверяем пришло ли сообщение с сервера об "успехе"
    	  		$(that).parent().remove(); // и если данные из бд удалены удаляем строчку со странички
    	  	}
    	  });
    	});
    });

#### Post-запрос по клику на кнопку delete

    <button class="delete" data-id="{{=user.id}}" >delete</button>

#### Обрабатываем путь:

    app.post('/delete', secretController.del); // сервер принимает post-запрос и выполняет функцию del, которая находится во внешнем контроллере secretController

#### Контроллер:

    exports.del = function(req, res) {
    	User.findById(req.body.id, function (err, user) { // ищем пользователя в БД по id
    		user.remove(); // удаляем его
    	  return res.send ({success: true}); // И возвращаем сообщение о том, что всё прошло успешно
    	});
    };
