title: Замена конструкции switch на объектные литералы
subtitle: Сервис международной доставки без головных болей 
date: 2014-17-12
author: Eleonora Pavlova
gravatarMail: koko@reevlodge.com
tags: [AngularJS, Javascript]
---

![Иллюстрация блокнота](/blog/images/switch.jpg)
Во многих языках программирования есть конструкция `switch` – но стоит ли её применять? 

Если вы JS-программист, вы постоянно работаете с объектами: создаёте, инициализируете и совершаете с ними разные манипуляции. Объекты очень гибкие — в javascript практически всё на них построено, и именно их я в последнее время использую вместо `switch`.
<!-- more -->

### Что такое конструкция switch?

Если вы ранее не использовали `switch` или не очень понимаете, что данная конструкция делает, давайте разберёмся. `Switch` последовательно сравнивает выражение со всеми указанными константами и выводит найденное соответствие, например, исполняемый блок кода.

Взглянем на типичное использование `switch`:

```js
var type = 'coke';
var drink;
switch(type) {
case 'coke':
  drink = 'Coke';
  break;
case 'pepsi':
  drink = 'Pepsi';
  break;
default:
  drink = 'Unknown drink!';
}
console.log(drink); // 'Coke'
```

Напоминает условную конструкцию `else` и `if`, но `switch` сравнивает с одним значением в каждом случае `case` нашей конструкции.
Когда в коде много условий `else if`, вероятно, что-то не так – в подобных случаях целесообразнее использовать `switch`. Вот пример злоупотребления `else if`:

```js
 function getDrink (type) {
  if (type === 'coke') {
    type = 'Coke';
  } else if (type === 'pepsi') {
    type = 'Pepsi';
  } else if (type === 'mountain dew') {
    type = 'Mountain Dew';
  } else if (type === 'lemonade') {
    type = 'Lemonade';
  } else if (type === 'fanta') {
    type = 'Fanta';
  } else {
    // выступает в качестве «дефолтного» значения
    type = 'Unknown drink!';
  }
  return 'You\'ve picked a ' + type;
}
```

Данный вариант — слишком общий, допускает ошибки и крайне многословен (повторы). Он допускает и всякие хаки, тк можно сравнивать несколько значений в каждом `else if`, например: `else if (type === 'coke' && somethingElse !== 'apples')`. В таких ситуациях `switch` был идеальным решением, хотя и приходилось не забывать добавлять оператор `break`; в конце каждого случая case для предотвращения автоматического исполнения кода следующего case (частая ошибка switch).  

### Проблемы switch

В использовании `switch` есть много неприятных моментов: процедурный поток управления, нестандартный синтактис блоков кода — в javascript стандартно используются фигурные скобки,  в конструкции `switch` – нет. В целом, синтаксис `switch` – не лучший пример javascript. Мы вынуждены вручную добавлять break для каждого case, что может усложнить дальнейшую отладку ошибок, а если где-то забудем break, это спровоцирует ошибки в последующих случаях case. Дуглас Крокфорд не раз об этом писал и рассказывал, он рекомендует использовать `switch` с осторожностью.

В javascript мы часто обращаемся к объектам для решения всевозможных задач, включая те, для которых нам бы и в голову не пришло использовать `switch`. Так почему бы не использовать объектный литерал вместо `switch`? Это сделает наш код более гибким, читаемым, поддерживаемым, и не нужно будет вручную добавлять к кейсам break! Также это упрощает работу новичкам, поскольку это стандартные объекты.

По мере увеличения количества case производительность объектов (хэш-таблиц) становится лучше, чем у конструкции `switch` (где важна последовательность кэйсов). Объектный подход это поиск по хеш-таблицам, а конструкция `switch` должна оценивать каждый case, пока не найдёт соответствие и `break`. 

### Поиск по объектным литералам

Мы постоянно используем объекты как конструкторы или литералы, часто для операций поиска — получения значений свойств объекта. 
Создадим простой объект, который возвращает только строковое значение:

```js
function getDrink (type) {
  var drinks = {
    'coke': 'Coke',
    'pepsi': 'Pepsi',
    'lemonade': 'Lemonade',
    'default': 'Default item'
  };
  return 'The drink I chose was ' + (drinks[type] || drinks['default']);
}
var drink = getDrink('coke');
// The drink I chose was Coke
console.log(drink);
```

Наш код на пару строк короче, чем пример со `switch`, и, мне кажется, лучше читается. Упростим его, убрав дефолтное значение:

```js
function getDrink (type) {
  return 'The drink I chose was ' + {
    'coke': 'Coke',
    'pepsi': 'Pepsi',
    'lemonade': 'Lemonade'
  }[type];
}
```

Однако, нам может понадобиться более сложное значение, чем строка, способное храниться в функции. Для краткости и простоты, я верну эти же строки в только что созданные функции:

```js
var type = 'coke';

var drinks = {
  'coke': function () {
    return 'Coke';
  },
  'pepsi': function () {
    return 'Pepsi';
  },
  'lemonade': function () {
    return 'Lemonade';
  }
};
```

Разница в том, что нам нужно вызвать функцию объекта:
`drinks[type]();`

