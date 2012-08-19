from storages.backends.s3boto import S3BotoStorage
from django.utils.functional import SimpleLazyObject

class StaticRootS3BotoStorage(S3BotoStorage):
    def __init__(self, *args, **kwargs):
        super(StaticRootS3BotoStorage, self).__init__(*args, **kwargs)
        self.location = 'static'

class MediaRootS3BotoStorage(S3BotoStorage):
    def __init__(self, *args, **kwargs):
        super(MediaRootS3BotoStorage, self).__init__(*args, **kwargs)
        self.location = 'media'
