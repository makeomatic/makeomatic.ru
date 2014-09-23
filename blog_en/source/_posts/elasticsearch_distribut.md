title: Hacking the code of international shipping
date: 2014-30-07
author: Anna Amineva
gravatarMail: annafedotovaa@gmail.com
tags: [Elasticsearch, NodeJS, AngularJS]
cover: http://en.makeomatic.ru/blog_en/images/elastic_distribut.png
coverWidth: 1000
coverHeight: 738
url: http://en.makeomatic.ru/blog/2014/07/30/elasticsearch_distribut/
---

![Illustration Distribut.io](/blog_en/images/elastic_distribut.png)

Addressing issues and solving problems, people and businesses are facing in their everyday routine, no matter how challenging they are, has always been usual practice for us at Makeomatic. But when a client with more than 15 years of experience in international shipping turned to us asking for help, at first we were frozen with shock — we had no idea of how intricate and sometimes misleading the process of worldwide logistics could be. It took us time and effort to investigate this question in great detail and get back to the client with the solution. We proposed a technical concept using new technologies, such as elasticseach, angular.js and node.js. In the end we managed to obtain a simple search engine of Harmonized System codes. 
<!-- more -->

###Search for a shipping code

This solution created by Makeomatic is now a part of Distribut.io, which is capable of doing many things in order to save user’s time with his or her international shipping paperwork. But there is one thing, which really does the trick — it can efficiently search through thousands of custom codes and regulations. Thanks to [Elasticsearch](http://www.elasticsearch.org/), an open source search engine that strives on analyzing data. Our technical decision doesn’t merely process data, it also possesses features of the artificial intelligence. Elasticsearch is capable of searching through millions of data entries, which is why it is used by such online giants as Foursquare, an audio distribution platform Soundcloud, a social network for developpers GitHub, a recommendation service StumbleUpon and many more. The best search engine analyzes data in real-time and offers a full text search. And this great power now works for the benefit of Distribut.io’s users.

Elasticsearch is what allows Distribut.io search through the international customs tarriffs, an internationally standardized system of names and numbers to classify traded products, known as Harmonized System (HS) codes. The HS is organized into 21 sections and 96 chapters, accompanied with general rules of interpretation and explanatory notes, making a manual search a daunting task.

This is an HS code table in its regular format. How quickly can you find the subheading 1602 10, 1602 50 31 or 1602 50 95 in order to determine if your exported goods meet this particular HS code? 

```
0206299132 10,07/01/96 12:00 AM,,EN,10,- - - - - ,Other								
0206299132 20,07/01/96 12:00 AM,,EN,10,- - - - - - ,"Thin skirt, whole"								
0206299132 30,07/01/96 12:00 AM,,EN,10,- - - - - - - ,Intended for processing								
0206299132 80,07/01/96 12:00 AM,,EN,10,- - - - - - - - ,"For the manufacture of products falling within subheadings 1602 10, 1602 50 31 or 1602 50 95, not containing meat other than that of animals of the bovine species, with a collagen/protein ratio of no more than 0,45 and containing by weight at least 20% of lean meat (excluding offal and fat) with meat and jelly accounting for at least 85% of the total net weight	 the products must be subjected to a heat treatment sufficient to ensure the coagulation of meat proteins in the whole of the product and which therefore shows no traces of a pinkish liquid on the cut surface when the product is cut along a line passing through its thickest part (A-products)"							
0206299134 80,07/01/96 12:00 AM,,EN,10,- - - - - - - - ,"For the manufacture of products other than those falling within subheadings ex 0210 20, 0210 99 51, 0210 99 90, 1602 50 10 and 1602 90 61 (B-products)"								
0206299136 80,07/01/96 12:00 AM,,EN,10,- - - - - - - - ,Other								
0206299139 80,01/01/89 12:00 AM,,EN,10,- - - - - - - ,Other								
0206299150 10,07/01/96 12:00 AM,,EN,10,- - - - - - ,Other								
0206299150 20,07/01/96 12:00 AM,,EN,10,- - - - - - - ,Intended for processing
```

What if those references that had taken you such great pains to find, in turn, contain still more references, sending you on another chase? By the time you have found the correct answer in the bureaucratic maze of HS codes, you will have wasted precious time and resources that could have been spent elsewhere. 

With Distribut.io, this task is no longer cumbersome, frustrating and inefficient. It frees a user from the need to compare and contrast the HS codes. With the help of the elasticsearch, Distribut.io offers an effective way to pick the right HS code for the right product, saving time and money and allowing the small business owner to focus on growing his or her business. 

If you find our ideas and their realization elegant and smart, we would gladly help you out with your project.  
#### Developing your idea with Makeomatic
You can drop us an email to [getstarted@makeomatic.ru](mailto:getstarted@makeomatic.ru)


