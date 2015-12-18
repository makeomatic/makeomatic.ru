title: Smart travelling network for the benefit of everyone
date: 2015-12-18
author: Eleonora Pavlova
gravatarMail: koko@reevlodge.com
tags: [NodeJS, Elasticsearch, AngularJS]
---

![Illustration Smart travelling](/blog/images/f4f_main.jpg)

Only one week left before we step into 2016. It's been a productive year for Makeomatic. Not breaking the established tradition, we visited [NodeConf](http://nodeconfeu.com/) in Waterford. Throughout the year our team leaders coached two interns, one of them eventually joined and empowered the team. On a more serious side, we polished and shipped older products as well as plunged into several new challenges. We'll tell you briefly about one of those and the technical decisions we made on the way.

<!-- more -->

As digital era dictates its rules, the rise of several large e-commerce platforms such as Amazon and Shopify and a swarm of smaller players tested and proved that e-commerce has come here to stay. Furthermore, the way we scout for a particular thing to buy has evolved — we don't go straight to the shop. Instead, we open a search engine, find what’s needed, and more than often order it right there. It's easy, convenient and saves a lot of time. Most importantly, it allows one to order from abroad something that would never be available in a local shop. 

However, when seeing the final shipping cost, often all you think is "thank you, but no, thank you". This varies from country to country, but more often than not you would find that international shipping expenses are ridiculously high. Then, what we usually do  is go to our preferred social network and post a plea hoping that some of our friends will soon be on a trip and will generously help us get the desired goods. This would work at times, but it is, by far, not a bulletproof solution.

When a new client approached us with a task to build a local social platform connecting those, who want to get purchases from abroad and those, who will benefit from delivering them, we could relate to the need for such a start-up. So after discussing essential features and user flow, we set up to work.  

### Purpose and target audience

At Makeomatic we try to be very precise about features from square one. This allows us not to spend months wireframing but rather jump right into creating UI that people are going to see. For this we need to determine the main problems which our product is going to solve, in other words, its main purpose. 

In this particular case, we set on the task to build a social network for people that are fond of travelling or interested in getting particular goods from abroad. This means that we needed to build a robust platform — comfortable for social interactions, modern and easy to use for demanding yuppies and secure for online payments. Throughout all of our prototyping and building we kept that in mind.

It was decided to divide the development into three separate stages — a desktop web app, iOS and Android mobile apps.

[1.jpg]

### First steps: choosing the tools

