title: Блог джуниора. Twitter Bootstrap subtitle: Bootstrap author: Горшунов Владимир tags: [Блог джуниора]<br>
На днях была выпущена новая версия twitter bootstrap 3 RC1. 
А т.к. никаких стилей для предыдущего проекта я не делал, решил чуть приукрасить страницу<!-- more -->

Подключается на клиенте. Стоило лишь добавить одну строчку в layout.dot, как странице уже стала выглядеть лучше:

    <link rel="stylesheet" type="text/css" href="/css/bootstrap.min.css">
    // у bootstrap'а есть минифицированная версия и удобоваримая, для людей, скачивается всё одним архивом, проблем быть не должно

Посмотрел bootstrap.css и документацию и преобразил все основные шаблоны, которые использовал в проекте:

    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>index</title>
        <script type="text/javascript" src="/js/jquery-2.0.3.js"></script>
        <script type="text/javascript" src="/js/client.js"></script>
        <link rel="stylesheet" type="text/css" href="/css/bootstrap.css">
        <link rel="stylesheet" type="text/css" href="/css/main.css">
      </head>
      <body>
        <div class="container"> // добавил класс container для центрирования страницы
          <header class="page-header"> // преобразил header
            <h1>index</h1>
          </header>
          {{=it.body}}
          <footer class="modal-footer"> // и footer, выглядит симпатично, большего, пока что, не требуется
            <p>
              &copy; Copyright  by vladimir
            </p>
          </footer>
        </div>
      </body>
    </html>

#### Cтраница логина:

    <form class="form-inline" method="post" action="/login"> //form-inline для реализации логина в одну строчку
      <input type="text" class="form-control login" placeholder="Enter username" name="username"> // form-control по умолчанию растягивает поле на всю ширину страницы
      <input type="password" class="form-control login" placeholder="Password" name="password"> // но нам этого не нужно, поэтомо отдельно в css-файле добавляем width: 150px
      <button type="submit" class="btn btn-default">Sign in</button> //обычная кнопка, со своими стилями
    </form>

#### Закрытая страница так:

    <p>All Database:</p>
    <ul class="database list-unstyled list-group"> // список без точек + объявляем как список
      {{~ it.users: user }}
        <li class="list-group-item">
          <div>{{=user.name}}</div>: 
          <div>{{=user.pass}}</div>
          <button class="delete btn btn-danger btn-small" data-id="{{=user.id}}" >delete</button> || <button class="edit btn btn-warning btn-small disabled" data-id="{{=user.id}}" >edit</button>
      </li>
      {{~}}
    </ul>
    <form method="get" action="/logout">
      <p class="text-success">Залогинен!</p>
      <button class="btn btn-primary">Log Out</button>
    </form>

#### Регистрация так:

    <form method="post" action="/register" class="form-horizontal">  
    </form>
    <form method="post" action="/register">
      <fieldset>
        <div class="form-group">
          <label for="inputUsername" class="col-lg-2 control-label register">Username</label>
          <div class="col-lg-10">
          <input name="user" type="text" class="form-control user" id="inputUsername" autocomplete="on" placeholder="Enter username">
         </div>
        </div>
        <div class="form-group">
          <label for="inputPassword" class="col-lg-2 control-label register">Password</label>
          <div class="col-lg-10">
            <input name="pass" type="password" class="form-control" id="inputPassword" placeholder="Password">
            <div class="checkbox">
              <label>
                <input type="checkbox"> Remember me
              </label>
            </div>
            <button type="submit" class="btn btn-default">Register</button>
          </div>
        </div>
      </fieldset>
    </form>
Чтобы не мельчить, напишу тут:
форму делим на 2 колонки с отношением 2 к 10, label + input соответственно
