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
        this.tpl = new Ext.XTemplate(
            '<iframe id="videoplayer"',
            ' src="http://player.vimeo.com/video/{id}?portrait=0&amp;color=4CC208"',
            ' width="640" height="360" frameborder="0"></iframe>',
            '<h1>{title}</h1>',
            '<p>{description}</p>'
        );
        this.update(this.tpl.apply(video));
    }
});