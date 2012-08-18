from main.abstract_assets import CssBundle, JsBundle, register
from walls.assets import walls_css, walls_js

layout_css = CssBundle(
    'layout/css/reset.css',
    'layout/css/base.css',
    'layout/css/header.css',
)


home_css = CssBundle(
    layout_css,
    'home/css/home_page.css',
    walls_css,
    output="home/css/home_page_bundle.css",
)

register('home_css', home_css)


home_js = JsBundle(
    walls_js,
    output="home/js/home_page_bundle.js",
)

register('home_js', home_js)