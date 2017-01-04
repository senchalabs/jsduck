Ext.require(['Ext.window.Window', 'Ext.toolbar.Toolbar', 'Ext.menu.ColorPicker', 'Ext.form.field.Date']);
Ext.onReady(function(){

    var handleAction = function(action){
        Ext.example.msg('<b>Action</b>', 'You clicked "' + action + '"');
    };

    var colorMenu = Ext.create('Ext.menu.ColorPicker', {
        handler: function(cm, color){
            Ext.example.msg('Color Selected', '<span style="color:#' + color + ';">You choose {0}.</span>', color);
        }
    });

    Ext.create('Ext.window.Window', {
        title: 'Standard',
        closable: false,
        height:250,
        width: 500,
        bodyStyle: 'padding:10px',
        contentEl: 'content',
        autoScroll: true,
        tbar: Ext.create('Ext.toolbar.Toolbar', {
            layout: {
                overflowHandler: 'Menu'
            },
            items: [{
                xtype:'splitbutton',
                text: 'Menu Button',
                iconCls: 'add16',
                handler: Ext.Function.pass(handleAction, 'Menu Button'),
                menu: [{text: 'Menu Item 1', handler: Ext.Function.pass(handleAction, 'Menu Item 1')}]
            },'-',{
                xtype:'splitbutton',
                text: 'Cut',
                iconCls: 'add16',
                handler: Ext.Function.pass(handleAction, 'Cut'),
                menu: [{text: 'Cut menu', handler: Ext.Function.pass(handleAction, 'Cut menu')}]
            },{
                text: 'Copy',
                iconCls: 'add16',
                handler: Ext.Function.pass(handleAction, 'Copy')
            },{
                text: 'Paste',
                iconCls: 'add16',
                menu: [{text: 'Paste menu', handler: Ext.Function.pass(handleAction, 'Paste menu')}]
            },'-',{
                text: 'Format',
                iconCls: 'add16',
                handler: Ext.Function.pass(handleAction, 'Format')
            },'->', {
                fieldLabel: 'Action',
                labelAlign: 'right',
                labelWidth: 70,
                width: 180,
                xtype: 'datefield',
                listeners: {
                    change: function(d, newVal, oldVal) {
                        Ext.example.msg('<b>Action date</b>', 'You picked ' + Ext.Date.format(newVal, d.format));
                    }
                }
            }, {
                text: 'Released',
                iconCls: 'add16',
                enableToggle: true,
                toggleHandler: function(button, pressed) {
                    Ext.example.msg('<b>Action</b>', 'Right ToggleButton ' + (pressed ? 'Pressed' : 'Released'));
                    button.setText(pressed ? 'Pressed' : 'Released')
                }
            }, {
                text: 'Choose a Color',
                menu: colorMenu // <-- submenu by reference
            }]
        })
    }).show();
});
