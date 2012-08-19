from django.conf import settings
from django_assets import Bundle


class AbstractBundle(Bundle):
    """
    Abstract bundle that supports default filters
    """
    DEFAULT_FILTERS = None

    def __init__(self, *contents, **options):
        filters = options.get('filters', self.DEFAULT_FILTERS)
        options['filters'] = filters
        super(AbstractBundle, self).__init__(*contents, **options)


class CssBundle(AbstractBundle):
    DEFAULT_FILTERS = settings.ASSETS_CSS_FILTERS


class JsBundle(AbstractBundle):
    DEFAULT_FILTERS = settings.ASSETS_JS_FILTERS
