console = window.console || { log: $.noop };
Lemidora = window.Lemidora || {};

/**
  * Lemidora Photo Wall Poller (i.e. polling mechanism)
  *
  * Note: this is inner/system tool used inside the Lemidora.Wall instances. Don't use it directly!
  *
  * @author WebRiders (http://webriders.com.ua/)
  * @param {Object} cfg Constructor params
  * @see Lemidora.WallPoller.init for cfg details
  * @constructor
  */
Lemidora.WallPoller = function(cfg) {
    if (cfg)
        this.init(cfg);
};

Lemidora.WallPoller.prototype = {
    wall: null, // to be set from the outside
    pollUrl: '',
    pollDelay: 5000,
    debug: false,
    autoStart: true,

    // private attrs
    _poll: null,
    _eventDispatcher: null,

    /**
     * Init the polling mechanism
     * 
     * @param {Lemidora.Wall} cfg.wall
     *     Wall instance
     * @param {String} cfg.pollUrl
     *     Polling URL (to periodically update the wall)
     * @param {Number} cfg.pollDelay
     *     Polling delay in milliseconds
     * @param {Boolean} cfg.debug
     *     Enable/disable debug mode (logging); default - false
     * @param {Boolean} cfg.autoStart
     *     true - start polling on init (by default);
     *     false - start polling manually
     */
    init: function(cfg) {
        $.extend(true, this, cfg);
        this._eventDispatcher = $({});
        this.poll();
    },

    startPolling: function() {
        this.debug && console.log('next poll will be in ' + (this.pollDelay / 1000).toFixed(2) + ' sec.');

        clearTimeout(this._poll);
        this._poll = setTimeout($.proxy(this, 'poll'), this.pollDelay);
    },

    stopPolling: function() {
        this.debug && console.log('polling stopped');
        clearTimeout(this._poll);
    },

    poll: function() {
        var self = this;

        this.debug && console.log('poll!');
        self.trigger('request-start');

        $.get(this.pollUrl)
            .success(function(wallInfo) {
                self.trigger('request-success', [wallInfo]);
            })
            .fail(function(res) {
                Lemidora.messages.error("I can't update the wall :(");
                self.trigger('request-fail', [res]);
            }).complete(function() {
                self.trigger('request-complete');
                self.startPolling();
            });
    },

    on: function(event, fn) {
        return this._eventDispatcher.on(event, fn);
    },

    off: function(event, fn) {
        return this._eventDispatcher.off(event, fn);
    },

    trigger: function(event, args) {
        return this._eventDispatcher.trigger(event, args);
    }
};
