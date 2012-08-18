========
Lemidora
========


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
