/**
 * List of classes, grouped into categories.
 */
Ext.define('Docs.view.cls.Index', {
    extend: 'Ext.container.Container',
    alias: 'widget.classindex',
    requires: [
        'Docs.ContentGrabber'
    ],
    cls: 'class-list iScroll',
    margin: '15 10',
    autoScroll: true,

    initComponent: function() {
        this.tpl = new Ext.XTemplate(
            '<h1 class="top" style="padding-bottom: 10px">{title}</h1>',
            '<tpl if="notice">',
                '<div class="notice">{notice}</div>',
            '</tpl>',
            '{categories}'
        );
        this.data = {
            notice: Docs.ContentGrabber.get("notice-text"),
            categories: Docs.ContentGrabber.get("categories-content"),
            title: Ext.query("title")[0].innerHTML
        };

        this.callParent(arguments);
    }
});
