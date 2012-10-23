/**
 * Editor for adding tags.
 */
Ext.define("Docs.view.comments.TagEditor", {
    extend: "Ext.container.Container",
    floating: true,
    hidden: true,
    componentCls: "comments-tageditor",

    initComponent: function() {
        var tagnames = Ext.create('Ext.data.Store', {
            fields: ['name'],
            data: [
                {name: "Fixed"},
                {name: "Bug"},
                {name: "Fixed in 4.1"}
            ]
        });

        this.items = [
            {
                xtype: 'combobox',
                listConfig: {
                    cls: "comments-tageditor-boundlist"
                },
                store: tagnames,
                queryMode: "local",
                displayField: "name",
                valueField: "name",
                enableKeyEvents: true,
                listeners: {
                    select: this.handleSelect,
                    blur: this.destroy,
                    keyup: this.onKeyUp,
                    scope: this
                }
            }
        ];

        this.callParent(arguments);
    },

    popup: function(el) {
        this.show();
        this.alignTo(el, 'bl', [-12, -2]);
        this.down("combobox").focus(true, 100);
    },

    onKeyUp: function(field, ev) {
        if (ev.keyCode === Ext.EventObject.ENTER) {
            this.handleSelect();
        }
        else if (ev.keyCode === Ext.EventObject.ESC) {
            this.destroy();
        }
    },

    handleSelect: function() {
        var value = Ext.String.trim(this.down("combobox").getValue());
        if (value) {
            /**
             * @event select
             * Fired when a tagname entered to the field and ENTER pressed.
             * @param {String} tagname
             */
            this.fireEvent("select", value);
        }
        this.destroy();
    }
});