The success of any start-up depends on a good idea, but, as far as we are concerned, and others agree (https://sivers.org/multiply), execution is what really matters. Every small architectural decision adds to the potential of the app. At Makeomatic we use a bunch of various technologies. Certainly, we have our favourites, and Node.js is definitely among them. 

At NodeConf we've been told that Node.js beats most of the other programming languages in development speed and, often, performance by 2-4 times. There's no better way to prove it than to switch from the old core languages, such as Java, Ruby or PHP, and use it in a real project. 

From our experience we can safely claim that Node.js is the right choice for high load, data-intensive applications, and paired with a javascript framework on the frontend - (like Angular or React) it is suitable for supporting isomorphic Single-Page Applications as well. 

What exactly is high-load, and how to understand if your product is going to be data-intensive?  We share the opinion that there is no universal tool for all cases. You wouldn't drive a nail with a screwdriver, and you shouldn't build a simple static blog with Node.js - of course you could as a proof-of-concept, but from a practical standpoint it would be "an overkill". But if your product is a search network engine (like the one we've worked on and briefly described here [link-to-post]) or if your app will be used by thousands of people simultaneously - Node.js is your best bet. That is why the first stage of our workflow is determining (and documenting) a list of all features - it gives us an overview of what a product is going to be in the end and what technical requirements should be taken care of in case we need to scale up.

Since our project is a social network, we knew that it was very likely to be a high-traffic application. It was also designed to be real-time: when a traveller or customer submits  information about a new trip or order, we needed to make these updates instantly available for all of our users. 

Finally, private messaging is a must. All this sounds like a typical use case for Node.js. A reasonable choice that we combined with Babel.js transpiler so that our developers could take advantage of using the newest version of Javascript (ES6).  

As we strive to keep up-to-date with evolving technologies and modern industry solutions, it was settled that we would use a microservices architecture. The idea of it is that the application consists of loosely coupled functional units, which are easily reusable and interchangeable. Simply put, it means that the codebase is logically divided into small components (or modules) - every module is a small app in itself. This makes the architecture flexible: if at some point our social network evolves into a more complex platform or transforms in a different product, we won't need to throw the whole codebase away and start from scratch. 

Predictably, as a search engine for the project we chose ElasticSearch - an open source solution with a rich API that we've taken advantage of in the previous projects. This time it helped us to provide a quick and easy search by multiple facets (country, date, product category, etc.). If we organized an in-house contest "favourite Makeomatic tools", ElasticSearch would certainly come second (after Node.js). We're planning to write a separate article describing the problems it helped us solve.

### Frontend - what the users will see

#### Intuitive UX

Obviously, every social network starts with a profile: an avatar, last time seen, personal user’s information, private messages - the usual stuff. Our profiles had to include so much more: planned trips, orders, reviews and all of the associated metadata. The first challenge we faced was to group the main interface components in such a manner that would ensure easy navigation. We tried to hide less important blocks in a submenu but quickly realized it wouldn't work. 

A social network's functionality is supposed to be intuitive. Users must not spend  hours to reveal all features of the app. Furthermore, help or FAQ sections must be a rarely used last resort option. Eventually, we encapsulated key information within tabs in the primary content area. On large screens user profiles display this information in one view, on mobile secondary features are hidden in navigation menu.

[2.jpg]
[3.jpg]



#### Social interactions

What's a social network without social interaction? Apart from private messaging, we integrated reviews and a rating system. This lets people leave a feedback on deals with other users, filtering out unreliable travellers or customers. The algorithm forming the ratings depends on different parameters, such as activity on the site, reviews, the amount of goods ordered and delivered.

[4.jpg]


Those who say “the devil’s in the details”, know a thing or two. After a short round of usability testing, we realized that our social profiles lacked one small but important feature — traveller’s panel. When embarking on a trip people want to spend it in good company, a natural desire that explains the proliferation of sites for searching travel mates. 

So our test users were expecting to see this feature as well. Without further delay we integrated the option into profiles, increasing social engagement and prompting people to return and use the platform more often. Apart from that, we added a "travelog" tab where people who have returned from a trip (and successfully delivered orders) could share their impressions. Among other things, these small improvements are beneficial for SMO (Social Media Optimization).

[5.jpg]

#### More technical aspects

It would be unfair not to mention one more secret weapon in our toolbox . The client part of the travelling network was written with the help of the Angular.js framework. By now everyone has heard of this "magic technology" from Google. Of course, there’s more logic than magic in it — every tool becomes a powerful weapon once you master it. 

At the beginning of the development cycle our team briefly considered different alternatives, and the final choice was Angular.js: this framework is maintained by huge community and backed by a monster corporation (so chances are high it won't be abandoned and deprecated), it works really well with Node.js and MongoDB (our main database). To top it off, we've used the framework extensively in previous projects — and there’s no better friend than experience.

There were also minor decisions like choosing a tool for automating our build tasks (currently - Gulp), preprocessing styles (this time it's Stylus) and a templating (Jade).

If you've read this far, you are probably a fan of modern web solutions. Or may be you are only considering which technologies to choose for your next mind-blowing start-up (if you need help - drop us a line, we'll gladly consult you). But I won't overwhelm you with technical aspects any longer. Because, whatever tools you opt-in  for, most importantly is whether your start-up, product or app solves real problems. If it does, it will find its users, no matter what. 

As the e-commerce market thrives, people will get more interested in acquiring unusual things. While the government constantly plans to reduce the tax-free threshold for online purchases from abroad, we hope that the smart social network we’ve had the chance to work on will meet the need to connect those who are ready to help others, getting extra money as a bonus to their trip, and those in need of unavailable, exclusive things. 

Merry Christmas and brilliant New 2016 Year 2016! The Makeomatic team wishes you to surf on the top of the digital wave and make all your ideas come to live.

[xmas picture]



