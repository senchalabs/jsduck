/**
 * Container for videos listing.
 */
Ext.define('Docs.view.videos.Index', {
    extend: 'Ext.container.Container',
    alias: 'widget.videoindex',
    requires: [
        'Docs.view.ThumbList'
    ],
    mixins: ['Docs.view.Scrolling'],

    cls: 'iScroll',
    margin: '10 0 0 0',
    autoScroll: true,

    initComponent: function() {
        this.items = [
            { xtype: 'container', html: '<h1 class="eg">Videos</h1>' },
            Ext.create('Docs.view.ThumbList', {
                itemTpl: [
                    '<dd ext:url="#!/video/{name}"><div class="thumb"><img src="{thumb}"/></div>',
                        '<div><h4>{title}',
                        '</h4><p>{[values.description.substr(0,80)]}...</p></div>',
                    '</dd>'
                ],
                data: Docs.data.videos
            })
        ];

        this.callParent(arguments);
    },

    /**
     * Returns tab config for videos page.
     * @return {Object}
     */
    getTab: function() {
        var enabled = (Docs.data.videos || []).length > 0;
        return enabled ? {cls: 'videos', href: '#!/video', tooltip: 'Videos'} : false;
    }
});
