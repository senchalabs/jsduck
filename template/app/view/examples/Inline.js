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
    // Make too long examples scrollable
    maxHeight: 400,

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
                bodyPadding: '0 10',
                cmpName: 'preview',
                html: this.getHtml()
            });
            var iframe = document.getElementById(this.getIframeId());
            // Something is not quite ready when onload fires.
            // I'm unsure what I should wait for. So I'm currently adding just this nasty delay.
            // 1 ms works in Chrome, Firefox wants something bigger. Works in IE too.
            iframe.onload = function() {
                Ext.Function.defer(callback, 100, scope);
            };
            iframe.src = Docs.touchExamplesUi ? "touchIframe.html" : "extIframe.html";
            this.layout.setActiveItem(1);
            this.previewInitialized = true;
        }
        else {
            this.layout.setActiveItem(1);
            callback.call(scope);
        }
    },

    getHtml: function() {
        if (Docs.touchExamplesUi) {
            var tpl = new Ext.XTemplate(
                '<div class="touchExample phone landscape">',
                    '<iframe id="{id}" style="width: 480px; height: 320px; border: 0;"></iframe>',
                '</div>'
            );
        }
        else {
            var tpl = new Ext.XTemplate(
                '<iframe id="{id}" style="width: 100%; height: 100%; border: 0"></iframe>'
            );
        }
        return tpl.apply({id: this.getIframeId()});
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
            this.setHeight(Docs.touchExamplesUi ? 320+50 : el.getHeight() + 5);
        }
    }

});
