Lemidora = window.Lemidora || {};

/**
  * Lemidora Photo Wall Editor - all about wall editing
  *
  * Note: this is inner/system tool used inside the Lemidora.Wall instance. Don't use it directly!
  *
  * Required sub-modules:
  *   - wall.image.editor.js
  *   - wall.editor.uploader.js - it may be optional if you don't enable uploading
  *
  * @author WebRiders (http://webriders.com.ua/)
  * @param {Object} cfg Constructor params 
  * @see Lemidora.WallEditor.init for cfg details
  * @constructor
  */
Lemidora.WallEditor = function(cfg) {
    if (cfg)
        this.init(cfg);
};

Lemidora.WallEditor.prototype = {
    wall: null, // to be set from the outside
    uploader: {},
    csrf: '',
    updateImageUrl: '',
    deleteImageUrl: '',
    imageEditor: {},

    // private attrs
    _eventDispatcher: null,

    /**
     * Init the editor
     *
     * @param {Lemidora.Wall} cfg.wall 
     *     Wall instance
     * @param {Object/false} cfg.uploader
     *     Lemidora.WallImageUploader config or false (if want to disable uploading); 
     *     default - {Object} (i.e. editing is enabled);
     *     wall.editor.uploader.js is required if uploading is enabled
     * @see Lemidora.WallImageUploader.init for cfg.uploader details
     * @param {String} cfg.csrf 
     *     CSRF token for AJAX POST requests (required by Django)
     * @param {String} cfg.updateImageUrl 
     *     URL to update single image
     * @param {String} cfg.deleteImageUrl 
     *     URL to delete single image
     * @param {Object/false} cfg.imageEditor
     *     Image editor config or false (if you don't want to enable image editing); 
     *     default - {Object} (i.e. image editing is enabled);
     *     this config is not used directly inside the Lemidora.WallEditor; 
     *     it's used in the Lemidora.Wall
     * @see Lemidora.Wall.createImage for cfg.imageEditor usage  
     */
    init: function(cfg) {
        $.extend(true, this, cfg);

        this.imageItemTemplate = this.wall.container.find(this.imageItemTemplate).html();
        this._eventDispatcher = $({});

        this.initUploader();
    },

    /**
     * Init the image uploading mechanism
     */
    initUploader: function() {
        if (!this.uploader)
            return false;
            
        if (!Lemidora.WallImageUploader)
            throw "Wall init error: can't detect module \"wall.editor.uploader.js\" to enable images upload";

        var uploaderConfig = $.extend(true, {}, this.uploader, { editor: this });
        this.uploader = new Lemidora.WallImageUploader(uploaderConfig);

        var self = this;

        this.uploader.on('upload-success', function(e, wallInfo) {
            self.trigger('upload-success', [wallInfo]);
        });
    },

    /**
     * Handle Lemidora.WallImage editing events
     *
     * @param {Lemidora.WallImage} wallImage
     */
    initImageEditing: function(wallImage) {
        if (!wallImage.editor)
            return false;

        var self = this;

        function _indicateImageEditing() {
            self.trigger('image-editing');
        }

        wallImage.editor.on('image-move-start', _indicateImageEditing);
        
        wallImage.editor.on('image-move', function(e, id, x, y) {
            self.updateImageRequest(id, { x: x, y: y });
        });
        
        wallImage.editor.on('image-resize-start', _indicateImageEditing);
        
        wallImage.editor.on('image-resize', function(e, id, width, height) {
            self.updateImageRequest(id, { width: width, height: height });
        });
        
        wallImage.editor.on('image-delete', function(e, id) {
            self.updateImageRequest(id, null, 'delete this image, please');
        });
    },

    /**
     * Send AJAX request to update the image
     *
     * @param {String/Number} id Image ID
     * @param {Object} attrs Lemidora.WallImage attributes to update; null-able (in case of deletion)
     * @param {Boolean} [del] Flag that indicates image deletion; 
     *     default - false (i.e. image update mode by default) 
     */
    updateImageRequest: function(id, attrs, del) {
        var self = this;

        self.trigger('request-start');

        var data = $.extend(
            true,
            {
                image_id: id,
                csrfmiddlewaretoken: this.csrf
            },
            attrs
        );

        url = del ? this.deleteImageUrl : this.updateImageUrl;

        $.post(url, data)
            .success(function(wallInfo) {
                self.trigger('request-success', [wallInfo]);
            })
            .fail(function(res) {
                Lemidora.messages.error('Your last action was not saved to server. Please, repeat it');
                self.trigger('request-fail', [res]);
            })
            .complete(function() {
                self.trigger('request-complete');
            });
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
