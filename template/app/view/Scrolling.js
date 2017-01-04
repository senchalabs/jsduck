/**
 * A mixin that adds various scrolling methods to panel or container.
 *
 * It monitors the scrolling and remembers scrolling amount in current
 * context, allowing the scroll amount to be restored afterwards.
 */
Ext.define('Docs.view.Scrolling', {
    // Inject call fo #initScrolling into initComponent into class
    // that uses this mixin
    onClassMixedIn: function(owner) {
        Ext.Function.interceptBefore(owner.prototype, "initComponent", this.prototype.initScrolling);
    },

    // Initializes scroll state saving.
    initScrolling: function() {
        this.scrollContext = 'index';
        this.scrollState = {};

        this.on("afterrender", function() {
            this.getScrollEl().addListener('scroll', this.saveScrollState, this);
        }, this);
    },

    /**
     * Sets the current scrolling context for saving scroll state.
     *
     * @param {String} ctx A name for the context.
     */
    setScrollContext: function(ctx) {
        this.scrollContext = ctx;
    },

    /**
     * Erases data about the given scrolling context.
     *
     * @param {String} ctx A name for the context.
     */
    eraseScrollContext: function(ctx) {
        delete this.scrollState[ctx];
    },

    /**
     * Saves the scroll state in current context.
     *
     * This is automatically called every time the container is scrolled.
     */
    saveScrollState: function() {
        this.scrollState[this.scrollContext] = this.getScrollTop();
    },

    /**
     * Restores scroll state in current context.
     */
    restoreScrollState: function() {
        this.setScrollTop(this.scrollState[this.scrollContext] || 0);
    },

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
        return this.getScrollEl().getScroll()['top'];
    },

    /**
     * Scrolls vertically to given offset.
     * @param {Number} offset
     */
    setScrollTop: function(offset) {
        return this.getScrollEl().scrollTo('top', offset);
    },

    /**
     * Scrolls panel to the top
     */
    scrollToTop: function() {
        this.getScrollEl().scrollTo('top');
    },

    // helper to make the mixin work with both Panel and Container.
    getScrollEl: function() {
        return this.body || this.el;
    }
});
