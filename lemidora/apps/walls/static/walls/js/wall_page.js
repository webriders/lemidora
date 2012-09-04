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
            editor: {
                updateImageUrl: this.updateImageUrl,
                deleteImageUrl: this.deleteImageUrl,
                autoUpdateUrl: this.autoUpdateUrl,
                csrf: this.csrf,
                uploader: {
                    uploadUrl: this.uploadUrl,
                    csrf: this.csrf
                }
            }
        });
    }
};

$(function() {
    Lemidora.wallPage.init();
});
