from django.conf.urls import patterns, url


urlpatterns = patterns('walls.views',
    url(r'^$', 'home_page'),
    url(r'^upload/$', 'upload_image'),
    url(r'^upload_page/$', 'upload_page'),
)
