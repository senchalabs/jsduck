/**
 * Controller for inline examples.
 */
Ext.define('Docs.controller.InlineExamples', {
    extend: 'Ext.app.Controller',

    init: function() {
        this.control({
            'inlineexample [cmpName=code]': {
                activate: function(cmp) {
                    this.activateTab(cmp, 'code');
                    var editor = cmp.up('inlineexample').editor;
                    // Weird bug on CodeMirror requires 2 refreshes...
                    editor.refresh();
                    editor.refresh();
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
                    cmp.up('inlineexample').showPreview();
                }
            },
            'inlineexample toolbar button[iconCls=copy]': {
                click: function(cmp) {
                    cmp.up('inlineexample').showCode();
                    cmp.up('inlineexample').editor.selectAll();
                }
            },
            'classoverview': {
                resize: this.createResizer('.class-overview'),
                afterload: this.replaceExampleDivs
            },
            'guidecontainer': {
                resize: this.createResizer('.guide-container'),
                afterload: this.replaceExampleDivs
            }
        });
    },

    // Creates function to resize examples inside a specified container
    createResizer: function(container) {
        return function() {
            Ext.Array.each(Ext.ComponentQuery.query(container + ' .inlineexample'), function(c) {
                if (c.editor && c.isVisible()) {
                    c.doLayout();
                    c.editor.refresh();
                }
            });
        };
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
            // Strip tags and replace HTML entities with their values
            var code = Ext.String.htmlDecode(Ext.util.Format.stripTags(inlineEg.innerHTML));
            var options = {};
            Ext.Array.forEach(inlineEg.className.split(/ +/), function(cls) {
                if (cls === "phone" || cls === "miniphone" || cls === "tablet") {
                    options.device = cls;
                }
                else if (cls === "ladscape" || cls === "portrait") {
                    options.orientation = cls;
                }
                else {
                    options[cls] = true;
                }
            });
            var div = document.createElement("div");
            inlineEg.parentNode.replaceChild(div, inlineEg);
            // Then render the example component inside the div
            var eg = Ext.create('Docs.view.examples.Inline', {
                height: 200,
                renderTo: div,
                value: code,
                options: options
            });
        }, this);
    }
});
