/**
 * List of classes on front page.
 * Together with links to guides and icons legend.
 */
Ext.define('Docs.view.index.Container', {
    extend: 'Ext.container.Container',
    alias : 'widget.indexcontainer',
    cls: 'class-list',

    initComponent: function() {
        this.tpl = new Ext.XTemplate(
            '<h1 class="top">{title}</h1>',
            '<tpl if="notice">',
                '<div class="notice">{notice}</div>',
            '</tpl>',
            '<div class="section legend">',
                '<h4>Legend</h4>',
                '<ul>',
                    '<li class="icon icon-pkg">Package</li>',
                    '<li class="icon icon-class">Class</li>',
                    '<li class="icon icon-singleton">Singleton</li>',
                    '<li class="icon icon-component">Component</li>',
                    '<li class="icon icon-guide">Guide</li>',
                '</ul>',
            '</div>',
            '<tpl if="guides">',
                '<div class="section guides">',
                    '<h1>Guides</h1>',
                    '{guides}',
                    '<div class="examples">',
                        '<a href="../examples/index.html">View the examples &rarr;</a>',
                    '</div>',
                '</div>',
            '</tpl>',
            '{categories}'
        );
        this.data = this.extractData();
        
        this.callParent(arguments);
    },

    // Extracts HTML from hidden elements in page
    extractData: function() {
        var data = {
            notice: Ext.get("notice-text"),
            guides: Ext.get("guides-content"),
            categories: Ext.get("categories-content")
        };
        for (var i in data) {
            var el = data[i];
            if (el) {
                // If page contains the div then extract its contents,
                // after that remove the original
                data[i] = el.dom.innerHTML;
                el.remove();
            }
        }
        // Extract <title> text
        data.title = Ext.query("title")[0].innerHTML;
        return data;
    }
});
