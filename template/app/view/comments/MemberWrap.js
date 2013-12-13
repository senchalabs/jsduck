/**
 * Wraps the element of class member documentation, rendering the
 * comments data inside it.
 */
Ext.define('Docs.view.comments.MemberWrap', {
    requires: [
        "Docs.Comments",
        "Docs.view.comments.Expander"
    ],

    /**
     * @cfg {Docs.view.cls.Overview} parent
     * The parent class Overview component.
     */

    /**
     * @cfg {Ext.Element/HTMLElement} el
     * The member element to wrap.
     */

    /**
     * @cfg {String} className
     * The name of the current class.
     */

    constructor: function(cfg) {
        Ext.apply(this, cfg);
        this.el = Ext.get(cfg.el);

        // The expander needs to reside inside some element.
        var expanderWrap = Ext.DomHelper.append(this.el.down('.long'), "<div></div>");
        var count = Docs.Comments.getCount(this.getTarget());

        this.expander = new Docs.view.comments.Expander({
            count: count,
            target: this.getTarget(),
            newCommentTitle: this.getNewCommentTitle(),
            renderTo: expanderWrap
        });

        this.updateSignatureCommentCount(count);
    },

    /**
     * Returns the comments target definition array.
     * @return {String[]}
     */
    getTarget: function() {
        if (!this.target) {
            this.target = ["class", this.getDefinedIn(), this.getMemberId()];
        }
        return this.target;
    },

    /**
     * Updates the comment count.
     * @param {Number} count
     */
    setCount: function(count) {
        this.expander.setCount(count);
        this.updateSignatureCommentCount(count);
    },

    // Updates the comment count in member signature.
    updateSignatureCommentCount: function(count) {
        var titleEl = this.el.down(".title");
        var titleComments = titleEl.down('.comment-counter-small');

        if (count > 0) {
            if (titleComments) {
                titleComments.update(""+count);
            }
            else {
                var el = Ext.DomHelper.append(titleEl, Docs.Comments.counterHtml(count), true);
                el.on("click", function() {
                    this.el.addCls("open");
                    this.expander.expand();
                    this.parent.scrollToEl(this.expander.getEl());
                }, this);
            }
        }
        else if (titleComments) {
            titleComments.remove();
        }
    },

    getNewCommentTitle: function() {
        if (this.getDefinedIn() !== this.className) {
            return [
                "<b>Be aware.</b> This comment will be posted to <b>" + this.getDefinedIn() + "</b> class, ",
                "from where this member is inherited from."
            ].join("");
        }
        else {
            return undefined;
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
