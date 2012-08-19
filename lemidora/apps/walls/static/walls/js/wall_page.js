Lemidora = window.Lemidora || {};

Lemidora.wallPage = {
    wall: null,
    uploadUrl: '',

    init: function() {
        this.wall = new Lemidora.Wall({
            container: '#main-wall',
            uploaderConfig: {
                uploadUrl: this.uploadUrl
            }
        });
    }
};

$(function() {
    Lemidora.wallPage.init();
});
