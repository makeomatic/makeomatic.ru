title: Улучшение логирования в AngularJS с помощью декораторов
date: 2014-01-06
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
tags: [Javascript]
---

Давайте выясним как использовать Декораторы (`Decorators`) для улучшения логирования в AngularJS и придания суперсил `$log` сервису. AngularJS имеет отличную скрытую возможность - `$provider.decorator()`. Она позволяет разработчикам перехватывать выполнение вызовов к сервисам и убирать, контролировать или изменять возможности этих сервисов. Возможность декорирования была спрятана не специально… скорее она затерялась среди других отличных возможностей AngularJS. В этой статье я представлю `Decorator` и покажу как постепенно добавлять функциональность к `$log` сервису… при этом практически не меняя созданные вами сервисы и контроллеры.

<!-- more -->
## Представляем $provide.decorator()

Процесс перехвата происходит в тот момент, когда экземпляр сервиса уже создан и может быть использован на:
* AngularJS built-in services: $log, $animate, $http, etc.
* Custom services: $twitter, $facebook, authenticator, etc.
In fact angular-mocks.js uses the decorator() to add
* встроенных в AngularJS сервисах: `$log`, `$animate`, `$http`, и т.д.
* собственных сервисах: `$twitter`, `$facebook`, `authenticator`, и т.д.

Более того, `angular-mocks.js` использует `decorator()`, чтобы добавить:
* `flush()` к `$timeout`,
* `respond()` к `$httpBackend`, и
* `flushNext()` к `$animate`

Так как мы добавляем или меняем поведение в момент построения сервиса, мне хотелось бы сказать, что `decorator()` позволяет нам внедрять собственные модели поведения. Итак, давайте выясним как вы можете использовать `decorator()` для *улучшения* AngularJS `$log` сервиса.
Перед тем как вы продолжите читать эту статью, я настоятельно рекомендую, чтобы вы сначала прочитали про ***внедрение зависимостей*** используя обучения в RequireJS и AngularJS, потому что многие примеры используют RequireJS `define()` и внедрение зависимостей.

##Представляем AngularJS $log

AngularJS имеет встроенный сервис `$log`, который очень полезен для  логирования сообщений об ошибках (как и дебаг информацию) в консоль. Используя этот сервис, разработчики могут просто контролировать процесс работы приложения, проверять правильность последовательности вызова функций и так далее. Более того, так как логирование используется очень часто, то разработчики постоянно недовольны, ведь им вечно требуется большее количество возможностей, чем дает стандартная консоль.
Я утверждаю, что разработчикам Ангуляра никогда не следует напрямую использовать `console.log()`для логирования сообщений в целях дебага. Вместо этого, пожалуйста, используйте `$log` …
Перед тем как говорить о расширении функционала, давайте сначала посмотрим на стандартное применение `$log`. Для наших целей, я буду использовать демо-приложение, которое показывает диалог для входа пользователю и предоставляет прототип сервиса авторизации. Внизу - скриншот демо-приложения.
 
