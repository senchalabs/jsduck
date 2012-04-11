/**
 * Toolbar for inline examples.
 */
Ext.define('Docs.view.examples.InlineToolbar', {
    extend: 'Ext.toolbar.Toolbar',
    componentCls: 'inline-example-tb',
    height: 30,

    initComponent: function() {
        this.addEvents(
            /**
             * @event
             * Fired when a button on toolbar clicked.
             * @param {String} name  Name of the button.
             * Possible values: "code", "preview", "copy"
             */
            "buttonclick"
        );

        this.items = [
            {
                iconCls: 'code',
                padding: '0 2 0 0',
                margin: '0 3 0 0',
                text: 'Code Editor',
                handler: this.createEventFirerer("code")
            },
            {
                padding: 0,
                margin: '0 3 0 0',
                iconCls: 'preview',
                text: 'Live Preview',
                handler: this.createEventFirerer("preview")
            },
            "->",
            {
                padding: 0,
                margin: 0,
                iconCls: 'copy',
                text: 'Select Code',
                handler: this.createEventFirerer("copy")
            }
        ];

        this.callParent(arguments);
    },

    createEventFirerer: function(name) {
        return Ext.Function.bind(function() {
            this.fireEvent("buttonclick", name);
        }, this);
    },

    activateButton: function(name) {
        Ext.Array.each(this.query('button'), function(b) {
            b.removeCls('active');
        });
        Ext.Array.each(this.query('button[iconCls=' + name + ']'), function(b) {
            b.addCls('active');
        });
    }

});
