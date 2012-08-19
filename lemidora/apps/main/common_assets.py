from main.abstract_assets import CssBundle, JsBundle


layout_css = CssBundle(
    'layout/css/reset.css',
    'layout/css/base.css',
    'layout/css/header.css',
)


messages_js = JsBundle(
    # Noty - jQuery notifications
    'noty/jquery.noty.js',
    'noty/layouts/top.js',
    'noty/layouts/topCenter.js',
    'noty/themes/default.js',
    'layout/js/messages.js',
)
