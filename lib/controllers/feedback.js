(function() {
  var cache, config, credentials, fs, mailOptions, nodemailer, oneDay, transport, _;

  nodemailer = require("nodemailer");

  _ = require('lodash');

  credentials = require("../../smtp.json");

  fs = require('fs');

  config = {
    service: 'yandex',
    auth: credentials
  };

  transport = nodemailer.createTransport("SMTP", config);

  mailOptions = {
    from: "Feedback robot <" + credentials.user + ">",
    to: "getstarted@makeomatic.ru"
  };

  cache = {
    phones: {}
  };

  oneDay = 86400000;

  setInterval((function() {
    return cache.phones = {};
  }), oneDay / 4);

  exports.brief = function(req, res) {
    var cachedPhone, data, email, errors, name, phone, qqfile, question, subject, text, _ref;

    _ref = req.body, name = _ref.name, phone = _ref.phone, email = _ref.email, question = _ref.question;
    qqfile = req.files.qqfile;
    if (cache.phones[cachedPhone] != null) {
      return res.json({
        success: true
      });
    }
    errors = [];
    if (name.length < 4) {
      errors.push("Укажите Ваше имя и фамилию");
    }
    if ((cachedPhone = phone.replace(/\D/g, "")).length < 11) {
      errors.push("Укажите ваш номер полностью");
    }
    if (errors.length > 0) {
      return res.json({
        success: false,
        errors: errors
      });
    }
    subject = "Запрос звонка от " + name;
    text = "Имя: " + name + "\n\nТелефон: " + phone + "\n\nE-mail: " + email + "\n\nВопрос: " + question;
    data = _.extend({
      subject: subject,
      text: text
    }, mailOptions);
    if (qqfile != null) {
      data.attachments = [
        {
          fileName: qqfile.name,
          streamSource: fs.createReadStream(qqfile.path),
          contentType: qqfile.type
        }
      ];
    }
    return transport.sendMail(data, function(err, response) {
      if (err != null) {
        console.error(err);
        return res.json({
          success: false,
          err: "Непредвиденная ошибка сервера"
        });
      }
      cache.phones[cachedPhone] = true;
      return res.json({
        success: true
      });
    });
  };

}).call(this);
