$(function(){
    'use strict';
    // инициализирую приложение
    window.up_button_animate_speed = 600;
    // кнопочка scroll to top
    window.App = {
        initialize: function() {
          this.addScrollTop();
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