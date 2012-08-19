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
    container: null,

    init: function(cfg) {
        $.extend(true, this, cfg);
        this.container = $(this.wall.container.find(this.container));

        this.initDragAndDrop();
    },

    initDragAndDrop: function() {
        var wall = this.wall.container,
            cnt = this.container;

        function _preventDefault(e) {
            e.stopPropagation();
            e.preventDefault();
        }

        wall.on("dragenter", function(e) {
            _preventDefault(e);
            cnt.addClass('active');
            console.log('over');
        });

        wall.on("dragexit", function(e) {
            _preventDefault(e);
            cnt.removeClass('active');
            console.log('out');
        });

        wall.on("dragover", _preventDefault);

        var self = this;

        wall.on("drop", function(e) {

        });
    }
};









/*
$(function() {

    wall.on("dragover", function(e) {
        e.stopPropagation();
        e.preventDefault();
    });

    wall.on("drop", function(e) {
        e.stopPropagation();
        e.preventDefault();
        var oe = e.originalEvent;
        var files = oe.dataTransfer.files;

        var count = files.length;
        var MAX_AMOUNT = 10;
        if (count > MAX_AMOUNT) {
            console.log("Sorry, but for now I can't upload more than " + MAX_AMOUNT + " files at a time");
            return false;
        }

        var toUpload = [];
        var ALLOWED_TYPE = /^image\/.*$/;
        var MAX_SIZE = 10 * 1024 * 1024;

        $.each(files, function(i, file) {
            if (!file.type.match(ALLOWED_TYPE)) {
                console.log("Sorry, but file \"" + file.name + "\" is not an image");
                return true;
            }
            if (file.size > MAX_SIZE) {
                console.log("Sorry, but image \"" + file.name + "\" is larger than " + MAX_SIZE + " bytes");
                return true;
            }
            toUpload.push(file);
        });

        if (!toUpload.length) {
            return;
        }

        if (window.FormData) {
            var formdata = new FormData();

            $.each(toUpload, function(i, file) {
                $('<li><span class="name"></span> <span class="size">(<i></i> bytes)</span> <div class="progress-bar"><div class="current"></div></div></li>')
                    .appendTo('#uploader .to-upload')
                    .find('.name').text(file.name).end()
                    .find('.size i').text(file.size);

                // File API - not for all!
                formdata.append('images[]', file);
            });

            $.ajax({
                url: '/uploader/',
                type: "POST",
                data: formdata,
                processData: false,
                contentType: false,
                success: function (res) {
                    $('body').append(res);
                },
                xhr: function() {
                    var xhr = new window.XMLHttpRequest();

                    //Upload progress
                    xhr.upload.addEventListener("progress", function(e) {
                        if (e.lengthComputable) {
                            var percentComplete = e.loaded / e.total;
                            //Do something with upload progress
                            console.log(percentComplete);
                        }
                    }, false);

                    return xhr;
                }
            });
        } else {
            alert('Unfurtunately you cant upload files for now :(');
        }
    });
});*/
