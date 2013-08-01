title: Блог джуниора. 4 статья subtitle: Deleting author: Горшунов Владимир tags: [Блог джуниора] 
Уделил время новому twitter bootstrap 3 RC1.<!-- more -->

Раньше много времени уделял, в основном, серверной части, а сейчас решил взяться за клиентскую. Стоило лишь добавить одну строчку в layout.dot, как странице уже стала выглядеть лучше:

{% blockquote %}
<link rel="stylesheet" type="text/css" href="/css/bootstrap.min.css">
{% endblockquote %}

Посмотрел bootstrap.css и документацию:
шаблон теперь выглядит так:

{% blockquote %}
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
    <div class="container">
      <header class="page-header">
        <h1>index</h1>
      </header>
      {{=it.body}}
      <footer class="modal-footer">
        <p>
          &copy; Copyright  by vladimir
        </p>
      </footer>
    </div>
  </body>
</html>
{% endblockquote %}

#### Cтраница логина:

{% blockquote %}
<form class="form-inline" method="post" action="/login">
  <input type="text" class="form-control login" placeholder="Enter username" name="username">
  <input type="password" class="form-control login" id="exampleInputPassword" placeholder="Password" name="password">
  <button type="submit" class="btn btn-default">Sign in</button>
</form>
{% endblockquote %}

#### Закрытая страница так:

{% blockquote %}
<p>All Database:</p>
<ul class="database list-unstyled list-group">
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
{% endblockquote %}

#### Регистрация так:

{% blockquote %}
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
{% endblockquote %}
