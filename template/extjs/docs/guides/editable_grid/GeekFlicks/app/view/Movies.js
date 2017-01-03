Ext.define('GeekFlicks.view.Movies', {
    extend: 'Ext.grid.Panel',
    id: "movies_editor",
    alias: 'widget.movieseditor',
    store: 'Movies',
    initComponent: function () {
        //note: store removed 
        this.columns = [{
            header: 'Title',
            dataIndex: 'title',
            flex: 1
        }, {
            header: 'Year',
            dataIndex: 'year',
            flex: 1
        }];
        this.callParent(arguments);

    }
});
