Lemidora = window.Lemidora || {};


Lemidora.messages = {
    /**
     * @param type - 'alert', 'success', 'error', 'warning', 'information', 'confirmation'
     * @param text
     */
    message: function(type, text) {
        var msg = noty({ type: type, text: text, dismissQueue: true, timeout: 5000 });
        return msg;
    },

    alert: function(text) {
        return this.message('alert', text);
    },

    success: function(text) {
        return this.message('success', text);
    },

    error: function(text) {
        return this.message('error', text);
    },

    warning: function(text) {
        return this.message('warning', text);
    },

    information: function(text) {
        return this.message('information', text);
    },

    confirmation: function(text) {
        return this.message('confirmation', text);
    }
};
