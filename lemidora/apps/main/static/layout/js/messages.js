Lemidora = window.Lemidora || {};


Lemidora.messages = {
    /**
     * @param type - 'alert', 'success', 'error', 'warning', 'information', 'confirmation'
     * @param text
     */
    message: function(type, text, cfg) {
        var msg = $.extend({
            type: type,
            text: text,
            layout: 'topCenter',
            dismissQueue: true,
            timeout: 5000
        }, cfg);

        msg = noty(msg);

        return msg;
    },

    supportedTypes: {
        'alert': 1,
        'success': 1,
        'error': 1,
        'warning': 1,
        'information': 1,
        'confirmation': 1
    },

    alert: function(text) {
        return this.message('alert', text, cfg);
    },

    success: function(text, cfg) {
        return this.message('success', text, cfg);
    },

    error: function(text, cfg) {
        return this.message('error', text, cfg);
    },

    warning: function(text, cfg) {
        return this.message('warning', text, cfg);
    },

    information: function(text, cfg) {
        return this.message('information', text, cfg);
    },

    confirmation: function(text, cfg) {
        return this.message('confirmation', text, cfg);
    }
};
