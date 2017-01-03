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
    maxCodeHeight: 400,

    /**
     * @cfg {String} value
     * The JavaScript code of the example.
     */

    /**
     * @cfg {Object} options
     * A set of options for configuring the preview:
     *
     * @cfg {String} options.device phone, miniphone or tablet
     * @cfg {String} options.orientation ladscape or portrait
     * @cfg {Boolean} options.raw True to turn off Ext.setup().
     * @cfg {Boolean} options.preview True to start up in preview mode.
     */
    options: {},

    /**
     * @cfg {Docs.view.examples.InlineToolbar} toolbar
     * The toolbar with buttons that controls this component.
     */

    constructor: function() {
        this.callParent(arguments);

        this.addEvents(
            /**
             * @event previewsuccess
             * Fired when preview was successfully created.
             * @param {Ext.Component} preview
             */
            'previewsuccess',
            /**
             * @event previewfailure
             * Fired when preview contains an error.
             * @param {Ext.Component} preview
             * @param {Error} e
             */
            'previewfailure'
        );
    },

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
                    init: this.updateHeight,
                    change: this.updateHeight,
                    scope: this
                }
            }),
            this.preview = Ext.create('Docs.view.examples.InlinePreview', {
                cmpName: 'preview',
                options: this.options
            })
        ];
        this.relayEvents(this.preview, ['previewsuccess', 'previewfailure']);

        if (this.options.preview) {
            this.activeItem = 1;
            if (this.toolbar) {
                this.toolbar.activateButton("preview");
            }
        }
        else {
            this.activeItem = 0;
            if (this.toolbar) {
                this.toolbar.activateButton("code");
            }
        }

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
        if (this.toolbar) {
            this.initToolbarEvents();
        }
    },

    initToolbarEvents: function() {
        this.toolbar.on("buttonclick", function(name) {
            if (name === "code") {
                this.showCode();
            }
            else if (name === "preview") {
                this.showPreview();
            }
            else if (name === "copy") {
                this.showCode();
                this.editor.selectAll();
            }
        }, this);
    },

    /**
     * Activates the code card.
     */
    showCode: function() {
        this.layout.setActiveItem(0);
        this.updateHeight();
        if (this.toolbar) {
            this.toolbar.activateButton("code");
        }
    },

    /**
     * Activates the preview card.
     */
    showPreview: function() {
        this.preview.update(this.editor.getValue());
        this.layout.setActiveItem(1);
        this.updateHeight();
        if (this.toolbar) {
            this.toolbar.activateButton("preview");
        }
    },

    // Syncs the height with number of lines in code example.
    updateHeight: function() {
        var previewHeight = this.preview.getHeight();
        var editorHeight = this.editor.getHeight();
        var toolbarHeight = 30;
        if (Docs.data.touchExamplesUi && previewHeight > 0) {
            this.setHeight(previewHeight+toolbarHeight);
        }
        else if (editorHeight > 0) {
            this.setHeight(Ext.Number.constrain(editorHeight+toolbarHeight, 0, this.maxCodeHeight));
        }
    }

});