Вот и пример использования нормального (не улучшенного) `$log` сервиса внутри прототипа сервиса авторизации.
```js
// *********************************************
// bootstrap.js
// *********************************************

(function()
{
	"use strict";

    /**
     * Mock Authenticator with promise-returning API
     */
    var Authenticator = function( session, $q, $log)
        {
                /**
                 * Mock login() service for authenticatator.
                 * @returns {Deferred.promise|*}
                 */
            var login = function(username, password)
                {
                    var dfd      = $q.defer(),
                        errorMsg = "Bad credentials. Please use a username of 'admin' for this mock login !";

                    $log.debug( supplant("login( `{0}` )", [username]) );

                    if( (username != "admin") && (password != "secretPassword") )
                    {
                        $log.debug( supplant( "login_onFault( `{0}` )", [errorMsg]) );
                        dfd.reject( errorMsg );
                    }
                    else
                    {
                        $log.debug( supplant("login_onResult(username = {0}, password = {1})", [username, password]) );

                        session.sessionID = "SESSION_83732";
                        session.username = username;

                        dfd.resolve(session);
                    }

                    return dfd.promise;
                },
                /**
                 * Mock service for logout.
                 * @returns {Deferred.promise|*}
                 */
                logout = function()
                {
                    var dfd = $q.defer();

                    $log.debug("logout()");

                    session.sessionID = null;
                    dfd.resolve();

                    return dfd.promise;
                };

            return {
                login : login,
                logout: logout
            };
        },
        /**
         * LoginController used with the login template
         */
        LoginController = function( authenticator, $scope, $log )
        {
            var onLogin = function()
            {
                $log.debug( supplant( "login( `{userName}` )", $scope ) );

                authenticator
                    .login( $scope.userName, $scope.password )
                    .then(
                    function (result)
                    {
                        $log.debug( supplant( "login_onResult( `{sessionID}` )", result) );

                        $scope.hasError = false;
                        $scope.errorMessage = '';
                    },
                    function (fault)
                    {
                        $log.debug( supplant("login_onFault( `{0}` )", [fault]) );

                        $scope.hasError = true;
                        $scope.errorMessage = fault;
                    }
                );
            };

            $scope.login    = onLogin;
            $scope.userName = '';
            $scope.password = '';

            $scope.hasError = false;
            $scope.errorMessage = '';
        },
        appName = "myApp.Application";

    /**
     * Start the main application
     * We manually start this bootstrap process; since ng:app is gone
     * ( necessary to allow Loader splash pre-AngularJS activity to finish properly )
     */

    angular.module(     appName,             [ ]             )
           .value(      "session",           { sessionID : null })
           .factory(    "authenticator",     ["session", "$q", "$log", Authenticator]   )
           .controller( "LoginController",   [ "authenticator", "$scope", "$log", LoginController ] );

    angular.bootstrap( document.getElementsByTagName("body"), [ appName ]);

}());
```

Когда логин форма отправляется и `LoginController::login('Thomas Burleson', 'unknown')`вызван, `$log` выведет данные в консоль браузера:
```js
login( ‘Thomas Burleson’)`
login( ‘Thomas Burleson’)`
login_onFault( ‘Bad credentials. Please use a username of ‘admin’ for mock logins !’ )
login_onFault( ‘Bad credentials. Please use a username of ‘admin’ for mock logins !’ )
```
Вывод консоли показывает, что `LoginController` и `Authenticator` в данный момент корректно выводит данные в консоль
* Но вывод консоли вводит в замешательство!
* Какой экземпляр класса вызва `$log.debug()`?


Для решения этой проблемы мы можем модифицировать каждый вызов `$log.debug()`, чтобы вручную добавлять название класса и даже временной штамп к каждому из них; также временные марки позволят нам периодически проверять процесс исполнения кода.

Но ***НЕ*** делайте этого… Это решение для начинающих и оно чертовски убого. Вот пример вывода, который мы хотели бы увидеть:
10:22:15:143 – LoginController::login( `Thomas Burleson` )
10:22:15:167 – Authenticator::login( `Thomas Burleson` )
10:22:15:250 – Authenticator::login_onFault( `Bad credentials. Please use a username of ‘admin’ for mock logins !` )
10:22:15:274 – LoginController::login_onFault( `Bad credentials. Please use a username of ‘admin’ for mock logins !` )

Перед тем как начать изменение ***ВСЕХ*** классов (так бы сделал начинающий разработчик), давайте остановимся и предположим, что `$provide.decorator()` позволит нам сделать это централизованно, и, более того, изменить или убрать любую функциональность. 
##Используем $provider.decorator()

Давайте используем ` $provider.decorator()` для перехвата вызовов к `$log.debug()` и динамически присоединим временные метки.

```js
(function() {
  "use strict";

    angular
      .module( appName, [ ] )
      .config([ "$provide", function( $provide )
      {
            // Use the `decorator` solution to substitute or attach behaviors to
            // original service instance; @see angular-mocks for more examples....

            $provide.decorator( '$log', [ "$delegate", function( $delegate )
            {
                // Save the original $log.debug()
                var debugFn = $delegate.debug;

                $delegate.debug = function( )
                {
                  var args    = [].slice.call(arguments),
                      now     = DateTime.formattedNow();

                  // Prepend timestamp
                  args[0] = supplant("{0} - {1}", [ now, args[0] ]);

                  // Call the original with the output prepended with formatted timestamp
                  debugFn.apply(null, args)
                };

                return $delegate;
            }]);
      }]);

})();
```
В этом случае мы использовали head-hook перехватчик, чтобы присоединить строку к началу и  ***после*** вызвать исходную функцию.  Другие декораторы  могут использовать tail-hook перехватчики или ***replace*** перехватчики. Разнообразие вариантов впечатляет. С вышеприведенными улучшениями вывод консоли покажет что-то похожее на:
```
10:22:15:143 – login( `Thomas Burleson` )
10:22:15:167 – login( `Thomas Burleson` )
10:22:15:250 – login_onFault( `Bad credentials. Please use a username of ‘admin’ for mock logins !` )
10:22:15:274 – login_onFault( `Bad credentials. Please use a username of ‘admin’ for mock logins !` )
```

