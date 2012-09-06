Lemidora = window.Lemidora || {};

/**
  * Lemidora Photo Wall
  *
  * Main constructor that initialize and manage the wall
  *
  * Required sub-modules:
  *   - wall.editor.js - it may be optional if you don't enable editing
  *   - wall.poller.js - it may be optional if you don't enable polling
  *   - wall.image.js
  *     ... (more sub-modules could be required by mentioned above modules)
  *
  * @author WebRiders (http://webriders.com.ua/)
  * @param {Object} cfg Constructor params
  * @see Lemidora.Wall.init for cfg details
  * @constructor
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
    poller: {},

    // inner attrs
    images: {},

    /**
     * Init the wall
     *
     * @param {String/Element/jQuery} cfg.container 
     *     Wall container (top element, not the working area)
     * @param {String/Element/jQuery} cfg.area 
     *     Wall working area (where the Images are placed);
     *     area selector/element will be searched inside the container
     * @param {Boolean} cfg.hideGreeter 
     *     Set to true if you want greeting message never to be shown; default - false
     * @param {Object/false} cfg.editor 
     *     Wall editor config or false (if want to disable editing); 
     *     default - {Object} (i.e. editing is enabled);
     *     wall.editor.js is required if the wall is editable
     * @see Lemidora.WallEditor.init for cfg.editor details
     * @param {Object/false} cfg.poller 
     *     Poller config or false (if you want to disable polling); 
     *     default - {Object} (i.e. polling is enabled);
     *     wall.poller.js is required if the polling is enabled
     * @see Lemidora.WallPoller.init for cfg.poller details
     */
    init: function(cfg) {
        $.extend(true, this, cfg);

        this.container = $(this.container);
        this.area = this.container.find(this.area);

        this.initGreeter();
        this.initEditor();
        this.initPolling();
    },

    /**
     * Init greeting message
     * Sometimes it's visible and sometimes - hidden
     */
    initGreeter: function() {
        var count = 0;

        $.each(this.images, function() { count++; });

        if (count || this.hideGreeter)
            this.container.removeClass('greeting');
        else
            this.container.addClass('greeting');
    },

    /**
     * Init the wall editor
     */
    initEditor: function() {
        if (!this.editor)
            return false;

        if (!Lemidora.WallEditor)
            throw "Init error: can't detect module \"wall.editor.js\" to enable edit mode";

        var editorConfig = $.extend(true, {}, this.editor, { wall: this });
        this.editor = new Lemidora.WallEditor(editorConfig);

        // this.editor.on('incoming-messages', $.proxy(this, 'showMessages'));
    },

    initPolling: function() {
        if (!this.poller)
            return false;

        if (!Lemidora.WallPoller)
            throw "Init error: can't detect module \"wall.poller.js\" to enable polling mechanism";

        var pollerConfig = $.extend(true, {}, this.poller, { wall: this });
        this.poller = new Lemidora.WallPoller(pollerConfig);

        // this.poller.on('incoming-messages', $.proxy(this, 'showMessages'));
    },

    /**
     * Add Lemidora.WallImage object to the wall (just registers it)
     *
     * @param {Lemidora.WallImage} wallImage
     */
    addImage: function(wallImage) {
        this.images[wallImage.attrs.id] = wallImage;
    },

    /**
     * Delete Lemidora.WallImage object from the wall (unregister and destroy it)
     *
     * @param {String/Number} wallImageId
     */
    deleteImage: function(wallImageId) {
        var wallImage = this.images[wallImageId];
        if (wallImage)
            wallImage.deleteImage();
        delete this.images[wallImageId];
    },

    /**
     * Update the wall using specific config 'wallInfo'
     *
     * @param {Object} wallInfo - specific config representing new wall state. Example:
     *
     * {
     *     "wall": {
     *         "owner": null,
     *         "created_date": "2012-08-19T17:38:34.454021+00:00",
     *         "id": 8,
     *         "key": "OB1RDS",
     *         "title": null
     *     },
     *     "images": [
     *         {
     *             "updated_date": "2012-08-19T17:41:14.619743+00:00",
     *             "updated_by": null,
     *             "title": null,
     *             "url": "/media/cache/e0/a0/e0a0aaa60a8844e60906ad1eaa7af0b3.jpg",
     *             "created_by": null,
     *             "height": 200,
     *             "width": 300,
     *             "created_date": "2012-08-19T17:41:13.277312+00:00",
     *             "y": 198.0,
     *             "x": 742.0,
     *             "rotation": 0.0,
     *             "z": 2,
     *             "id": 29
     *         },
     *     ],
     *     "messages": {
     *         "_exception": [],
     *         "information": [],
     *         "success": [
     *             "File Ski-Photo-20120203-165808.jpg successfully uploaded!"
     *         ],
     *         "alert": [],
     *         "warning": [],
     *         "error": []
     *     }
     * }
     *
     */
    updateWall: function(wallInfo) {
        var wall = this,
            images = wall.images,
            incomingImages = wallInfo.images || [],
            incomingIds = {};

        $.each(incomingImages, function(i, attrs) {
            var id = attrs.id;

            if (id in images) {
                images[id].updateImage(attrs);
            } else {
                Lemidora.WallImage.createImage(wall, attrs);
            }

            incomingIds[id] = true;
        });

        $.each(images, function(i, image) {
            var id = image.attrs.id;

            if (!(id in incomingIds))
                wall.deleteImage(id);
        });

        if (wallInfo.messages)
            wall.showMessages(wallInfo.messages);

        wall.initGreeter();
    },

    /**
     * Show nice popup notifications
     *
     * Requires module "messages.js" (in which Lemidora.messages defined) 
     *
     * @param {Object} messages - example:
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
