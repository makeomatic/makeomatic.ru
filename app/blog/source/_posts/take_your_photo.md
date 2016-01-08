title: Фотографируй себя когда создаешь коммит
date: 2013-11-18
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
cover: https://makeomatic.ru/blog/images/selfie.jpg
coverWidth: 620
coverHeight: 434
url: https://makeomatic.ru/blog/2014/07/05/nodeconfeu_2013/
tags: [GitHub]
---

![Самофото](/blog/images/selfie.jpg)

Начнем со скачивания `imagesnap` из https://github.com/rharder/imagesnap или установим его с помощью `homebrew` 
`brew install imagesnap`

Создадим  `~/.gitshots` содержащий:
`mkdir ~/.gitshots`

Добавим `post-commit hook`, чтобы привязать ваше github хранилище:

```ruby
#!/usr/bin/env ruby
file="~/.gitshots/#{Time.now.to_i}.jpg"
unless File.directory?(File.expand_path("../../rebase-merge", __FILE__))
  puts "Taking capture into #{file}!"
  system "imagesnap -q -w 3 #{file} &"
end
exit 0
```

Наслаждайтесь!

