from common import *
import dj_database_url


DATABASES = {
    'default': dj_database_url.config(default='postgres://localhost')
}
