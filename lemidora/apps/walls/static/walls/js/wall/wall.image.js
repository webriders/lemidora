Lemidora = window.Lemidora || {};

/**
  * Lemidora Photo Wall Image
  * Common wall image functionality (without editing, just a view mode)
  *
  * Note: this is inner/system tool used inside the Lemidora.Wall instance. Don't use it directly!
  *
  * Required sub-modules:
  *   - wall.image.editor.js
  *
  * @author WebRiders (http://webriders.com.ua/)
  * @param {Object} cfg Constructor params
  * @see Lemidora.WallImage.init for cfg details
  * @constructor
  */
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
    editor: {}, // will be re-inited

    /**
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
    attrs: {}, // will be re-inited

    /**
     * Init the image
     *
     * @param {Lemidora.Wall} cfg.wall 
     *     Wall instance
     * @param {String} cfg.container 
     *     Image container (top element) HTML template;
     *     default - {String}; see the code for it;
     *     it will be appended to this.wall.area
     * @param {String} cfg.imageEl
     *     IMG element selector; 
     *     it will be searched inside this.container;
     *     default - 'img.image'
     * @param {String} cfg.imageContainer
     *     IMG's parent element selector; 
     *     it will be searched inside this.container;
     *     default - '.image-container'
     * @param {String} cfg.title
     *     Image title element selector; 
     *     it will be searched inside this.container;
     *     default - '> .title'
     * @param {String} cfg.lastEditDate
     *     Image last-edit-date element selector; 
     *     it will be searched inside this.container;
     *     default - '.last-edit .datetime'
     * @param {String} cfg.lastEditPerson
     *     Image last-edit-person (registered user name) element selector; 
     *     it will be searched inside this.container;
     *     default - '.last-edit .person'
     * @param {Object/false} cfg.editor
     *     Lemidora.WallImageEditor config or false (if want to disable image editing); 
     *     default - {Object} (i.e. image editing is enabled);
     *     wall.image.editor.js is required if image editing is enabled
     * @see Lemidora.WallImageEditor.init for cfg.editor details
     */
    init: function(cfg) {
        this.editor = {};
        this.attrs = {};

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