Но мы ведь еще хотели включить название класса для каждого вызванного метода!
* А вы заметили , что только `$log.debug()` был декорирован?
* Как на счет декорирования  других функций, таких как `.error(), .warning()` и т.д.?
Достичь данного результата будет чуть сложнее… но не так сложно как вам может показаться!

##Переработка для повторного использования кода

Перед тем, как мы расширим `LogEnhancer` еще большей функциональностью, давайте реорганизуем наш код. Мы переработаем его для того, чтобы мы смогли с легкостью повторно использовать его же в различных приложениях.

```js
// **********************************
// Module: bootstrap.js
// **********************************

(function() {
  "use strict";

  var dependencies = [
    'angular',
    'myApp/logger/LogDecorator',
    'myApp/services/Authenticator',
    'myApp/controllers/LoginController'
  ];

  define( dependencies, function( angular, LogDecorator, Authenticator, LoginController )
  {
    // Configure the AngularJS HTML5 application `myApp`

    angular
      .module(     "myApp",           [ ]              )
      .config(     LogDecorator                        )
      .service(    "authenticator",   Authenticator    )
      .controller( "LoginController", LoginController  );

  });

})();
// *****************************************
// Module: myApp/logger/LogDecorator.js
// *****************************************

(function()
{
  "use strict";

  var dependencies = [
    'myApp/logger/LogEnhancer'
  ];

  define( dependencies, function( enchanceLoggerFn )
  {
      var LogDecorator = function( $provide )
          {
              // Register our $log decorator with AngularJS $provider

              $provide.decorator( '$log', [ "$delegate", function( $delegate )
              {
                  // NOTE: the LogEnchancer module returns a FUNCTION that we named `enchanceLoggerFn`
                  //       All the details of how the `enchancement` works is encapsulated in LogEnhancer!

                  enchanceLoggerFn( $delegate );

                  return $delegate;
              }]);
          };

      return [ "$provide", LogDecorator ];
  });

})();
// ****************************************
// Module: myApp/logger/LogEnhancer.js
// ****************************************

(function()
{
  "use strict";

  var dependencies = [
    'myApp/utils/DateTime',
    'myApp/utils/supplant'
  ];

  define( dependencies, function( DateTime, supplant )
  {
    var enchanceLogger = function( $log )
        {
          // Save the original $log.debug()
          var debugFn = $log.debug;

          $log.debug = function( )
          {
            var args    = [].slice.call(arguments),
                now     = DateTime.formattedNow();

                // prepend a timestamp to the original output message
                args[0] = supplant("{0} - {1}", [ now, args[0] ]);

            // Call the original with the output prepended with formatted timestamp
            debugFn.apply(null, args)
          };

          return $log;
        };

    return enchanceLogger;
  });

})();
```

