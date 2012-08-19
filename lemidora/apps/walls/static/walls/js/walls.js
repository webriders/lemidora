Lemidora = window.Lemidora || {};


Lemidora.Wall = function(cfg) {
    if (cfg)
        this.init(cfg);
};

Lemidora.Wall.prototype = {
    container: null,

    /**
     * Images upload manager
     */
    uploader: null,
    // Restricted object. Please don't use it directly
    _uploaderDefaultConfig: {
        container: '.uploader'
    },

    init: function(cfg) {
        this.uploaderConfig = $.extend(
            true,
            { wall: this },
            this._uploaderDefaultConfig
        );

        $.extend(true, this, cfg);

        this.container = $(this.container);
        this.uploader = new Lemidora.WallUploader(this.uploaderConfig);
    }
};
