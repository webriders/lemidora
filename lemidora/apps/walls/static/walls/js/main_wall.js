Lemidora = window.Lemidora || {};

Lemidora.mainWall = {
    wall: null,

    init: function() {
        this.wall = new Lemidora.Wall({
            container: '#main-wall'
        });
    }
};

$(function() {
    Lemidora.mainWall.init();
});
