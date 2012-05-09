/**
 * A mixin that adds various scrolling methods to panel.
 */
Ext.define('Docs.view.PanelScrolling', {
    /**
     * Scrolls the specified element into view
     *
     * @param {String/HTMLElement/Ext.Element} el  The element to scroll to.
     * @param {Object} [opts]  Additional options:
     * @param {Number} opts.offset  Additional amount to scroll more or less
     * @param {Boolean} opts.highlight  True to also highlight the element.
     */
    scrollToView: function(el, opts) {
        el = Ext.get(el);
        opts = opts || {};
        if (el) {
            this.setScrollTop(this.getScrollTop() + el.getY() + (opts.offset || 0));
            opts.highlight && el.highlight();
        }
    },

    /**
     * Returns the amount of vertical scroll.
     * @return {Number}
     */
    getScrollTop: function() {
        return this.body.getScroll()['top'];
    },

    /**
     * Scrolls vertically to given offset.
     * @param {Number} offset
     */
    setScrollTop: function(offset) {
        return this.body.scrollTo('top', offset);
    },

    /**
     * Scrolls panel to the top
     */
    scrollToTop: function() {
        this.body.scrollTo('top');
    }
});
