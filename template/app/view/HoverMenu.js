/**
 * Menu shown by {@link Docs.view.HoverMenuButton}.
 */
Ext.define('Docs.view.HoverMenu', {
    extend: 'Ext.view.View',
    requires: [
        'Docs.Comments',
        'Docs.view.Signature'
    ],

    alias: 'widget.hovermenu',
    componentCls: 'hover-menu',
    itemSelector: 'div.item',
    deferEmptyText: false,

    /**
     * @cfg {Number} colHeight  maximum number of items in one column.
     * When more than that, items are placed into multiple columns.
     */
    columnHeight: 25,

    initComponent: function() {
        this.renderTo = Ext.getBody();

        this.tpl = new Ext.XTemplate(
            '<table>',
            '<tr>',
                '<td>',
                '<tpl for=".">',
                    '<div class="item">',
                        '{[this.renderLink(values)]}',
                    '</div>',
                    // Start new column when columnHeight reached
                    '<tpl if="xindex % this.columnHeight === 0 && xcount &gt; xindex">',
                        '</td><td>',
                    '</tpl>',
                '</tpl>',
                '</td>',
            '</tr>',
            '</table>',
            {
                columnHeight: this.columnHeight,

                renderLink: function(values) {
                    var tags = Docs.view.Signature.render(values.meta);
                    var cnt = Docs.Comments.counterHtml(values.commentCount);
                    return Ext.String.format('<a href="#!/api/{0}" rel="{0}" class="docClass">{1} {2} {3}</a>', values.url, values.label, tags, cnt);
                }
            }
        );

        this.callParent();
    }
});
