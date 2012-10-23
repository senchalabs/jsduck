/**
 * Editor for adding tags.
 */
Ext.define("Docs.view.comments.TagEditor", {
    extend: "Ext.container.Container",
    floating: true,
    hidden: true,
    style: "padding-top: 10px;",

    initComponent: function() {
        this.items = [
            {
                xtype: 'textfield',
                enableKeyEvents: true,
                listeners: {
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
        this.down("textfield").focus(true, 100);
    },

    onKeyUp: function(field, ev) {
        if (ev.keyCode === Ext.EventObject.ENTER) {
            var value = Ext.String.trim(field.getValue());
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
        else if (ev.keyCode === Ext.EventObject.ESC) {
            this.destroy();
        }
    }
});