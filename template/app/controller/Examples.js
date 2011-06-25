/**
 * Listeners should be defined here instead of in the view classes
 */
Ext.define('Docs.controller.Examples', {
    extend: 'Ext.app.Controller',

    refs: [
        {
            ref: 'tab',
            selector: 'inlineexample toolbar button'
        }
    ],

    init: function() {

        this.control({
            'inlineexample': {
                afterlayout: function(cmp) {

                    if(!cmp.codeEditor) {
                        var codeBody = cmp.getComponent(0).body;

                        cmp.codeEditor = CodeMirror(codeBody, {
                            mode:  "javascript",
                            indentUnit: 4,
                            onChange: function(e) {
                                cmp.updateHeight();
                            }
                        });
                    }
                }
            },
            'inlineexample [cmpName=code]': {
                activate: function(cmp) {
                    this.activateTab(cmp, 'code')
                    var inlineEg = cmp.up('inlineexample');
                    if (inlineEg && inlineEg.codeEditor) {
                        // Weird bug on CodeMirror requires 2 refreshes...
                        inlineEg.codeEditor.refresh();
                        inlineEg.codeEditor.refresh();
                    }
                }
            },
            'inlineexample [cmpName=preview]': {
                show: function(card) {
                    this.refreshPreview(card.ownerCt);
                },
                activate: function(cmp) {
                    this.activateTab(cmp, 'preview');
                }
            },
            'inlineexample [cmpName=meta]': {
                activate: function(cmp) {
                    this.activateTab(cmp, 'info')
                }
            },
            'inlineexample toolbar button[iconCls=code]': {
                click: function(cmp) {
                    cmp.up('inlineexample').layout.setActiveItem(0);
                }
            },
            'inlineexample toolbar button[iconCls=preview]': {
                click: function(cmp) {
                    cmp.up('inlineexample').layout.setActiveItem(1);
                }
            },
            'inlineexample toolbar button[iconCls=info]': {
                click: function(cmp) {
                    cmp.up('inlineexample').layout.setActiveItem(2);
                }
            },
            'classoverview': {
                resize: function() {
                    Ext.Array.each(Ext.ComponentQuery.query('.inlineexample'), function(c) {
                        if (c.codeEditor) {
                            c.doLayout();
                            c.codeEditor.refresh();
                        }
                    });
                },
                afterload: function() {
                    this.replaceExampleDivs();
                }
            },
            'gridpanel[cmpName=examplelist]': {
                itemclick: function(view, record, item, index, event) {
                    this.showExample(Ext.getCmp('inlineCodeExample'), record.data.location);
                }
            }
        });
    },

    activateTab: function(cmp, buttonCls) {
        Ext.Array.each(cmp.up('inlineexample').query('toolbar button'), function(b) {
            b.removeCls('active');
        });
        Ext.Array.each(cmp.up('inlineexample').query('toolbar button[iconCls=' + buttonCls + ']'), function(b) {
            b.addCls('active');
        });
    },

    showExample: function(inlineEg, exampleId, stripComments, updateHeight) {

        var self = this;

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

                    var activeItem = inlineEg.layout.getActiveItem();
                    if (activeItem.cmpName == 'preview') {
                        self.refreshPreview(inlineEg);
                    }

                    if (updateHeight) {
                        inlineEg.updateHeight();
                    }
                }
            });
        }
    },

    replaceExampleDivs: function() {
        var self = this;

        Ext.Array.each(Ext.query('.inlineExample'), function(inlineEg) {
            var egId = inlineEg.getAttribute('rel');
            var divId = inlineEg.getAttribute('id');
            var eg = Ext.create('Docs.view.examples.Inline', {
                height: 200,
                renderTo: divId,
                listeners: {
                    render: function() {
                        self.showExample(this, egId, true, true);
                    }
                }
            });
        });
    },

    refreshPreview: function(cmp) {
        document.getElementById('egIframe' + cmp.iframeId).contentWindow.refreshPage(cmp.codeEditor.getValue(), '');
    }

});