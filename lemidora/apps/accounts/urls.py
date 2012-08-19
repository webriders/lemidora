from django.conf.urls import patterns, url


urlpatterns = patterns(
    'accounts.views',
    url(r'dive/$', 'social_login_page', name='login'),
    url(r'dive/complete/$', 'social_login_complete', name='social_login_complete'),
)
