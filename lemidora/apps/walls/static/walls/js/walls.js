Lemidora = window.Lemidora || {};


Lemidora.Wall = function(cfg) {
    if (cfg)
        this.init(cfg);
};

Lemidora.Wall.prototype = {
    container: null,

    init: function(cfg) {
        this.initUploaderConfig(); // this init must go before $.extend(true, this, cfg);
        $.extend(true, this, cfg);
        this.container = $(this.container);
        this.initUploader();
        this.initImages();
    },

    /**
     * Images upload manager
     */
    uploader: null,
    // Internal object. Please don't override it in constructor
    _uploaderDefaultConfig: {
    },

    initUploaderConfig: function() {
        this.uploaderConfig = $.extend(
            true,
            { wall: this },
            this._uploaderDefaultConfig
        );
    },

    initUploader: function() {
        this.uploader = new Lemidora.WallUploader(this.uploaderConfig);
    },

    images: {},

    /**
     * Init images that are already on the wall (initially)
     */
    initImages: function() {
        var wall = this,
            images = this.images = {};

        this.container.find('.wall-image').each(function(i, image) {
            var wallImage = new Lemidora.WallImage({
                wall:  wall,
                container: image
            });
            images[wallImage.attrs.id] = wallImage;
        });
    }
};

