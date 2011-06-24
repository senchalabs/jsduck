/**
 * Inline example tab panel. Allows code to be demonstrated and edited inline.
 */
Ext.define('Docs.view.examples.Inline', {

    extend: 'Ext.Panel',
    alias: 'widget.inlineexample',

    layout: 'card',
    border: 0,
    resizable: {
        transparent: true,
        handles: 's',
        constrainTo: false
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
                iconCls: 'info',
                tooltip: 'Meta Info'
            },
            {
                padding: 0,
                margin: 0,
                iconCls: 'copy',
                tooltip: 'Copy to Clipboard'
            }
        ]
    }],

    defaults: {
        border: 0
    },

    initComponent: function() {

        var self = this;

        Docs.view.examples.Inline.prototype.iframeId = Docs.view.examples.Inline.prototype.iframeId || 0;
        Docs.view.examples.Inline.prototype.iframeId = Docs.view.examples.Inline.prototype.iframeId + 1;
        this.iframeId = Docs.view.examples.Inline.prototype.iframeId;

        this.items = [{
            cmpName: 'code',
            style: 'border: 0',
            bodyPadding: 2,
            bodyStyle: 'background: #f7f7f7',
            autoScroll: true
        }];

        this.items.push({
            bodyPadding: 10,
            cmpName: 'preview',
            html: '<iframe id="egIframe' + this.iframeId + '" src="egIframe.html" style="width: 100%; height: 100%; border: 0"></iframe>'
        });

        this.items.push({
            bodyPadding: 10,
            html: 'Meta Info',
            cmpName: 'meta'
        });

        this.callParent(arguments);
    },

    updateHeight: function() {
        var el = this.el.down('.CodeMirror-lines');
        if (el) {
            this.setHeight(el.getHeight() + 5)
        }
    }

});