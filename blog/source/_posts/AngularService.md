title: Блог джуниора. Angular.js Создание сервиса и контроллера subtitle: Angular.js author: Горшунов Владимир tags: [Блог джуниора]<br>
В этой статье, я, как и обещал расскажу про создание сервиса и разберемся с новым шаблоном и, наконец-таки, напишем свой контроллер.<!-- more -->

Итак, для обработки новой страницы делаем следующим образом:<br>
Создаем обработку пути ```/main/package``` <br>
Указываем на новый контроллер и на новый шаблон

	.when('/main/package',
	  {
	    controller: 'MainPackageController',
	    templateUrl: 'partials/mainPackage.html'
	  })

Рассмотрим сначала шаблон:<br>
Мы тут используем директиву ng-repeat, т.к. Нам нужен список из ссылок на разные страницы. Представим, что каждая ссылка ведет в свой пак с уровнями

	<div ng-repeat="package in packages">
	  <a href="#/main/package/{{package.id}}/levels">{{package.id}}</a>
	</div>

```packages``` – это массив из объектов, в каждом хранится id пака уровней, сколько уровней пройдено/всего уровней и сложность пака из уровней. Мы к нему вернемся чуть позднее.

Приступим к нашему контроллеру:<br>
Создаем ```MainPackageController``` и принимаем параметр ```$scope```

	app.controller('MainPackageController', function($scope) {});

Помещаем в контроллер функцию ```init()``` и сразу же её создадим

	init();
	function init(){};

В функции нам нужно указать, где находится packages.<br>
Вот мы и дошли до сервиса.<br>
Сервис у нас будет оперировать с данными, туда и будем просится за нашим массивом  packages. Сервис мы назовём gameService, а функцию, что нам будет выдавать массив назовём getPackages.<br> 
Присваиваем то, что нам выдаст функция переменной packages, которая находится в области $scope:

	$scope.packages = gameService.getPackages();

Для сервиса создадим отдельный файл ```gameService.js``` и добавим его в наш html-файл:

	<script src="services/gameService.js"></script>

Создаём сервис с именем ```gameService```:

	app.service('gameService', function() {})

В сервис мы помещаем  функцию ```getPackages```, которая возвращает нам массив ```packages```.

	this.getPackages = function() {
	    return packages;
	};

Итак, пришло время к созданию массива. В нашем сервисе создаем переменную ```packages```
Проверяем, всё работает:)

	var packages = [
	  {id: 1, levelname: "Beginner", finishedLevels: 0, allLevels: 20},
	  {id: 2, levelname: "Intermediate", finishedLevels: 0, allLevels: 20},
	  {id: 3, levelname: "Professional", finishedLevels: 0, allLevels: 20}
	];