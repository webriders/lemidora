from django.conf.urls import patterns, include, url
from django.contrib import admin


admin.autodiscover()


urlpatterns = patterns('',
    # Contrib
    url(r'^admin/', include(admin.site.urls)),

    # Custom
    url(r'^', include('main.urls')),
    url(r'^', include('walls.urls')),
)
