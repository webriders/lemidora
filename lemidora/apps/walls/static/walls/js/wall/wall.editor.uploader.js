Lemidora = window.Lemidora || {};

/**
  * Lemidora Photo Wall Image upload manager
  * It's responsible for files drag-and-drop to the work area and their upload to the server
  *
  * Note: this is inner/system tool used inside the Lemidora.Wall instance. Don't use it directly!
  *
  * @author WebRiders (http://webriders.com.ua/)
  * @param {Object} cfg Constructor params
  * @see Lemidora.WallImageUploader.init for cfg details
  * @constructor
  */
Lemidora.WallImageUploader = function(cfg) {
    if (cfg)
        this.init(cfg);
};

Lemidora.WallImageUploader.prototype = {
    editor: null,
    container: [
        '<div class="uploader">',
            '<div class="overlay"></div>',
            '<div class="content-wrap">',
                '<div class="content">',
                    '<div class="title">Drop your images <em>(anywhere)</em></div>',
                    '<ul class="file-list"></ul>',
                    '<div class="progress-bar"></div>',
                '</div>',
            '</div>',
        '</div>'
    ].join(''),
    title: '.title',
    fileList: '.file-list',
    fileItemTemplate: '<li><div class="name"></div><div class="size"></div></li>',
    progressBar: '.progress-bar',
    maxFilesAmount: 10,
    maxFileSize: 10 * 1024 * 1024,
    allowedMimeType: /^image\/.*$/,
    uploadUrl: '',
    csrf: '',

    /**
     * Init the uploader
     *
     * @param {Lemidora.WallEditor} cfg.editor
     *     Wall editor instance; you can access the wall instance from it
     * @param {String} cfg.container
     *     Uploader layout container HTML template;
     *     it will be appended to this.editor.wall.container;
     *     default - {String}; see the code for it
     * @param {String} cfg.title
     *     Title element selector - i.e. big header text "Drop files here";
     *     it will be searched inside this.container;
     *     default - '.title'
     * @param {String} cfg.fileList
     *     Upload files list element selector; 
     *     it will be searched inside this.container;
     *     default - '.file-list'
     * @param {String} cfg.fileItemTemplate
     *     Upload file list item HTML template; 
     *     default - {String}; see the code for it
     * @param {String} cfg.progressBar
     *     Upload progress bar element selector (total progress-bar for all files); 
     *     it will be searched inside this.container;
     *     default - '.progress-bar'
     * @param {String} cfg.maxFilesAmount
     *     Simultanious upload file amount; 
     *     default - 10
     * @param {String} cfg.maxFileSize
     *     Maximum single file size; 
     *     default - 10 MiB (10 * 1024 * 1024 bytes)
     * @param {String} cfg.allowedMimeType
     *     Allowed file's MIME-type regexp; 
     *     default - /^image\/.*$/ (i.e. image/jpeg, image/png, image/gif, etc.)
     * @param {String} cfg.uploadUrl
     *     URL to upload files
     * @param {String} cfg.csrf
     *     CSRF token for AJAX POST requests (required by Django)
     */
    init: function(cfg) {
        $.extend(true, this, cfg);

        this.container = $(this.container).appendTo(this.editor.wall.container);
        this.title = this.container.find(this.title);
        this.fileList = this.container.find(this.fileList);
        this.progressBar = this.container.find(this.progressBar);

        this.initDragAndDrop();
    },

    /**
     * Init ability to drag images from your file-navigator and drop them directly to the wall.
     *
     * For now this is the only way to upload your images.
     * And unfortunately it doesn't work in Internet Explorer < 10
     * All other modern browsers supports this functionality.
     */
    initDragAndDrop: function() {
        if (!window.FormData) {
            Lemidora.messages.warning("Unfortunately your browser doesn't support JS File API and you can't drag'n'drop files", { timeout: false });
            return false;
        }

        var wallContainer = this.editor.wall.container,
            cnt = this.container;

        function _preventDefault(e) {
            e.stopPropagation();
            e.preventDefault();
        }

        wallContainer.on("dragenter", function(e) {
            _preventDefault(e);
            cnt.addClass('active');
        });

        wallContainer.on("dragexit", function(e) {
            _preventDefault(e);
            cnt.removeClass('active');
        });

        wallContainer.on("dragover", _preventDefault);

        var self = this;

        wallContainer.on("drop", function(e) {
            _preventDefault(e);

            if (cnt.is('.uploading')) {
                Lemidora.messages.warning('Another upload is in progress');
                return false;
            }

            cnt.addClass('uploading');

            var oe = e.originalEvent;
            var files = oe.dataTransfer.files;
            files = self.validateFiles(files);

            if (!files.length) {
                Lemidora.messages.warning('Nothing to upload');
                cnt.removeClass('uploading active');
                return false;
            }

            var coords = {
                x: e.originalEvent.pageX,
                y: e.originalEvent.pageY
            };

            self.initFileList(files);
            self.initProgressBar();
            self.upload(files, coords);
        });
    },

    /**
     * Validate files before upload.
     *
     * They should fit max amount, max size and MIME-type
     *
     * @param {Array of File} files 
     *     Array of file objects (default browser's File instances)
     */
    validateFiles: function(files) {
        var maxAmount = this.maxFilesAmount;
        if (files.length > maxAmount) {
            Lemidora.messages.error("Can't upload more than " + maxAmount + " files at a time, sorry");
            return false;
        }

        var toUpload = [];
        var mime = this.allowedMimeType;
        var maxSize = this.maxFileSize;

        $.each(files, function(i, file) {
            if (!file.type.match(mime)) {
                Lemidora.messages.warning("\"" + file.name + "\" is not an image");
                return true;
            }

            if (file.size > maxSize) {
                Lemidora.messages.warning("Image \"" + file.name + "\" is larger than " + maxSize + " bytes");
                return true;
            }

            toUpload.push(file);
        });

        return toUpload;
    },

    /**
     * Show files to upload
     *
     * @param {Array of File} files 
     *     Array of file objects (default browser's File instances)
     */
    initFileList: function(files) {
        var fileList = this.fileList,
            fileItemTemplate = this.fileItemTemplate;

        fileList.empty();

        $.each(files, function(i, file) {
            var fileName = file.name;
            var nBytes = file.size;

            // next piece of code was taken from the MDN File API example
            var sOutput = nBytes + " bytes";
            // optional code for multiples approximation
            for (var aMultiples = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"], nMultiple = 0, nApprox = nBytes / 1024; nApprox > 1; nApprox /= 1024, nMultiple++) {
                sOutput = nApprox.toFixed(3) + " " + aMultiples[nMultiple] + " <span>(" + nBytes + " bytes)</span>";
            }

            $(fileItemTemplate).appendTo(fileList)
                .find('.name').text(fileName).end()
                .find('.size').html(sOutput);
        });
    },

    /**
     * Init the progress bar layout.
     *
     * We use jQuery UI progress-bar. 
     * We need to reset it each time we upload new files
     */
    initProgressBar: function() {
        this.progressBar.progressbar({ value: 0 })
            .find('.ui-progressbar-value').text('');
    },

    /**
     * Upload the files
     *
     * @param {Array of File} files
     *     Array of file objects (default browser's File instances)
     * @param {Object} coords
     *     Coordinates of dropped files; e.g.: { x: 200, y: 200 }
     */
    upload: function(files, coords) {
        var formdata = new FormData();

        $.each(files, function(i, file) {
            formdata.append('image_' + i, file);
        });

        formdata.append('csrfmiddlewaretoken', this.csrf);

        if (coords) {
            formdata.append('x', coords.x);
            formdata.append('y', coords.y - parseInt(this.editor.wall.area.css('margin-top')));
        }

        var self = this,
            cnt = this.container,
            pb = this.progressBar;

        $.ajax({
            url: this.uploadUrl,
            type: "POST",
            data: formdata,
            processData: false,
            contentType: false,

            success: function(wallInfo) {
                cnt.removeClass('uploading active');
                self.trigger('upload-success', [wallInfo]);
            },

            error: function(res) {
                cnt.removeClass('uploading active');
                Lemidora.messages.error('Error happend during your file(s) uploading');
                self.trigger('upload-fail', [res]);
            },

            xhr: function() {
                var xhr = new window.XMLHttpRequest();

                xhr.upload.addEventListener("progress", function(e) {
                    if (e.lengthComputable) {
                        var percentComplete = e.loaded / e.total * 100;
                        pb.progressbar({ value: percentComplete });

                        if (percentComplete == 100)
                            pb.find('.ui-progressbar-value').text('processing your images ...');
                    }
                }, false);

                xhr.upload.addEventListener("load", function(e){
                    pb.progressbar({ value: 100 });
                    pb.find('.ui-progressbar-value').text('processing your images ...');
                }, false);

                return xhr;
            }
        });
    },

    on: function(event, fn) {
        return this.container.on(event, fn);
    },

    off: function(event, fn) {
        return this.container.off(event, fn);
    },

    trigger: function(event, args) {
        return this.container.trigger(event, args);
    }
};
