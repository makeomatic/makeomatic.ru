title: Блог джуниора. Angular.js subtitle: Bootstrap author: Горшунов Владимир tags: [Блог джуниора]
В данной мини-статье хочу написать немного об Angular.js.<!-- more -->
Angular.js представляет собой фреймворк для построения веб-приложений.

Основные фичи:
Ангуляр заменяет шаблонизаторы.
Двустороннее связывание данных: автоматическое изменение вида при изменении модели и наоборот.
Директивы, для расширения возможностей html
А также рутинг, работа с формами, тестируемость и анимация

Простейшее приложение можно создать лишь добавив в html файл:

<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.1.5/angular.min.js"></script>

И добавить ng-app к body или html тегам(по крайней мере, обычно так делают) так:

<html ng-app>

Некоторые могут подумать, зачем к html прикручивать, объясню:
Cоздавая приложения на ангуляре мы создаём $scope – область видимости и за пределами области видимости ангуляр не работает. Соответственно, добавляя ng-app в html мы можем также обновлять, например, title тег.
Далее попробую объяснить про MVC в Ангуляре:
В Angular, модель(Model) это любые данные, доступные как свойство объекта области видимости.
Видом(View) является DOM загруженный и отображенный в браузере, после того как Angular преобразовал его на основе информации в шаблоне, контроллере и модели.
Контроллер(Controller) является функцией JavaScript, использующейся для расширения экземпляров областей видимости.
Покажу на примере простого приложения:

index.html:

<!DOCTYPE html>
<html ng-app>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>test</title>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.1.5/angular.min.js"></script>
    <script type="text/javascript" src="client.js"></script>
    <link rel="stylesheet" type="text/css" href="/css/bootstrap.css">
    <link rel="stylesheet" type="text/css" href="/css/main.css">
  </head>
  <body ng-controller="List">
    <div class="container">
      <header class="page-header">
        <h1>NEWS</h1>
      </header>
      <div ng-controller="List">
        <ul class="list-unstyled list-group">
          <li ng-repeat="item in news" class="list-group-item">
            <h3>{{item.subject}}</h3>
            <article>{{item.content}}</article>
          </li>
        </ul>
        <form name='addForm' class="form-inline" ng-submit="add($event)">
          <input type="text" class="form-control" ng-model="article.subject" placeholder="Enter article's name"/>
          <input type="text" class="form-control" ng-model="article.content" placeholder="Enter article's preview"/>
          <input type="text" class="form-control" ng-model="article.fullContent" placeholder="Enter article" />
          <button type="submit" class="btn btn-default">Add</button>
        </form>
      </div>
      <footer class="modal-footer">
        <p>
          &copy; Copyright  by vladimir
        </p>
      </footer>
    </div>
  </div>
</body>
</html>


client.js:

var List = function($scope){
  $scope.news = [
    {subject: "111", content: "111!", fullContent: "111!!!"},
    {subject: "222", content: "222!", fullContent: "222!!!"},
    {subject: "333", content: "333!", fullContent: "333!!!"}
  ];
  $scope.add = function ($event){
    $scope.news.push(angular.copy($scope.article));
    $scope.article = {}
    return false;    
  };
};
