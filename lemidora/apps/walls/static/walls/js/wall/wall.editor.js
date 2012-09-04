Lemidora = window.Lemidora || {};

/**
  * Lemidora Photo Wall Editor
  *
  * Inner/system tool used inside the Lemidora.Wall instances. Don't use it directly!
  *
  * @author WebRiders
  *
  * Modules:
  *     wall.editor.uploader.js
  *
  * @cfg {Object} - constructor params. See the .init(...) JSDoc for details
  */
Lemidora.WallEditor = function(cfg) {
    if (cfg)
        this.init(cfg);
};

Lemidora.WallEditor.prototype = {
    wall: null, // to be set from the outside
    imageItemTemplate: '#image-item',
    uploader: {},
    csrf: '',
    updateImageUrl: '',
    deleteImageUrl: '',
    autoUpdateUrl: '',
    pollDelay: 5000,

    // private attrs
    _poll: null,
    _eventDispatcher: null,

    /**
     * @cfg wall {Lemidora.Wall} - wall instance
     * @cfg imageItemTemplate {String/Element/jQuery} - Lemidora.WallImage template to create DOM element from it
     *      imageItemTemplate selector/element will be searched inside this.wall.container 
     * @cfg uploader {Object/false} - Lemidora.WallImageUploader config or false (if want to disable uploading); default - config;
     *      wall.editor.uploader.js is required if uploading is enabled
     * @cfg csrf {String} - CSRF token for AJAX POST requests (required by Django)
     * @cfg updateImageUrl {String} - URL to update single image
     * @cfg deleteImageUrl {String} - URL to delete single image
     * @cfg autoUpdateUrl {String} - polling URL (to periodically update the wall)
     * @cfg pollDelay {Number} - polling delay in milliseconds
     */
    init: function(cfg) {
        $.extend(true, this, cfg);

        this.imageItemTemplate = this.wall.container.find(this.imageItemTemplate).html();
        this._eventDispatcher = $({});

        this.initUploader();
        this.initImagesEvents(this.wall.images);
        this.startAutoUpdate();
    },

    initUploader: function() {
        if (!this.uploader)
            return false;
            
        if (!Lemidora.WallImageUploader)
            throw "Init error: can't detect module \"wall.editor.uploader.js\" to enable images upload";

        var uploaderConfig = $.extend(true, {}, this.uploader, { editor: this });
        this.uploader = new Lemidora.WallImageUploader(uploaderConfig);

        var self = this;

        this.uploader.on('uploaded', function(e, wallInfo) {
            self.updateWall(wallInfo);
        });
    },

    /**
     * Handle Lemidora.WallImage array
     * See the .initImageEvents(...) JSDoc for details
     *
     * @wallImages {Array of Lemidora.WallImage}
     */
    initImagesEvents: function(wallImages) {
        var self = this;

        $.each(wallImages, function(i, wallImage) {
            self.initImageEvents(wallImage);
        });
    },

    /**
     * Handle Lemidora.WallImage events and update the wall state
     *
     * @wallImage {Lemidora.WallImage}
     */
    initImageEvents: function(wallImage) {
        wallImage.on('image-move-start', $.proxy(this, 'stopAutoUpdate'));
        wallImage.on('image-move', $.proxy(this, 'moveImageRequest'));
        wallImage.on('image-resize-start', $.proxy(this, 'stopAutoUpdate'));
        wallImage.on('image-resize', $.proxy(this, 'resizeImageRequest'));
        wallImage.on('image-delete', $.proxy(this, 'deleteImageRequest'));
    },

    /**
     * @e {jQuery.Event}
     * @id {String/Number} - Lemidora.WallImage ID
     * @x - new X-position
     * @x - new Y-position 
     */
    moveImageRequest: function(e, id, x, y) {
        this.updateImageRequest(id, { x: x, y: y });
    },

    /**
     * @e {jQuery.Event}
     * @id {String/Number} - Lemidora.WallImage ID
     * @width - new image width
     * @height - new image height 
     */
    resizeImageRequest: function(e, id, width, height) {
        this.updateImageRequest(id, { width: width, height: height });
    },

    /**
     * @e {jQuery.Event}
     * @id {String/Number} - Lemidora.WallImage ID
     */
    deleteImageRequest: function(e, id) {
        this.updateImageRequest(id, null, 'delete, please');
    },

    /**
     * @e {jQuery.Event}
     * @attrs {Object} - Lemidora.WallImage attributes to update; null-able
     * @del {Boolean} - flag that indicates image deletion; default - false (i.e. image update by default) 
     */
    updateImageRequest: function(id, attrs, del) {
        var self = this;

        this.stopAutoUpdate();

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
            .success(function(res) {
                self.updateWall(res);
            })
            .fail(function() {
                self.showMessages({
                    error: ['Your last action was not saved to server. Please, repeat it']
                });
            })
            .complete(function() {
                self.startAutoUpdate();
            });
    },

    startAutoUpdate: function() {
        console.log('next auto-update wil start in 7 sec.');

        var self = this;

        this._poll = setTimeout(function() {
            self.autoUpdate();
        }, this.pollDelay);
    },

    stopAutoUpdate: function() {
        console.log('auto-update stopped');

        clearTimeout(this._poll);
    },

    autoUpdate: function() {
        console.log('auto-update started');

        var self = this;

        $.get(this.autoUpdateUrl)
            .success(function(res) {
                self.updateWall(res);
            })
            .fail(function() {
                self.showMessages({
                    error: ["I can't update the wall :("]
                });
            }).complete(function() {
                self.startAutoUpdate();
            });
    },

    /**
     * 'wallInfo' example:
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
        var wall = this.wall,
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

            if (!(id in incomingIds)) {
                image.deleteImage();
                delete images[id];
            }
        });

        if (wallInfo.messages)
            this.trigger('incoming-messages', [wallInfo.messages]);

        this.trigger('updated');
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
