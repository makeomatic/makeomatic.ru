var crypto = require('crypto');
var querystring = require('querystring');

function md5(str){
  return crypto.createHash('md5').update(str).digest('hex');
}

hexo.extend.helper.register('gravatar', function (item) {
  var gravatar = md5(item.gravatarMail.toLowerCase());
  return  "<span class='author'>"+
            "<img src='//www.gravatar.com/avatar/" + gravatar + "?s=20' /> " + item.author +
          "</span>";

});
