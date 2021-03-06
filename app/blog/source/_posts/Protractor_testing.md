title: Эффективное сквозное тестирование с Protractor
subtitle: Часть 1
date: 2015-01-05
author: Eleonora Pavlova
gravatarMail: koko@reevlodge.com
cover: https://makeomatic.ru/blog/images/Protractor_testing.png
coverWidth: 540
coverHeight: 514
url: https://makeomatic.ru/blog/2015/01/05/Protractor_testing/
tags: [Javascript, AngularJS]
---

![Иллюстрация блокнота](/blog/images/Protractor_testing.png)

С AngularJS действительно удобно работать, поскольку тестам изначально придаётся большое значение - каждое изменение, внесённое в исходники, тестируется перед сохранением в ядро.

<!-- more -->

Тестирование крайне важно, особенно в Javascript - языке с динамической проверкой типов. Тесты позволяют отловить ошибки до того, как они попадут в продакшн. Уже не говоря о том, что они повышают качество кода.

Баги неизбежны в любом коде, и наша задача уметь их отыскать и постараться починить до  того, как они проявят себя в конечном продукте. В тестовой среде появляется возможность изолировать части функционала и «пощупать» приложение изнутри.

#### Тестирование — неотъемлемая часть работы, если мы хотим понимать, что происходит в приложении.

В данной статье мы рассмотрим сквозное (e2e) тестирование приложений. Сквозное тестирование — это поведенческое тестирование по методу «чёрного ящика» (проверка выполнения приложением заданных функциональных требований, при которой не используются знания о внутренней структуре тестируемого объекта). То есть мы тестируем, что система работает, как планировалось, с точки зрения конечного пользователя.

Пользователю всё равно, работает ли приложение «как планировалось», ему важно, чтобы функционал работал в соответствии с его собственными ожиданиями. Тестирование по сути это  автоматизированный запуск приложения в браузере и последовательные действия, проверяющие весь функционал пользовательского интерфейса. Совершать все эти действия вручную было бы крайне неэффективно, поэтому создадим автоматические тесты.

### Автоматизация с помощью Protractor

