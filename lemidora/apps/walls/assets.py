from main.abstract_assets import CssBundle, JsBundle


# 'walls' is an inner application that has no own pages at the web-site. So its bundles should be included somewhere
walls_css = CssBundle(
    'walls/css/walls.css',
    'walls/css/main_wall.css',
)


walls_js = JsBundle(
    'walls/js/uploader.js',
    'walls/js/walls.js',
    'walls/js/main_wall.js',
)
