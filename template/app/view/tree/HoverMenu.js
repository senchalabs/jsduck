/**
 * Menu of history items.
 */
Ext.define('Docs.view.tree.HoverMenu', {
    extend: 'Ext.view.View',

    itemSelector: 'div.item',
    deferEmptyText: false,
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
