/**
 * Controller for both examples tab and inline examples.
 */
Ext.define('Docs.controller.Examples', {
    extend: 'Ext.app.Controller',

    init: function() {
        this.control({
            'inlineexample': {
                afterlayout: function(cmp) {
                    if (!cmp.codeEditor) {
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
                    this.activateTab(cmp, 'code');
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
                    this.showExample(Ext.getCmp('standAloneCodeExample'), record.data.location);
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
        // Works with Gists from GitHub
        if (exampleId.match(/^https:\/\/api\.github\.com/)) {
            Ext.data.JsonP.request({
                url: exampleId,
                success: function(json) {
                    inlineEg.codeEditor.setValue(json.data.files["basic_grid_panel.js"].content);
                    window.frames[inlineEg.getIframeId()].refreshPage(inlineEg.codeEditor.getValue(), '');
                },
                scope: this
            });
        }
        else {
            Ext.Ajax.request({
                method: 'GET',
                url: 'doc-resources/' + exampleId,
                headers: { 'Content-Type' : 'application/json' },
                success: function(response, opts) {
                    // Remove any trailing whitespace
                    var code = response.responseText.replace(/\s*$/, '');

                    // Remove comments
                    if (stripComments) {
                        code = code.replace(/\/\*\*[\s\S]*\*\/[\s\S]/, '');
                    }

                    inlineEg.codeEditor.setValue(code);

                    var activeItem = inlineEg.layout.getActiveItem();
                    if (activeItem.cmpName == 'preview') {
                        this.refreshPreview(inlineEg);
                    }

                    if (updateHeight) {
                        inlineEg.updateHeight();
                    }
                },
                scope: this
            });
        }
    },

    replaceExampleDivs: function() {
        Ext.Array.each(Ext.query('.inline-example'), function(inlineEg) {
            var egId = inlineEg.getAttribute('rel');
            var divId = inlineEg.getAttribute('id');
            Ext.create('Docs.view.examples.Inline', {
                height: 200,
                renderTo: divId,
                listeners: {
                    render: function(cmp) {
                        this.showExample(cmp, egId, true, true);
                    },
                    scope: this
                }
            });
        }, this);
    },

    refreshPreview: function(cmp) {
        document.getElementById(cmp.getIframeId()).contentWindow.refreshPage(cmp.codeEditor.getValue(), '');
    }

});