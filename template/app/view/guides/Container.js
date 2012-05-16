/**
 * The guide page.
 *
 * Renders the guide and print button.
 */
Ext.define('Docs.view.guides.Container', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.guidecontainer',
    componentCls: 'guide-container',
    mixins: ['Docs.view.Scrolling'],

    initComponent: function() {
        this.addEvents(
            /**
             * @event
             * Fired after guide loaded.
             */
            'afterload'
        );

        this.callParent(arguments);
    },

    /**
     * Scrolls the specified element into view
     *
     * @param {String} el  The element to scroll to.
     */
    scrollToEl: function(el) {
        this.scrollToView(el, {
            highlight: true,
            offset: -100
        });
    },

    /**
     * Loads guide into the page.
     * @param {Object} guide
     */
    load: function(guide) {
        this.tpl = this.tpl || new Ext.XTemplate(
            Docs.data.showPrintButton ? '<a class="print guide" href="?print=/guide/{name}" target="_blank">Print</a>' : '',
            '{content}'
        );

        this.update(this.tpl.apply(guide));
        Docs.Syntax.highlight(this.getEl());

        this.fireEvent('afterload');
    }
});
