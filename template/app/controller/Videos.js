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
            '#videotree': {
                urlclick: function(url) {
                    this.loadVideo(url);
                }
            },
            'videoindex > thumblist': {
                urlclick: function(url) {
                    this.loadVideo(url);
                }
            }
        });
    },

    loadIndex: function() {
        Ext.getCmp('doctabs').activateTab('#!/video');
        Ext.getCmp('card-panel').layout.setActiveItem('videoindex');
        Ext.getCmp('treecontainer').showTree('videotree');
    },

    loadVideo: function(url, noHistory) {
        var videoId = url.match(/[0-9]+$/)[0];

        if (this.currentVideo === videoId) {
            this.activateVideoCard();
            return;
        }
        this.currentVideo = videoId;

        noHistory || Docs.History.push(url);
        this.fireEvent('showVideo', url);

        Ext.getCmp('video').load(this.getVideo(videoId));
        this.activateVideoCard();
    },

    activateVideoCard: function() {
        Ext.getCmp('card-panel').layout.setActiveItem('video');
        Ext.getCmp('treecontainer').showTree('videotree');
    },

    // Given an ID returns corresponding video description object
    getVideo: function(id) {
        if (!this.map) {
            this.map = {};
            Ext.Array.forEach(Docs.data.videos, function(group) {
                Ext.Array.forEach(group.items, function(v) {
                    this.map[v.id] = v;
                }, this);
            }, this);
        }
        return this.map[id];
    }
});
