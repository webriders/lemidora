from django.conf.urls import patterns, url


urlpatterns = patterns(
    'accounts.views',
    url(r'dive/$', 'social_login_page', name='login'),
)
