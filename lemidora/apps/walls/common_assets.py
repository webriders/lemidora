from main.abstract_assets import CssBundle, JsBundle


# 'walls' is an inner application that has no own pages at the web-site. So its bundles should be included somewhere
wall_css = CssBundle(
    'walls/css/wall/wall.css',
    'walls/css/wall/wall.editor.css',
    'walls/css/wall/wall.editor.uploader.css',
    'walls/css/wall/wall.image.css',
    'walls/css/wall/wall.image.editor.css',
)


wall_js = JsBundle(
    'walls/js/wall/wall.js',
    'walls/js/wall/wall.editor.js',
    'walls/js/wall/wall.editor.uploader.js',
    'walls/js/wall/wall.image.js',
    'walls/js/wall/wall.image.editor.js',
    'walls/js/wall/wall.poller.js',
)
