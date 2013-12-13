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
    	// Ti change -- prepare data for Guides index page
		var data = Ext.Array.map(Docs.data.guides, function(guide){
			if(guide.items == null || guide.items.length === 0){
				guide.items = [{
					name: guide.name,
					title: guide.title
				}];
			}
			return guide;
		});
        // 
        this.items = [
            { xtype: 'container', html: '<h1 class="eg">Guides</h1>' },
            Ext.create('Docs.view.ThumbList', {
                commentType: "guide",
                itemTpl: [
				// Ti change -- icon change next line
                    '<dd ext:url="#!/guide/{name}"><div class="thumb"><img src="resources/images/icon-lg.png"/></div>',
                        '<div><h4>{title}</h4><p>{description}</p></div>',
                    '</dd>'
                ],
                // Ti change -- use generated guides data
                data: data
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
