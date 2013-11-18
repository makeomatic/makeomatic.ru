title: Создавайте отчет о выполненной работе, используя Git Log
date: 2013-11-19
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
tags: [GitHub]
---

Иногда наши клиенты просят отправить недельный отчет по проделанной работе. Несомненно, это занятие не доставляет удовольствия ни одному разработчику. Я предпочитаю предоставлять данную информацию с помощью *git log*.

## Способ создания git log 

Результат можно достичь, в случае использования индивидуальных настроек:
`git log --author=Vitaly # Поставьте свое имя`

Генерируем следующий вывод данных:

```ruby
commit ad5140bca518c676cd4a6e9b268f66d3ff89f992
Author: Vitaly Aminev <v@aminev.me>
Date:   Tue Nov 19 10:01:41 2013 +0400

    refs #101: Lorem Ipsum commit message

commit 5d3d687cbdea09e334267312451065a4416ea5b1
Merge: 76c97d3 b7850f9
Author: Vitaly Aminev <v@aminev.me>
Date:   Tue Nov 19 10:01:41 2013 +0400

    Merge branch 'master' of git.example.com:your-project/your-branch

commit 7e6e36eb78f3b07bcb12c0fa3c1e240e6634ellr
Author: Vitaly Aminev <v@aminev.me>
Date:   Tue Nov 11 10:01:21 2013 +0400

    Lorem Ipsum commit message

commit f86221395bee652e08ab8d25c18445c27yy5b723
Author: Vitaly Aminev <v@aminev.me>
Date:   Tue Nov 12 12:47:11 2013 +0400

    refs #101: Lorem Ipsum commit message

commit 31dc49c6a8da7bou699aff7814baa0af555618d8
Author: Vitaly Aminev <v@aminev.me>
Date:   Tue Nov 13 15:23:41 2013 +0400

    refs #100: Lorem Ipsum commit message
```

## Следующий шаг:

Ограничиваем лог последней неделей (или месяцем или…). Можем использовать его начиная и заканчивая следующими опциями:
`git log --author=Vitaly --since='1 sunday ago' --until='now'`

В системе автоматически введены настройки, которые выводят результаты о проделанной работе, начиная с воскресения.
Можно так же поменять настройки временных рамок:
`git log --author=Vitaly --since='2 sunday ago' --until='1 sunday ago'`

На самом деле это не особо читаемый формат, но я предпочитаю создавать компактный отчет, используя  `formatoption`. Помимо этого используется строгая последовательность для установки формата и показа информации в журнале событий. Предпочтительный формат:
`%Cred%h%Creset %s %Cgreen(%ci) %Cblue<%an>%Creset`

демонстрируя commit hash `%h`, красный цвет `%Cred`, сообщение в коммите `%s` в стандартном цвете `%Creset`, 
время в коммите `%ci`, в зеленом цвете `%Cgreen` и имя автора `%an`, в голубом `%Cblue` и переключение цвета. 
Большее кол-во вариантов форматирования вы пожете посмотреть на [официальном сайте](https://www.kernel.org/pub/software/scm/git/docs/git-log.html#_pretty_format)

**Итак создаем:**

```ruby
ad5140b refs #101: Lorem Ipsum commit message (2013-08-23 12:50:41 2013 +0400) <Vitaly Aminev>
5d3d687 Merge branch 'master' of git.example.com:your-project/your-branch (2013-08-23 12:39:35 2013 +0400) <Vitaly Aminev>
7e6e36e Lorem Ipsum commit message (2013-08-23 10:35:41 2013 +0400) <Vitaly Aminev>
f862213 refs #101: Lorem Ipsum commit message (2013-08-23 10:35:23 2013 +0400) <Vitaly Aminev>
31dc49c refs #100: Lorem Ipsum commit message (2013-08-22 09:26:40 2013 +0400) <Vitaly Aminev>
```

Другой формат показа, используемый только для даты и сообщения в коммите:

`%Cgreen%ci%Creset %s%Creset`

**Генерируем:**

```ruby
git log --author=Vitaly --since='2 sunday ago' --until='1 sunday ago' --format='%Cgreen%ci%Creset %s%Creset

2013-08-23 12:50:41 2013 +0400 refs #101: Lorem Ipsum commit message 
2003-08-23 12:39:35 2013 +0400 Merge branch 'master' of git.example.com:your-project/your-branch
2013-08-23 10:35:41 2013 +0400 Lorem Ipsum commit message 
2013-08-23 10:35:23 2013 +0400 refs #101: Lorem Ipsum commit message 
2013-08-22 09:26:40 2013 +0400 refs #100: Lorem Ipsum commit message
```

У нас появился базовый отчет. Клиент не должен знать что это за соединение. На самом деле я предпочитаю удалять это сообщение, используя флаг `no-merges`:

```ruby
git log --author=Vitaly --since='2 sunday ago' --until='1 sunday ago' --format='%Cgreen%ci%Creset %s%Creset' --no-merges

2013-08-23 12:50:41 2013 +0400 refs #101: Lorem Ipsum commit message 
2013-08-23 10:35:41 2013 +0400 Lorem Ipsum commit message 
2013-08-23 10:35:23 2013 +0400 refs #101: Lorem Ipsum commit message 
2013-08-22 09:26:40 2013 +0400 refs #100: Lorem Ipsum commit message
```

Сейчас у нас есть полный отчет о проделанной работе.

***На заметку:***

Чтобы каждый раз не вписывать настройки, достаточно один раз их сохранить в `git command`. 
Отредактируйте `.git/config` в своем репозитории и добавьте: 

```
 [alias]
  report = "log --author=Vitaly --since='2 sunday ago' --until='1 sunday ago' --format='%Cgreen%ci%Creset %s%Creset' --no-merges"

```

**Теперь Вы можете:**

получить отчет;
`git report`

создать больше отчетов;
`report-csv = "log --author=Vitaly --since='2 sunday ago' --until='1 sunday ago' --format='\"%ci\",\"%s\"' --no-merges"`

*(Внимание: избегайте " in format using \ )*

**CSV report  создается:**

`git report-csv > report.csv`

*Ура*, отчет по выполненной работе теперь выглядит намного проще.

*(конечно, иногда приходится редактировать текст выведенных данных, чтобы они были понятны самому клиенту)*

Отправляйте репорты с удовольствием! =)

