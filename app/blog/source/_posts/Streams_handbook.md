title: Работа с потоками в node.js
date: 2016-08-22
author: Andrey Afoninsky
gravatarMail: vkfont@gmail.com
tags: [Node.js, Javascript]
---

<div class="text-center">
![Работа с потоками в node.js](/blog/images/Streams_node.png)
</div>

Данный документ является вольным переводом [stream-handbook](https://github.com/substack/stream-handbook) и охватывает основы создания [node.js](http://nodejs.org/) приложений с использованием [потоков](http://nodejs.org/docs/latest/api/stream.html). По сравнению с источником - обновлены некоторые главы с учетом 2016 года, добавлено объяснение различий между разными версиями API, убраны устаревшие модули и добавлены новые, изменена структура повествования.

<!-- more -->

Таким образом, надеюсь, в результате получился актуальный современный учебник по потоковому API в node.js. Жду ваших комментариев и замечаний.

### Оглавление
- [Вступление](#intro)
- [Почему мы должны использовать потоки](#why)
- [Основы](#theory)
  - [.pipe()](#pipe)
  - [Потоки на чтение (readable)](#readable)
    - [Создание потока на чтение](#readable-create)
    - [Использование потока на чтение](#readable-usage)
  - [Потоки на запись (writeable)](#writeable)
    - [Создание потока на запись](#writeable-create)
    - [Отправка данных в поток на запись](#writeable-usage)
  - [Дуплексные потоки (duplex)](#duplex)
  - [Трансформирующие потоки (transform)](#transform)
  - [Различия в реализации потоков](#difference)
    - [streams1: устаревшее API](#streams1)
    - [streams2: второе поколение](#streams2)
    - [streams3: стабильная реализация](#streams3)
  - [Дополнительно](#additional)
- [Встроенные потоки](#internal)
- [Сторонние потоки](#external)
  - [Список модулей](#modules)
  - [Примеры использования](#examples)
  - [Мощные комбинации](#cool)
    - [Создание распределенной сети](#mesh)
    - [Клиент-серверный RPC](#rpc)
    - [Собственная реализация socket.io](#socket)
- [Заключение](#conslusion)

# Вступление <a name="intro"></a>

```
"Нам нужен способ взаимодействия между программами, наподобие того как садовый шланг можно подключать к разным сегментам и изменять направление воды. То же самое можно сделать с вводом-выводом данных"
```

[Дуглас Макилрой. 11 октября 1964](http://cm.bell-labs.com/who/dmr/mdmpipe.html)

![doug mcilroy](/blog/images/mcilroy.png)

***

Потоки пришли к нам из [первых дней эпохи Unix](http://www.youtube.com/watch?v=tc4ROCJYbm0) и зарекомендовали себя в течении многих десятилетий как надежный способ создания сложных систем из маленьких компонентов, которые [делают что-то одно, но делают это хорошо](https://ru.wikipedia.org/wiki/Философия_UNIX). В Unix потоки реализуются в оболочке с помощью знака `|` (pipe). В node встроенный [модуль потоков](http://nodejs.org/docs/latest/api/stream.html) используется в базовых библиотеках, кроме этого его можно подключать в свой код. Подобно Unix, в node основной метод модуля потоков называется `.pipe()`. Он позволяет соединять потоки с разной скоростью передачи данных таким образом что данные не будут потеряны.

Потоки помогают [разделять ответственность](https://ru.wikipedia.org/wiki/Разделение_ответственности), поскольку позволяют вынести все взаимодействие в отдельный интерфейс, который может быть [использован повторно] (http://www.faqs.org/docs/artu/ch01s06.html#id2877537). Вы сможете подключить вывод одного потока на ввод другого, и [использовать библиотеки](http://npmjs.org) которые будут работать с подобными интерфейсами на более высоком уровне.

Потоки - важный элемент микроархитектурного дизайна и философии UNIX, но кроме этого есть еще достаточное количество важных абстракций для рассмотрения. Всегда помните своего врага ([технический долг](http://c2.com/cgi/wiki?TechnicalDebt)) и ищите наиболее подходящие для решения задач абстракции.

![brian kernighan](/blog/images/kernighan.png)

***

# Почему мы должны использовать потоки <a name="why"></a>

Ввод-вывод в node асинхронен, поэтому взаимодействие с диском и сетью происходит через различные способы управления асинхронным кодом (обещания, генераторы, функции обратного вызова и т.п.). Следующий код отдает файл браузеру через функцию обратного вызова (callback):

``` js
var http = require('http');
var fs = require('fs');

var server = http.createServer(function (req, res) {
    fs.readFile(__dirname + '/data.txt', function (err, data) {
        res.end(data);
    });
});
server.listen(8000);
```

Этот код работает, но он буферизирует весь `data.txt` в память при каждом запросе. Если `data.txt` достаточно большой, ваша программа начнет потреблять слишком много оперативной памяти, особенно при большом количестве подключений пользователей с медленными каналами связи.

При этом пользователи останутся недовольными, ведь им придется ждать пока весь файл не будет считан в память на сервере перед отправкой.

К счастью, оба аргумента `(req, res)` являются потоками, а это значит что мы можем переписать код с использованием `fs.createReadStream()` вместо `fs.readFile()`:

``` js
var http = require('http');
var fs = require('fs');

var server = http.createServer(function (req, res) {
    var stream = fs.createReadStream(__dirname + '/data.txt');
    stream.pipe(res);
});
server.listen(8000);
```

Теперь `.pipe()` самостоятельно слушает события `'data'` и`'end'` потока созданного через `fs.createReadStream()`. Этот код не только чище, но теперь и `data.txt` доставляется по частям по мере чтения его с диска.

Использование `.pipe()` имеет ряд других преимуществ, например автоматическая обработка скорости ввода-вывода - node.js не будет буферизировать лишние части файла в память пока предыдущие части не отправлены клиенту с медленным соединением.

А если мы хотим еще больше ускорить отправку файла? Добавим сжатие:

``` js
var http = require('http');
var fs = require('fs');
var oppressor = require('oppressor');

var server = http.createServer(function (req, res) {
    var stream = fs.createReadStream(__dirname + '/data.txt');
    stream.pipe(oppressor(req)).pipe(res);
});
server.listen(8000);
```

Теперь наш файл cжимается для браузеров, которые поддерживают gzip или deflate! Мы просто отдаем модулю [opressor](https://github.com/substack/oppressor) всю логику обработки content-encoding и забываем про нее.

После того как вы ознакомитесь с API потоков, вы сможете писать потоковые модули и соединять их как кусочки лего, вместо того чтобы изобретать свои велосипеды и пытаться запомнить все способы взаимодействия между компонентами системы.

Потоки делают программирование в node.js простым, элегантным и компонуемым.

# Основы <a name="theory"></a>

Существует 4 вида потоков:

* на чтение (__readable__)
* на запись (__writeable__)
* трансформирующие (__transform__)
* дуплексные (__duplex__)

Начиная с версии node.js v0.12 в стабильном состоянии заморожена версия APIv3 (__streams3__) - именно его описывает официальная документация. Все виды потоков, и различия в реализации API между ними будут рассмотрены ниже.

## pipe() <a name="pipe"></a>

Любой поток может использовать`.pipe()` для соединения входов с выходами.

`.pipe()` это просто функция, которая берет поток на чтение `src` и соединяет его вывод с вводом потока на запись `dst`:

```js
src.pipe(dst)
```

`.pipe(dst)` возвращает `dst`, так что вы можете связывать сразу несколько потоков:

```js
a.pipe(b).pipe(c).pipe(d)
```
или то же самое:

```js
a.pipe(b);
b.pipe(c);
c.pipe(d);
```

Аналогично в Unix вы можете связать утилиты вместе:

```
a | b | c | d
```

## Потоки на чтение (readable) <a name="readable"></a>

Поток на чтение производит данные, которые с помощью `.pipe()` могут быть переданы в поток на запись, трансформирующий или дуплексный поток:

``` js
readableStream.pipe(dst)
```

### Создание потока на чтение <a name="readable-create"></a>

Давайте создадим считываемый поток!

``` js
var Readable = require('stream').Readable;

var rs = new Readable;
rs.push('beep ');
rs.push('boop\n');
rs.push(null);

rs.pipe(process.stdout);
```

```
$ node read0.js
beep boop
```

Тут `rs.push(null)` сообщает потребителю, что `rs` закончил вывод данных.

Заметьте, мы отправили содержимое в поток на чтение `rs` ДО привязывания его к `process.stdout`, но сообщение все равно появилось в консоли. Когда вы посылаете с помощью `.push()` данные в поток на чтение, они буферизируются до тех пор пока потребитель не будет готов их прочитать.

Тем не менее, в большинстве случаев будет лучше если мы не будем их буферизировать совсем, вместо этого будем генерировать их только когда данные запрашиваются потребителем.

Мы можем посылать данные кусками, определив функцию `._read`:

``` js
var Readable = require('stream').Readable;
var rs = Readable();

var c = 97;
rs._read = function () {
    rs.push(String.fromCharCode(c++));
    if (c > 'z'.charCodeAt(0)) rs.push(null);
};

rs.pipe(process.stdout);
```

```
$ node read1.js
abcdefghijklmnopqrstuvwxyz
```

Теперь мы помещаем буквы  от `'a'` до `'z'` включительно, но только тогда когда потребитель будет готов их прочитать.

Метод `_read` также получает в первом аргументе параметр `size`, который указывает сколько байт потребитель хочет прочитать - он необязательный, так что ваша реализация потока может его игнорировать.

Обратите внимание, вы также можете использовать `util.inherits()` для наследования от базового потока, но такой подход может быть непонятен тому кто будет читать ваш код.

Чтобы продемонстрировать, что наш метод `_read` вызовется только когда потребитель запросит данные, добавим задержку в наш поток:

```js
var Readable = require('stream').Readable;
var rs = Readable();

var c = 97 - 1;

rs._read = function () {
    if (c >= 'z'.charCodeAt(0)) return rs.push(null);

    setTimeout(function () {
        rs.push(String.fromCharCode(++c));
    }, 100);
};

rs.pipe(process.stdout);

process.on('exit', function () {
    console.error('\n_read() called ' + (c - 97) + ' times');
});
process.stdout.on('error', process.exit);
```

Запустив программу, мы увидим, что если мы запросим 5 байт - `_read ()` вызовется 5 раз:

```
$ node read2.js | head -c5
abcde
_read() called 5 times
```

Задержка через setTimeout необходима, так как операционной системе требуется определенное время чтобы послать сигнал о закрытии конвейера.

Обработчик `process.stdout.on('error', fn)` также необходим, поскольку операционная система пошлет SIGPIPE нашему процессу когда утилите `head` больше не будет нужен результат нашей программы (в этом случае будет вызвано событие EPIPE в потоке `process.stdout`).

Эти усложнения необходимы при взаимодействии с конвейером в операционной системе, но в случае реализации потоков чисто в коде они будут обработаны автоматически.

Если вы хотите создать читаемый поток, который выдает произвольные форматы данных вместо строк и буферов - убедитесь что вы его инициализировали с соответствующей опцией: `Readable ({ objectMode: true })`.

### Использование потока на чтение <a name="readable-usage"></a>

В большинстве случаев мы будем подключать такой поток к другому потоку, созданному нами или модулями наподобие [through](https://npmjs.org/package/through),  [concat-stream](https://npmjs.org/package/concat-stream). Но иногда может потребоваться использовать его напрямую.

``` js
process.stdin.on('readable', function () {
    var buf = process.stdin.read();
    console.dir(buf);
});
```

```
$ (echo abc; sleep 1; echo def; sleep 1; echo ghi) | node consume0.js
<Buffer 61 62 63 0a>
<Buffer 64 65 66 0a>
<Buffer 67 68 69 0a>
null
```

Когда данные становятся доступными, возникает событие `'readable'`, и вы можете вызвать `.read()` чтобы получить следующую порцию данных из буффера.

Когда поток завершится, `.read()` вернет `null`, потому что не останется доступных для чтения байтов.

Вы можете запросить определенное количество байтов: `.read(n)`. Указание необходимого размера носит рекомендательный характер, и не сработает для потоков возвращающих объекты. Однако, все базовые потоки обязаны поддерживать данную опцию.

Пример чтения в буффер порциями по 3 байта:

``` js
process.stdin.on('readable', function () {
    var buf = process.stdin.read(3);
    console.dir(buf.toString());
});
```

Но, при запуске этого примера мы получим не все данные:

```
$ (echo abc; sleep 1; echo def; sleep 1; echo ghi) | node consume1.js
'abc'
'\nde'
'f\ng'
```
Это произошло потому что последняя порция данных осталась во внутреннем буфере, и нам надо "подопнуть" их. Сделаем мы это сообщив с помощью `.read(0)` что нам надо больше чем только что полученные 3 байта данных:

``` js
process.stdin.on('readable', function () {
    var buf = process.stdin.read(3);
    console.dir(buf.toString());
    process.stdin.read(0);
});
```

Теперь наш код работает как и ожидалось:

``` js
$ (echo abc; sleep 1; echo def; sleep 1; echo ghi) | node consume2.js
'abc'
'\nde'
'f\ng'
'hi\n'
```

В случае, если вы получили больше данных чем вам требуется - можно использовать `.unshift()` чтобы вернуть их назад. Использование `.unshift()` помогает нам предотвратить получение ненужных частей.

К примеру, создадим парсер который разделяет абзац на строки с делителем - переносом строки:

``` js
var offset = 0;

process.stdin.on('readable', function () {
    var buf = process.stdin.read();
    if (!buf) return;
    for (; offset < buf.length; offset++) {
        if (buf[offset] === 0x0a) {
            console.dir(buf.slice(0, offset).toString());
            buf = buf.slice(offset + 1);
            offset = 0;
            process.stdin.unshift(buf);
            return;
        }
    }
    process.stdin.unshift(buf);
});
```

```
$ tail -n +50000 /usr/share/dict/american-english | head -n10 | node lines.js
'hearties'
'heartiest'
'heartily'
'heartiness'
'heartiness\'s'
'heartland'
'heartland\'s'
'heartlands'
'heartless'
'heartlessly'
```

Код выше приведен только для примера, если вам действительно нужно будет разбить строку - лучше будет воспользоваться специализированным модулем [split](https://npmjs.org/package/split) и не изобретать велосипед.

## Потоки на запись (writeable) <a name="writeable"></a>

В поток на запись можно послать данные используя `.pipe()`, но прочитать их уже не получится:

``` js
src.pipe(writableStream)
```

### Создание потока на запись <a name="writeable-create"></a>

Просто определяем методом `._write(chunk, enc, next)`, и теперь в наш поток можно передавать данные:

``` js
var Writable = require('stream').Writable;
var ws = Writable();
ws._write = function (chunk, enc, next) {
    console.dir(chunk);
    next();
};

process.stdin.pipe(ws);
```

```
$ (echo beep; sleep 1; echo boop) | node write0.js
<Buffer 62 65 65 70 0a>
<Buffer 62 6f 6f 70 0a>
```

Первый аргумент, `chunk`, это данные которые посылает отправитель.

Второй аргумент, `enc`, это строка с названием кодировки. Она используется только в случае когда опция `opts.decodeString` установлена в `false`, и вы отправляете строку.

Третий аргумент, `next(err)`, является функцией обратного вызова (callback), сообщающей отправителю что можно послать еще данные. Если вы вызовите ее с параметром `err`, в потоке будет создано событие `'error'`.

В случае если поток из которого вы читаете передает строки, они будут преобразовываться в `Buffer`. Чтобы отключить преобразование - создайте поток на запись с соответствующим параметром: `Writable({ decodeStrings: false })`.

Если поток на чтение передает объекты - явно укажите это в параметрах: `Writable({ objectMode: true })`.

### Отправка данных в поток на запись <a name="writeable-usage"></a>

Чтобы передать данные в поток на запись - вызовите `.write(data)`, где `data` это набор данных которые вы хотите записать.

``` js
process.stdout.write('beep boop\n');
```

Если вы хотите сообщить что вы закончили запись - вызовите `.end()` (или `.end(data)` чтобы отправить еще немного данных перед завершением):

``` js
var fs = require('fs');
var ws = fs.createWriteStream('message.txt');

ws.write('beep ');

setTimeout(function () {
    ws.end('boop\n');
}, 1000);
```

```
$ node writing1.js
$ cat message.txt
beep boop
```

Не беспокойтесь о синхронизации данных и буферизации, `.write()` вернет `false` если в буфере скопилось данных больше чем указывалось в параметре `opts.highWaterMark` при создании потока. В этом случае следует подождать события `'drain'`, которое сигнализирует о том что данные можно снова писать.

## Дуплексные потоки (duplex) <a name="duplex"></a>

Дуплексные потоки наследуют методы как от потоков на чтение, так и от потоков на запись. Это позволяет им действовать в обоих направлениях - читать данные, и записывать их в обе стороны. В качестве аналогии можно привести телефон. Если вам требуется сделать что-нибудь типа такого:

``` js
a.pipe(b).pipe(a)
```

значит вам нужен дуплексный поток.

## Трансформирующие потоки (transform) <a name="transform"></a>

Трансформирующие потоки это частный случай дуплексных потоков (в обоих случаях они могут использоваться как для записи, так и чтения). Разница в том, что в случае трансформации отдаваемые данные так или иначе зависят от того что подается на вход.

Возможно, вы также встречали второе название таких потоков - "сквозные" ("through streams"). В любом случае, это просто фильтры которые преобразовывают входящие данные и отдают их.

## Различия в реализации потоков <a name="difference"></a>

### streams1: устаревшее API <a name="streams1"></a>
В первых версиях node.js существовал _классический_ (__streams1__) интерфейс потоков. Интерфейс поддерживал добавление данных в поток (push-режим), однако потребитель мог только слушать события `data` и `end`, буферизация не поддерживалась и данные легко было потерять. Разработчики вручную контролировали поток вызывая `.pause()` и `.resume()`. На текущий момент его практически нигде не используют. Если вы все таки работаете с подобным потоком - вам пригодится несколько практик.

К примеру, чтобы избежать установки слушателей `"data"` и `"end"` подойдет модуль [through](https://npmjs.org/package/through):

``` js
var through = require('through');
process.stdin.pipe(through(write, end));

function write (buf) {
    console.log(buf);
}
function end () {
    console.log('__END__');
}
```

```
$ (echo beep; sleep 1; echo boop) | node through.js
<Buffer 62 65 65 70 0a>
<Buffer 62 6f 6f 70 0a>
__END__
```

а для буферизации всего содержимого потока сойдет [concat-stream](https://npmjs.org/package/concat-stream):

``` js
var concat = require('concat-stream');
process.stdin.pipe(concat(function (body) {
    console.log(JSON.parse(body));
}));
```

```
$ echo '{"beep":"boop"}' | node concat.js
{ beep: 'boop' }
```

_У классических потоков на чтение для остановки и продолжения есть методы `.pause()` и `.resume()`, но их использования следует избегать. Если вам необходим этот функционал - рекомендуется не создавать логику самостоятельно, а использовать модуль [through](https://npmjs.org/package/through)._

### streams2: второе поколение <a name="streams2"></a>
В node.js v0.10 появилось второе поколение потоков (__streams2__). Эти потоки всегда запускаются в режиме паузы, и у потребителей уже есть возможность запросить данные вызвав `.read(numBytes)` (pull-режим), присутствует буферизация. Ключевая особенность данного API - поток автоматически переключается в _классический_ режим в целях совместимости если назначить обработчики на `data` и `end`. При этом поток снимается с режима паузы и отключается возможность использовать pull-режим. На момент написания статьи (11.07.2016) многие неактуальные модули работают в данном режиме, однако активно развивающиеся модули перешли на третье поколение.

### streams3: стабильная реализация <a name="streams3"></a>
Начиная с node.js v0.11, концепция потоков переработана и _признана стабильной_ -  в официальной документации описывается именно поведение __streams3__. По умолчанию потоки все еще запускаются в режиме паузы а назначение обработчиков снимает их с паузы. Однако, если использовать `.pause()` и вызвать метод `.read()` - соответствующие данные будут возвращены. Таким образом, потоки поддерживают как pull режим, так и push. При этом, можно смело использовать модули с streams2 так как они совместимы.


## Дополнительно <a name="additional"></a>

Вы прочитали про базовые понятия касающиеся потоков, если вы хотите узнать больше - обратитесь к актуальной [документация по потокам](http://nodejs.org/docs/latest/api/stream.html#stream_stream). В случае если вам понадобится сделать API __streams2__ потоков совместимым с "классическим" API __streams1__ (например, при использовании устаревших версий node.js)- используйте модуль [readable-stream](https://npmjs.org/package/readable-stream). Просто подключите его в свой проект: `require('readable-stream')` вместо `require('stream')`.


# Встроенные потоки <a name="internal"></a>

Эти потоки поставляются с node.js и могут быть использованы без подключения дополнительных библиотек.

## process

### [process.stdin](http://nodejs.org/docs/latest/api/process.html#process_process_stdin)

Поток на чтение содержит стандартный системный поток ввода для вашей программы.

По умолчанию он находится в режиме паузы, но после первого вызова `.resume()` он начнет исполняться в
[следующем системном тике](http://nodejs.org/docs/latest/api/process.html#process_process_nexttick_callback).

Если process.stdin указывает на терминал (проверяется вызовом
[`tty.isatty()`](http://nodejs.org/docs/latest/api/tty.html#tty_tty_isatty_fd)), тогда входящие данные будут буферизироваться построчно. Вы можете выключить построчную буферизацию вызвав `process.stdin.setRawMode(true)`. Однако, имейте ввиду что в этом случае обработчики системных нажатий (таких как`^C` и `^D`) будут удалены.

### [process.stdout](http://nodejs.org/api/process.html#process_process_stdout)

Поток на запись, содержащий стандартный системный вывод для вашей программы. Посылайте туда данные, если вам нужно передать их в stdout.

### [process.stderr](http://nodejs.org/api/process.html#process_process_stderr)

Поток на запись, содержащий стандартный системный вывод ошибок для вашей программы. Посылайте туда данные, если вам нужно передать их в stderr.

## [child_process.spawn()](https://nodejs.org/api/child_process.html)

Данная функция запускает процесс, и возвращает объект содержащий stderr/stdin/stdout потоки данного процесса.

### [fs.createReadStream()](https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options)

Поток на чтение, содержащий указанный файл. Используйте, если вам надо прочесть большой файл без больших затрат ресурсов.

### [fs.createWriteStream()](https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options)

Поток на запись, позволяющий сохранить переданные данные в файл.

## net

### [net.connect()](http://nodejs.org/docs/latest/api/net.html#net_net_connect_options_connectionlistener)

Данная функция вернет дуплексный поток, который позволяет подключиться к удаленному хосту по протоколу tcp.

Все данные которые вы будете в него записывать будут буферизироваться до тех пор, пока не возникнет событие `'connect'`.

### [net.createServer()](https://nodejs.org/api/net.html#net_net_createserver_options_connectionlistener)

Создает сервер для обработки входящих соединений. Параметром передается функция обратного вызова (callback), которая вызывается при создании соединения, и содержит поток на запись.

``` js
const net = require('net');
const server = net.createServer((c) => {
  // 'connection' listener
  console.log('client connected');
  c.on('end', () => {
    console.log('client disconnected');
  });
  c.write('hello\r\n');
  c.pipe(c);
});
server.on('error', (err) => {
  throw err;
});
server.listen(8124, () => {
  console.log('server bound');
});
```

### [http.request()](https://nodejs.org/api/http.html#http_http_request_options_callback)

Создает поток на чтение, позволяющий сделать запрос к веб-серверу и вернуть результат.

### [http.createServer()](https://nodejs.org/api/http.html#http_http_createserver_requestlistener)

Создает сервер для обработки входящих веб-запросов. Параметром передается функция обратного вызова (callback), которая вызывается при создании соединения, и содержит поток на запись.

### [zlib.createGzip()](https://nodejs.org/api/zlib.html#zlib_zlib_creategzip_options)

Трансформирующий поток, который отдает на выходе запакованный gzip.

### [zlib.createGunzip()](https://nodejs.org/api/zlib.html#zlib_zlib_creategunzip_options)

Трансформирующий поток, распаковывает gzip-поток.

### [zlib.createDeflate()](https://nodejs.org/api/zlib.html#zlib_zlib_createdeflate_options)

### [zlib.createInflate()](https://nodejs.org/api/zlib.html#zlib_zlib_createinflate_options)


# Сторонние потоки <a name="external"></a>

## Список модулей <a name="modules"></a>
Ниже приведен список npm-модулей, работающих с потоками. Список является далеко не полным, постоянно появляются новые модули и их нет возможности отслеживать. Цель данной таблицы - дать представление о "кирпичиках", из которых вы можете собрать свое приложение. Не стесняйтесь проходить по ссылкам и изучать документацию, там есть более подробное описание и примеры использования.

|            |              |
:-----------:|------------- |
| [through](https://github.com/dominictarr/through) | Простой способ создания дуплексного потока или конвертации "классического" в современный |
| [from](https://github.com/dominictarr/from) | Аналог through, только для создания потока для чтения |
| [pause-stream](https://github.com/dominictarr/pause-stream) | Позволяет буферизировать поток и получать результат буфера в произвольный момент |
| [concat-stream](https://github.com/maxogden/node-concat-stream) | Буферизирует поток в один общий буфер. `concat(cb)` принимает параметром только один аргумент - функцию `cb(body)`, которая вернет `body` когда поток завершится |
| [duplex](https://github.com/dominictarr/duplex), [duplexer](https://github.com/Raynos/duplexer) | Создание дуплексного потока |
| [emit-stream](https://github.com/substack/emit-stream) | Конвертирует события (event-emitter) в поток, и обратно |
| [invert-stream](https://github.com/dominictarr/invert-stream) | Создает из двух потоков один, "соединяя" вход первого потока с выходом второго и наоборот |
| [map-stream](https://github.com/dominictarr/map-stream) | Создает трансформирующий поток для заданной асинхронной функции |
| [remote-events](https://github.com/dominictarr/remote-events) | Позволяет объединять несколько эмиттеров событий в единый поток |
| [buffer-stream](https://github.com/Raynos/buffer-stream) | Дуплексный поток, буферизирующий проходящие через него данные |
| [highland](https://github.com/caolan/highland) | Управление асинхронным кодом с использованием потоков |
| [auth-stream](https://github.com/Raynos/auth-stream) | Добавление слоя авторизации для доступа к потокам |
| [mux-demux](https://github.com/dominictarr/mux-demux) | Создание мультифункциональных потоков на основе любых текстовых. |
| [stream-router](https://github.com/Raynos/stream-router) | Роутер для потоков, созданных с помощью `mux-demux` |
| [multi-channel-mdm](https://github.com/Raynos/multi-channel-mdm) | Создание постоянных потоков (каналов) из потоков `mux-demux` |
| [crdt](https://github.com/dominictarr/crdt), [delta-stream](https://github.com/Raynos/delta-stream), [scuttlebutt](https://github.com/dominictarr/scuttlebutt) | Данная коллекция потоков предполагает, что операции над данными всегда возвращают один и тот же результат вне зависимости от порядка этих операций |
| [request](https://github.com/mikeal/request) | Создание http-запросов |
| [reconnect-core](https://github.com/juliangruber/reconnect-core) | Базовый настраиваемый интерфейс для переподключения потоков при возникновении проблем в сети |
| [kv](https://github.com/dominictarr/kv) | Абстрактный поток, предоставляющий враппер для доступа к различным key-value хранилищам |
| [trumpet](https://github.com/substack/node-trumpet) | Трансформация html-текста с использованием css-селекторов |
| [JSONStream](https://github.com/dominictarr/JSONStream) | Преобразование `JSON.parse` и `JSON.stringify`. Примеры использования - обработка большого объема JSON-данных при недостаточном количестве оперативной памяти, обработка json "на лету" при получении его через медленные каналы, и т.п. |
| [shoe](https://github.com/substack/shoe) | Трансляция вебсокет событий. |
| [dnode](https://github.com/substack/dnode) | Данный модуль дает вам возможность вызывать удаленные функции (RPC) через любой поток |
| [tap](https://github.com/isaacs/node-tap) | Фреймворк для тестирования node.js на основе потоков. |
| [stream-spec](https://github.com/dominictarr/stream-spec) | Способ описания спецификации потоков, для автоматизации их тестирования. |

## Примеры использования <a name="examples"></a>

`pause-stream` позволяет буферизировать поток и получать результат буфера в произвольный момент:

```js
var ps = require('pause-stream')();

badlyBehavedStream.pipe(ps.pause())

aLittleLater(function (err, data) {
  ps.pipe(createAnotherStream(data))
  ps.resume()
})
```
***
В данном примере `concat-stream`  вернет строку `"beep boop"` только после того как вызовется `cs.end()`. Результат работы программы - перевод строки в верхний регистр:

``` js
var concat = require('concat-stream');

var cs = concat(function (body) {
    console.log(body.toUpperCase());
});
cs.write('beep ');
cs.write('boop.');
cs.end();
```

```
$ node concat.js
BEEP BOOP.
```
***
Следующий пример с `concat-stream` обработает строку с параметрами, и вернет их уже в JSON:

``` js
var http = require('http');
var qs = require('querystring');
var concat = require('concat-stream');

var server = http.createServer(function (req, res) {
    req.pipe(concat(function (body) {
        var params = qs.parse(body.toString());
        res.end(JSON.stringify(params) + '\n');
    }));
});
server.listen(5005);
```

```
$ curl -X POST -d 'beep=boop&dinosaur=trex' http://localhost:5005
{"beep":"boop","dinosaur":"trex"}
```
***

В данном примере используются `JSONStream` и `emit-stream` и `net`. Будет создан сервер который автоматически отправит все события клиенту:

```js
var emitStream = require('emit-stream');
var JSONStream = require('JSONStream');
var net = require('net');

var server = (function () {
    var ev = createEmitter();

    return net.createServer(function (stream) {
        emitStream(ev)
            .pipe(JSONStream.stringify())
            .pipe(stream)
        ;
    });
})();
server.listen(5555);

var EventEmitter = require('events').EventEmitter;

function createEmitter () {
    var ev = new EventEmitter;
    setInterval(function () {
        ev.emit('ping', Date.now());
    }, 2000);

    var x = 0;
    setInterval(function () {
        ev.emit('x', x ++);
    }, 500);

    return ev;
}
```

Клиент, со своей стороны, может автоматически конвертировать приходящие данные обратно в события:

```js
var emitStream = require('emit-stream');
var net = require('net');

var stream = net.connect(5555)
    .pipe(JSONStream.parse([true]))
;
var ev = emitStream(stream);

ev.on('ping', function (t) {
    console.log('# ping: ' + t);
});

ev.on('x', function (x) {
    console.log('x = ' + x);
});
```
***
Данная программа создаст из stdin и stdout дуплексный поток с помощью `invert-stream`:

```js
var spawn = require('child_process').spawn
  var invert = require('invert-stream')

  var ch = spawn(cmd, args)
  var inverted = invert()

  ch.stdout.pipe(inverted.other).pipe(ch.sdin)

  //now, we have just ONE stream: inverted

  //write to che ch's stdin
  inverted.write(data)

  //read from ch's stdout
  inverted.on('data', console.log)
```

```js
var map = require('map-stream')

map(function (data, callback) {
  //transform data
  // ...
  callback(null, data)
})
```
***
Для создания потока, работающего с датами, тут мы используем `mux-demux`:

```js
var MuxDemux = require('mux-demux')
var net = require('net')

net.createServer(function (con) {
  con.pipe(MuxDemux(function (stream) {
    stream.on('data', console.log.bind(console))
  })).pipe(con)
}).listen(8642, function () {
  var con = net.connect(8642), mx
  con.pipe(mx = MuxDemux()).pipe(con)

  var ds = mx.createWriteStream('times')

  setInterval(function () {
    ds.write(new Date().toString())
  }, 1e3)
})
```

## Мощные комбинации <a name="cool"></a>

Статья была бы не полной без рассказа о той магии, которую можно совершать используя комбинации различных потоков. Давайте рассмотрим некоторые из них.

### Создание распределенной сети <a name="mesh"></a>

Модуль `scuttlebutt` может быть использован для синхронизации состояния между узлами mesh-сети, где узлы непосредственно не связаны между собой и нет единого мастера (аналог торрент-клиента).

Под капотом у `scuttlebutt` используется широко известный в узких кругах протокол [gossip](https://en.wikipedia.org/wiki/Gossip_protocol), который гарантирует что все узлы будут возвращать [последнее актуальное значение](https://ru.wikipedia.org/wiki/Консистентность_в_конечном_счёте).

Используя интерфейс `scuttlebutt/model`, мы можем создавать клиентов и связывать их между собой:

``` js
var Model = require('scuttlebutt/model');
var am = new Model;
var as = am.createStream();

var bm = new Model;
var bs = bm.createStream();

var cm = new Model;
var cs = cm.createStream();

var dm = new Model;
var ds = dm.createStream();

var em = new Model;
var es = em.createStream();

as.pipe(bs).pipe(as);
bs.pipe(cs).pipe(bs);
bs.pipe(ds).pipe(bs);
ds.pipe(es).pipe(ds);

em.on('update', function (key, value, source) {
    console.log(key + ' => ' + value + ' from ' + source);
});

am.set('x', 555);
```

Мы создали сеть в форме ненаправленного графа, которая выглядит так:

```
a <-> b <-> c
      ^
      |
      v
      d <-> e
```

Узлы `a` и `e` напрямую не соединены, но если мы выполним команду:

```
$ node model.js
x => 555 from 1347857300518
```

то увидим что узел  `a` будет доступен узлу `e` через узлы `b`и `d`. Учитывая то, что `scuttlebutt` использует простой потоковый интерфейс, и все узлы гарантированно получат данные - мы можем соединить любой процесс, сервер или транспорт которые поддерживают обработку строк.

Давайте создадим более реалистичный пример. В нем мы будем соединяться через сеть, и увеличивать счетчик каждые 320 миллисекунд на всех узлах:

``` js
var Model = require('scuttlebutt/model');
var net = require('net');

var m = new Model;
m.set('count', '0');
m.on('update', function (key, value) {
    console.log(key + ' = ' + m.get('count'));
});

var server = net.createServer(function (stream) {
    stream.pipe(m.createStream()).pipe(stream);
});
server.listen(8888);

setInterval(function () {
    m.set('count', Number(m.get('count')) + 1);
}, 320);
```

Теперь создадим клиента, который подключается к серверу, получает обновления и выводит их на экран:

``` js
var Model = require('scuttlebutt/model');
var net = require('net');

var m = new Model;
var s = m.createStream();

s.pipe(net.connect(8888, 'localhost')).pipe(s);

m.on('update', function cb (key) {
    // wait until we've gotten at least one count value from the network
    if (key !== 'count') return;
    m.removeListener('update', cb);

    setInterval(function () {
        m.set('count', Number(m.get('count')) + 1);
    }, 100);
});

m.on('update', function (key, value) {
    console.log(key + ' = ' + value);
});
```

Клиент получился чуть-чуть сложнее, так как ему приходится ждать обновления от остальных участников прежде чем убедиться что он может увеличить счетчик.

После того как мы запустим сервер и несколько клиентов - мы увидим изменения счетчика наподобие такого:

```
count = 183
count = 184
count = 185
count = 186
count = 187
count = 188
count = 189
```

Время от времени на некоторых узлах мы будем замечать что значения повторяются:

```
count = 147
count = 148
count = 149
count = 149
count = 150
count = 151
```

Это происходит потому, что мы не предоставили достаточно данных алгоритму для разрешения временных конфликтов, и ему сложнее поддерживать синхронизацию всех узлов. К сожалению, дальнейшее развитие примера выходит за пределы данной статьи, поэтому рекомендуем самостоятельно изучить `scuttlebutt`.

Обратите внимание, что в вышеприведенных примерах сервер это всего лишь еще один узел с теми же привилегиями что и остальные клиенты. Понятия "клиент" и "сервер" не затрагивают способы синхронизации данных, в данном сервер это "тот кто первым создал соединение". Подобные протоколы называют "симметричными", еще один пример подобного протокола можно посмотреть в реализации модуля `dnode`.

### Клиент-серверный RPC <a name="rpc"></a>

Для примера, создадим простой сервер `dnode`:

``` js
var dnode = require('dnode');
var net = require('net');

var server = net.createServer(function (c) {
    var d = dnode({
        transform : function (s, cb) {
            cb(s.replace(/[aeiou]{2,}/, 'oo').toUpperCase())
        }
    });
    c.pipe(d).pipe(c);
});

server.listen(5004);
```

потом напишем клиента, который вызывает метод сервера `.transform()`:

``` js
var dnode = require('dnode');
var net = require('net');

var d = dnode();
d.on('remote', function (remote) {
    remote.transform('beep', function (s) {
        console.log('beep => ' + s);
        d.end();
    });
});

var c = net.connect(5004);
c.pipe(d).pipe(c);
```

После запуска, клиент выведет следующий текст:

```
$ node client.js
beep => BOOP
```

Клиент послал `'beep'` на сервер, запросив выполнение метода `.transform()`, сервер вернул результат.

Интерфейс, который предоставляет `dnode`, является дуплексным потоком. Таким образом, так как и клиент и сервер подключены друг к другу (`c.pipe(d).pipe(c)`), запросы можно выполнять в обе стороны.

`dnode` раскрывает себя во всей красе когда вы начинаете передавать аргументы к предоставленным методам. Посмотрим на обновленную версию предыдущего сервера:

``` js
var dnode = require('dnode');
var net = require('net');

var server = net.createServer(function (c) {
    var d = dnode({
        transform : function (s, cb) {
            cb(function (n, fn) {
                var oo = Array(n+1).join('o');
                fn(s.replace(/[aeiou]{2,}/, oo).toUpperCase());
            });
        }
    });
    c.pipe(d).pipe(c);
});

server.listen(5004);
```

Вот обновленный клиент:

``` js
var dnode = require('dnode');
var net = require('net');

var d = dnode();
d.on('remote', function (remote) {
    remote.transform('beep', function (cb) {
        cb(10, function (s) {
            console.log('beep:10 => ' + s);
            d.end();
        });
    });
});

var c = net.connect(5004);
c.pipe(d).pipe(c);
```

После запуска клиента, мы увидим:

```
$ node client.js
beep:10 => BOOOOOOOOOOP
```

Сервер увидел аргумент, и выполнил функцию с ним!

Основная идея такая: вы просто кладете функцию в объект, и на другой стороне земного шара вызываете идентичную функцию с нужными вам аргументами. Вместо того чтобы выполниться локально, данные передаются на сервер и функция возвращает результат удаленного выполнения. Это просто работает.

`dnode` работает через потоки как в node.js, так и в браузере. Удобно комбинировать потоки через `mux-demux` для создания мультиплексного потока, работающего в обе стороны.

### Собственная реализация socket.io <a name="socket"></a>

Мы можем создать собственное API для генерации событий через websocket с использованием потоков.

Сперва, используем `shoe` для создания серверного обработчика вебсокетов, и `emit-stream` чтобы превратить эмиттер событий в поток, который генерирует объекты.

Далее, поток с объектами мы подключаем к `JSONStream`, с целью преобразовать объект в строку готовую для передачи в сеть.

``` js
var EventEmitter = require('events').EventEmitter;
var shoe = require('shoe');
var emitStream = require('emit-stream');
var JSONStream = require('JSONStream');

var sock = shoe(function (stream) {
    var ev = new EventEmitter;
    emitStream(ev)
        .pipe(JSONStream.stringify())
        .pipe(stream)
    ;
    ...
});
```

Теперь мы можем прозрачно генерировать события используя метод эмиттера `ev`. К примеру, несколько событий через разные промежутки времени:

``` js
var intervals = [];

intervals.push(setInterval(function () {
    ev.emit('upper', 'abc');
}, 500));

intervals.push(setInterval(function () {
    ev.emit('lower', 'def');
}, 300));

stream.on('end', function () {
    intervals.forEach(clearInterval);
});
```

Наконец, экземпляр `shoe` привяжем к http-серверу:

``` js
var http = require('http');
var server = http.createServer(require('ecstatic')(__dirname));
server.listen(8080);

sock.install(server, '/sock');
```

Между тем, на стороне браузера поток от `shoe` содержащий json обрабатывается и получившиеся объекты передаются в `eventStream()`. Таким образом, `eventStream()` возвращает эмиттер который генерирует переданные сервером события:

``` js
var shoe = require('shoe');
var emitStream = require('emit-stream');
var JSONStream = require('JSONStream');

var parser = JSONStream.parse([true]);
var stream = parser.pipe(shoe('/sock')).pipe(parser);
var ev = emitStream(stream);

ev.on('lower', function (msg) {
    var div = document.createElement('div');
    div.textContent = msg.toLowerCase();
    document.body.appendChild(div);
});

ev.on('upper', function (msg) {
    var div = document.createElement('div');
    div.textContent = msg.toUpperCase();
    document.body.appendChild(div);
});
```

Используем [browserify](https://github.com/substack/node-browserify) для генерации кода в браузере, чтобы мы могли делать `require()` прямо в файле:

```
$ browserify main.js -o bundle.js
```

Подключаем `<script src="/bundle.js"></script>` в html-страницу, открываем ее в браузере и наслаждаемся серверными событиями которые отображаются в браузере.

# Заключение <a name="conclusion"></a>
Начав использовать потоки и планировать с их помощью процесс разработки программ, вы заметите что стали больше полагаться на маленькие переиспользуемые компоненты которым не нужно ничего кроме общего интерфейса потоков. Вместо маршрутизации сообщений через глобальную систему событий и настройки обработчиков вы сфокусируетесь на разбиении приложения на мелкие компоненты, хорошо выполняющими какую-то одну задачу.

В примерах вы можете легко заменить `JSONStream` на `stream-serializer` чтобы получить немного другой способ преобразования в строку. Вы можете добавить дополнительный слой чтобы обрабатывать потери связи с помощью `reconnect-core`. Если вы захотите использовать события с областью видимости - вы вставите дополнительный поток с поддержкой [eventemitter2](https://npmjs.org/package/eventemitter2). В случае если вам потребуется изменить поведение некоторых частей потока вы сможете пропустить его через `mux-demux` и разделить на отдельные каналы каждый со своей логикой.

С течением времени, при изменении требований к приложению, вы легко сможете заменять устаревшие компоненты новыми, с гораздо меньшим риском получить в результате неработающую систему.
