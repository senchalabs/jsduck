/**
 * Container for videos listing.
 */
Ext.define('Docs.view.videos.Index', {
    extend: 'Ext.container.Container',
    alias: 'widget.videoindex',
    requires: [
        'Docs.view.ThumbList'
    ],

    cls: 'all-demos iScroll',
    margin: '10 0 0 0',
    autoScroll: true,

    initComponent: function() {
        this.items = [
            { xtype: 'container', html: '<h1 class="eg">Ext JS Videos</h1>' },
            Ext.create('Docs.view.ThumbList', {
                itemTpl: [
                    '<dd ext:url="#!/video/{id}"><img src="{thumb}"/>',
                        '<div><h4>{title}',
                        '</h4><p>{[values.description.substr(0,80)]}</p></div>',
                    '</dd>'
                ],
                data: Docs.data.videos
            })
        ];

        this.callParent(arguments);
    }
});
