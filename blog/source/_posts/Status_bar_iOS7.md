title: Как починить статус бар в iOS7
subtitle: Как починить статус бар в iOS 7
date: 2013-11-21
author: Анна Аминева
gravatarMail: annafedotovaa@gmail.com
tags: [iOS7, status bar]
---


Как и многие из вас я тщательно работаю над переходом на iOS7 в течении долгого времени. С момента разработки старых приложений в Xcode5 для iOS7, статус бара, накладывающегося на контроллеры видов (views/view controllers), добавилось много головной боли. 

## Методы исправления статус бара

Вот и уже известные методы:

1.Добавляем 

`self.edgesForExtendedLayout = UIRectEdgeNone; in viewDidLoad`

2.Если контроллеры видов встроены внутри `UINaivigationController` и navigation bar не спрятан, в этом случае дайте бару фоновое изображение.
3.Если контроллеры видов встроены внутри `UINaivigationController` и navigation bar не спрятан, в таком случае, вы должны двигать вручную каждые 20 пикселей UIView ниже по оси *y*.

## Важный трюк

Однако, когда все вышеперечисленное не работает (в моем случае отображенный модальный вид оставляет вместо статус бара черный фон). 

К счастью, нам на помощь приходит решающая уловка:
```
        if (IS_IOS7) {
        UIView *fixbar = [[UIView alloc] init];
        fixbar.frame = CGRectMake(0, 0, 320, 20);
        fixbar.backgroundColor = [UIColor colorWithRed:0.973 green:0.973 blue:0.973 alpha:1]; // the default color of iOS7 bacground or any color suits your design
        [self.view addSubview:fixbar];
```
