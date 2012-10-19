/**
 * Container for guides listing.
 */
Ext.define('Docs.view.guides.Index', {
    extend: 'Ext.container.Container',
    alias: 'widget.guideindex',
    requires: ['Docs.view.ThumbList'],
    mixins: ['Docs.view.Scrolling'],

    cls: 'iScroll',
    margin: '10 0 0 0',
    autoScroll: true,

    initComponent: function() {
        this.items = [
            { xtype: 'container', html: '<h1 class="eg">Guides</h1>' },
            Ext.create('Docs.view.ThumbList', {
                commentType: "guide",
                itemTpl: [
                    '<dd ext:url="#!/guide/{name}"><div class="thumb"><img src="guides/{name}/icon.png"/></div>',
                        '<div><h4>{title}</h4><p>{description}</p></div>',
                    '</dd>'
                ],
                data: Docs.data.guides
            })
        ];

        this.callParent(arguments);
    },

    /**
     * Returns tab config for guides page.
     * @return {Object}
     */
    getTab: function() {
        var enabled = (Docs.data.guides|| []).length > 0;
        return enabled ? {cls: 'guides', href: '#!/guide', tooltip: 'Guides'} : false;
    },

    /**
     * Refreshes the comment counters.
     */
    updateCommentCounts: function() {
        this.down("thumblist").updateCommentCounts();
    }
});
