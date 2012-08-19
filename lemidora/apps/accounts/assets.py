from django_assets import register
from main.abstract_assets import CssBundle, JsBundle
from main.common_assets import layout_css, messages_js


wall_page_css = CssBundle(
    layout_css,
    'accounts/css/social_login_page.css',
    output="accounts/css/social_login_page_bundle.css",
)

register('social_login_page_css', wall_page_css)


wall_page_js = JsBundle(
    messages_js,
    'accounts/js/social_login_page.js',
    output="accounts/js/social_login_page_bundle.js",
)

register('social_login_page_js', wall_page_js)
