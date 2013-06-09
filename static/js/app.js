$(function(){
    'use strict';
    // инициализирую приложение
    window.up_button_animate_speed = 600;
    // кнопочка scroll to top
    window.App = {
        initialize: function() {
          this.addScrollTop();
          this.addMaskedInput();
        },
        addMaskedInput: function(){
          $("[name=phone]").mask("+9 (999) 999-99-99");
          $("#callback").on('submit', this.requestCallback);
        },
        requestCallback: function(e){
          e.preventDefault();
          var _this = window.App,
              $this = $(this),
              $submit = $("[type=submit]", $this);
          // не даем спамить сабмитить
          if ( _this.callbackWasSubmitted ||  $submit.hasClass("disabled") ) return;

          var data  = $this.serializeArray(),
              name  = data[0].value,
              phone = data[1].value;

          // делаем простые проверки на наличие имени, фамилии и телефона
          var errors = [];

          if (name.length < 4){
              errors.push("Укажите Ваше имя и фамилию");
          }

          if (phone.replace(/\D/g, "").length < 11){
              errors.push("Укажите ваш номер полностью");
          }

          var $container = $("ul.error");
          if ( errors.length === 0 ){
              $container.addClass("hidden");
              // отправляем форму
              $submit.addClass("disabled");
              $.post($this.attr("action"), $.param(data), function(response, textStatus){
                  if (response.success === true){
                      _this.callbackWasSubmitted = true;
                      $submit.toggleClass("disabled success").text("Спасибо за Ваш запрос, скоро мы с вами свяжемся!");
                      $("input, textarea", $this).slideUp(200);
                  } else {
                      // здесь возникла ошибка -- TODO: обработать
                  }
              }, 'json');
          } else {
             // контейнер для ошибок
             $container.empty().removeClass("hidden");

             $.each(errors, function(k,v){
                $container.append("<li>"+this+"</li>");
             });
          }

          return false;
        },
        addScrollTop: function () {
            var self = this;
            this.up = $("#up");

            $(window).on("scroll", function () {
                var t;
                t = $(window).scrollTop();
                if (!self.is_animated)
                    t > 50 ? self.show_up_button() : self.hide_up_button();
            });

            this.up.on("click", function () {
                $("html, body").animate({
                    scrollTop: 0
                }, self.up_button_animate_speed, function () {
                    self.hide_up_button();
                });
            });
        },
        show_up_button: function () {
            var self = this;
            if (!this.up.data("is_visible")) {
                this.is_animated = true;

                this.up.stop(true, true).transition({
                    top: 0,
                    opacity: 1
                }, self.up_button_animate_speed, function () {
                    return self.is_animated = false;
                });

                this.up.data("is_visible", true);
            }
        },
        hide_up_button: function () {
            var self = this;

            if (this.up.data("is_visible")) {
                this.is_animated = true;

                this.up.stop(true, true).transition({
                    top: -54,
                    opacity: 0
                }, this.up_button_animate_speed, function () {
                    self.is_animated = false;
                });

                this.up.data("is_visible", false);
            }
        }
    };

    window.App.initialize();
});