from common import *
import dj_database_url


DATABASES = {
    'default': dj_database_url.config(env='LEMIDORA_DATABASE_URL', default='postgres://localhost')
}

STATIC_URL = '/static/'
MEDIA_URL = '/media/'

DEV_STATIC_SERVE = True
ASSETS_DEBUG = True
