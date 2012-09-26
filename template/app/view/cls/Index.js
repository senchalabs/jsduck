/**
 * List of classes, grouped into categories.
 */
Ext.define('Docs.view.cls.Index', {
    extend: 'Ext.container.Container',
    alias: 'widget.classindex',
    requires: [
        'Docs.ContentGrabber',
        'Docs.CommentCounts'
    ],
    mixins: ['Docs.view.Scrolling'],
    cls: 'class-categories iScroll',
    margin: '15 10',
    autoScroll: true,

    initComponent: function() {
        this.tpl = new Ext.XTemplate(
            '<h1 class="top" style="padding-bottom: 10px">API Documentation</h1>',
            '<tpl if="notice">',
                '<div class="notice">{notice}</div>',
            '</tpl>',
            '{categories}'
        );
        this.data = {
            notice: Docs.ContentGrabber.get("notice-text"),
            categories: Docs.ContentGrabber.get("categories-content")
        };

        this.commentCountTpl = Ext.create('Ext.Template',
            '<span class="toggleMemberComments">{0}</span>'
        );

        this.callParent(arguments);
    },

    afterRender: function() {
        this.callParent(arguments);

        Docs.CommentCounts.afterLoaded(function() {
            this.getEl().select("a.docClass").each(function(a) {
                var className = a.getHTML();
                var count = Docs.CommentCounts.getClassTotal(className);
                if (count) {
                    this.commentCountTpl.append(a, [count]);
                }
            }, this);
        }, this);
    },

    /**
     * Returns tab config for classes page if at least one class.
     * @return {Object}
     */
    getTab: function() {
        var enabled = (Docs.data.classes || []).length > 0;
        return enabled ? {cls: 'classes', href: '#!/api', tooltip: 'API Documentation'} : false;
    }
});
