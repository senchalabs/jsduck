/**
 * Controller for Videos.
 */
Ext.define('Docs.controller.Videos', {
    extend: 'Docs.controller.Content',
    baseUrl: '#!/video',
    title: 'Videos',

    refs: [
        {
            ref: 'viewport',
            selector: '#viewport'
        },
        {
            ref: 'index',
            selector: '#videoindex'
        },
        {
            ref: 'tree',
            selector: '#videotree'
        }
    ],

    init: function() {
        this.addEvents(
            /**
             * @event showVideo
             * Fired after a video is shown. Used for analytics event tracking.
             * @param {String} name Name of the video.
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
        Ext.getCmp('treecontainer').showTree('videotree');
        this.callParent();
    },

    loadVideo: function(url, noHistory) {
        var reRendered = false;

        Ext.getCmp('card-panel').layout.setActiveItem('video');
        Ext.getCmp('treecontainer').showTree('videotree');
        var name = url.match(/^#!\/video\/(.*)$/)[1];

        var video = this.getVideo(name);
        if (!video) {
            this.getController('Failure').show404("Video <b>"+Ext.String.htmlEncode(name)+"</b> was not found.");
            return;
        }
        this.getViewport().setPageTitle(video.title);
        if (this.activeUrl !== url) {
            Ext.getCmp('video').load(video);
            reRendered = true;
        }
        noHistory || Docs.History.push(url);
        this.fireEvent('showVideo', name, {reRendered: reRendered});
        this.getTree().selectUrl(url);
        this.activeUrl = url;
    },

    // Given a name returns corresponding video description object
    getVideo: function(name) {
        if (!this.map) {
            this.map = {};
            Ext.Array.forEach(Docs.data.videos, function(group) {
                Ext.Array.forEach(group.items, function(v) {
                    this.map[v.name] = v;
                }, this);
            }, this);
        }
        return this.map[name];
    }
});
