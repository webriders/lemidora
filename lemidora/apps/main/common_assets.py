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

jquery_js = JsBundle(
    'jquery/jquery-1.8.1.js',
)

jquery_ui_css = CssBundle(
    'jquery/ui/css/custom-theme/jquery-ui-1.8.23.custom.css',
)

jquery_ui_js = CssBundle(
    'jquery/ui/js/jquery-ui-1.8.23.custom.min.js',
)
