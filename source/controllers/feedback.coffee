## Зависимости
nodemailer = require "nodemailer"
transport  = nodemailer.createTransport "sendmail"
_          = require 'lodash'

mailOptions =
  from: "Feedback robot <noreply+callback@makeomatic.ru>"
  to: "getstarted@makeomatic.ru"


# кеш внутри памяти -- мы не хотим получать много спама, но и мучаться писать защиты тоже не хотим
# просто сохраняем все запросы внутри памяти и периодически чистим
cache =
  phones: {}

# чистим каждые 6 часов
oneDay = 86400000
setInterval (-> cache.phones = {}), oneDay/4

exports.callback = (req, res)->
  ## Здесь обрабатываем заявки на поступающие запросы
  {name, phone, email, question} = req.body
  # если в кеше уже присутствует телефон - не шлем еще раз
  return res.json {success: true} if cache.phones[cachedPhone]?
  # делаем аналогичные клиенту проверки
  errors = []
  errors.push "Укажите Ваше имя и фамилию" if name.length < 4
  errors.push "Укажите ваш номер полностью" if (cachedPhone = phone.replace(/\D/g, "")).length < 11
  return res.json {success:false, errors} if errors.length > 0

  subject = "Запрос звонка от #{name}"
  text    = """
            Имя: #{name}\n
            Телефон: #{phone}\n
            E-mail: #{email}\n
            Вопрос: #{question}
            """

  # заставлять клиента ждать ответ мы не будем
  transport.sendMail _.extend {subject, text}, mailOptions, (err, response)->
    if err?
      console.error err
      return res.json {success: false, err: "Непредвиденная ошибка сервера"}

    # добавляем телефон в кеш
    cache.phones[cachedPhone] = true

    # отдаем ответ что все ок
    res.json {success: true}


exports.brief = (req, res)->
  ## здесь обрабатываем бриф

  res.json {success: true}