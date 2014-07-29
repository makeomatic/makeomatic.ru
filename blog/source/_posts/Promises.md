title: Промисы
subtitle: Упрощаем использование параллельных потоков в Javascript
date: 2013-11-30
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
cover: http://makeomatic.ru/blog/2013/11/30/Promises/
coverWidth: 623
coverHeight: 351
url: http://makeomatic.ru/blog/2013/11/17/Browser_notepad/
tags: [Javascript]
---

![Иллюстрация блокнота](/blog/images/promises.jpg)

Промисы - представление некоего значения в будущем. Они отличаются от типичного для Node.js стиля с огромным количеством колбэков (Callback hell), потому что они дают вам реальные значения, которые вы можете продолжать использовать.
Несколько примеров: 

<!-- more -->

### Промисы представляют «обещание» будущего значения

``` javascript
var pinky = require('pinky')
var fs = require('fs')

// You just return a placeholder for your value,
// then fulfill or reject your placeholder
// depending on the asynchronous operation later on
function read(filename) {
    var promise = pinky()
    fs.readFile(filename, function(error, buffer) {
        if (error)  promise.reject(error)
        else        promise.fulfill(buffer)
    })
    return promise
}
```

### Промисы можно комбинировать

Потому что они являются реальными значениями, точно так же как String или Array:


``` javascript
function decode(encoding, buffer) {
    // We put things into a Promise, so we can
    // accept both real buffers *and* eventual ones :D
    return pinky(buffer).then(function(buffer){
        return buffer.toString(encoding)
    })
}
var data = decode('utf-8', read('foo.txt'))
```

### Промисы можно использовать где угодно, ведь они - это значения

``` javascript
// This means we can make any function
// accept a promise without changing any
// of its code :
D
function lift2(a, b, f) {
    return pinky(a).then(function(valueA) {
        return pinky(b).then(function(valueB) {
            return pinky(f(valueA, valueB))
        })
    })
})
function concat(a, b) { return a + b }
var fooBar = lift2(data, fs.readFileSync('bar.txt', 'utf-8'), concat)
```

### Просто создать новые комбинаторы

- Все вышеперечисленные свойства облегчают эту задачу. Бонус: структурирует ваш запутанный код.

- Все вышеперечисленные свойства облегчают задачу. Бонус: весь ваш запутанный код разделяется!

``` javascript
function pipeline(fns) {
    return fns.reduce(function(promise, f){
        return promise.then(f)
    }, promise(undefined) }
}
// This looks better with currying, but you
// can use `.bind(null, x, y)`
pipeline( read('foo.txt')
        , decode('utf-8')
        , splitLines
        , map(toUpperCase)
        , joinLines
        , write('screaming.txt'))

// Or in parallel
parallel( read('foo.txt')
        , read('bar.txt')
        , read('baz.txt'))
  .then(function(foo, bar, baz) {
      return foo + ';' + bar + ';' + baz
  })

// Or in any other order you want, just
// build relationships between
// the values using `.then()` and the
// promise library will figure it out :D
```
### Промисы стандартизированы

Выберите любую библиотеку реализующую промисы и вы сможете работать с асинхронным кодом. В добавок, если вы пишите комбинатор для promises, он будет работать везде, а не только в вашей библиотеке: https://github.com/killdream/pinky-combinators

### Работа без колбэков в Node.js без проблем

Если вы используете Node.js, то вы можете создать комбинатор,  который позволит отказаться от колбэков всего с помощью 5 строчек кода, но мы уже сделали это за вас: 

```js
#### λ lift-node
# Lifts a Node-style function into a function yielding a Promise.
#
# :: (a..., ((Error c, b) -> ())) -> Promise a c... -> Promise b c
lift-node = (f) -> (...args) ->
  promise = pinky!
  (all args) .then (as) -> f ...as, (err, data) ->
                                                | err => promise.reject err
                                                | _   => promise.fulfill data
  return promise
```

### Ссылки и дополнительный материал

Несомненно обратите внимание на спецификацию https://github.com/promises-aplus/promises-spec и на библиотеки, которые ее реализуют https://github.com/promises-aplus/promises-spec/blob/master/implementations.md

Отличные статьи по теме включают пост James Coglan http://blog.jcoglan.com/2013/03/30/callbacks-are-imperative-promises-are-functional-nodes-biggest-missed-opportunity/ и пост Irkali http://jeditoolkit.com/2012/04/26/code-logic-not-mechanics.html#post

Читайте так же статьи по теме: 

* [Сервис "AddThis" замедляет вас?](http://makeomatic.ru/blog/2013/12/05/AddThis/)
