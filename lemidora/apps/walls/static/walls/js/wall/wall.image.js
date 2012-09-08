Lemidora = window.Lemidora || {};


Lemidora.WallImage = function(cfg) {
    if (cfg)
        this.init(cfg);
};

Lemidora.WallImage.prototype = {
    wall: null,
    container: [
        '<div class="wall-image">',
            '<div class="last-edit">',
                '<span class="label">UPD:</span> ',
                '<span class="datetime"></span> ',
                '<span class="person"></span>',
            '</div>',
            '<div class="image-container">',
                '<img class="image" src="" />',
            '</div>',
            '<div class="title"></div>',
        '</div>'
    ].join(''),
    imageEl: 'img.image',
    imageContainer: '.image-container',
    title: '> .title',
    lastEditDate: '.last-edit .datetime',
    lastEditPerson: '.last-edit .person',
    editor: {},

    /**
     * 
     * WallImage object attributes. E.g.:
     *
     * {
     *     id: 123,
     *     width: 400,
     *     height: 300,
     *     x: 253,
     *     y: 136,
     *     z: 0,
     *     rotate: 45,
     *     title: "Hello, world",
     *     url: 'http://your.cdn/image.png'б
     *     updated_date: "2012-08-19T17:38:41.212292+00:00",
     *     updated_by: "John Smith"
     * }
     */
    attrs: {},

    init: function(cfg) {
        $.extend(true, this, cfg);

        this.container = $(this.container).appendTo(this.wall.area)
            .css({
                left: this.attrs.x,
                top: this.attrs.y
            })
            .hide().fadeIn();

        this.imageEl = this.container.find(this.imageEl);
        this.imageContainer = this.container.find(this.imageContainer);
        this.title = this.container.find(this.title);
        this.lastEditDate = this.container.find(this.lastEditDate);
        this.lastEditPerson = this.container.find(this.lastEditPerson);

        this.initEditor();
        this.updateImage();
    },

    initEditor: function() {
        if (!this.editor)
            return false;

        if (!Lemidora.WallImageEditor)
            throw "Wall init error: can't detect module \"wall.image.editor.js\" to enable image editing";

        var editorConfig = $.extend(true, {}, this.editor, { image: this });
        this.editor = new Lemidora.WallImageEditor(editorConfig);
    },

    updateImage: function(attrs) {
        // update attrs
        $.extend(true, this.attrs, attrs);
        attrs = this.attrs; // get full updated attrs

        // update element
        this.imageEl.attr('src', attrs.url).width(attrs.width).height(attrs.height);
        this.title.text(attrs.title);
        this.container.data(attrs).animate({
            left: attrs.x,
            top: attrs.y
        });

        var lastEditDate = this.utils.formatDate(attrs.updated_date);        
        this.lastEditDate.text(lastEditDate);
        this.lastEditPerson.text(attrs.updated_by || '');
    },

    deleteImage: function() {
        this.container.fadeOut(function() {
            $(this).remove();
        });
    },

    utils: {
        /**
         * Format date to "DD.MM.YY hh:mm:ss"
         *
         * @param {Date/String} date Date object or datestring in ISO format
         */
        formatDate: function(date) {
            if (!(date instanceof Date))
                date = new Date(date);

            var day = ("0" + date.getDate()).slice(-2);
            var month = ("0" + (date.getMonth() + 1)).slice(-2);
            var year = ('' + date.getFullYear()).substr(2);
            var hours = ("0" + date.getHours()).slice(-2);
            var minutes = ("0" + date.getMinutes()).slice(-2);
            var seconds = ("0" + date.getSeconds()).slice(-2);

            var out = day + '.' + month + '.' + year + ' ' + hours + ':' + minutes + ':' + seconds;
            return out;
        }
    }
};
