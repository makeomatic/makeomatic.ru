title: “Безопасный” `$apply`в Angular.JS
date: 2014-01-30
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
tags: [Angular.JS, Javascript]
---

Если вы частенько натыкаетесь на `$apply already in progress`, пока работаете с ангуляром (я замечаю, что чаще всего с этим сталкиваюсь, когда внедряю сторонние плагины, которые вызывают большое количество DOM событий), то вы можете использовать  сервис `safeApply` для проверки текущей фазы обрабоки в ангуляре, непосредственно перед выполнением вашей функции. Я обычно (monkey) патчу `$scope` объект основного контроллера, а Angular распространяет мои изменения в остальные части приложения за меня:
```
$scope.safeApply = function(fn) {
  var phase = this.$root.$$phase;
  if(phase == '$apply' || phase == '$digest') {
    if(fn && (typeof(fn) === 'function')) {
      fn();
    }
  } else {
    this.$apply(fn);
  }
};
```
А затем просто заменяйте  `$apply` на `safeApply` везде, где вам это необходимо:

```
$scope.safeApply(function() {
  alert('Now I'm wrapped for protection!');
});
```

В следующем примере, вы можете увидеть как присоединять `safeApply` в виде Ангуляр сервиса к вашему модулю. В добавок, эта версия учитывает вызовы к `$apply()`, которые не передают функцию в первом аргументе.  Чтобы им воспользоваться, присоедините следующее к вашему модулю:
.factory('safeApply', [function($rootScope) {
		    return function($scope, fn) {
		        var phase = $scope.$root.$$phase;
		        if(phase == '$apply' || phase == '$digest') {
		            if (fn) {
		                $scope.$eval(fn);
		            }
		        } else {
		            if (fn) {
		                $scope.$apply(fn);
		            } else {
		                $scope.$apply();
		            }
		        }
		    }
		}])
		  
и используйте его c помощью внедрения зависимостей:

.controller('MyCtrl', ['$scope,' 'safeApply', function($scope, safeApply) {
		    safeApply($scope);                     // no function passed in
		    safeApply($scope, function() {   // passing a function in
		    });
		}])
		   
		
		
