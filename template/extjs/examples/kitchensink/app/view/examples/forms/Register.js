Ext.define('KitchenSink.view.examples.forms.Register', {
    extend: 'KitchenSink.view.examples.Example',
    requires: [
        'Ext.form.FieldSet',
        'Ext.form.Panel',
        'Ext.form.field.ComboBox',
        'Ext.form.field.Date',
        'Ext.form.field.Text',
        'KitchenSink.store.States'
    ],

    items: [{
        xtype: 'form',

        frame: true,
        title: 'Register',
        bodyPadding: 13,
        autoScroll:true,

        fieldDefaults: {
            labelAlign: 'right',
            labelWidth: 115,
            msgTarget: 'side'
        },

        items: [{
            xtype: 'fieldset',
            title: 'User Info',
            defaultType: 'textfield',
            defaults: {
                width: 300
            },
            items: [
                { allowBlank:false, fieldLabel: 'User ID', name: 'user', emptyText: 'user id' },
                { allowBlank:false, fieldLabel: 'Password', name: 'pass', emptyText: 'password', inputType: 'password' },
                { allowBlank:false, fieldLabel: 'Verify', name: 'pass', emptyText: 'password', inputType: 'password' }
            ]
        },
        {
            xtype: 'fieldset',
            title: 'Contact Information',
            defaultType: 'textfield',
            defaults: {
                width: 300
            },
            items: [{
                fieldLabel: 'First Name',
                emptyText: 'First Name',
                name: 'first'
            },
            {
                fieldLabel: 'Last Name',
                emptyText: 'Last Name',
                name: 'last'
            },
            {
                fieldLabel: 'Company',
                name: 'company'
            },
            {
                fieldLabel: 'Email',
                name: 'email',
                vtype: 'email'
            },
            {
                xtype: 'combobox',
                fieldLabel: 'State',
                name: 'state',
                store: Ext.create('KitchenSink.store.States'),
                valueField: 'abbr',
                displayField: 'state',
                typeAhead: true,
                queryMode: 'local',
                emptyText: 'Select a state...'
            },
            {
                xtype: 'datefield',
                fieldLabel: 'Date of Birth',
                name: 'dob',
                allowBlank: false,
                maxValue: new Date()
            }]
        }],

        buttons: [{
            text: 'Register',
            disabled: true,
            formBind: true
        }]

    }]
});
