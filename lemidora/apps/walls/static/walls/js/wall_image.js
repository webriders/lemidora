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
    editTitleButton: '.set-title',
    rotationButton: '.handle-rotate',

    /**
     * Example:
     * {
     *     id: 123,
     *     width: 400,
     *     height: 300,
     *     x: 253,
     *     y: 136,
     *     z: 0,
     *     rotate: 45,
     *     title: "Hello, world",
     *     url: 'http://your.cdn/image.png'
     * }
     */
    attrs: {},

    init: function(cfg) {
        $.extend(true, this, cfg);

        this.container = $(this.container);
        this.image = this.container.find(this.image);
        this.imageContainer = this.container.find(this.imageContainer);
        this.title = this.container.find(this.title);
        this.editTitleButton = this.container.find(this.editTitleButton);
        this.rotationButton = this.container.find(this.rotationButton);

        this.initElement();
        this.initTitleEdit();
        this.initRotation();
        this.initDraggable();
        this.initResizable();
    },

    initElement: function() {
        var cnt = this.container;

        this.attrs = {
            id: cnt.data('id'),
            width: cnt.data('width'),
            height: cnt.data('height'),
            x: cnt.data('x'),
            y: cnt.data('y'),
            z: cnt.data('z'),
            rotate: cnt.data('rotate'),
            url: cnt.data('url'),
            title: cnt.find('.title').text()
        };

        Lemidora.WallImage.updateImageElement(this.container, this.attrs);
    },

    initTitleEdit: function() {
        if (this.attrs.title) {
            this.title.show();
        } else {
            this.title.hide();
        }

        // TODO: enable title editing
        this.editTitleButton.hide();
    },

    initRotation: function() {
        // TODO: enable rotation
        this.rotationButton.hide();
    },

    initDraggable: function() {
        var self = this;

        this.container.draggable({
            stop: function(e, ui) {
                var pos = ui.helper.position();

                var newX = pos.left,
                    newY = pos.top;

                self.trigger('image-move', [self.attrs.id, newX, newY]);
            }
        });
    },

    initResizable: function() {
        var self = this,
            cnt = this.container,
            image = this.image;

        this.imageContainer
            .resizable({
                aspectRatio: this.attrs.width / this.attrs.height,
                maxHeight: 1200,
                maxWidth: 1200,
                minHeight: 200,
                minWidth: 200,
                helper: 'wall-image-resizable-helper',
                handles: "all",
                stop: function(e, ui) {
                    var el = ui.element;

                    cnt.css('left', parseInt(cnt.css('left')) + parseInt(el.css('left')));
                    cnt.css('top', parseInt(cnt.css('top')) + parseInt(el.css('top')));
                    el.css({ left: 0, top: 0 });

                    var newWidth = el.width(),
                        newHeight = el.height();

                    image.css({
                        width: newWidth,
                        height: newHeight
                    });

                    self.trigger('image-resize', [self.attrs.id, newWidth, newHeight]);
                }
            });

        this.imageContainer.find('.ui-resizable-handle').css('z-index', 1);
    },

    updateImage: function(attrs) {
        // Update attrs
        $.extend(true, this.attrs, attrs);
        attrs = this.attrs;

        // Update element
        Lemidora.WallImage.updateImageElement(this.container, attrs);
    },

    deleteImage: function() {
        this.container.fadeOut(function() {
            $(this).remove();
        });
    },

    on: function(event, fn) {
        return this.container.on(event, fn);
    },

    off: function(event, fn) {
        return this.container.off(event, fn);
    },

    trigger: function(event, args) {
        return this.container.trigger(event, args);
    }
};


/**
 * Utils
 */
Lemidora.WallImage.createImage = function(wall, attrs) {
    if (!attrs.id)
        throw 'You must specify attrs.id';

    if (attrs.id in wall.images)
        throw 'Image with id="' + attrs.id + '" already exists';

    var imageEl = $(wall.imageItemTmpl).appendTo(wall.area);
    Lemidora.WallImage.updateImageElement(imageEl, attrs);

    wall.initImage(imageEl);
};


Lemidora.WallImage.updateImageElement = function(imageEl, attrs) {
    imageEl.data(attrs)
        .find(Lemidora.WallImage.prototype.title).text(attrs.title).end()
        .find(Lemidora.WallImage.prototype.image).attr('src', attrs.url).attr('width', attrs.width).attr('height', attrs.height).end()
        .animate({
            left: attrs.x,
            top: attrs.y
        });
};
