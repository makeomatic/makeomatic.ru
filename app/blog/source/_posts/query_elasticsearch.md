title: Работаем с запросами в ElasticSearch, содержащими обратные слеши
date: 2014-03-20
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
cover: https://makeomatic.ru/blog/images/elasticsearch.jpg
coverWidth: 620
coverHeight: 620
url: https://makeomatic.ru/blog/2014/03/20/query_elasticsearch/
tags: [ElasticSearch]
---

![Иллюстрация блокнота](/blog/images/elasticsearch.jpg)

Если вы индексируете не анализируемое содержимое, которое содержит обратные слеши, то вы можете заметить, что вы не получите ожидаемых результатов, при выполнении таких поисковых запросов. Например, предположите, что вы индексируете эту строку:

<!-- more -->

`MyIndex\MyType\Classname` (является названием php класса), в поле `className` вашего индекса. Вы проиндексировали его без использования анализаторов для того, чтобы ElasticSearch обработал строку без каких-либо изменений. Теперь, предположим, вы хотите найти данную запись. Если вы делаете запросы через HTTP, они будут выглядеть примерно так:

`http://localhost:9200/my_index/my_type/_search?pretty=true&q=className:MyIndex\MyType\Classname`

Но вы не получите никаких результатов: ElasticSearch требует, чтобы обратные слеши были экранированы для проведения поискового запроса.

Работающий запрос будет выглядеть так:

`http://localhost:9200/my_index/my_type/_search?pretty=true&q=className:MyIndex\\MyType\\Classname`

Если вы делаете запрос через PHP как и я, функция `addslashes()` - ваш друг, хотя и `str_replace()` может помочь.

Скорее всего есть и более элегантные решения, но то о чем мы написали работает успешно!


