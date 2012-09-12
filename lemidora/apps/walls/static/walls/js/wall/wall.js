Lemidora = window.Lemidora || {};

/**
  * Lemidora Photo Wall
  *
  * Main constructor that initialize and manage the wall
  *
  * Required sub-modules:
  *   - wall.editor.js
  *   - wall.poller.js
  *   - wall.image.js
  *   - wall.image.editor.js
  *   ... (more sub-modules could be required by mentioned above modules)
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
    area: '<div class="area"></div>',
    greeter: [
        '<div class="greeting-message">',
            '<div class="message-content">',
                '<h2 class="title">',
                    '<strong>Lemidora\'s idea</strong> is very simple:',
                '</h2>',
                '<ol>',
                    '<li class="mi">drop your photos <span>(right here)</span></li>',
                    '<li class="ra">invite your friends for collaboration</li>',
                    '<li class="do">create your photo-wall together!</li>',
                '</ol>',
            '</div>',
        '</div>'
    ].join(''),

    editor: {}, // will be re-inited
    poller: {}, // will be re-inited
    zoomer: {}, // will be re-inited

    // inner attrs
    images: {}, // images collection; will be re-inited

    /**
     * Init the wall
     *
     * @param {String/Element/jQuery} cfg.container 
     *     Wall container (top element, not the working area);
     *     the only DOM element that should already exist for the wall
     * @param {String} cfg.area 
     *     Wall working area (where images are placed) HTML template;
     *     default - {String}; see the code for it;
     *     it will be appended to this.container
     * @param {String/false} cfg.greeter 
     *     Greeting message HTML template or false (if you don't want greeting message to be shown); 
     *     default - {String}; see the code for it;
     *     it will be appended to this.container
     * @param {Object/false} cfg.editor 
     *     Wall editor config or false (if want to disable editing); 
     *     default - {Object} (i.e. editing is enabled);
     *     wall.editor.js is required if the wall is editable;
     *     wall.image.editor.js is also required in that case
     *     wall.image.editor.js is also required in that case
     * @see Lemidora.WallEditor.init for cfg.editor details
     * @param {Object/false} cfg.poller 
     *     Poller config or false (if you want to disable polling); 
     *     default - {Object} (i.e. polling is enabled);
     *     wall.poller.js is required if the polling is enabled
     * @see Lemidora.WallPoller.init for cfg.poller details
     */
    init: function(cfg) {
        this.editor = {};
        this.poller = {};
        this.zoomer = {};
        this.images = {};

        $.extend(true, this, cfg);

        this.container = $(this.container);
        this.area = $(this.area).appendTo(this.container);

        this.initGreeter();
        this.initEditor();
        this.initZooming();
        this.initPolling();
    },

    initGreeter: function() {
        if (!this.greeter)
            return false;

        this.greeter = $(this.greeter).appendTo(this.container);
        this.updateGreeter();
    },

    /**
     * Init greeting message
     * Sometimes it's visible and sometimes - hidden
     */
    updateGreeter: function() {
        if (!this.greeter)
            return false;

        var count = 0;
        $.each(this.images, function() { count++; });
        this.greeter[count ? 'hide' : 'show']();
    },

    /**
     * Init the wall editor
     */
    initEditor: function() {
        if (!this.editor)
            return false;

        if (!Lemidora.WallEditor)
            throw "Wall init error: can't detect module \"wall.editor.js\" to enable wall editing";

        var editorConfig = $.extend(true, {}, this.editor, { wall: this });
        this.editor = new Lemidora.WallEditor(editorConfig);

        var self = this;

        this.editor.on('request-success upload-success', function(e, wallInfo) {
            self.updateWall(wallInfo);
        });

        this.editor.on('editing-enabled', function() {
            $.each(self.images, function(i, wallImage) {
                wallImage.editor && wallImage.editor.enable();
            });

            // turn off zooming while editing
            if (self.zoomer) {
                self.zoomer.reset(); // for now there are problems with scaled draggable and resizable - so we reset zooming (to 100%)
                self.zoomer.disable(); // ... and disable it
            }
        });

        this.editor.on('editing-disabled', function() {
            $.each(self.images, function(i, wallImage) {
                wallImage.editor && wallImage.editor.disable();
            });

            // turn on zooming in preview mode
            self.zoomer && self.zoomer.enable();
        });
    },

    initZooming: function() {
        if (!this.zoomer)
            return false;

        if (!Lemidora.WallZoomer)
            throw "Wall init error: can't detect module \"wall.zoomer.js\" to enable wall zooming";

        var zoomerConfig = $.extend(true, {}, this.zoomer, { wall: this });
        this.zoomer = new Lemidora.WallZoomer(zoomerConfig);

        if (this.editor && this.editor.enabled)
            this.zoomer.disable();
    },

    /**
     * Init the wall polling mechanism
     */
    initPolling: function() {
        if (!this.poller)
            return false;

        if (!Lemidora.WallPoller)
            throw "Wall init error: can't detect module \"wall.poller.js\" to enable polling mechanism";

        var pollerConfig = $.extend(true, {}, this.poller, { wall: this });
        this.poller = new Lemidora.WallPoller(pollerConfig);

        var self = this;

        this.poller.on('request-success', function(e, wallInfo) {
            self.updateWall(wallInfo);
        });

        if (this.editor) {
            this.editor.on('image-editing request-start', function() {
                self.poller.stopPolling();
            });

            this.editor.on('request-complete', function() {
                self.poller.startPolling();
            });
        }
    },

    /**
     * Add Lemidora.WallImage object to the wall (create and register it)
     *
     * @param {Lemidora.WallImage} attrs Lemidora.WallImage attributes
     * @see Lemidora.WallImage.attrs 
     */
    createImage: function(attrs) {
        var wallImage = new Lemidora.WallImage({ 
            wall: this, 
            attrs: attrs,
            editor: this.editor ? this.editor.imageEditor : false 
        });
        
        this.images[attrs.id] = wallImage;
        
        if (this.editor) {
            this.editor.registerImage(wallImage);
            wallImage.editor && wallImage.editor[this.editor.enabled ? 'enable' : 'disable']();
        }
    },

    /**
     * Update Lemidora.WallImage object
     *
     * @param {String/Number} wallImageId
     * @param {Lemidora.WallImage} attrs Lemidora.WallImage attributes
     * @see Lemidora.WallImage.attrs 
     */
    updateImage: function(id, attrs) {
        this.images[id] && this.images[id].updateImage(attrs);
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
     * @param {Object} wallInfo Specific config representing new wall state. Example:
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

        // update or create images
        $.each(incomingImages, function(i, attrs) {
            var id = attrs.id;

            if (id in images)
                wall.updateImage(id, attrs);
            else
                wall.createImage(attrs);

            incomingIds[id] = true;
        });

        // delete 'old' images
        $.each(images, function(i, image) {
            var id = image.attrs.id;

            if (!(id in incomingIds))
                wall.deleteImage(id);
        });

        // show response messages
        if (wallInfo.messages)
            wall.showMessages(wallInfo.messages);

        // update greeting message appearence
        wall.updateGreeter();
    },

    /**
     * Show nice popup notifications
     *
     * This is just a wrapper for Lemidora.messages
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
