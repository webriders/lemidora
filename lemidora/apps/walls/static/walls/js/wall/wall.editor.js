Lemidora = window.Lemidora || {};

/**
  * Lemidora Photo Wall Editor - all about wall editing
  *
  * Note: this is inner/system tool used inside the Lemidora.Wall instance. Don't use it directly!
  *
  * Required sub-modules:
  *   - wall.editor.uploader.js
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
    uploader: {}, // will be re-inited
    csrf: '',
    updateImageUrl: '',
    deleteImageUrl: '',
    imageEditor: {}, // will be re-inited
    enabled: true,
    stateContainer: [
        '<div class="editor-state-switch">',
            '<a href="#edit" class="edit-mode" title="enter the edit mode">Edit wall</a>',
            '<a href="#view" class="view-mode" title="view the wall as visitors will see it">Preview</a>',
        '</div>'
    ].join(''),
    editModeButton: 'a.edit-mode',
    viewModeButton: 'a.view-mode',

    // private attrs
    _eventDispatcher: null,
    _lastRequestId: 0,

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
     * @see Lemidora.WallImageEditor for cfg.imageEditor details
     * @param {Boolean} enabled - initial editor state; default - true;
     *     use .enable() and .disable() instead of manual setting
     */
    init: function(cfg) {
        this.uploader = {};
        this.imageEditor = {};

        $.extend(true, this, cfg);

        this.stateContainer = $(this.stateContainer).appendTo(this.wall.container);
        this.editModeButton = this.stateContainer.find(this.editModeButton);
        this.viewModeButton = this.stateContainer.find(this.viewModeButton);
        this._eventDispatcher = $({});

        this.initUploader();
        this.initState();
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

    initState: function() {
        var self = this;

        this.editModeButton.click(function(e) {
            e.preventDefault();
            self.enable();
        });

        this.viewModeButton.click(function(e) {
            e.preventDefault();
            self.disable();
        });

        this[this.enabled ? 'enable' : 'disable']();
    },

    enable: function() {
        this.enabled = true;
        this.wall.container.removeClass('editing-disabled');
        this.trigger('editing-enabled');
    },

    disable: function() {
        this.enabled = false;
        this.wall.container.addClass('editing-disabled');
        this.trigger('editing-disabled');
    },

    /**
     * Handle image editing events (move, resize, etc.)
     *
     * @param {Lemidora.WallImage} wallImage
     */
    registerImage: function(wallImage) {
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
     *     default - false (i.e. image update mode by default, not a deletion) 
     */
    updateImageRequest: function(id, attrs, del) {
        var self = this;

        self.trigger('request-start');

        var data = $.extend(
            true,
            { image_id: id, csrfmiddlewaretoken: this.csrf },
            attrs
        );

        url = del ? this.deleteImageUrl : this.updateImageUrl;

        /* 
        we remember last request so only it's response (the latest one) will throw events;
        we do this because older request could give response later than the later request 
        */
        this._lastRequestId++;

        $.post(url, data)
            .success(
                $.proxy(function(requestId, wallInfo) {
                    if (requestId != this._lastRequestId)
                        return;
                    this.trigger('request-success', [wallInfo]);
                }, this, this._lastRequestId)
            )
            .fail(
                $.proxy(function(requestId, res) {
                    if (requestId != this._lastRequestId)
                        return;
                    Lemidora.messages.error('Your last action was not saved to server. Please, repeat it');
                    self.trigger('request-fail', [res]);
                }, this, this._lastRequestId)
            )
            .complete(
                $.proxy(function(requestId) {
                    if (requestId != this._lastRequestId)
                        return;
                    self.trigger('request-complete');
                }, this, this._lastRequestId)   
            );
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
