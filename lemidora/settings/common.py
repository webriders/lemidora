# Django settings for lemidora project.

import os
import sys

PROJECT_ROOT = os.path.abspath('.')
sys.path.append(os.path.join(PROJECT_ROOT, 'lemidora', 'apps'))

DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
# ('Your Name', 'your_email@example.com'),
)

MANAGERS = ADMINS

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'America/Chicago'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True


# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"

MEDIA_ROOT = ''
STATIC_ROOT = ''

# Additional locations of static files
STATICFILES_DIRS = ()

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'u9-dvh*a1584cge8f)_9m%!7!k&amp;^^ma%p(6p%q^h#deehgu!^u'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
    #     'django.template.loaders.eggs.Loader',
    )

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'social_auth.context_processors.social_auth_backends',
    'social_auth.context_processors.social_auth_login_redirect',
    )

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'social_auth.middleware.SocialAuthExceptionMiddleware'
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
    )

ROOT_URLCONF = 'lemidora.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'lemidora.wsgi.application'

TEMPLATE_DIRS = (
# Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
# Always use forward slashes, even on Windows.
# Don't forget to use absolute paths, not relative paths.
)

INSTALLED_APPS = (
    # Contrib
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',

    # 3rd party
    'south',
    'sorl.thumbnail',
    'django_assets',
    'gunicorn',  # Web Server
    'social_auth',
    'storages',

    # Custom
    'main',
    'walls',
)

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}

ASSETS_CSS_FILTERS = 'cssrewrite, cssmin'
ASSETS_JS_FILTERS = 'jsmin'
ASSETS_DEBUG = False
ASSETS_ROOT = os.path.join(PROJECT_ROOT, 'webassets')

STATICFILES_DIRS += (ASSETS_ROOT,)

SOUTH_TESTS_MIGRATE = False

### Social settings block

## General
SOCIAL_AUTH_PROTECTED_USER_FIELDS = ['email', ]  # We want to persist e-mail, that we obtained from 1st user social account
SOCIAL_AUTH_SESSION_EXPIRATION = False

AUTHENTICATION_BACKENDS = (
    'social_auth.backends.facebook.FacebookBackend',
    'social_auth.backends.contrib.vkontakte.VKontakteOAuth2Backend',
    'social_auth.backends.google.GoogleOAuth2Backend'
    'django.contrib.auth.backends.ModelBackend',  # We need this backend since we using default django.auth user model
)

# Facebook
FACEBOOK_APP_ID = os.environ.get('LEMIDORA_FACEBOOK_APP_ID')
FACEBOOK_API_SECRET = os.environ.get('LEMIDORA_FACEBOOK_API_SECRET')

FACEBOOK_EXTENDED_PERMISSIONS = ['email']


# Github
GITHUB_APP_ID = os.environ.get('LEMIDORA_GITHUB_APP_ID')
GITHUB_API_SECRET = os.environ.get('LEMIDORA_GITHUB_API_SECRET')


# Google OAuth2
GOOGLE_OAUTH2_CLIENT_ID = os.environ.get('LEMIDORA_GOOGLE_OAUTH2_CLIENT_ID')
GOOGLE_OAUTH2_CLIENT_SECRET = os.environ.get('LEMIDORA_GOOGLE_OAUTH2_CLIENT_SECRET')
