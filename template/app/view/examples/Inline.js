/**
 * Inline example tab panel. Allows code to be demonstrated and edited inline.
 */
Ext.define('Docs.view.examples.Inline', {

    extend: 'Ext.Panel',
    alias: 'widget.inlineexample',

    layout: {
        type: 'card',
        deferredRender: false
    },
    // resizable: {
    //     transparent: true,
    //     handles: 's',
    //     constrainTo: false
    // },
    border: 0,

    defaults: {
        style: 'background: #f7f7f7; border: 0;',
        border: 0,
        bodyBorder: 0
    },

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'left',
        padding: '0 2',
        border: 0,
        style: 'background: none;',
        items: [
            {
                iconCls: 'code',
                padding: '0 2 0 0',
                margin: 0,
                tooltip: 'Code',
                handler: function() {
                    this.up('inlineexample').layout.setActiveItem(0);
                }
            },
            {
                padding: 0,
                margin: 0,
                iconCls: 'preview',
                tooltip: 'Preview',
                handler: function() {
                    this.up('inlineexample').layout.setActiveItem(1);
                }
            },
            {
                padding: 0,
                margin: 0,
                iconCls: 'info',
                tooltip: 'Meta Info',
                handler: function() {
                    this.up('inlineexample').layout.setActiveItem(2);
                }
            },
            {
                padding: 0,
                margin: 0,
                iconCls: 'copy',
                tooltip: 'Copy to Clipboard'
            }
        ]
    }],

    plain: true,
    deferredRender: false,

    initComponent: function() {

        Docs.view.examples.Inline.prototype.iframeId = Docs.view.examples.Inline.prototype.iframeId || 0;
        Docs.view.examples.Inline.prototype.iframeId = Docs.view.examples.Inline.prototype.iframeId + 1;

        this.iframeId = Docs.view.examples.Inline.prototype.iframeId;

        this.items = [{
            cls: 'codemirrorCode',
            style: 'border: 0',
            bodyPadding: 2,
            bodyStyle: 'background: #f7f7f7',
            autoScroll: true
        }];

        this.items.push({
            bodyPadding: 10,
            html: '<iframe id="egIframe' + this.iframeId + '" src="egIframe.html" style="width: 100%; height: 100%; border: 0"></iframe>',
            listeners: {
                show: function(a,b,c) {
                    document.getElementById('egIframe' + this.ownerCt.iframeId).contentWindow.refreshPage(this.ownerCt.codeEditor.getValue(), '');
                }
            }
        });

        this.items.push({
            bodyPadding: 10,
            html: 'Meta Info'
        });

        this.callParent(arguments);
    },

    showExample: function(exampleId, stripComments, updateHeight) {

        var inlineEg = this;

        if (exampleId.match(/^https:\/\/api\.github\.com/)) {
            Ext.data.JsonP.request({
                url: exampleId,
                success: function(json) {
                    inlineEg.codeEditor.setValue(json.data.files["basic_grid_panel.js"].content);
                    window.frames['egIframe' + inlineEg.iframeId].refreshPage(inlineEg.codeEditor.getValue(), ''); //inlineEg.cssEditor.getValue());
                },
                scope: this
            });

        } else {
            Ext.Ajax.request({
                method  : 'GET',
                url     : 'doc-resources/' + exampleId,
                headers : { 'Content-Type' : 'application/json' },

                success : function(response, opts) {

                    // Remove any trailing whitespace
                    var code = response.responseText.replace(/\s*$/, '');

                    // Remove comments
                    if (stripComments) {
                        code = code.replace(/\/\*\*[\s\S]*\*\/[\s\S]/, '');
                    }

                    inlineEg.codeEditor.setValue(code, '');

                    if (updateHeight) {
                        inlineEg.updateHeight();
                    }
                },
                failure : function(response, opts) {
                    console.log("Fail")
                }
            });
        }
    },

    updateHeight: function() {
        var inlineEg = this.el.up('.inlineExample');
        if (inlineEg) {
            var egId = this.el.up('.inlineExample').getAttribute('id');
            var el = Ext.get(Ext.query('#' + egId + ' .CodeMirror-lines')[0]);
            if (el) {
                var height = el.getHeight();
                this.setHeight(height + 10)
            }
        }
    },

    listeners: {
        afterlayout: function() {
            if(!this.codeEditor) {
                var codeBody = this.getComponent(0).body;
                var cmp = this;

                this.codeEditor = CodeMirror(codeBody, {
                    mode:  "javascript",
                    indentUnit: 4,
                    hmm: 'rar',
                    onChange: function(e) {
                        cmp.updateHeight();
                    }
                });
            }
        }
    }
});