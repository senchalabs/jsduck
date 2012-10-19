/**
 * The video page.
 *
 * Renders the video itself and its title + description.
 */
Ext.define('Docs.view.videos.Container', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.videocontainer',
    componentCls: 'video-container',
    requires: [
        "Docs.Comments",
        "Docs.view.comments.LargeExpander"
    ],

    initComponent: function() {
        this.callParent(arguments);

        this.on("hide", this.pauseVideo, this);
    },

    pauseVideo: function() {
        var videoPlayer = document.getElementById('video_player');
        if (videoPlayer && videoPlayer.api_pause) {
            videoPlayer.api_pause();
        }
    },

    /**
     * Loads video into the page.
     * @param {Object} video
     */
    load: function(video) {
        this.video = video;

        this.tpl = this.tpl || new Ext.XTemplate(
            '<object width="640" height="360" id="video_player">',
                '<param name="allowfullscreen" value="true" />',
                '<param name="allowscriptaccess" value="always" />',
                '<param name="flashvars" value="api=1" />',
                '<param name="movie" value="http://vimeo.com/moogaloop.swf?clip_id={id}&amp;server=vimeo.com&amp;color=4CC208&amp;fullscreen=1" />',
                '<embed src="http://vimeo.com/moogaloop.swf?clip_id={id}&amp;server=vimeo.com&amp;color=4CC208&amp;fullscreen=1" ',
                    'type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="640" height="360"></embed>',
            '</object>',
            '<h1>{title}</h1>',
            '<p>{[this.linkify(values.description)]}</p>',
            {
                // Detects URL-s in text and converts them to links
                linkify: function(text) {
                    return text.replace(/(\bhttps?:\/\/\S+)/ig, "<a href='$1'>$1</a>");
                }
            }
        );

        this.update(this.tpl.apply(video));

        if (Docs.Comments.isEnabled()) {
            this.initComments();
        }
    },

    initComments: function() {
        this.expander = new Docs.view.comments.LargeExpander({
            type: "video",
            name: this.video.name,
            el: this.getEl().down(".x-panel-body")
        });
    },

    /**
     * Updates the comments counter.
     */
    updateCommentCounts: function() {
        if (!this.expander) {
            return;
        }
        this.expander.getExpander().setCount(Docs.Comments.getCount(["video", this.video.name, ""]));
    }
});