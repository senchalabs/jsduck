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
            '<div class="section guides">',
                '<h1>Guides</h1>',
                '<div class="lft">',
                    '<a class="guide getting_started" rel="getting_started" href="#/guide/getting_started">Getting Started</a>',
                    '<a class="guide class_system" rel="class_system" href="#/guide/class_system">Class System</a>',
                    '<a class="guide application_architecture" rel="application_architecture" href="#/guide/application_architecture">MVC Architecture</a>',
                    '<a class="guide layouts_and_containers" rel="layouts_and_containers" href="#/guide/layouts_and_containers">Layouts and Containers</a>',
                '</div>',
                '<div class="mid">',
                    '<a class="guide data" rel="data" href="#/guide/data">Data</a>',
                    '<a class="guide grid" rel="grid" href="#/guide/grid">Grids</a>',
                    '<a class="guide tree" rel="tree" href="#/guide/tree">Trees</a>',
                    '<a class="guide drawing_and_charting" rel="drawing_and_charting" href="#/guide/drawing_and_charting">Charts</a>',
                '</div>',
                '<div class="rgt">',
                    '<a class="guide forms" rel="forms" href="#/guide/forms">Forms</a>',
                    '<a class="guide components" rel="components" href="#/guide/components">Components</a>',
                    '<a class="guide theming" rel="theming" href="#/guide/theming">Theming</a>',
                    '<a class="guide direct" rel="direct" href="#/guide/direct">Direct</a>',
                '</div>',
                '<div class="examples">',
                    '<a href="http://dev.sencha.com/deploy/ext-4.0.2a/examples/index.html">View the Ext 4.0 examples &rarr;</a>',
                '</div>',
            '</div>',
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
        this.html = tpl.apply(Ext.apply({
            // Use the same title as in <title>
            title: Ext.query("title")[0].innerHTML,
            // If page contains div with notice-text extract the text and show it as notice
            notice: notice && notice.dom.innerHTML
        }, data));

        this.callParent(arguments);
    }
});
