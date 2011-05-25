/**
 * Menu of history items.
 */
Ext.define('Docs.view.tree.HistoryItems', {
    extend: 'Ext.view.View',

    itemSelector: 'div.item',
    emptyText: 'No history',
    renderTo: Ext.getBody(),
    cls: 'hover-menu-menu show',

    tpl: new Ext.XTemplate(
        '<tpl for=".">',
            '<div class="item">',
                '<a href="#/api/{cls}" rel="{cls}" class="docClass">{cls}</a>',
                '<a class="close" href="#" rel="{cls}">x</a>',
            '</div>',
        '</tpl>'
    )
});
