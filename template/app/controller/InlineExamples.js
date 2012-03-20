/**
 * Controller for inline examples.
 */
Ext.define('Docs.controller.InlineExamples', {
    extend: 'Ext.app.Controller',
    requires: [
        'Docs.view.examples.InlineWrap'
    ],

    init: function() {
        this.addEvents(
            /**
             * @event
             * Fired after example divs have been replaced with InlineWrap components.
             */
            'afterreplaceexamples'
        );

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
                    c.editor.refresh();
                }
            });
        };
    },

    replaceExampleDivs: function() {
        var inlineWraps = [];
        Ext.Array.each(Ext.query('.inline-example'), function(pre) {
            inlineWraps.push(Ext.create("Docs.view.examples.InlineWrap", pre));
        }, this);
        this.fireEvent('afterreplaceexamples', inlineWraps);
    }

});
