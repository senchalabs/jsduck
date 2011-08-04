/**
 * Controller for Videos.
 */
Ext.define('Docs.controller.Videos', {
    extend: 'Ext.app.Controller',

    init: function() {
        this.control({
            'videolist': {
                videoclick: function(id) {
                    this.openVideo(id);
                }
            },
            'videostree': {
                videoclick: function(id) {
                    this.openVideo(id);
                }
            }
        });
    },

    loadIndex: function() {
        Ext.getCmp('doctabs').activateTab('#/videos');
        Ext.getCmp('card-panel').layout.setActiveItem('videos');
        Ext.getCmp('tree-container').layout.setActiveItem(3);
        Ext.getCmp('tree-container').show();
    },

    openVideo: function(videoId) {
        this.currentVideo = videoId;

        Ext.create('Ext.Window', {
            title: 'Video',
            width: 660,
            height: 431,
            modal: true,
            html: '<iframe id="videoplayer" src="' + this.getUrl(videoId) + '" width="640" height="360" frameborder="0" style="margin: 5px auto 0 auto; display: block;"></iframe>',
            bbar: [
                '->',
                {
                    xtype: 'button',
                    text: '&laquo; Previous',
                    handler: this.prev,
                    scope: this
                },
                '-',
                {
                    xtype: 'button',
                    text: 'Next &raquo;',
                    handler: this.next,
                    scope: this
                }
            ]
        }).show();
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
            this._videoIds = Ext.Array.flatten(Ext.Array.map(Docs.videos, function(v) { return Ext.Array.map(v.videos, function(w) { return w.id; }); }));
        }
        return this._videoIds;
    }
});
