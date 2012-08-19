from django.conf.urls import patterns, include, url


urlpatterns = patterns('main.views',
    url(r'^$', 'home_page'),
)

# Adding debug-mappings
#if settings.DEBUG:
#    from django.conf.urls.static import static
#    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
#    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
