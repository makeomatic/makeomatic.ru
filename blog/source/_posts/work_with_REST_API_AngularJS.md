title: Работа с REST API в AngularJS
subtitle: Расширение колбэков функций
date: 2013-12-27
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
cover: http://makeomatic.ru/blog/images/callback.jpg
coverWidth: 623
coverHeight: 350
url: http://makeomatic.ru/blog/2013/12/27/work_with_REST_API_AngularJS/
tags: [AngularJS]
---

![Иллюстрация блокнота](/blog/images/callback.jpg)

#### Расширение колбэков http запросов в AngularJS

В этом примере мне хочется показать вам как я реализовываю `$rootScope.$apply()` для каждого вызова REST api. Это всего лишь пример того, как вы можете расширить колбэки функции если мы предполагаем, что колбэк при обращении к REST api всегда находится в функции на последнем месте.

<!-- more -->

```javascript
/*** this is just example of some javascript api api ***/
this.api = {
    assets: {
        _init: function () {
            //do something here and this will not be patched
        },
        one: function (id, callback) {
            http({ data: {id: id}}).success(callback);
        },
        two: function (id, callback) {
            http({ data: {id: id}}).success(callback);
        }
    }
}

var that = this,
    /**
     * Don't include methods
     * @type {Array}
     */
        excludeMethods = [
        '_init',
        'option'
    ],
    patchObjects = [ 'assets', 'user'];
```

API patcher расширяет колбэк и помещает `$rootScope.$apply()` в каждую колбэк функцию.

```javascript
/**
 * Api patcher
 * <a href="/param">@param</a> source
 * <a href="/param">@param</a> destionation
 */
function extend(source, destionation) {
    var fn = function (i) {
        return function () {
            var lastIndex = arguments.length - 1,
                args = Array.prototype.slice.call(arguments, 0, lastIndex),
                callback = arguments[lastIndex];
            /**
             * Patch last one
             */
            args.push(function (data, error) {
                if (angular.isFunction(callback)) {
                    callback.call(this, data, error);
                    $rootScope.$apply();
                }
            });
            /**
             * Call the source with new arguments
             */
            source[i].apply(source, args);
        }
    };
    /**
     * Loop over method
     */
    for (var i in source) {
        if (excludeMethods.indexOf(i) === -1) {
            if (angular.isFunction(source[i])) {
                destionation[i] = fn(i);
            }
        }
    }
}

/**
 * Patch objects
 */
patchObjects.forEach(function (value) {
    that[value] = {}; // initialize
    extend(that.api[value], that[value]);
});
```

У сервиса будет метод схожий с тем, который вы вызываете в контроллере.

```javascript
myApiService.assets.one(id, function (data, error) {
       $scope.list = data;
           // now you don't need to call $rootScope.$apply(); on each request
});
```
Читайте статьи по теме: [Data service для работы с API в AngularJS](http://makeomatic.ru/blog/2014/04/22/Module_in_AngularJS/#ym_playback=linkmap&ym_cid=15629977)
