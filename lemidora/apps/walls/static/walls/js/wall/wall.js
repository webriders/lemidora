Lemidora = window.Lemidora || {};

/**
  * Lemidora Photo Wall
  *
  * Main constructor that initialize and manage the wall
  *
  * @author WebRiders
  *
  * Modules:
  *     wall.editor.js
  *     wall.image.js (required)
  *     ... (more sub-modules could be required by mentioned above)
  *
  * @cfg {Object} - constructor params. See the .init() docstring for details
  */
Lemidora.Wall = function(cfg) {
    if (cfg)
        this.init(cfg);
};

Lemidora.Wall.prototype = {
    container: null,
    area: '.area',
    hideGreeter: false,
    editor: {},

    /**
     * @cfg container {String/Element/jQuery} - wall container (top element, not the working area)
     * @cfg area {String/Element/jQuery} - wall working area (where the Images are placed);
     *      area selector/element will be searched inside the container
     * @cfg hideGreeter {Boolean} - set to true if you want greeting message never to be shown; default - false
     * @cfg editor {Object/false} - WallEditor config or false (if want to disable editing); default - config;
     *      wall.editor.js is required if the wall is editable
     * 
     * More config options are available in specific modules
     */
    init: function(cfg) {
        $.extend(true, this, cfg);

        this.container = $(this.container);
        this.area = this.container.find(this.area);

        this.initExistingImages();
        this.initGreeter();
        this.initEditor();
    },

    images: {},

    /**
     * Init images that are already on the wall (initially)
     */
    initExistingImages: function() {
        if (!Lemidora.WallImage)
            raise "Init error: can't detect required module \"wall.image.js\"";

        this.images = {};
        var self = this;

        this.area.find('.wall-image').each(function(i, imageEl) {
            self.initExistingImage(imageEl);
        });
    },

    initExistingImage: function(imageEl) {
        var wallImage = new Lemidora.WallImage({
            wall: this,
            container: imageEl
        });

        this.images[wallImage.attrs.id] = wallImage;
    },

    initGreeter: function() {
        var count = 0;

        $.each(this.images, function() { count++; });

        if (count || this.hideGreeter)
            this.container.removeClass('greeting');
        else
            this.container.addClass('greeting');
    },

    initEditor: function() {
        if (!this.editor)
            return false;

        if (!Lemidora.WallEditor)
            raise "Init error: can't detect module \"wall.editor.js\" to enable edit mode";

        var editorConfig = $.extend(true, {}, this.editor, { wall: this });
        this.editor = new Lemidora.WallEditor(editorConfig);

        this.editor.on('incoming-messages', $.proxy(this, 'showMessages'));
        this.editor.on('updated', $.proxy(this, 'initGreeter'));
    },

    /**
     * @messages {Object} - example:
     *
     * {
     *     "information": [],
     *     "success": [
     *         "File Ski-Photo-20120203-165808.jpg successfully uploaded!"
     *     ],
     *     "alert": [],
     *     "warning": [],
     *     "error": []
     * }
     *
     */
    showMessages: function(messages) {
        $.each(messages, function(type, msgs) {
            if (type in Lemidora.messages.supportedTypes) {
                $.each(msgs, function(i, text) {
                    Lemidora.messages.message(type, text);
                });
            }
        });
    }
};
