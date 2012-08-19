from django_assets import register
from main.abstract_assets import CssBundle, JsBundle
from main.common_assets import layout_css, messages_js


home_page_css = CssBundle(
    layout_css,
    'home/css/home_page.css',
    output="home/css/home_page_bundle.css",
)

register('home_page_css', home_page_css)


home_page_js = JsBundle(
    messages_js,
    output="home/js/home_page_bundle.js",
)

register('home_page_js', home_page_js)
