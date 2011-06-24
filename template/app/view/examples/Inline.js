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

    defaults: {
        border: 0
    },

    initComponent: function() {

        var self = this;

        Docs.view.examples.Inline.prototype.iframeId = Docs.view.examples.Inline.prototype.iframeId || 0;
        Docs.view.examples.Inline.prototype.iframeId = Docs.view.examples.Inline.prototype.iframeId + 1;
        this.iframeId = Docs.view.examples.Inline.prototype.iframeId;

        this.items = [{
            cls: 'codemirrorCode',
            style: 'border: 0',
            bodyPadding: 2,
            bodyStyle: 'background: #f7f7f7',
            autoScroll: true,
            listeners: {
                activate: function() {
                    self.activateTab('code')
                }
            }
        }];

        this.items.push({
            bodyPadding: 10,
            html: '<iframe id="egIframe' + this.iframeId + '" src="egIframe.html" style="width: 100%; height: 100%; border: 0"></iframe>',
            listeners: {
                show: function(a,b,c) {
                    document.getElementById('egIframe' + this.ownerCt.iframeId).contentWindow.refreshPage(this.ownerCt.codeEditor.getValue(), '');
                },
                activate: function() {
                    self.activateTab('preview')
                }
            }
        });

        this.items.push({
            bodyPadding: 10,
            html: 'Meta Info',
            listeners: {
                activate: function() {
                    self.activateTab('info')
                }
            }
        });

        this.callParent(arguments);
    },

    activateTab: function(buttonCls) {
        Ext.Array.each(this.query('button'), function(b) {
            b.removeCls('active');
        });
        Ext.Array.each(this.query('button[iconCls=' + buttonCls + ']'), function(b) {
            b.addCls('active');
        });
    },

    showExample: function(exampleId, stripComments, updateHeight) {

        var inlineEg = this;

        // Works with Gists from GitHub
        if (exampleId.match(/^https:\/\/api\.github\.com/)) {
            Ext.data.JsonP.request({
                url: exampleId,
                success: function(json) {
                    inlineEg.codeEditor.setValue(json.data.files["basic_grid_panel.js"].content);
                    window.frames['egIframe' + inlineEg.iframeId].refreshPage(inlineEg.codeEditor.getValue(), '');
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

                    inlineEg.codeEditor.setValue(code);

                    if (updateHeight) {
                        inlineEg.updateHeight();
                    }
                }
            });
        }
    },

    updateHeight: function() {
        var el = this.el.down('.CodeMirror-lines');
        if (el) {
            this.setHeight(el.getHeight() + 5)
        }
    },

    listeners: {
        afterlayout: function() {
            if(!this.codeEditor) {
                var cmp = this;
                var codeBody = this.getComponent(0).body;

                this.codeEditor = CodeMirror(codeBody, {
                    mode:  "javascript",
                    indentUnit: 4,
                    onChange: function(e) {
                        cmp.updateHeight();
                    }
                });
            }
        }
    }
});