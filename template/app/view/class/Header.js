/**
 * Renders class name and icon in page header.
 */
Ext.define('Docs.view.class.Header', {
    extend: 'Ext.container.Container',
    padding: '5 0 17 0',
    alias: 'widget.classheader',

    tpl: Ext.create('Ext.XTemplate',
        '<h1 class="{[this.getClass(values)]}">',
            '<a href="source/{href}" target="_blank">{name}</a>',
            '<tpl if="xtype">',
                '<span>xtype: {xtype}</span>',
            '</tpl>',
        '</h1>',
        {
            getClass: function(cls) {
                if (cls.component) {
                    return "component";
                }
                else if (cls.singleton) {
                    return "singleton";
                }
                else {
                    return "class";
                }
            }
        }
    ),

    initComponent: function() {
        this.html = this.tpl.apply(this.docClass || '&nbsp;');

        this.callParent(arguments);
    }
});
