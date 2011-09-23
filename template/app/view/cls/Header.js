/**
 * Renders class name and icon in page header.
 */
Ext.define('Docs.view.cls.Header', {
    extend: 'Ext.container.Container',
    padding: '10 0 17 0',
    // Initially the component will be empty and so the initial height
    // will not be correct if not set explicitly
    height: 55,
    alias: 'widget.classheader',
    cls: 'classheader',

    initComponent: function() {
        this.tpl = Ext.create('Ext.XTemplate',
            '<h1 class="{[this.getClass(values)]}">',
                '<tpl if="private">',
                    '<span class="private">Private</span>',
                '</tpl>',
                '<a href="source/{href}" target="_blank">{name}</a>',
                '{[this.renderXTypes(values.xtypes)]}',
            '</h1>',
            Docs.showPrintButton ? '<a class="print" href="?print=/api/{name}" target="_blank">Print</a>' : '',
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
                },
                renderXTypes: function(xtypes) {
                    var map = {
                        widget: "xtype",
                        plugin: "ptype",
                        feature: "ftype"
                    };
                    var r = [];
                    xtypes && Ext.Object.each(map, function(ns, title) {
                        if (xtypes[ns]) {
                            r.push(title + ": " + xtypes[ns].join(", "));
                        }
                    });

                    if (r.length > 0) {
                        return "<span>" + r.join(", ") + "</span>";
                    }
                    else {
                        return "";
                    }
                }
            }
        );
        this.callParent();
    },

    /**
     * Loads class name and icon to header.
     * @param {Object} cls  class config.
     */
    load: function(cls) {
        this.update(this.tpl.apply(cls));
    }
});
