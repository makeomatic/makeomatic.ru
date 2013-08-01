title: Блог джуниора. 3 статья subtitle: Deleting author: Горшунов Владимир tags: [Блог джуниора] 
Сделал кнопку delete, сразу прикладываю код:<!-- more -->

{% blockquote %}
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
{% endblockquote %}

#### Post-запрос по клику на кнопку delete

{% blockquote %}
<button class="delete" data-id="{{=user.id}}" >delete</button>
{% endblockquote %}

#### Обрабатываем путь:

{% blockquote %}
app.post('/delete', secretController.del);
{% endblockquote %}

#### Контроллер:

{% blockquote %}
exports.del = function(req, res) {
	User.findById(req.body.id, function (err, user) {
		user.remove();
	  return res.send ({success: true});
	});
};
{% endblockquote %}
