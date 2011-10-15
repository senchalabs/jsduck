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
                '<a href="#" class="class-source-link">{name}',
                  '<span class="class-source-tip">View source...</span>',
                '</a>',
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
                    var titles = {
                        widget: "xtype",
                        plugin: "ptype",
                        feature: "ftype"
                    };
                    var r = [];
                    xtypes && Ext.Object.each(xtypes, function(ns, types) {
                        r.push((titles[ns] || ns) + ": " + types.join(", "));
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

        this.on("render", this.initSourceLink, this);

        this.callParent();
    },

    initSourceLink: function() {
        // When class name clicked, open the source file directly or
        // pop up a menu if there's more than one source file.
        this.classLinkEvent("click", function() {
            var files = this.loadedCls.files;
            if (files.length === 1) {
                window.open("source/" + files[0].href);
            }
            else {
                var menu = this.createFileMenu(files);
                menu.showBy(this, undefined, [58,-20]);
            }
        }, this);

        // show "View source..." tip below class name on hover
        this.classLinkEvent("mouseover", function() {
            this.el.down(".class-source-tip").show();
        }, this);
        this.classLinkEvent("mouseout", function() {
            this.el.down(".class-source-tip").hide();
        }, this);
    },

    // Helper for binding handlers to class name link
    classLinkEvent: function(eventName, fun, scope) {
        this.el.on(eventName, fun, scope, {
            preventDefault: true,
            delegate: 'a.class-source-link'
        });
    },

    createFileMenu: function(files) {
        return new Ext.menu.Menu({
            items: Ext.Array.map(files, function(f) {
                return {
                    text: f.filename,
                    handler: function() {
                        window.open("source/" + f.href);
                    }
                };
            }, this)
        });
    },

    /**
     * Loads class name and icon to header.
     * @param {Object} cls  class config.
     */
    load: function(cls) {
        this.loadedCls = cls;
        this.update(this.tpl.apply(cls));
    }
});
