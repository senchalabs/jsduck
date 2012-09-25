/**
 * Wraps the element of class member documentation, rendering the
 * comments data inside it.
 */
Ext.define('Docs.view.comments.MemberWrap', {
    tpl: Ext.create("Ext.XTemplate", '<span class="toggleMemberComments">{0}</span>'),

    /**
     * @cfg {Ext.Element/HTMLElement} el
     * The member element to wrap.
     */

    /**
     * @cfg {String} className
     * The name of the current class.
     */

    /**
     * @cfg {Number} count
     * The comment count of the member.
     */

    constructor: function(cfg) {
        Ext.apply(this, cfg);
        this.el = Ext.get(cfg.el);

        // The expander needs to reside inside some element.
        var expanderWrap = Ext.DomHelper.append(this.el.down('.long'), "<div></div>");

        this.expander = new Docs.view.comments.Expander({
            num: this.num,
            className: this.className,
            memberId: this.getMemberId(),
            renderTo: expanderWrap
        });
    },

    /**
     * Updates the comment count.
     * @param {Number} count
     */
    setCount: function(count) {
        this.expander.setCount(count);

        var titleEl = this.el.down(".title");
        var titleComments = titleEl.down('.toggleMemberComments');

        if (count > 0) {
            if (titleComments) {
                titleComments.update(""+count);
            }
            else {
                this.tpl.append(titleEl, [count]);
            }
        }
        else if (titleComments) {
            titleComments.remove();
        }
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
