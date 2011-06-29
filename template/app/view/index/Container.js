/**
 * List of classes on front page.
 * Together with links to guides and icons legend.
 */
Ext.define('Docs.view.index.Container', {
    extend: 'Ext.container.Container',
    alias : 'widget.indexcontainer',
    cls: 'class-list',

    initComponent: function() {
        var tpl = new Ext.XTemplate(
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
                        '<a href="http://dev.sencha.com/deploy/ext-4.0.2a/examples/index.html">View the Ext 4.0 examples &rarr;</a>',
                    '</div>',
                '</div>',
            '</tpl>',
            '{categories}'
        );

        var notice = Ext.get("notice-text");
        var guides = Ext.get("guides-content");
        var categories = Ext.get("categories-content");
        this.html = tpl.apply({
            // Use the same title as in <title>
            title: Ext.query("title")[0].innerHTML,
            // If page contains div with notice-text extract the text and show it as notice
            notice: notice && notice.dom.innerHTML,
            // Extract guides
            guides: guides && guides.dom.innerHTML,
            // Extract categories
            categories: categories && categories.dom.innerHTML
        });

        this.callParent(arguments);
    }
});