Protractor –  рекомендуемый фреймворк для сквозного тестирования.  В отличие от стандартного исполнителя сценариев Angular, Protractor сделан на основе Selenium [WebDriver](https://code.google.com/p/selenium/wiki/WebDriverJs) - инструмента для автоматизированного тестирования веб-приложений, с API и набором расширений, позволяющих управлять поведением браузера. Расширения WebDriver есть для всех типов браузеров, включая наиболее популярные. Таким образом, мы получаем быстрое и стабильное тестирование в реальной браузерной среде.

К счастью, Protractor работает в связке с Jasmine, так что тем, кто знаком с этим фреймворком, не придётся изучать новый. Но можно установить его и как самостоятельный исполнитель тестов или использовать как библиотеку.


### Установка

В отличие от стандартного исполнителя сценариев, для работы Protractor нужно запустить отдельный сервер по адресу  `http://location:4444` (можно перенастроить). К счастью, в дистрибутиве Protractor имеется утилита, упрощающая процесс установки Selenium Server. Чтобы воспользоваться скриптом, необходимо установить Protractor локально в корневой каталог тестируемого Angular приложения.

`$ npm install protractor`

Далее запускаем скрипт-загрузчик Selenium (расположен в локальном каталоге `node_modules/`) командой:

`$ ./node_modules/protractor/bin/webdriver-manager update`

Этот скрипт загружает файлы, необходимые для запуска Selenium, и создаёт соответствующий каталог. Когда всё загружено, запускаем Selenium с драйвером Chrome командой старт:

` $ ./node_modules/protractor/bin/webdriver-manager start`

Если у вас возникают проблемы при запуске Selenium, попробуйте обновить ChromeDriver, загрузив последнюю версию [здесь](http://chromedriver.storage.googleapis.com/).

Теперь можем работать с Protractor, подключившись к серверу Selenium, который работает в фоновом режиме.

### Настройка

Наподобие таск-раннера Karma, для запуска и работы с Selenium нужен конфигурационный файл.  Наиболее простой способ создания конфигурационного файла Protractor - скопировать базовую конфигурацию из каталога установки.

`$ cp ./node_modules/protractor/example/chromeOnlyConf.js protractor_conf.js`

Для старта Protractor в файле необходимо сделать несколько изменений. Во-первых,  по умолчанию конфигурационный файл использует драйвер Chrome, которого нет в текущей директории. Поэтому мы должны указать путь к драйверу в локальной папке `./node_modules`.

```js
chromeDriver: './node_modules/protractor/selenium/chromedriver',
```

Далее нужно изменить путь массива specs, указав на наши локальные тесты.

```js
specs: ['test/e2e/**/*_spec.js'],
```

При настройке тестов в Protractor существует множество различных параметров конфигурации. В этой статье мы затронем некоторые из них, но помните, что существует и немало других опций.

Есть два варианта запуска тестов. Первый, автономный режим — использовать Protractor для запуска Selenium, когда запускаем наши тесты. Пример файла конфигурации в данной статье использует этот метод.

```js
chromeOnly: true,
chromeDriver: './node_modules/protractor/selenium/chromedriver',
```

Второй вариант предполагает подключение к отдельно запущенному серверу Selenium. Когда тесты становятся более сложными, вероятно, целесообразнее использовать этот вариант.

В этом случае нужно удалить указанные выше настройки (chromeOnly и chromeDriver), и добавить параметр seleniumAddress, указывающий путь к запущенному серверу Selenium:

```js
seleniumAddress: 'http://0.0.0.0:4444/wd/hub',
```

### Написание тестов

При написании тестов в Protractor используется фреймворк Jasmine. То есть мы пишем тесты точно так же, как для Karma. Пример простого теста в Protractor:

```js
describe('homepage', function() {
  beforeEach(function() {
    // функция before
  });

  it('should load the page', function() {
    // далее тест
    expect(...).toEqual('hello');
  });
});
```

В примере приведён не полный код, но структура узнаваема — синтаксис Jasmine. Для создания структуры тестов используем функции `beforeEach()`, `afterEach()`  и вложенные блоки `describe()`. Для выполнения тестов используем синтаксис Jasmine – `expect()`.
При написании тестов в Protractor нам понабодятся некоторые его глобальные переменные. Ниже приведены некоторые из них.
browser – оболочка вебдрайвера, используется для навигации и получения информации о странице.

#### Browser

Можем использовать переменную browser для перехода на страницу с помощью функции `get()`:

```js
beforeEach(function() {
  browser.get('http://127.0.0.1:9000/');
});
С объектом browser можно также проделывать разные штуки. Например, дебаггинг с помощью метода debugger() :
it('should find title element', function() {
  browser.get('app/index.html');

  browser.debugger();

  element(by.binding('user.name'));
});
```

Для использования этого теста в отладчике node, запускаем его в режиме отладки:

`$ protractor debug conf.js`

Запуская Protractor в режиме отладки, мы получаем бонус — выполнение в браузере останавливается, и теперь все клиентские скрипты Protractor доступны нам из консоли. Чтобы получить к ним доступ, нужно вызвать объект Protractor – `window.clientSideScripts.`

### Начнём тестировать!

Можно долго рассказывать о том, для чего нужно использовать Protractor, гораздо сложнее его нормально настроить. Тк мы стремимся к высокому качеству материалов по Angular, давайте уже углубимся в тестирование приложения и различные стратегии.

### Наше приложение

Давайте для примера возьмём приложение, реализующее свой вариант просмотра [Github issues](https://github.com/). Простое приложение, у которого всего несколько функций:

* Оно позволяет указывать владельца репозитория и URL через окно ввода;
* В нём имеется главная страница и страница About;
* issues упорядочены друг под другом;
* используется Gravatar пользователя.

Наше конечное приложение выглядит вот так (картинка 1 a, b - из статьи):

![Иллюстрация блокнота](/blog/images/protractor1.png)

![Иллюстрация блокнота](/blog/images/protractor2.png)

При написании тестов для каждого приложения необходимо продумать стратегию.  Можно написать слишком много тестов для очень простого приложения, а можно, наоборот, слишком мало. Найдя правильный баланс между двумя крайностями, мы здорово поможем себе, когда возьмёмся за реализацию приложения и тестов к нему.  

### Стратегия тестирования

По опыту, наилучший баланс между написанием тестов и написанием кода достигается тогда, когда вы чётко понимаете, что тестировать и как именно тестировать. Когда мы пишем тест, важно, чтобы он проверял именно то поведение, которое задумано. То есть, мы не должны писать тест, чтобы проверить, меняется ли содержание тэга `h1`,  потому что мы вводим текст в поле `<input>`.  А вот проверить фильтрацию нашей фичи «поиск в режиме реального времени» (Live Search) нужно.

Мы пришли к выводу, что писать тесты заранее, на стадии прототипирования, не имеет смысла. В этой стадии можно написать пару тестов максимум, потому что мы всё ещё продумываем функции нашего приложения. А вот по мере роста приложения уже стоит писать больше тестов, чтобы убедиться, что оно ведёт себя так, как задумано в продакшене.

Наконец, нужно структурировать тесты так, чтобы каждый блок проверял какую-то свою, очень маленькую задачу. В идеале тест должен проверять не более 1 ожидаемого события.

Ну, хватит теории, применим стратегию на практике.

Во-первых, нужно проверить, что наше приложение добавляет название репозитория, с которым мы будем работать. Используя функционал Angular, приложение делает `http` запрос к `github.com`. Этот запрос возвращается, и мы заполняем оставшиеся поля главной страницы.

Во-вторых, необходимо протестировать изменение навигации и содержания страницы. Этот тест предполагает нажатие навигационной кнопки для изменения местоположения `$location`.

Поехали!

### Создаём первые тесты

Наш файл конфигурации Protractor довольно прост и почти не отличается от базового конфига, который поставляется при установке:

```js
// пример файла конфигурации
exports.config = {
  seleniumAddress: 'http://0.0.0.0:4444/wd/hub',
  capabilities: { 'browserName': 'chrome' },
  specs: ['test/e2e/**/*.spec.js'],
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }
};
```

Будем писать тесты в папке `test/e2e`, как и указали в конфигурационном файле в виде `[name].spec.js`. Создадим наш первый тест под названием `main.spec.js`.

Набросаем простую «рыбу»:

```js
// в test/e2e/main.spec.js
describe('E2E: main page', function() {
  // здесь будут наши тесты
});
```

Тк мы пишем тесты на фреймворке Jasmine, воспользуемся блоком `beforeEach()`. Также необходимо отслеживать экземпляр Protractor, создадим для этого переменную `ptor`. Для каждого теста будем использовать объект browser для перехода на главную страницу.

При сквозном тестировании,  нужен запущенный сервер, на котором будут осуществляться наши тесты.

```js
describe('E2E: main page', function() {
  var ptor;

  beforeEach(function() {
    browser.get('http://127.0.0.1:9000/');
    ptor = protractor.getInstance();
  });

});
```

Вместо того, чтобы указывать полный URL каждый раз, когда хотим протестировать страницу, можем добавить параметр `baseUrl` в конфигурационный файл Protractor. Далее будем считать, что этот параметр в конфиге у нас выглядит так:

`baseUrl: 'http://127.0.0.1:9000/',`

Первый тест убедится, что главная страница загружается: проверим наличие элемента на странице. Поскольку на главной странице есть идентификатор  #home, создадим ожидание, проверяющее наше условие.

Сначала выберем `<div>` с идентификатором `#main` с помощью функции `by.id()`:

```js
it('should load the home page', function() {
  var ele = by.id('home');
});
```

Получив нужный элемент, с помощью Protractor метода `isElementPresent()`: зададим ожидание, проверяющее присутствие элемента на странице:

```js
it('should load the home page', function() {
  var ele = by.id('home');
  expect(ptor.isElementPresent(ele)).toBe(true);
});
```

Для тестирования необходимо запустить сервер Selenium. К счастью, `webdriver-manager` облегчает нам жизнь (эта утилита автоматически включена в Protractor). Итак, запускаем  `webdriver-manager`:

`$ ./node_modules/protractor/bin/webdriver-manager start`

Запускаем Protractor в новом терминале. Двоичный файл `Protractor` принимает один аргумент — конфигурационный файл:

`$ ./node_modules/protractor/bin/protractor protractor_conf.js`

![Иллюстрация блокнота](/blog/images/protractor3.png)

### Тестируем поле ввода

Приступим к тестированию `<input>`.  Главная страница загружает одну форму с одним полем ввода, которое отображается, если пользователь сам не выбрал репозиторий для поиска issues. `input type="text"` привязан к модели `repoName`. После заполнения, форма исчезает и появляется нужный список issues.

![Иллюстрация блокнота](/blog/images/protractor5.png)

HTML выглядит так:

```js
<div id="repoform" class="main" ng-if="!repoName">
  <form ng-submit="getIssues()" class="input-group">
    <div class="input-group">
      <input type="text" ng-model='repo.name' placeholder='Enter repo name' />
      <span class="input-group-btn">
        <input type="submit" class="btn btn-primary" value="Search">
      </span>
    </div>
  </form>
</div>
```

Нам важно протестировать, что заполненная форма исчезает, и на её месте появляется нужный список issues. Поэтому в следующем тесте  выбираем элемент `<input>` и заполняем его, для этого применим к нему метод `sendKeys()`. Для выделения самого элемента `input` воспользуемся методом  `by.input()` , который найдёт элементы `<input>`, содержащие привязку к `ng-model`:

 ```js
 it('the input box should go away on submit', function() {
  element(by.input('repo.name')).sendKeys('angular/angular.js\n');
});
```

При прогоне этого теста увидим, что  поле `<input>` заполняется. Никаких ожиданий нет, тк мы их ещё не написали, но видим, что в поле ввода появляется `angular/angular.js`.  

Чтобы поле ввода исчезло, нужно отправить заполненную форму. Наиболее просто это сделать, сымитировав нажатие клавиши enter. Поэтому в методе `sendKeys()` добавили сочетание `\n` , которое имитирует нажатие enter в элементе `<input>`.  

Теперь осталось написать ожидание, что элемент `repoForm` более не существует на странице (тк мы прячем его с помощью `ng-if`).

Используем для этого упомянутый ранее метод:

```js
it('the input box should go away on submit', function() {
  element(by.input('repo.name')).sendKeys('angular/angular.js\n');
  expect(ptor.isElementPresent(by.id('repoform'))).toBe(false);
});
```

В части 2 мы протестируем список `<issues>` и навигацию. Держите руку на пульсе!
