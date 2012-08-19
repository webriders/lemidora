from common import *
import dj_database_url
import os


DATABASES = {
    'default': dj_database_url.config(env='LEMIDORA_DATABASE_URL', default='postgres://localhost')
}

MEDIA_ROOT = os.path.join(PROJECT_ROOT, 'media')
STATIC_URL = '/static/'
MEDIA_URL = '/media/'

DEV_STATIC_SERVE = True
ASSETS_DEBUG = True
