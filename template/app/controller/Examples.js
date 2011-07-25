/**
 * Controller for inline examples.
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
                activate: function(cmp) {
                    this.activateTab(cmp, 'preview');
                }
            },
            'inlineexample toolbar button[iconCls=code]': {
                click: function(cmp) {
                    cmp.up('inlineexample').showCode();
                }
            },
            'inlineexample toolbar button[iconCls=preview]': {
                click: function(cmp) {
                    cmp.up('inlineexample').showPreview(function() {
                        this.refreshPreview(cmp.up('inlineexample'));
                    }, this);
                }
            },
            'inlineexample toolbar button[iconCls=copy]': {
                click: function(cmp) {
                    var editor = cmp.up('inlineexample').codeEditor;
                    var lastLine = editor.lineCount() - 1;
                    var lastCh = editor.getLine(lastLine).length;
                    editor.setSelection({line: 0, ch: 0}, {line: lastLine, ch: lastCh});
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

    replaceExampleDivs: function() {
        Ext.Array.each(Ext.query('.inline-example'), function(inlineEg) {
            // Grab code from <pre> element and replace it with new empty <div>
            var code = inlineEg.innerText;
            var div = document.createElement("div");
            inlineEg.parentNode.replaceChild(div, inlineEg);
            // Then render the example component inside the div
            var eg = Ext.create('Docs.view.examples.Inline', {
                height: 200,
                renderTo: div,
                listeners: {
                    afterrender: function(cmp) {
                        this.updateExample(cmp, code);
                    },
                    scope: this
                }
            });
        }, this);
    },

    // Updates code inside example component
    updateExample: function(example, code) {
        example.codeEditor.setValue(code);
        var activeItem = example.layout.getActiveItem();
        if (activeItem.cmpName == 'preview') {
            this.refreshPreview(example);
        }
        example.updateHeight();
    },

    // Refreshes the preview of example
    refreshPreview: function(example) {
        var iframe = document.getElementById(example.getIframeId());
        iframe.contentWindow.refreshPage(example.codeEditor.getValue(), '');
    }

});