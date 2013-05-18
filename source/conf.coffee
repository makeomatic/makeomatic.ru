fs = require 'fs'

###
  Config
###

## technology ##
exports.tech = tech = []

path = "#{__dirname}/../static/img/technology"
fs.readdirSync(path).forEach (technology)->
  if fs.statSync("#{path}/#{technology}").isFile()
    tech.push "/img/technology/#{technology}"


## Links ##
exports.links = [
  {name: "Команда",     href: "#team",    isActive: true}
  {name: "О нас",       href: "#about"}
  {name: "Портфолио",   href: "#portfolio"}
  {name: "Технологии",  href: "#tech"}
  {name: "Контакты",    href: "#contacts"}
]

## phone ##
exports.phone = "+7 (495) 79-222-44"

## email ##
exports.email = "getstarted@makeomatic.ru"

## copyright ##
exports.copyright = "Make-o-Matic, (c) 2012-2013<br/>Разработка сайтов и мобильных приложений"

## address ##
exports.address = "Россия, Москва, Ленинский пр-т, д 1, офис 314<br/>индекс: 111555"


###
  Config -- homepage
###

## Title ##
exports.main_page_title = "Make-o-Matic: создание сайтов в Москве, разработка мобильных приложений, дизайн"

## Team ##
exports.employees = [
  {
  photo: "/img/employee/002.png"
  name:  "Вячеслав Гусев"
  occupation: "Граф дизайнер"
  }
  {
  photo: "/img/employee/003.png"
  name:  "Борис Повод"
  occupation: "iOS Мастер"
  }
  {
    photo: "/img/employee/001.png"
    name:  "Виталий Аминев"
    occupation: "CEO"
  }
  {
  photo: "/img/employee/004.png"
  name:  "Анна Федотова"
  occupation: "Дир. по развитию"
  }
  {
  photo: "/img/employee/006.png"
  name:  "Никита Львов"
  occupation: "Секретное Оружие"
  }
  {
  photo: "/img/employee/005.png"
  name:  "Арман Манукян"
  occupation: "Креативный Арма"
  }
  {
  photo: "/img/employee/007.png"
  name:  "Дмитрий Горбунов"
  occupation: "JavaScript Guru"
  }
  {
  photo: "/img/employee/008.png"
  name:  "Алексей Князев"
  occupation: "Python Мастер"
  }
]
## Portfolio ##
exports.portfolio = portfolio = []

## Рекорды рынка недвижимости ##
portfolio.push require('./fixtures/recordi')

## ФитКафе ##
portfolio.push require('./fixtures/fitcafe')

## openInclude ##
portfolio.push require('./fixtures/openinclude')

## openInclude ##
portfolio.push require('./fixtures/speakgeo')

## openInclude ##
portfolio.push require('./fixtures/liveone')