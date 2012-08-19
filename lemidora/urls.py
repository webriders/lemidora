from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.conf import settings


admin.autodiscover()


urlpatterns = patterns('',
    # Contrib
    url(r'^admin/', include(admin.site.urls)),

    # Custom
    url(r'^', include('main.urls')),
    url(r'^', include('walls.urls')),
    url(r'^', include('accounts.urls')),

    # 3rd party
    url(r'', include('social_auth.urls')),
)


if getattr(settings, 'DEV_STATIC_SERVE', False):
    from django.conf.urls.static import static
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
