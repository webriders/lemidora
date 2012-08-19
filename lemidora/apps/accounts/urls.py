from django.conf.urls import patterns, url
from django.contrib.auth.views import logout


urlpatterns = patterns(
    'accounts.views',
    url(r'dive/$', 'social_login_page', name='login'),
    url(r'dive/complete/$', 'social_login_complete', name='social_login_complete'),
    url(r'leave/$', logout, name='logout'),
)