Контейнерное структурирование, использованное выше, соответствует [Закону Деметры] (http://ru.wikipedia.org/wiki/%D0%97%D0%B0%D0%BA%D0%BE%D0%BD_%D0%94%D0%B5%D0%BC%D0%B5%D1%82%D1%80%D1%8B). При таком подходе весь функционал, которым сервис `$log` был улучшен, инкапсулируется в модуле `LogEnhancer`. 

Вот теперь мы готовы продолжить добавление функционала в `LogEnhancer`… Мы будет внедрять имена классов и добавлять их в сообщения к выводу.

##Расширяем LogEnhancer

Чтобы с легкостью добавить к `$log` нужную функциональность, которая внедрит имена классов в вывод сообщений, нам нужно позволить $log генерировать уникальные экземпляры самого себя; где такой экземпляр будет зарегистрирован со специальным именем класса. 

Возможно, пример кода вам это объяснит:
```js
// ****************************************
// Module: myApp/controllers/LoginController.js
// ****************************************

define( dependencies, function( supplant )
{
  var LoginController = function( authenticator, $scope, $log )
    {
        $log = $log.getInstance( "LoginController" );

        // ...
    };

  return [ "authenticator", "$scope", "$log", LoginController ];

});
```
Мы использовали метод `$log.getInstance()`, чтобы вернуть объект,  который выглядит как `$log`, но на самом деле это ***НЕ*** AngularJS $log. Как мы это сделали?  Наш LogEnhancer декорировал AngularJS `$log` сервис и ***ДОБАВИЛ*** `getInstance()` метод к этому сервису.

Элегантность данного решения заключается в том, что `$log` до сих пор проходит `Duck` тест, но внутренне знает как  присоединять строку LoginController ко всем вызовам `$log`, выполненным в LoginController классе.  Всего лишь одна строка кода добавит поддержку этого функционала в любой класс… и это здорово!

Давайте перечислим набор возможностей, которые нам до сих пор нужны, чтобы полностью заменить `$log` нашим модулем `LogEnhancer`:
* Перехват всех методов `$log`: log, info, warn, debug, error
* Возможность построения вызова с токенизированными сообщениями и сложными параметрами (мы не будем обсуждать это в нашей статье)
* Добавление  функции `getInstance()` с возможностью создавать отдельные экземпляры `$log` с определенными названиями классов

##Использование каррирования внутри LogEnhancer

Мы можем использовать технику каррирования, чтобы захватить конкретную лог функцию, чтобы мы могли перехватывать только определенные вызовы к `log` функции. Эта техника позволяет нам использовать общий обработчик, который частично применяется к каждому вызову функции `$log`.
```js
// **********************************
// Module: myApp/logger/LogEnhancer.js
// **********************************

(function()
{
  "use strict";

  var dependencies = [
    'myApp/utils/DateTime'
    'myApp/utils/supplant'
  ];

  define( dependencies, function( DateTime, supplant )
  {
    var enchanceLogger = function( $log )
        {
                /**
                 * Partial application to pre-capture a logger function
                 */
            var prepareLogFn = function( logFn )
                {
                    /**
                     * Invoke the specified `logFn<` with the supplant functionality...
                     */
                    var enhancedLogFn = function ( )
                    {
                        var args = Array.prototype.slice.call(arguments),
                            now  = DateTime.formattedNow(),

                            // prepend a timestamp to the original output message
                            args[0] = supplant("{0} - {1}", [ now, args[0] ]);

                        logFn.call( null,  supplant.apply( null, args ) );
                    };
                    
                    // Special... only needed to support angular-mocks expectations
                    enhancedLogFn.logs = [ ];

                    return enhancedLogFn;
                };

            $log.log   = prepareLogFn( $log.log );
            $log.info  = prepareLogFn( $log.info );
            $log.warn  = prepareLogFn( $log.warn );
            $log.debug = prepareLogFn( $log.debug );
            $log.error = prepareLogFn( $log.error );

            return $log;
        };

    return enchanceLogger;
  });

})();
```
Заметьте, что метод `debugFn.call( … )`, так же использует метод `supplant()`, чтобы преобразовать любой токенизированный контент в финальную строку для вывода:

```js
var user = { who:"Thomas Burleson", email:"ThomasBurleson@gmail.com" };

    // This should output:
    // A warning message for ‘Thomas Burleson’ will be sent to ‘ThomasBurleson@gmail.com’ !

    $log.warn( "A warning message for ‘{who}’ will be sent to ‘{email}’ !", user );
```

Итат, мы не только перехватили вызовы `$log` и добавили временные метки, но и улучшили эти функции, внедрив поддержку токенизированных строк.
Adding $log.getInstance()
Finally we need to implement the getInstance() method and publish it as part of the AngularJS $log service.

##Добавляем `$log.getInstance()`

Наконец нам надо реализовать метод `getInstance()` и опубликовать его как часть сервиса лог AngularJS.
```js
// **********************************
// Module: myApp/logger/LogEnhancer.js
// **********************************
(function()
{
  "use strict";

  var dependencies = [
            'myApp/utils/DateTime',
            'myApp/utils/supplant'
      ];

  define( dependencies, function( DateTime, supplant )
  {
    var enhanceLogger = function( $log )
        {
                /**
                 * Capture the original $log functions; for use in enhancedLogFn()
                 */
            var _$log = (function( $log )
                {
                    return {
                        log   : $log.log,
                        info  : $log.info,
                        warn  : $log.warn,
                        debug : $log.debug,
                        error : $log.error
                    };
                })( $log ),
                /**
                 * Partial application to pre-capture a logger function
                 */
                prepareLogFn = function( logFn, className )
                {
                    /**
                     * Invoke the specified `logFn` with the supplant functionality...
                     */
                    var enhancedLogFn = function ( )
                    {
                        var args = Array.prototype.slice.call(arguments),
                            now  = DateTime.formattedNow();

                            // prepend a timestamp and optional classname to the original output message
                            args[0] = supplant("{0} - {1}{2}", [ now, className, args[0] ]);

                        logFn.call( null,  supplant.apply( null, args ) );
                    };

                    // Special... only needed to support angular-mocks expectations
                    enhancedLogFn.logs = [ ];

                    return enhancedLogFn;
                },
                /**
                 * Support to generate class-specific logger instance with classname only
                 *
                 * @param name
                 * @returns Object wrapper facade to $log
                 */
                getInstance = function( className )
                {
                    className = ( className !== undefined ) ? className + "::" : "";

                    return {
                        log   : prepareLogFn( _$log.log,    className ),
                        info  : prepareLogFn( _$log.info,   className ),
                        warn  : prepareLogFn( _$log.warn,   className ),
                        debug : prepareLogFn( _$log.debug,  className ),
                        error : prepareLogFn( _$log.error,  className )
                    };
                };

            $log.log   = prepareLogFn( $log.log );
            $log.info  = prepareLogFn( $log.info );
            $log.warn  = prepareLogFn( $log.warn );
            $log.debug = prepareLogFn( $log.debug );
            $log.error = prepareLogFn( $log.error );

            // Add special method to AngularJS $log
            $log.getInstance = getInstance;

            return $log;
        };

    return enhanceLogger;
  });

})();
```
Мы преобразовываем нашу функцию `prepareLogFn()`, используемую для каррирования, чтобы принять опциональный аргумент с названием класса. И мы создали метод `getInstance()`, который создает экземпляр объекта с тем же API, что и у оригинального лог сервиса.
Наконец, нам нужно преобразовать наш оригинальный пример кода с использованием `$log.getInstance()`:
```js
(function()
{
	"use strict";

	var dependencies = [
		'myApp/utils/supplant'
	];

	define( dependencies, function( supplant )
	{
		var Authenticator = function( session, $q, $log)
		{
		    $log = $log.getInstance( "Authenticator" );

		    // … other code here
		};

        return ["session", "$q", "$log", Authenticator];

	});

	define( dependencies, function( supplant )
	{
		var LoginController = function( authenticator, $scope, $log )
		    {
			$log = $log.getInstance( "LoginController" );

			var onLogin = function()
			    {
			        $log.debug( "login( `{userName}` )", $scope );

			        // … other code here
			    };

			    // … other code here
		    };

		return [ "authenticator", "$scope", "$log", LoginController ];

	});

}());
```

Вы заметили дополнительное изменение, показанное в 30 строке исходного кода выше? `$log.debug()` включил все возможности `supplant()` в LogEnhancer… Так, что теперь вызовы к `$log` поддерживают токенизированные строки и ассоциативные массивы.
Теперь вывод в браузерную консоль будет таким: 
```
10:22:15:143 – LoginController::login( `Thomas Burleson` )
10:22:15:167 – Authenticator::login( `Thomas Burleson` )
10:22:15:250 – Authenticator::login_onFault( `Bad credentials. Please use a username of ‘admin’ for mock logins !` )
10:22:15:274 – LoginController::login_onFault( `Bad credentials. Please use a username of ‘admin’ for mock logins !` )
```
**Выводы**

Это  только один пример того, как Декораторы могут быть использованы для добавления или преобразования поведения в AngularJS приложениях. А LogEnhancer может быть также расширен с возможностями:
•	Вывод  в кастомную консоль приложения… например, для генерации удаленных отчетов для клиентов
•	Цветовое кодировние и группирование сообщений в логе по категориям; @see Chrome Dev Tools
•	Логирование клиентских ошибок на удаленный сервер
Я уверен, что с помощью данной техники можно создать еще множество элегантных решений. Если у вас есть классный декоратор, не забудьте поделиться им с AngularJS сообществом!

##Материалы
Я создал публичный GitHub репозиторий с исходным кодом и примерами, использованными в данном материале.
По мотивам Burleson Thomas (http://solutionoptimist.com/2013/10/07/enhance-angularjs-logging-using-decorators/)

