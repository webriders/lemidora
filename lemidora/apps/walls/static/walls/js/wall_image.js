Lemidora = window.Lemidora || {};


Lemidora.WallImage = function(cfg) {
    if (cfg)
        this.init(cfg);
};

/**
 * WallUploader is part of WallManager.
 * It's responsible for files drag-and-drop to the work area and their upload.
 *
 */
Lemidora.WallImage.prototype = {
    wall: null,
    container: null,
    image: 'img.image',
    imageContainer: '.image-container',
    title: '.title',

    attrs: {},

    init: function(cfg) {
        $.extend(true, this, cfg);
        this.container = $(this.container);
        this.image = this.container.find(this.image);
        this.title = this.container.find(this.title);
        this.initAttrs();
        this.initTitle();
        this.initDraggable();
        this.initResizable();
    },

    initAttrs: function() {
        var cnt = this.container;

        this.attrs = {
            id: cnt.data('id'),
            width: cnt.data('width'),
            height: cnt.data('height'),
            x: cnt.data('x'),
            y: cnt.data('y'),
            z: cnt.data('z'),
            rotate: cnt.data('rotate'),
            title: cnt.find('.title').text()
        };
    },

    initTitle: function() {
        if (this.attrs.title) {
            this.title.show();
        } else {
            this.title.hide();
        }
    },

    initDraggable: function() {
        this.container.draggable();
    },

    initResizable: function() {
        var image = this.image,
            titleHeight = this.title.height();

        this.image
            .resizable({
                aspectRatio: this.attrs.width / this.attrs.height,
                maxHeight: 1200,
                maxWidth: 1200,
                minHeight: 200,
                minWidth: 200,
                helper: 'wall-image-resizable-helper',
//                stop: function(e, ui) {
//                    var size = ui.size;
//                    size.height -= titleHeight;
//                    image.css(size);
//                }
            });
    }
};
