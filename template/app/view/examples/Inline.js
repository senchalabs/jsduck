/**
 * Inline example tab panel. Allows code to be demonstrated and edited inline.
 */
Ext.define('Docs.view.examples.Inline', {
    extend: 'Ext.Panel',
    alias: 'widget.inlineexample',

    componentCls: 'inline-example-cmp',
    layout: 'card',
    border: 0,
    resizable: {
        transparent: true,
        handles: 's',
        constrainTo: false
    },

    statics: {
        iframeId: 0
    },

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

    defaults: {
        border: 0
    },

    initComponent: function() {
        this.items = [
            {
                cmpName: 'code',
                style: 'border: 0',
                bodyPadding: 2,
                bodyStyle: 'background: #f7f7f7',
                autoScroll: true
            }
        ];

        this.callParent(arguments);
    },

    /**
     * Activates the code card.
     */
    showCode: function() {
        this.layout.setActiveItem(0);
    },

    /**
     * Activates the code preview card.
     * When called for the first time, creates the preview iframe.
     * @param {Function} callback  Called when iframe is ready.
     * @param {Object} scope
     */
    showPreview: function(callback, scope) {
        if (!this.previewInitialized) {
            this.add({
                bodyPadding: 10,
                cmpName: 'preview',
                html: '<iframe id="' + this.getIframeId() + '" style="width: 100%; height: 100%; border: 0"></iframe>'
            });
            var iframe = document.getElementById(this.getIframeId());
            iframe.onload = Ext.Function.bind(callback, scope);
            iframe.src = "egIframe.html";
            this.layout.setActiveItem(1);
            this.previewInitialized = true;
        }
        else {
            this.layout.setActiveItem(1);
            callback.call(scope);
        }
    },

    /**
     * Returns iframe ID for this inline example component.
     * @return {String}
     */
    getIframeId: function() {
        if (!this.iframeId) {
            this.statics().iframeId += 1;
            this.iframeId = "egIframe" + this.statics().iframeId;
        }
        return this.iframeId;
    },

    /**
     * Syncs the height with number of lines in code example.
     */
    updateHeight: function() {
        var el = this.el.down('.CodeMirror-lines');
        if (el) {
            this.setHeight(el.getHeight() + 5);
        }
    }

});
