========
Lemidora
========

Description
-----------

[Lemidora](http://lemidora.com) is a new way to share your photos. You have freedom now!
No more table layouts with thumbnails and additional clicks, just compose your photo wall as you like in the most intuitive way.

What you can do with Lemidora:
* create photo Wall
* upload images by drag-and-dropping on the Wall
* resize and move your pictures
* share Wall with your friends
* **The Top Feature:** when multiple users edit Wall, you see their updates in real-time

And please note, when you resize photo, we always create it from originally uploaded image, without quality loss!

Planned features
----------------

* Home page to view public walls
* Private walls
* Collaboratos management for private walls
* Collaboratos permission management
* Image rotation
* Wall backgrouds


Technical Features
------------------

* Powered by Django!
* Amazon S3 storage for static and media files
* [Heoroku](http://www.heroku.com/) hosting
* Three tier server side architecture: Service layer (Django models and basic API), Facade layer , View layer (tiny and elegant))
* Killer MessagesContextManager for ajax error/messages handing
* Unit test coverage for Service/Facade layer
* Collaborative, multi-user realtiome photo Wall editing
* Object-oriented Javascript components
* HTML5 multiple files ajax uploading


Installation
------------

### Add database url environment variables

* LEMIDORA_DATABASE_URL='postgres://user:pass@host:port/dbname'

### Add S3 access keys to environment variables (for static/media support)

* LEMIDORA_AWS_ACCESS_KEY_ID='your key'
* LEMIDORA_AWS_SECRET_ACCESS_KEY='your key'

### Add social networks credentials for social networks auth support

* Facebook
  * LEMIDORA_FACEBOOK_APP_ID='your app id'
  * LEMIDORA_FACEBOOK_API_SECRET='your app key'

* Github
  * LEMIDORA_GITHUB_APP_ID='your app id'
  * LEMIDORA_GITHUB_API_SECRET='your app key'

* Google
  * LEMIDORA_GOOGLE_OAUTH2_CLIENT_ID='your app id'
  * LEMIDORA_GOOGLE_OAUTH2_CLIENT_SECRET='your app key'
