title: Блог джуниора. Angular.js + Сервер subtitle: Angular.js author: Горшунов Владимир tags: [Блог джуниора]<br>
Сегодня я хочу немного связать приложение, что я сделал в прошлый день, с сервером. 
Итак, поехали!<!-- more -->

В прошлый раз я обновлял данные на странице, но никуда не записывал, было решено отправлять Post-запрос на сервер, и если сервер отвечал “успехом”, то обновлять.<br>

Сначала добавим $http, как параметр, нужный нам, позволяет совершать запросы на сервер<br>

    var List = function($scope, $http)

У нас есть функция обработки статьи

	$scope.add = function ($event){
	  $scope.news.push(angular.copy($scope.article));
	  $scope.article = {}
	  return false;	
	};

Добавим Post-запрос:

	$http({method: 'POST', url: '/add', data: $scope.article})
	  .success(function(data, status, headers, config) {})
	  .error(function(data, status, headers, config) {});

Добавим в код обновление страницы сайта
        
	$scope.news.push(angular.copy($scope.article));
	$scope.article = {}

И в конце, как и раньше возвращаем false-значение

	return false;

Так же если у нас ошибка на сервере или сервер передает ошибку, мы можем её вывести или как-то обработать.<br>

Итак, мы отправили запрос на сервер, что же делает сам сервер?<br>
В нашем приложении установлена база данных ```MongoDB``` и ```Mongoose``` для связи с ней:<br>

Обрабатываем Post-запрос:<br>
при переходе по пути ```/add``` выполняется функция<br>

	.post('/add', function(req,res){});

Поместим в функцию обработку запроса.<br>
Сначала, создадим переменную item и присвоим ей объект, который получаем

    var item = new News(req.body);

После сохраняем в базу данных, если ошибка, то выводим в консоль<br>
Впоследствии, возвращаем item клиенту

	item.save(function (err, item) {
	  if (err) { console.log(err)}
	  return res.json(item);
	});
