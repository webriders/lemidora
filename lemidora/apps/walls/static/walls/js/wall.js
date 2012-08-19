Lemidora = window.Lemidora || {};


Lemidora.Wall = function(cfg) {
    if (cfg)
        this.init(cfg);
};

Lemidora.Wall.prototype = {
    container: null,
    area: '.area',
    imageItemTmpl: '#image-item',

    init: function(cfg) {
        this.initUploaderConfig(); // this init must go before $.extend(true, this, cfg);
        $.extend(true, this, cfg);

        this.container = $(this.container);
        this.area = this.container.find(this.area);
        this.imageItemTmpl = this.container.find(this.imageItemTmpl).html();

        this.initUploader();
        this.initExistingImages();
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
    initExistingImages: function() {
        var wall = this,
            images = this.images = {};

        this.container.find('.wall-image').each(function(i, image) {
            var wallImage = new Lemidora.WallImage({
                wall:  wall,
                container: image
            });
            images[wallImage.attrs.id] = wallImage;
        });
    },

    /**
     * Look into wall_image.js for 'attrs' specification
     */
    addImage: function(attrs) {
        if (!attrs.id)
            throw 'You must specify attrs.id';

        if (attrs.id in this.images)
            throw 'Image with id="' + attrs.id + '" already exists';

        var imageEl = $(this.imageItemTmpl).appendTo(this.area)
            .data(attrs)
            .find(Lemidora.WallImage.prototype.title).text(attrs.title).end()
            .find(Lemidora.WallImage.prototype.image).attr('src', attrs.url).attr('width', attrs.width).attr('height', attrs.height).end();

        var wallImage = new Lemidora.WallImage({
            wall:  this,
            container: imageEl
        });

        this.images[attrs.id] = wallImage;

        return wallImage;
    }
};
