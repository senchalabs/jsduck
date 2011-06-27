/**
 * List of classes on front page.
 * Together with links to guides and icons legend.
 */
Ext.define('Docs.view.index.Container', {
    extend: 'Ext.container.Container',
    alias : 'widget.indexcontainer',
    cls: 'class-list',

    initComponent: function() {
        var data = this.classData;

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
            '<tpl for="organisation">',
                '<div class="section classes">',
                    '<h1>{name}</h1>',
                    '<tpl for="categories">',
                        '<div class="{align}">',
                        '<tpl for="items">',
                            '<h3>{.}</h3>',
                            '<div class="links">',
                                '{[this.renderClasses(values)]}',
                            '</div>',
                        '</tpl>',
                        '</div>',
                    '</tpl>',
                    '<div style="clear:both"></div>',
                '</div>',
            '</tpl>',
            {
                renderClasses: function(category) {
                    return Ext.Array.map(data.categories[category].classes, function(cls) {
                        return Ext.String.format('<a href="#/api/{0}" rel="{0}" class="docClass">{0}</a>', cls);
                    }).join("\n");
                }
            }
        );

        var notice = Ext.get("notice-text");
        var guides = Ext.get("guides-content");
        this.html = tpl.apply(Ext.apply({
            // Use the same title as in <title>
            title: Ext.query("title")[0].innerHTML,
            // If page contains div with notice-text extract the text and show it as notice
            notice: notice && notice.dom.innerHTML,
            // Extract guides
            guides: guides && guides.dom.innerHTML
        }, data));

        this.callParent(arguments);
    }
});
