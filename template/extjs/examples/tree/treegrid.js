Ext.Loader.setConfig({
    enabled: true
});Ext.Loader.setPath('Ext.ux', '../ux');

Ext.require([
    'Ext.data.*',
    'Ext.grid.*',
    'Ext.tree.*',
    'Ext.ux.CheckColumn'
]);

Ext.onReady(function() {
    Ext.QuickTips.init();

    //we want to setup a model and store instead of using dataUrl
    Ext.define('Task', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'task',     type: 'string'},
            {name: 'user',     type: 'string'},
            {name: 'duration', type: 'string'},
            {name: 'done',     type: 'boolean'}
        ]
    });

    var store = Ext.create('Ext.data.TreeStore', {
        model: 'Task',
        proxy: {
            type: 'ajax',
            //the store will get the content from the .json file
            url: 'treegrid.json'
        },
        folderSort: true
    });

    //Ext.ux.tree.TreeGrid is no longer a Ux. You can simply use a tree.TreePanel
    var tree = Ext.create('Ext.tree.Panel', {
        title: 'Core Team Projects',
        width: 500,
        height: 300,
        renderTo: Ext.getBody(),
        collapsible: true,
        useArrows: true,
        rootVisible: false,
        store: store,
        multiSelect: true,
        singleExpand: true,
        //the 'columns' property is now 'headers'
        columns: [{
            xtype: 'treecolumn', //this is so we know which column will show the tree
            text: 'Task',
            flex: 2,
            sortable: true,
            dataIndex: 'task'
        },{
            //we must use the templateheader component so we can use a custom tpl
            xtype: 'templatecolumn',
            text: 'Duration',
            flex: 1,
            sortable: true,
            dataIndex: 'duration',
            align: 'center',
            //add in the custom tpl for the rows
            tpl: Ext.create('Ext.XTemplate', '{duration:this.formatHours}', {
                formatHours: function(v) {
                    if (v < 1) {
                        return Math.round(v * 60) + ' mins';
                    } else if (Math.floor(v) !== v) {
                        var min = v - Math.floor(v);
                        return Math.floor(v) + 'h ' + Math.round(min * 60) + 'm';
                    } else {
                        return v + ' hour' + (v === 1 ? '' : 's');
                    }
                }
            })
        },{
            text: 'Assigned To',
            flex: 1,
            dataIndex: 'user',
            sortable: true
        }, {
            xtype: 'checkcolumn',
            header: 'Done',
            dataIndex: 'done',
            width: 40,
            stopSelection: false
        }, {
            text: 'Edit',
            width: 40,
            menuDisabled: true,
            xtype: 'actioncolumn',
            tooltip: 'Edit task',
            align: 'center',
            icon: '../simple-tasks/resources/images/edit_task.png',
            handler: function(grid, rowIndex, colIndex, actionItem, event, record, row) {
                Ext.Msg.alert('Editing' + (record.get('done') ? ' completed task' : '') , record.get('task'));
            }
        }]
    });
});
