/**
 * The Expander with a h3 heading "Comments".
 */
Ext.define('Docs.view.comments.LargeExpander', {
    requires: [
        "Docs.Comments",
        "Docs.view.comments.Expander"
    ],

    html: [
        '<div class="comments-section">',
            '<h3 class="members-title icon-comment">Comments</h3>',
            '<div></div>',
        '</div>'
    ].join(""),

    /**
     * @cfg {Ext.Element/HTMLElement} el
     * The member element to wrap.
     */

    /**
     * @cfg {String} type
     * One of: "class", "guide", "video".
     */
    type: "class",

    /**
     * @cfg {String} name
     * The name of the current class, guide or video.
     */

    constructor: function(cfg) {
        Ext.apply(this, cfg);
        this.el = Ext.get(cfg.el);

        // The expander needs to reside inside some element.
        var expanderWrap = Ext.DomHelper.append(this.el, this.html, true).down("div");

        this.expander = new Docs.view.comments.Expander({
            count: Docs.Comments.getCount(this.type, this.name),
            type: this.type,
            className: this.name,
            renderTo: expanderWrap
        });
    },

    /**
     * Access the embedded Expander element.
     * @return {Docs.view.comments.Expander}
     */
    getExpander: function() {
        return this.expander;
    }

});
