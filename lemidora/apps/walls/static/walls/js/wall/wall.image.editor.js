Lemidora = window.Lemidora || {};

/**
  * Lemidora Photo Wall Image Editor - all about single wall image editing
  *
  * Note: this is inner/system tool used inside the Lemidora.Wall instance. Don't use it directly!
  *
  * @author WebRiders (http://webriders.com.ua/)
  * @param {Object} cfg Constructor params 
  * @see Lemidora.WallImageEditor.init for cfg details
  * @constructor
  */
Lemidora.WallImageEditor = function(cfg) {
    if (cfg)
        this.init(cfg);
};

Lemidora.WallImageEditor.prototype = {
    image: null,
    editTitleButton: '<a href="#set-title" class="set-title">set title</a>',
    rotationButton: '<a href="#rotate" title="rotate" class="handle-rotate">rotate</a>',
    deleteButton: '<a href="#delete" class="delete">delete</a>',
    enabled: true,

    // private attrs
    _eventDispatcher: null,

    /**
     * Init the wall image editor
     *
     * @param {Lemidora.WallImage} cfg.image 
     *     Wall image object instance
     * @param {String} cfg.editTitleButton 
     *     "Edit image title" button HTML template;
     *     default - {String}; see the code for it;
     *     it will be appended to this.image.container
     * @param {String} cfg.rotationButton 
     *     "Rotate image" button HTML template;
     *     default - {String}; see the code for it;
     *     it will be appended to this.image.container
     * @param {String} cfg.deleteButton 
     *     "Delete image" button HTML template;
     *     default - {String}; see the code for it;
     *     it will be appended to this.image.container
     * @param {Boolean} enabled - initial editor state; default - true;
     *     use .enable() and .disable() instead of manual setting
     */
    init: function(cfg) {
        $.extend(true, this, cfg);

        this.editTitleButton = $(this.editTitleButton).appendTo(this.image.container);
        this.rotationButton = $(this.rotationButton).appendTo(this.image.container);
        this.deleteButton = $(this.deleteButton).appendTo(this.image.container);

        this._eventDispatcher = $({});

        this.initTitleEdit();
        this.initRotation();
        this.initDeletion();
        this.initDraggable();
        this.initResizable();
        this.initState();
    },

    initTitleEdit: function() {
        if (this.image.attrs.title)
            this.image.title.show();
        else
            this.image.title.hide();

        // TODO: enable title editing
        this.editTitleButton.hide();
    },

    initRotation: function() {
        // TODO: enable rotation
        this.rotationButton.hide();
    },

    initDeletion: function() {
        var self = this;

        this.deleteButton.click(function(e) {
            e.preventDefault();
            self.image.deleteImage();
            self.trigger('image-delete', [self.image.attrs.id]);
        });
    },

    initDraggable: function() {
        var self = this,
            wallImage = this.image;

        wallImage.container.draggable({
            stop: function(e, ui) {
                var pos = ui.helper.position();

                var newX = pos.left,
                    newY = pos.top;

                self.trigger('image-move', [wallImage.attrs.id, newX, newY]);
            },

            start: function() {
                self.trigger('image-move-start', [wallImage.attrs.id]);
            }
        });
    },

    initResizable: function() {
        var self = this,
            wallImage = this.image,
            cnt = wallImage.container;

        wallImage.imageContainer
            .resizable({
                aspectRatio: wallImage.attrs.width / wallImage.attrs.height,
                maxHeight: 1200,
                maxWidth: 1200,
                minHeight: 200,
                minWidth: 200,
                helper: 'wall-image-resizable-helper',
                handles: "all",

                stop: function(e, ui) {
                    var el = ui.element;

                    cnt.css({
                        left: parseInt(cnt.css('left')) + parseInt(el.css('left')),
                        top: parseInt(cnt.css('top')) + parseInt(el.css('top'))
                    });

                    el.css({ left: 0, top: 0 });

                    var newWidth = el.width(),
                        newHeight = el.height();

                    wallImage.imageEl.css({
                        width: newWidth,
                        height: newHeight
                    });

                    self.trigger('image-resize', [wallImage.attrs.id, newWidth, newHeight]);
                },

                start: function() {
                    self.trigger('image-resize-start', [wallImage.attrs.id]);
                }
            })
            .find('.ui-resizable-handle').css('z-index', 1);
    },

    initState: function() {
        this[this.enabled ? 'enable' : 'disable']();
    },

    enable: function() {
        this.enabled = true;
        
        var wallImage = this.image,
            cnt = wallImage.container,
            icnt = wallImage.imageContainer;

        cnt.removeClass('editing-disabled');
        cnt.draggable('enable');
        icnt.resizable('enable');

        this.trigger('editing-enabled');
    },

    disable: function() {
        this.enabled = false;

        var wallImage = this.image,
            cnt = wallImage.container,
            icnt = wallImage.imageContainer;

        cnt.addClass('editing-disabled');
        cnt.draggable('disable');
        icnt.resizable('disable');
        
        this.trigger('editing-disabled');
    },

    on: function(event, fn) {
        return this._eventDispatcher.on(event, fn);
    },

    off: function(event, fn) {
        return this._eventDispatcher.off(event, fn);
    },

    trigger: function(event, args) {
        return this._eventDispatcher.trigger(event, args);
    }
};
