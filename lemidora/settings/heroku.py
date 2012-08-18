from common import *
import dj_database_url


DATABASES = {
    'default': dj_database_url.config(env='LEMIDORA_DATABASE_URL', default='postgres://localhost')
}
