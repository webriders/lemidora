Lemidora = window.Lemidora || {};


Lemidora.WallUploader = function(cfg) {
    if (cfg)
        this.init(cfg);
};

/**
 * WallUploader is part of WallManager.
 * It's responsible for files drag-and-drop to the work area and their upload.
 *
 */
Lemidora.WallUploader.prototype = {
    wall: null,
    container: '.uploader',
    title: '.title',
    fileList: '.file-list',
    fileItemTmpl: '#file-item',
    progressBar: '.progress-bar',
    closeButton: '.close-button',
    maxFilesAmount: 10,
    maxFileSize: 10 * 1024 * 1024,
    allowedMimeType: /^image\/.*$/,
    uploadUrl: '',

    init: function(cfg) {
        $.extend(true, this, cfg);

        this.container = $(this.wall.container.find(this.container));
        this.title = this.container.find(this.title);
        this.fileList = this.container.find(this.fileList);
        this.fileItemTmpl = this.container.find(this.fileItemTmpl).html();
        this.progressBar = this.container.find(this.progressBar);
        this.closeButton = this.container.find(this.closeButton);

        this.initCloseButton();
        this.initDragAndDrop();
    },

    initCloseButton: function() {
        this.closeButton.click(function(e) {
            e.preventDefault();
            cnt.removeClass('active');
        });
    },

    initDragAndDrop: function() {
        if (!window.FormData) {
            Lemidora.messages.warning("Unfortunately your browser doesn't support JS File API and you can't drag'n'drop files", { timeout: false });
        }

        var wall = this.wall.container,
            cnt = this.container;

        function _preventDefault(e) {
            e.stopPropagation();
            e.preventDefault();
        }

        wall.on("dragenter", function(e) {
            _preventDefault(e);
            cnt.addClass('active');
        });

        wall.on("dragexit", function(e) {
            _preventDefault(e);
            cnt.removeClass('active');
        });

        wall.on("dragover", _preventDefault);

        var self = this;

        wall.on("drop", function(e) {
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

            self.initFileList(files);
            self.initProgressBar();
            self.upload(files);
        });
    },

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

    initFileList: function(files) {
        var fileList = this.fileList,
            fileItemTmpl = this.fileItemTmpl;

        fileList.empty();

        $.each(files, function(i, file) {
            var fileName = file.name;
            var nBytes = file.size;

            var sOutput = nBytes + " bytes";
            // optional code for multiples approximation
            for (var aMultiples = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"], nMultiple = 0, nApprox = nBytes / 1024; nApprox > 1; nApprox /= 1024, nMultiple++) {
                sOutput = nApprox.toFixed(3) + " " + aMultiples[nMultiple] + " <span>(" + nBytes + " bytes)</span>";
            }

            $(fileItemTmpl).appendTo(fileList)
                .find('.name').text(fileName).end()
                .find('.size').html(sOutput);
        });
    },

    initProgressBar: function() {
        this.progressBar.progressbar({ value: 0 });
    },

    upload: function(files) {
        var formdata = new FormData();

        $.each(files, function(i, file) {
            formdata.append('images[]', file);
        });

        var cnt = this.container,
            pb = this.progressBar;

        $.ajax({
            url: this.uploadUrl,
            type: "POST",
            data: formdata,
            processData: false,
            contentType: false,

            success: function (res) {
                cnt.removeClass('uploading active');
                pb.progressbar({ value: 100 });
            },

            error: function() {
                cnt.removeClass('uploading active');
                Lemidora.messages.error('Error happend during your file(s) uploading');
            },

            xhr: function() {
                var xhr = new window.XMLHttpRequest();

                xhr.upload.addEventListener("progress", function(e) {
                    if (e.lengthComputable) {
                        var percentComplete = e.loaded / e.total * 100;
                        pb.progressbar({ value: percentComplete });
                    }
                }, false);

                return xhr;
            }
        });
    }
};
