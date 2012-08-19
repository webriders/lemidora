Lemidora = window.Lemidora || {};


Lemidora.auth = {
    init: function () {
        this.initSocialAuth();
    },

    initSocialAuth: function () {
        $(".social-auth").click(this.socialAuth);
    },

    socialAuth: function (e) {
        e.preventDefault();

        var loginUrl = $(this).attr("href"),
            windowName = "Dive in Lemidora",
            features = "status=0,toolbar=0,location=0,menubar=0,directories=0,height=500,width=920";

        window.open(loginUrl, windowName, features);
    },

    socialAuthComplete: function (result) {
        var self = this;
        if (result == 'success') {
            window.location.href = self.redirectUrl;
        } else {
            window.location.reload(true);
        }
    }

};

$(function () {
    Lemidora.auth.init();
});
