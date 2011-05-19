Ext.define('Docs.view.search.Dropdown', {
    extend: 'Ext.view.View',
    alias: 'widget.searchdropdown',

    floating: 'true',
    autoShow: true,
    autoRender: true,
    toFrontOnShow: true,

    store: 'Search',

    id: 'quick-search',
    overItemCls:'x-view-over',
    trackOver: true,
    itemSelector:'div.item',
    singleSelect: true,

    tpl: new Ext.XTemplate(
        '<tpl for=".">',
            '<div class="item {type}">',
                '<div class="title">{member}</div>',
                '<div class="class">{cls}</div>',
            '</div>',
        '</tpl>'
    )
});
