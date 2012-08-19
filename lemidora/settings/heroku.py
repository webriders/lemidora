from common import *
import dj_database_url


DATABASES = {
    'default': dj_database_url.config(env='LEMIDORA_DATABASE_URL', default='postgres://localhost')
}

# S3 STORAGE CONFIG
DEFAULT_FILE_STORAGE = 'lemidora.s3utils.MediaRootS3BotoStorage'
STATICFILES_STORAGE = 'lemidora.s3utils.StaticRootS3BotoStorage'
AWS_ACCESS_KEY_ID = os.environ.get('LEMIDORA_AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('LEMIDORA_AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = 'lemidora'
#S3_URL = 'http://lemidora.s3.amazonaws.com/'
S3_URL = 'http://lemidora.s3-website-eu-west-1.amazonaws.com/'

AWS_S3_SECURE_URLS=False
AWS_QUERYSTRING_AUTH=False
AWS_REDUCED_REDUNDANCY=True

STATIC_URL = S3_URL + 'static/'
MEDIA_URL = S3_URL + 'media/'
