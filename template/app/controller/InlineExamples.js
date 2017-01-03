/**
 * Controller for inline examples.
 */
Ext.define('Docs.controller.InlineExamples', {
    extend: 'Ext.app.Controller',
    requires: [
        'Docs.view.examples.InlineWrap'
    ],

    init: function() {
        this.control({
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
                }
            });
        };
    },

    replaceExampleDivs: function() {
        Ext.Array.each(Ext.query('.inline-example'), function(pre) {
            Ext.create("Docs.view.examples.InlineWrap", pre);
        }, this);
    }

});
