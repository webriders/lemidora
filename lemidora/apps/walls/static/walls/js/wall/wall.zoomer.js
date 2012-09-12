Lemidora = window.Lemidora || {};

Lemidora.WallZoomer = function(cfg) {
    if (cfg)
        this.init(cfg);
};

Lemidora.WallZoomer.prototype = {
    wall: null,
    container: [
        '<div class="wall-zoom">',
            '<div class="title">zoom</div>',
            '<ul class="legend">',
                '<li class="point-1">100%</li>',
                '<li class="point-2">80%</li>',
                '<li class="point-3">60%</li>',
                '<li class="point-4">40%</li>',
                '<li class="point-5">20%</li>',
            '</ul>',
            '<div class="zoom-slider"></div>',
        '</div>'
    ].join(''),
    slider: '.zoom-slider',
    enabled: true,

    init: function(cfg) {
        $.extend(true, this, cfg);

        this.container = $(this.container).appendTo(this.wall.container);
        this.slider = this.container.find(this.slider);

        this.initSlider();
        this.initState();
    },

    initSlider: function() {
        var self = this;

        this.slider.slider({
            orientation: 'vertical',
            value: 100,
            min: 10,
            step: 5,

            stop: function(e, ui) { 
                self._scaleWall(ui.value);
            }
        });
    },

    _scaleWall: function(zoom) {
        var area = this.wall.area,
            zoom = zoom / 100,
            translateCoef = (1 - 1 / zoom) / 2;

        var translate = [
            parseInt(translateCoef * area.width()) + 'px', 
            parseInt(translateCoef * area.height()) + 'px'
        ];

        area.css('-moz-transform', 'scale(' + zoom + ') translate(' + translate.join() + ')');
    },

    initState: function() {
        this[this.enabled ? 'enable' : 'disable']();
    },

    enable: function() {
        this.enabled = true;
        this.container.show();
    },

    disable: function() {
        this.enabled = false;
        this.container.hide();
    },

    setValue: function(zoom) {
        this.slider.slider('value', zoom);
        this._scaleWall(zoom);
    },

    reset: function() {
        this.setValue(100);
    }
};