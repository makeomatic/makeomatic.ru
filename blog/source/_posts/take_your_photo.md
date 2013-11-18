title: Фотографируй себя когда cоздаешь коммит
date: 2013-11-18
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
tags: [GitHub]
---

![Самофото](/blog/images/selfie.jpg)

Начнем со скачивания `imagesnap` из `https://github.com/alexwilliamsca/imagesnap` или установим его с помощью `homebrew` 
`brew install imagesnap`

Создадим  `~/.gitshots` содержащий:
`mkdir ~/.gitshots`

Добавим строку кода как post-commit, чтобы привязать ваше *github* хранилище:
`#!/usr/bin/env ruby`

Наслаждайтесь!

