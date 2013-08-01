title: Блог джуниора. 3 статья subtitle: Deleting author: Горшунов Владимир tags: [Блог джуниора] 
Сделал кнопку delete, сразу прикладываю код:<!-- more -->

    $( document ).ready(function() {
      $(".delete").click(function(event){
    	  var that = this;
    	  $.post("/delete", { id: $(this).attr("data-id") }, function(data){
    	  	console.log(data.success);
    	  	if (data.success){
    	  		console.log(that);
    	  		$(that).parent().remove();
    	  	}
    	  });
    	});
    });

#### Post-запрос по клику на кнопку delete

    <button class="delete" data-id="{{=user.id}}" >delete</button>

#### Обрабатываем путь:

    app.post('/delete', secretController.del);

#### Контроллер:

    exports.del = function(req, res) {
    	User.findById(req.body.id, function (err, user) {
    		user.remove();
    	  return res.send ({success: true});
    	});
    };
