Lemidora = window.Lemidora || {};

Lemidora.wallPage = {
    wall: null,
    uploadUrl: '',
    updateImageUrl: '',
    deleteImageUrl: '',
    autoUpdateUrl: '',
    csrf: '',

    init: function() {
        this.wall = new Lemidora.Wall({
            container: '#main-wall',
            // greeter: false,

            editor: {
                updateImageUrl: this.updateImageUrl,
                deleteImageUrl: this.deleteImageUrl,
                csrf: this.csrf,

                uploader: {
                    uploadUrl: this.uploadUrl,
                    csrf: this.csrf
                }
            },

            poller: {
                // debug: true,
                pollUrl: this.autoUpdateUrl,
                pollDelay: 10 * 60 * 1000
            }
        });
    }
};

$(function() {
    Lemidora.wallPage.init();
});
