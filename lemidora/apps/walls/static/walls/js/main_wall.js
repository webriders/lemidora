Lemidora = window.Lemidora || {};

Lemidora.mainWall = {
    wall: null,

    init: function() {
        this.wall = new Wall({
            container: '#main-wall'
        });
    }
};

$(function() {
    Lemidora.mainWall.init();
});
