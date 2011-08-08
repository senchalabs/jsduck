/**
 * Controller for Videos.
 */
Ext.define('Docs.controller.Videos', {
    extend: 'Ext.app.Controller',

    init: function() {
        this.addEvents(
            /**
             * @event showVideo
             * Fired after a video is shown. Used for analytics event tracking.
             * @param {String} video name of the video.
             */
            "showVideo"
        );

        this.control({
            'videoindex > thumblist': {
                urlclick: function(url) {
                    this.loadVideo(url);
                }
            },
            'videotree': {
                videoclick: function(url) {
                    this.loadVideo(url);
                }
            }
        });
    },

    loadIndex: function() {
        Ext.getCmp('doctabs').activateTab('#/video');
        Ext.getCmp('card-panel').layout.setActiveItem('videoindex');
        Ext.getCmp('tree-container').layout.setActiveItem('videotree');
        Ext.getCmp('tree-container').show();
    },

    loadVideo: function(url, noHistory) {
        var videoRe = url.match(/[0-9]+$/),
            videoId = videoRe[0];

        if (this.currentVideo === videoId) {
            return this.activateVideoCard();
        }
        this.currentVideo = videoId;

        noHistory || Docs.History.push('#' + url);
        this.fireEvent('showVideo', url);

        var ifr = document.getElementById("videoplayer");
        ifr.contentWindow.location.replace(this.getUrl(videoId));
        this.activateVideoCard();
    },

    activateVideoCard: function() {
        Ext.getCmp('card-panel').layout.setActiveItem('video');
        Ext.getCmp('tree-container').layout.setActiveItem('videotree');
        Ext.getCmp('tree-container').show();
    },

    getUrl: function(videoId) {
        return 'http://player.vimeo.com/video/' + videoId + '?portrait=0&amp;color=4CC208';
    },

    setUrl: function(videoId) {
        this.currentVideo = videoId;
        document.getElementById('videoplayer').setAttribute('src', this.getUrl(videoId));
    },

    next: function() {
        if (!this.currentVideo) return;
        var idx = Ext.Array.indexOf(this.videoIds(), this.currentVideo);
        this.setUrl((idx == this.videoIds().length) ? 0 : this.videoIds()[idx + 1]);
    },

    prev: function() {
        if (!this.currentVideo) return;
        var idx = Ext.Array.indexOf(this.videoIds(), this.currentVideo);
        this.setUrl((idx == 0) ? this.videoIds()[this.videoIds().length - 1] : this.videoIds()[idx - 1]);
    },

    videoIds: function() {
        if (!this._videoIds) {
            this._videoIds = Ext.Array.flatten(Ext.Array.map(Docs.data.videos, function(v) { return Ext.Array.map(v.videos, function(w) { return w.id; }); }));
        }
        return this._videoIds;
    }
});
