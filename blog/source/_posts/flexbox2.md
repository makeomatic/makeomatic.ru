title: Flex-элементы
subtitle: Часть 2
date: 2015-03-23
author: Eleonora Pavlova
gravatarMail: koko@reevlodge.com
cover: https://makeomatic.ru/blog/images/flex2.jpg
coverWidth: 595
coverHeight: 335
url: https://makeomatic.ru/blog/2015/03/23/flexbox2/
tags: [CSS]
---

<div class="text-center">
![Иллюстрация блокнота](/blog/images/flex2.jpg)
</div>
<br/>

О flex-контейнере и его свойствах поговорили в [части 1](https://makeomatic.ru/blog/2015/02/24/flexbox/), теперь поговорим о дочерних элементах.

<!-- more -->

### Свойства flex-элементов

#### order

![Иллюстрация блокнота](/blog/images/order2.svg)

По умолчанию элементы в контейнере располагаются в порядке следования в html-документе. Однако, с помощью свойства order порядок можно изменять.

```js
.item {
  order: <integer>; /*любое ваше число*/
}
```

#### flex-grow

![Иллюстрация блокнота](/blog/images/flex-grow.svg)

Это свойство позволяет элементу при необходимости увеличиваться в размерах. Принимает пропорциональное число без единиц измерения и определяет, какое количество свободного пространства в контейнере каждый элемент может занимать. Если указанное значение flex-grow для всех элементов равно 1, каждый элемент займёт одинаковое количество пространства. Если присвоить одному элементу значение 2, он займёт в два раза больше пространства, чем остальные элементы. 

```js
.item {
  flex-grow: <число>; /* по умолчанию 0 */
}
```

Отрицательные значения не допустимы.

#### flex-shrink

По аналогии с предыдущим, это свойство позволяет элементу при необходимости уменьшаться в размерах.

```js
.item {
  flex-shrink: <число>; /* по умолчанию 1 */
}
```

Отрицательные значения не допустимы.

#### flex-basis

Определяет размер элемента по умолчанию до распределения свободного места в контейнере. Задаёт ширину или высоту элемента — в зависимости от указанного направления flex-direction. 

```js
.item {
  flex-basis: <величина> | auto; /* по умолчанию auto */
}
```

Если указано значение 0, свободное пространство вокруг содержания элемента не учитывается. Если указано значение auto, пространство распределяется в соответствии с величиной свойства flex-grow данного элемента. Подробная иллюстрация [здесь](http://www.w3.org/TR/css3-flexbox/images/rel-vs-abs-flex.svg)

#### flex

Это короткий вариант записи свойств flex-grow, flex-shrink и flex-basis. Два последних параметра (flex-shrink и flex-basis)  - опциональны. Значения flex по умолчанию: 0 1 auto.

```js
.item {
  flex: none | [ <'flex-grow'> <'flex-shrink'> || <'flex-basis'> ]
}
```

Рекомендуется использовать это короткое свойство flex вместо прописывания каждого свойства по-отдельности.

#### align-self

![Иллюстрация блокнота](/blog/images/align-self.svg)

Это свойство задаёт выравнивание по перпендикулярной оси конкретному flex-элементу — и переопределяет указанное ранее для контейнера свойство align-items (возможные значения такие же - см. в разделе «Свойства flex-контейнера»). 

```js
.item {
  align-self: auto | flex-start | flex-end | center | baseline | stretch;
}
```

Имейте в виду, что свойства float, clear и vertical-align не работают для flex-элементов.

### Перейдём к примерам 

Начнём с примера, решаюшего тривиальную задачу — идеальное центрирование. С flexbox это просто:

```js
.parent {
  display: flex;
  height: 300px; /* любое ваше значение */
}

.child {
  width: 100px;  /* любое ваше значение  */
  height: 100px; /* любое ваше значение  */
  margin: auto;  /* магия! */
}
```

Этот пример основан на том, что свойство margin: auto в flex-контейнере распределяет всё свободное пространство. Таким образом, flex-элемент идеально выравнивается по обеим осям. 

Другой пример. Рассмотрим список из 6 элементов, в эстетических целях всем заданы фиксированные размеры, хотя они могли быть и не указаны. Нам нужно, чтобы элементы были красиво выравнены по горизонтальной оси так, чтобы при изменении размера браузера, всё оставалось по-прежнему красивым (без @media queries):

```js
 .flex-container {
  /* Создаём flex контекст */
  display: flex;
  
  /* Определяем направление и указываем, могут ли блоки переноситься 
   * Помните, это короткий вариант записи, то же самое, что отдельно указать    
   * flex-direction: row;
   * flex-wrap: wrap;
   */
  flex-flow: row wrap;
  
  /* Далее указываем, как будет распределяться свободное пространство */
  justify-content: space-around;
}
```

Готово. Остальное — вопрос дизайна. Ниже вставлен пример с codepen с данным кодом. Не поленитесь, сходите на [Codepen](http://codepen.io/HugoGiraudel/full/LklCv/), и поиграйтесь с размерами вашего браузера:

<p data-height="268" data-theme-id="0" data-slug-hash="LklCv" data-default-tab="result" data-user="HugoGiraudel" class='codepen'>See the Pen <a href='http://codepen.io/HugoGiraudel/pen/LklCv/'>Demo Flexbox 1</a> by Hugo Giraudel (<a href='http://codepen.io/HugoGiraudel'>@HugoGiraudel</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

Попробуем что-нибудь ещё. В верхней части нашего сайта имеется выравненная по правому краю навигация. Нам надо, чтобы на средних экранах она была выравнена по центру, а на малых экранах превращалась в одну колонку. Легко.

```js
/* большие экраны */
.navigation {
  display: flex;
  flex-flow: row wrap;
  /* Выравнивает элементы по конечной точке главной оси*/
  justify-content: flex-end;
}

/* средние экраны */
@media all and (max-width: 800px) {
  .navigation {
    /* Центрируем меню, равномерно распределяя пространство вокруг элементов */
    justify-content: space-around;
  }
}

/* малые экраны */
@media all and (max-width: 500px) {
  .navigation {
    /* Указываем направление column для выстраивания элементов в столбик*/
    flex-direction: column;
  }
}
```

<p data-height="268" data-theme-id="0" data-slug-hash="pkwqH" data-default-tab="result" data-user="HugoGiraudel" class='codepen'>See the Pen <a href='http://codepen.io/HugoGiraudel/pen/pkwqH/'>Demo Flexbox 2</a> by Hugo Giraudel (<a href='http://codepen.io/HugoGiraudel'>@HugoGiraudel</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

Поиграемся с гибкостью flex-элементов. Нам нужен макет из трёх колонок, с полноразмерным header и footer, и порядком, отличным от указанного в html-коде. Выстраиваем макет по принципу mobile-first: 

```js
.wrapper {
  display: flex;
  flex-flow: row wrap;
}

/* Задаём всем элементам ширину 100% */
.header, .main, .nav, .aside, .footer {
  flex: 1 100%;
}

/* В подходе mobile-first порядок следования элементов совпадает с указанным в html-документе
 * в нашем случае:
 * 1. header
 * 2. nav
 * 3. main
 * 4. aside
 * 5. footer
 */

/* средние экраны */
@media all and (min-width: 600px) {
  /* Указываем свойство flex, чтобы оба сайдбара выстроились в один ряд */
  .aside { flex: 1 auto; }
}

/* большие экраны */
@media all and (min-width: 800px) {
  /* Меняем порядок следования первого сайдбара и main
   * И задаём элементу main ширину в два раза больше ширины сайдбаров
   */
  .main { flex: 2 0px; }
  
  .aside-1 { order: 1; }
  .main    { order: 2; }
  .aside-2 { order: 3; }
  .footer  { order: 4; }
}
```

<p data-height="268" data-theme-id="0" data-slug-hash="qIAwr" data-default-tab="result" data-user="HugoGiraudel" class='codepen'>See the Pen <a href='http://codepen.io/HugoGiraudel/pen/qIAwr/'>Demo Flexbox 3</a> by Hugo Giraudel (<a href='http://codepen.io/HugoGiraudel'>@HugoGiraudel</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

### Префиксы для Flexbox

Для поддержки во всех возможных браузерах Flexbox требует вендорных префиксов, причём не достаточно просто приставить к свойству вендорный префикс, иногда это совсем иные названия свойств и параметров. Связано это неудобство с изменениями, вносимыми в спецификацию Flexbox с течением времени, в результате чего появился [«старый» и «новый» синтаксис flexbox](http://css-tricks.com/old-flexbox-and-new-flexbox/) . 

Проще всего обойти это неудобство, используя новый (и окончательный) синтаксис в связке с [Autoprefixer](https://github.com/postcss/autoprefixer) .

Или, в качестве альтернативы, можно использовать приведённый ниже Sass @mixin:

```js
@mixin flexbox() {
  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
}

@mixin flex($values) {
  -webkit-box-flex: $values;
  -moz-box-flex:  $values;
  -webkit-flex:  $values;
  -ms-flex:  $values;
  flex:  $values;
}

@mixin order($val) {
  -webkit-box-ordinal-group: $val;  
  -moz-box-ordinal-group: $val;     
  -ms-flex-order: $val;     
  -webkit-order: $val;  
  order: $val;
}

.wrapper {
  @include flexbox();
}

.item {
  @include flex(1 200px);
  @include order(2);
}
```

### Баги

Есть у Flexbox и ошибки. Наиболее полный их перечень можно найти у Филиппа Уолтона и Грега Витворта по [ссылке](https://github.com/philipwalton/flexbugs).

### Браузерная поддержка

разбита по «версиям» flexbox:

новая (подразумевает последний синтаксис спецификации — напр., display: flex;)
промежуточная (неофициальный синтаксис 2011 года — напр., display: flexbox;)
старая (старый синтаксис 2009 года — напр., display: box;)

![Иллюстрация блокнота](/blog/images/table.png)

Браузеры Blackberry 10+ поддерживают новый синтаксис.

Более полная информация о том, какой синтаксис лучше использовать для наиболее полной поддержки, можно изучить [эту](http://css-tricks.com/using-flexbox/) и [эту](https://dev.opera.com/articles/advanced-cross-browser-flexbox/#fallbacks) статьи. 

###  Дополнительная информация (англ источники)

[Flexbox in the CSS specifications](http://www.w3.org/TR/css3-flexbox/)

[Flexbox at MDN](http://www.w3.org/TR/css3-flexbox/)

[Flexbox at Opera](https://dev.opera.com/articles/flexbox-basics/)

[Diving into Flexbox by Bocoup](http://bocoup.com/weblog/dive-into-flexbox/)

[Mixing syntaxes for best browser support on CSS-Tricks](http://css-tricks.com/using-flexbox/)

[Flexbox by Raphael Goetter (FR)](http://www.alsacreations.com/tuto/lire/1493-css3-flexbox-layout-module.html)

[Flexplorer by Bennett Feely](http://bennettfeely.com/flexplorer/)

