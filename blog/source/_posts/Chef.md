title: Как удалить постоянные атрибуты сервера в Chef?
date: 2013-12-19
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
tags: [Chef]
---

![Иллюстрация блокнота](/blog/images/chef.png)
## Рецепты для шефа
Вы когда- либо случайно устанавливали `node.normal[:foo][:bar] = 'something bad'` в вашем рецепте для `chef`? 

<!-- more -->

Потом вы заметили, что сервер сохранил атрибуты с приоритетом `normal` между запусками chef, а на самом деле вы хотели использовать атрибуты с их [стандартным приоритетом] (http://docs.opscode.com/essentials_cookbook_attribute_files.html#attribute-precedence) в файле вашего кукбука `attributes/default.rb`.

### Команда "knife exec"
Команда `knife exec` - это ваш друг:
```rb
knife exec -E "nodes.transform(:all) {|n| n.normal_attrs[:foo].delete(:bar) rescue nil }"
```
**Пример**: Мне нужно было удалить некоторые `default`, `normal` и `override` атрибуты для `sudo cookbook` на всех серверах, для этого я использовала команду:
```rb
knife exec -E "nodes.transform(:all) {|n| n.default_attrs['authorization']['sudo'].delete('groups') rescue nil }"
knife exec -E "nodes.transform(:all) {|n| n.normal_attrs['authorization']['sudo'].delete('groups') rescue nil }"
knife exec -E "nodes.transform(:all) {|n| n.override_attrs['authorization']['sudo'].delete('groups') rescue nil }"
```

Если я захочу внести изменение только на определенном сервере, то я передам запрос к Solr в `node.transform()`:
```rb
knife exec -E "nodes.transform('name:dfw-mynode-01') {|n| n.default_attrs['authorization']['sudo'].delete('groups') rescue nil }"
```

**На заметку**: команда `knife exec` сильна… С большой силой приходит большая ответственность!
