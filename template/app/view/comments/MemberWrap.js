/**
 * Wraps the element of class member documentation, rendering the
 * comments data inside it.
 */
Ext.define('Docs.view.comments.MemberWrap', {
    extend: 'Docs.view.cls.MemberWrap',
    requires: [
        "Docs.Comments",
        "Docs.view.comments.Expander"
    ],

    /**
     * @cfg {Docs.view.cls.Overview} parent
     * The parent class Overview component.
     */

    /**
     * @cfg {String} className
     * The name of the current class.
     */

    constructor: function(cfg) {
        this.callParent([cfg]);

        var count = Docs.Comments.getCount(this.getTarget());
        if (count > 0) {
            this.updateSignatureCommentCount(count);
        }
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
     * Returns the actual expander component, which it gets created
     * when this function is called for the first time.
     */
    getExpander: function() {
        if (!this.expander) {
            // The expander needs to reside inside some element.
            var expanderWrap = Ext.DomHelper.append(this.el.down('.long'), "<div></div>");

            this.expander = new Docs.view.comments.Expander({
                count: Docs.Comments.getCount(this.getTarget()),
                target: this.getTarget(),
                newCommentTitle: this.getNewCommentTitle(),
                renderTo: expanderWrap
            });
        }
        return this.expander;
    },

    /**
     * Updates the comment count.
     * @param {Number} count
     */
    setCount: function(count) {
        this.getExpander().setCount(count);
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
                    this.getExpander().expand();
                    this.parent.scrollToEl(this.getExpander().getEl());
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
                "<b>Be aware.</b> This member is inherited from <b>" + this.getDefinedIn() + "</b>; ",
                "comments posted here will also be posted to that page."
            ].join("");
        }
        else {
            return undefined;
        }
    },

    /**
     * Expands of collapses the member.
     * @param {Boolean} expanded
     */
    setExpanded: function(expanded) {
        this.callParent([expanded]);

        if (expanded) {
            // Initialize the expander.
            this.getExpander().show();
        }
    }

});
