/**
 * The video page.
 *
 * Renders the video itself and its title + description.
 */
Ext.define('Docs.view.videos.Container', {
    extend: 'Ext.container.Container',
    alias: 'widget.videocontainer',

    /**
     * Loads video into the page.
     * @param {Object} video
     */
    load: function(video) {
        this.tpl = this.tpl || new Ext.XTemplate(
            '<iframe id="videoplayer"',
            ' src="http://player.vimeo.com/video/{id}?portrait=0&amp;color=4CC208"',
            ' width="640" height="360" frameborder="0"></iframe>',
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
    }
});