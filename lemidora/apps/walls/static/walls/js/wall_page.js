Lemidora = window.Lemidora || {};

Lemidora.wallPage = {
    wall: null,
    uploadUrl: '',
    updateImageUrl: '',
    deleteImageUrl: '',
    csrf: '',

    init: function() {
        this.wall = new Lemidora.Wall({
            container: '#main-wall',
            updateImageUrl: this.updateImageUrl,
            deleteImageUrl: this.deleteImageUrl,
            csrf: this.csrf,

            uploaderConfig: {
                uploadUrl: this.uploadUrl,
                csrf: this.csrf
            }
        });
    }
};

$(function() {
    Lemidora.wallPage.init();
});
