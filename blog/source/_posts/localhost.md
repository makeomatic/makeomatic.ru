title: Делитесь своим localhost с кем угодно
date: 2013-11-22
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
tags: [localhost]
---


Хотите узнать способ быстро поделиться локальным сайтом без необходимости его развёртывания?
Я с радостью расскажу как на самом деле это просто делается.

Для начала установим `localtunnel`:

`$ gem install localtunnel`

<!-- more -->

Далее запускаем ваш localhost сервер, к примеру на **Rails**, используя default WEBrick сервер:

`$ rails s`

Или **Python**:

`$ python - m SimpleHTTPServer 8000`

Когда в первый раз вы запускаете localtunnel, вам нужно будет использовать один из ваших публичных SSH ключей:

`$ localtunnel -k ~/.ssh/id_rsa.pub 8000`


Вы найдете что-то подобное в конце:
```
➜  project_name git:(develop) localtunnel 8000
   This localtunnel service is brought to you by Twilio.
   Port 8000 is now publicly accessible from http://xxxx.localtunnel.com ...
```
   
Затем просто поделитесь ссылкой http://xxxx.localtunnel.com с тем, кому нужно показать ваш результат.
В дальнейшем вы можете использовать только `localtunnel <port>`, чтобы создавать публичный URL:

`$ localtunnel 8000`

И это все. 
Установка и настройка занимают меньше 5-ти минут и это превосходно работает.
