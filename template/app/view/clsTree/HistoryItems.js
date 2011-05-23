/**
 * Menu of history items.
 */
Ext.define('Docs.view.clsTree.HistoryItems', {
    extend: 'Ext.view.View',

    itemSelector: 'div.a',
    emptyText: 'No history',
    renderTo: Ext.getBody(),
    cls: 'hover-menu-menu show',

    tpl: new Ext.XTemplate(
        '<tpl for=".">',
            '<div class="item">',
                '<a href="{cls}" rel="{cls}" class="docClass">{cls}</a>',
                '<a class="close" href="#" rel="{cls}">x</a>',
            '</div>',
        '</tpl>'
    )
});
