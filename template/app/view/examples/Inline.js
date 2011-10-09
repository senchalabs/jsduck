/**
 * Inline example tab panel. Allows code to be demonstrated and edited inline.
 */
Ext.define('Docs.view.examples.Inline', {
    extend: 'Ext.Panel',
    alias: 'widget.inlineexample',
    requires: [
        'Docs.view.examples.InlineEditor',
        'Docs.view.examples.InlinePreview'
    ],

    componentCls: 'inline-example-cmp',
    layout: 'card',
    border: 0,
    resizable: {
        transparent: true,
        handles: 's',
        constrainTo: false
    },
    // Make too long examples scrollable
    maxHeight: 890,

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'left',
        padding: '0 2',
        style: 'background: none;',
        items: [
            {
                iconCls: 'code',
                padding: '0 2 0 0',
                margin: 0,
                tooltip: 'Code'
            },
            {
                padding: 0,
                margin: 0,
                iconCls: 'preview',
                tooltip: 'Preview'
            },
            {
                padding: 0,
                margin: 0,
                iconCls: 'copy',
                tooltip: 'Select'
            }
        ]
    }],

    /**
     * @cfg {Object} options
     * A set of options for configuring the preview:
     *
     * @cfg {String} options.device phone, miniphone or tablet
     * @cfg {String} options.orientation ladscape or portrait
     * @cfg {Boolean} options.raw True to turn off Ext.setup().
     */
    options: {},

    initComponent: function() {
        this.options = Ext.apply({
            device: "phone",
            orientation: "landscape"
        }, this.options);

        this.items = [
            this.editor = Ext.create('Docs.view.examples.InlineEditor', {
                cmpName: 'code',
                value: this.value,
                listeners: {
                    change: this.updateHeight,
                    scope: this
                }
            }),
            this.preview = Ext.create('Docs.view.examples.InlinePreview', {
                cmpName: 'preview',
                options: this.options
            })
        ];

        this.activeItem = Docs.touchExamplesUi ? 1 : 0;

        this.on("afterrender", this.init, this);

        this.callParent(arguments);
    },

    // Updates code inside example component
    init: function() {
        var activeItem = this.layout.getActiveItem();
        if (activeItem.cmpName === 'preview') {
            this.showPreview();
        }
        this.updateHeight();
    },

    /**
     * Activates the code card.
     */
    showCode: function() {
        this.layout.setActiveItem(0);
    },

    /**
     * Activates the preview card.
     */
    showPreview: function() {
        this.preview.update(this.editor.getValue());
        this.layout.setActiveItem(1);
    },

    // Syncs the height with number of lines in code example.
    updateHeight: function() {
        if (Docs.touchExamplesUi) {
            var height = this.preview.getHeight();
            height > 0 && this.setHeight(height);
        }
        else {
            var editorHeight = this.editor.getHeight();
            editorHeight && this.setHeight(editorHeight + 5);
        }
    }

});
