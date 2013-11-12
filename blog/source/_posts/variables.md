title: Javascript, работа с переменными и их типы
subtitle: скалярные и составные данные, указатели на объекты и массивы
date: 2013-11-09
author: Виталий Аминев
gravatarMail: v@aminev.me
tags: [Javascript]
---

## Типы переменных в Javascript

```javascript
1. String // строка
2. Boolean // булин: true/false
3. Number // число 
4. Object // Объект
5. Array // Массив
6. Function // Функция
7. null // тип - объект, на самом деле ссылка на объект null
8. undefined // не существующая переменная
```

### Скалярные типы переменных

Они же простые типы данных. Их ключевой особенностью является то, что при присвоении другим переменным, 
значение ***копируется***

К скалярным типам данных относятся:

1. String
<!-- more -->
2. Boolean
3. Number

```javascript
// данный сниппет показывает как работают скалярные переменные

var x = 10,
    y = 12,
    z = "f"
    
console.log(x+y) // 22
console.log(x+z) // "10f"
var m = x
x = 1250
console.log("m is ", m, ", x is ", x) // m is 10, x is 1250
```

### Составные или комплексные типы переменных

Здесь все намного интереснее - присвоение переменной всего лишь отдает ***ссылку***
Проще всего понять на примере

```javascript
var x = {a: 10, b: 25, c: [10, 20, 30], m: {} }, // объект x
    copyOfX = x,
    arr = x.c,
    obj = x.m

arr.splice(0,1) // удаляем первый элемент массива
obj.hello = "world" // добавляем свойство объекта

console.log( copyOfX === x ) // true

console.log( arr === x.c )) // true
console.log( arr ) // [20, 30]
console.log( x.c ) // [20, 30]

console.log( obj ) // { hello: "world" }
```

К составным переменным относятся:

1. Object
2. Array
3. Function

В следующей заметке читайте об отношении функций, контекстов и this
