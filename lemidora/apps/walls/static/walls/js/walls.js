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
    // Internal object. Please don't override it in constructor
    _uploaderDefaultConfig: {
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
