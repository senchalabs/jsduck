/**
 * Wraps the element of class member documentation, providing methods
 * to expand and collapse the member.
 */
Ext.define('Docs.view.cls.MemberWrap', {
    /**
     * @cfg {Ext.Element/HTMLElement} el
     * The member element to wrap.
     */

    constructor: function(cfg) {
        Ext.apply(this, cfg);
        this.el = Ext.get(cfg.el);
    },

    /**
     * Expands of collapses the member.
     * @param {Boolean} expanded
     */
    setExpanded: function(expanded) {
        if (expanded) {
            if (!this.isExpanded()) {
                this.el.addCls('open');
            }
        }
        else {
            this.el.removeCls('open');
        }
    },

    /**
     * True when member is expanded.
     * @return {Boolean}
     */
    isExpanded: function() {
        return this.el.hasCls("open");
    },

    /**
     * Returns the class the wrapped member is defined in.
     * @return {String}
     */
    getDefinedIn: function() {
        return this.el.down('.meta .defined-in').getAttribute('rel');
    },

    /**
     * Returns the ID of the wrapped member.
     * @return {String}
     */
    getMemberId: function() {
        return this.el.getAttribute('id');
    }
});
