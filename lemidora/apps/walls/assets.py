from django_assets import register
from main.abstract_assets import CssBundle, JsBundle
from main.common_assets import layout_css, messages_js, jquery_ui_css, jquery_js, jquery_ui_js
from walls.common_assets import walls_css, walls_js


wall_page_css = CssBundle(
    jquery_ui_css,
    layout_css,
    walls_css,
    'walls/css/wall_page.css',
    output="walls/css/wall_page_bundle.css",
)

register('wall_page_css', wall_page_css)


wall_page_js = JsBundle(
    jquery_js,
    jquery_ui_js,
    messages_js,
    walls_js,
    'walls/js/wall_page.js',
    output="walls/js/wall_page_bundle.js",
)

register('wall_page_js', wall_page_js)
