Ext.require([
    'Ext.Editor',
    'Ext.form.Panel',
    'Ext.form.field.ComboBox',
    'Ext.form.field.Date'
]);

Ext.onReady(function(){
    Ext.create('Ext.form.Panel', {
        renderTo: 'container',
        width: 700,
        height: 400,
        title: 'User Details',
        defaultType: 'textfield',
        bodyPadding: 10,
        defaults: {
            labelWidth: 100
        },
        items: [{
            fieldLabel: 'First Name',
            name: 'firstname'
        }, {
            fieldLabel: 'Middle Name',
            name: 'middlename'
        }, {
            fieldLabel: 'Last Name',
            name: 'lastname'
        }, {
            xtype: 'datefield',
            name: 'dob',
            fieldLabel: 'D.O.B'
        }],
        listeners: {
            afterrender: function(form){
                var cfg = {
                    shadow: false,
                    completeOnEnter: true,
                    cancelOnEsc: true,
                    updateEl: true,
                    ignoreNoChange: true
                }, height = form.child('textfield').getHeight();

                var labelEditor = Ext.create('Ext.Editor', Ext.apply({
                    autoSize: {
                        width: 'field'
                    },
                    height: height,
                    offsets: [0, (Ext.isIEQuirks ? 0 : 2)],
                    alignment: 'l-l',
                    listeners: {
                        beforecomplete: function(ed, value){
                            if (value.charAt(value.length - 1) != ':') {
                                ed.setValue(ed.getValue() + ':');
                            }
                            return true;
                        }
                    },
                    field: {
                        width: 100,
                        name: 'labelfield',
                        allowBlank: false,
                        xtype: 'textfield',
                        selectOnFocus: true,
                        maxLength: 20,
                        enforceMaxLength: true
                    }
                }, cfg));
                form.body.on('dblclick', function(e, t){
                    labelEditor.startEdit(t);
                    // Manually focus, since clicking on the label will focus the text field
                    labelEditor.field.focus(50, true);
                }, null, {
                    delegate: 'label.x-form-item-label'
                });

                var titleEditor = Ext.create('Ext.Editor', Ext.apply({
                    alignment: 'tl',
                    offsets: [0, -3],
                    field: {
                        width: 130,
                        xtype: 'combo',
                        editable: false,
                        forceSelection: true,
                        queryMode: 'local',
                        displayField: 'text',
                        valueField: 'text',
                        store: {
                            fields: ['text'],
                            data: [{
                                text: 'User Details'
                            },{
                                text: 'Developer Details'
                            },{
                                text: 'Manager Details'
                            }]
                        }
                    }
                }, cfg));

                form.header.titleCmp.textEl.on('dblclick', function(e, t){
                    titleEditor.startEdit(t);
                });
            }
        }
    });
});
