title: Блог джуниора. Angular.js subtitle: Bootstrap author: Горшунов Владимир tags: [Блог джуниора]<br>
В данной мини-статье хочу написать немного об ```Angular.js```.<!-- more -->
```Angular.js``` представляет собой фреймворк для построения веб-приложений.

Основные фичи:<br>
Ангуляр заменяет шаблонизаторы.<br>
Двустороннее связывание данных: автоматическое изменение вида при изменении модели и наоборот.<br>
Директивы, для расширения возможностей html.<br>
А также рутинг, работа с формами, тестируемость и анимация<br>

Простейшее приложение можно создать лишь добавив в html файл:

    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.1.5/angular.min.js"></script>

И добавить ng-app к body или html тегам(по крайней мере, обычно так делают) так:

    <html ng-app>

Некоторые могут подумать, зачем к html прикручивать, объясню:<br>
Cоздавая приложения на ангуляре мы создаём ```$scope``` – область видимости и за пределами области видимости ангуляр не работает. Соответственно, добавляя ng-app в html мы можем также обновлять, например, title тег.<br>
Далее попробую объяснить про MVC в Ангуляре:<br>
В ```Angular.js```, модель(Model) это любые данные, доступные как свойство объекта области видимости.<br>
Видом(View) является DOM загруженный и отображенный в браузере, после того как Angular преобразовал его на основе информации в шаблоне, контроллере и модели.<br>
Контроллер(Controller) является функцией ```JavaScript```, использующейся для расширения экземпляров областей видимости.<br>
Покажу на примере простого приложения:<br>

index.html:

    <!DOCTYPE html>
    <html ng-app> <!-- директива, указывающая на приложение -->
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>test</title>
        <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.1.5/angular.min.js"></script>
        <script type="text/javascript" src="client.js"></script>
        <link rel="stylesheet" type="text/css" href="/css/bootstrap.css">
        <link rel="stylesheet" type="text/css" href="/css/main.css">
      </head>
      <body ng-controller="List"> <!-- создаем контроллер с именем List -->
        <div class="container">
          <header class="page-header">
            <h1>NEWS</h1>
          </header>
          <div>
            <ul class="list-unstyled list-group">
              <li ng-repeat="item in news" class="list-group-item"> <!-- директива ng-repeat создает экземпляры по шаблону для каждого элемента коллекции.-->
                <h3>{{item.subject}}</h3> 
                <article>{{item.content}}</article>
              </li>
            </ul>
            <form name='addForm' class="form-inline" ng-submit="add($event)"> <!-- ng-submit привязывает angular-выражение к событию отправки формы -->
              <input type="text" class="form-control" ng-model="article.subject" placeholder="Enter article's name"/> <!-- данные из модели передаются -->
              <input type="text" class="form-control" ng-model="article.content" placeholder="Enter article's preview"/> <!-- по клику на кнопку Add -->
              <input type="text" class="form-control" ng-model="article.fullContent" placeholder="Enter article" /> <!-- в функцию add() -->
              <button type="submit" class="btn btn-default">Add</button> <!-- обработка которой написана ниже -->
            </form>
          </div>
          <footer class="modal-footer">
            <p>
              &copy; Copyright  by vladimir
            </p>
          </footer>
        </div>
      </body>
    </html>

client.js:

    var List = function($scope){
      $scope.news = [ // создаем массив с данными
        {subject: "111", content: "111!", fullContent: "111!!!"},
        {subject: "222", content: "222!", fullContent: "222!!!"},
        {subject: "333", content: "333!", fullContent: "333!!!"}
      ];
      $scope.add = function ($event){ // обработка нажатия кнопки add
        $scope.news.push(angular.copy($scope.article)); добавляем к массиву новый объект
        $scope.article = {}; // очищаем содержимое input в форме
        return false;    
      };
    };