Такой код - легче поддерживать, приятнее читать. Простой объект. Можно забыть про `break` и ошибки, связанные с его отсутствием в конце case.

В случае со `switch` мы бы поместили его в функцию и `return` значение, сделаем то же самое с объектом, превратив его в практичную функцию:

```js
function getDrink (type) {
  var drinks = {
    'coke': function () {
      return 'Coke';
    },
    'pepsi': function () {
      return 'Pepsi';
    },
    'lemonade': function () {
      return 'Lemonade';
    }
  };
  return drinks[type]();
}
// вызовем функцию
var drink = getDrink('coke');
console.log(drink); // 'Coke'
```

Всё отлично, но не учтён дефолтный случай. Это легко исправить:

```js
function getDrink (type) {
  var fn;
  var drinks = {
    'coke': function () {
      return 'Coke';
    },
    'pepsi': function () {
      return 'Pepsi';
    },
    'lemonade': function () {
      return 'Lemonade';
    },
    'default': function () {
      return 'Default item';
    }
  };
  // если объект drinks содержит переданный параметр,
  // используем его
  if (drinks[type]) {
    fn = drinks[type];
  } else {
    // в ином случае, приравняем к дефолтному значению drinks.default
    // удобно и логично использовать везде квадратные скобки
    fn = drinks['default'];
  }
  return fn();
}
// вызываем с параметром "dr pepper"
var drink = getDrink('dr pepper');
console.log(drink); // 'выдаст дефолтное значение'
```

Можно упростить нашу конструкцию `else` и `if`, используя в выражении оператор `||` «или»:

```js
function getDrink (type) {
  var drinks = {
    'coke': function () {
      return 'Coke';
    },
    'pepsi': function () {
      return 'Pepsi';
    },
    'lemonade': function () {
      return 'Lemonade';
    },
    'default': function () {
      return 'Default item';
    }
  };
  return (drinks[type] || drinks['default'])();
}
```

Мы поставили операции поиска по объекту `()`, что делает их выражением. И затем вызвали результат выражения. Если `drinks [type]` не будет найден, вернётся `drinks['default']` — элементарно!

Не обязательно всегда делать `return` внутри функции, можем присвоить результат любой переменной и затем вызвать её.

```js
function getDrink (type) {
  var drink;
  var drinks = {
    'coke': function () {
      drink = 'Coke';
    },
    'pepsi': function () {
      drink = 'Pepsi';
    },
    'lemonade': function () {
      drink = 'Lemonade';
    },
    'default': function () {
      drink = 'Default item';
    }
  };
    // вызываем выражение
  (drinks[type] || drinks['default'])();
    
  // возвращаем строку с выбранным напитком drink
  return 'The drink I chose was ' + drink;
}

var drink = getDrink('coke');
// The drink I chose was Coke
console.log(drink);
```

* Это самые базовые примеры; 
* Объектные литералы содержат функцию, которая возвращает строку; 

Если вам нужна только строка, вы можете использовать строку как значение ключа — но иногда всё же логичнее использовать функции. Если вы используете и строки и функции, возможно, будет проще всегда использовать функции — для безопасного поиска параметра и дальнейшего вызова — мы ведь не хотим пытаться вызывать строку.

### "Проскакивание" объектов

В случае со `switch` мы можем позволить кейсу «проскочить» — когда к одному блоку кода применяется более одного случая case.

```js
var type = 'coke';
var snack;
switch(type) {
case 'coke':
case 'pepsi':
  snack = 'Drink';
  break;
case 'cookies':
case 'crisps':
  snack = 'Food';
  break;
default:
  drink = 'Unknown type!';
}
console.log(snack); // 'Drink'
```

Мы позволяем `coke` и `pepsi` «проскочить» и не завершаем цикл `switch`, поскольку не добавляем оператор `break`. То же самое легко и более наглядно можно сделать с объектными литералами — это сделает наш код структурированным, читаемым и многократно используемым, а также убережёт от ошибкам. 

```js
function getSnack (type) {
  var snack;
  function isDrink () {
    return snack = 'Drink';
  }
  function isFood () {
    return snack = 'Food';
  }
  var snacks = {
    'coke': isDrink,
    'pepsi': isDrink,
    'cookies': isFood,
    'crisps': isFood,
  };
  return snacks[type]();
}

var snack = getSnack('coke');
console.log(snack); // 'Drink'
```

####Выводы

Применение объектов даёт больший контроль над кодом, конструкция `switch` –  немного устарела, не изящна в синтаксисе и сложна в отладке ошибок. Объекты проще расширять, поддерживать и тестировать. Они привычны, поскольку являются основополагающим звеном Javascript, и мы используем их в работе каждый день для самых разных задач. Объектные литералы могут содержать функции и любые другие [типы объектов](http://toddmotto.com/understanding-javascript-types-and-reliable-type-checking/), что делает их очень гибкими. У функций в литералах есть область действия (scope), поэтому мы можем вернуть замыкание из вызываемой родительской функции (в нашем случае `getDrink` возвращает замыкание).

Комментарии и фидбэк можно найти на [Reddit](http://www.reddit.com/r/javascript/comments/2b4s6r/deprecating_the_switch_statement_for_object)  

