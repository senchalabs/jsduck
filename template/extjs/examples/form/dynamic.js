Ext.require([
    //'Ext.form.*',
    //'Ext.layout.container.Column',
    //'Ext.tab.Panel'
    '*'
]);

Ext.onReady(function() {
    Ext.QuickTips.init();

    var bd = Ext.getBody();

    /*
     * ================  Simple form  =======================
     */
    bd.createChild({tag: 'h2', html: 'Form 1 - Very Simple'});

    var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

    var simple = Ext.widget({
        xtype: 'form',
        layout: 'form',
        collapsible: true,
        id: 'simpleForm',
        url: 'save-form.php',
        frame: true,
        title: 'Simple Form',
        bodyPadding: '5 5 0',
        width: 350,
        fieldDefaults: {
            msgTarget: 'side',
            labelWidth: 75
        },
        defaultType: 'textfield',
        items: [{
            fieldLabel: 'First Name',
            afterLabelTextTpl: required,
            name: 'first',
            allowBlank: false
        },{
            fieldLabel: 'Last Name',
            afterLabelTextTpl: required,
            name: 'last',
            allowBlank: false
        },{
            fieldLabel: 'Company',
            name: 'company'
        }, {
            fieldLabel: 'Email',
            afterLabelTextTpl: required,
            name: 'email',
            allowBlank: false,
            vtype:'email'
        }, {
            fieldLabel: 'DOB',
            name: 'dob',
            xtype: 'datefield'
        }, {
            fieldLabel: 'Age',
            name: 'age',
            xtype: 'numberfield',
            minValue: 0,
            maxValue: 100
        }, {
            xtype: 'timefield',
            fieldLabel: 'Time',
            name: 'time',
            minValue: '8:00am',
            maxValue: '6:00pm'
        }],

        buttons: [{
            text: 'Save',
            handler: function() {
                this.up('form').getForm().isValid();
            }
        },{
            text: 'Cancel',
            handler: function() {
                this.up('form').getForm().reset();
            }
        }]
    });

    simple.render(document.body);


    /*
     * ================  Form 2  =======================
     */
    bd.createChild({tag: 'h2', html: 'Form 2 - Adding fieldsets'});

    var fsf = Ext.widget({
        xtype: 'form',
        id: 'fieldSetForm',
        collapsible: true,
        url: 'save-form.php',
        frame: true,
        title: 'Simple Form with FieldSets',
        bodyPadding: '5 5 0',
        width: 350,
        fieldDefaults: {
            msgTarget: 'side',
            labelWidth: 75
        },
        defaults: {
            anchor: '100%'
        },

        items: [{
            xtype:'fieldset',
            checkboxToggle:true,
            title: 'User Information',
            defaultType: 'textfield',
            collapsed: true,
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },
            items :[{
                fieldLabel: 'First Name',
                afterLabelTextTpl: required,
                name: 'first',
                allowBlank:false
            },{
                fieldLabel: 'Last Name',
                afterLabelTextTpl: required,
                name: 'last'
            },{
                fieldLabel: 'Company',
                name: 'company'
            }, {
                fieldLabel: 'Email',
                afterLabelTextTpl: required,
                name: 'email',
                vtype:'email'
            }]
        },{
            xtype:'fieldset',
            title: 'Phone Number',
            collapsible: true,
            defaultType: 'textfield',
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },
            items :[{
                fieldLabel: 'Home',
                name: 'home',
                value: '(888) 555-1212'
            },{
                fieldLabel: 'Business',
                name: 'business'
            },{
                fieldLabel: 'Mobile',
                name: 'mobile'
            },{
                fieldLabel: 'Fax',
                name: 'fax'
            }]
        }],

        buttons: [{
            text: 'Save'
        },{
            text: 'Cancel'
        }]
    });

    fsf.render(document.body);

    /*
     * ================  Form 3  =======================
     */
    bd.createChild({tag: 'h2', html: 'Form 3 - A little more complex'});


    var top = Ext.widget({
        xtype: 'form',
        id: 'multiColumnForm',
        collapsible: true,
        frame: true,
        title: 'Multi Column, Nested Layouts and Anchoring',
        bodyPadding: '5 5 0',
        width: 600,
        fieldDefaults: {
            labelAlign: 'top',
            msgTarget: 'side'
        },

        items: [{
            xtype: 'container',
            anchor: '100%',
            layout: 'hbox',
            items:[{
                xtype: 'container',
                flex: 1,
                layout: 'anchor',
                items: [{
                    xtype:'textfield',
                    fieldLabel: 'First Name',
                    afterLabelTextTpl: required,
                    allowBlank: false,
                    name: 'first',
                    anchor:'95%',
                    value: 'Don'
                }, {
                    xtype:'textfield',
                    fieldLabel: 'Company',
                    name: 'company',
                    anchor:'95%'
                }]
            },{
                xtype: 'container',
                flex: 1,
                layout: 'anchor',
                items: [{
                    xtype:'textfield',
                    fieldLabel: 'Last Name',
                    afterLabelTextTpl: required,
                    allowBlank: false,
                    name: 'last',
                    anchor:'100%',
                    value: 'Griffin'
                },{
                    xtype:'textfield',
                    fieldLabel: 'Email',
                    afterLabelTextTpl: required,
                    allowBlank: false,
                    name: 'email',
                    vtype:'email',
                    anchor:'100%'
                }]
            }]
        }, {
            xtype: 'htmleditor',
            name: 'bio',
            fieldLabel: 'Biography',
            height: 200,
            anchor: '100%'
        }],

        buttons: [{
            text: 'Save',
            handler: function() {
                this.up('form').getForm().isValid();
            }
        },{
            text: 'Cancel',
            handler: function() {
                this.up('form').getForm().reset();
            }
        }]
    });

    top.render(document.body);


    /*
     * ================  Form 4  =======================
     */
    bd.createChild({tag: 'h2', html: 'Form 4 - Forms can be a TabPanel...'});

    var tabs = Ext.widget({
        xtype: 'form',
        id: 'tabForm',
        width: 350,
        border: false,
        bodyBorder: false,
        fieldDefaults: {
            labelWidth: 75,
            msgTarget: 'side'
        },
        items: {
            xtype:'tabpanel',
            activeTab: 0,
            defaults:{
                bodyPadding: 10,
                layout: 'anchor'
            },

            items:[{
                title:'Personal Details',
                defaultType: 'textfield',
                defaults: {
                    anchor: '100%'
                },
                items: [{
                    fieldLabel: 'First Name',
                    name: 'first',
                    afterLabelTextTpl: required,
                    allowBlank: false,
                    value: 'Ed'
                },{
                    fieldLabel: 'Last Name',
                    afterLabelTextTpl: required,
                    allowBlank: false,
                    name: 'last',
                    value: 'Spencer'
                },{
                    fieldLabel: 'Company',
                    name: 'company',
                    value: 'Ext JS'
                }, {
                    fieldLabel: 'Email',
                    afterLabelTextTpl: required,
                    allowBlank: false,
                    name: 'email',
                    vtype:'email'
                }]
            },{
                title: 'Phone Numbers',
                defaultType: 'textfield',
                defaults: {
                    anchor: '100%'
                },
                items: [{
                    fieldLabel: 'Home',
                    name: 'home',
                    value: '(888) 555-1212'
                },{
                    fieldLabel: 'Business',
                    name: 'business'
                },{
                    fieldLabel: 'Mobile',
                    name: 'mobile'
                },{
                    fieldLabel: 'Fax',
                    name: 'fax'
                }]
            }]
        },

        buttons: [{
            text: 'Save',
            handler: function() {
                this.up('form').getForm().isValid();
            }
        },{
            text: 'Cancel',
            handler: function() {
                this.up('form').getForm().reset();
            }
        }]
    });

    tabs.render(document.body);



    /*
     * ================  Form 5  =======================
     */
    bd.createChild({tag: 'h2', html: 'Form 5 - ... and forms can contain TabPanel(s)'});

    var tab2 = Ext.widget({
        title: 'Inner Tabs',
        xtype: 'form',
        id: 'innerTabsForm',
        collapsible: true,
        bodyPadding: 5,
        width: 600,
        fieldDefaults: {
            labelAlign: 'top',
            msgTarget: 'side'
        },
        defaults: {
            anchor: '100%'
        },

        items: [{
            xtype: 'container',
            layout:'hbox',
            items:[{
                xtype: 'container',
                flex: 1,
                border:false,
                layout: 'anchor',
                defaultType: 'textfield',
                items: [{
                    fieldLabel: 'First Name',
                    afterLabelTextTpl: required,
                    allowBlank: false,
                    name: 'first',
                    anchor:'95%'
                }, {
                    fieldLabel: 'Company',
                    name: 'company',
                    anchor:'95%'
                }]
            },{
                xtype: 'container',
                flex: 1,
                layout: 'anchor',
                defaultType: 'textfield',
                items: [{
                    fieldLabel: 'Last Name',
                    afterLabelTextTpl: required,
                    allowBlank: false,
                    name: 'last',
                    anchor:'95%'
                },{
                    fieldLabel: 'Email',
                    afterLabelTextTpl: required,
                    allowBlank: false,
                    name: 'email',
                    vtype:'email',
                    anchor:'95%'
                }]
            }]
        },{
            xtype:'tabpanel',
            plain:true,
            activeTab: 0,
            height:235,
            defaults:{
                bodyPadding: 10
            },
            items:[{
                title:'Personal Details',
                defaults: {
                    width: 230
                },
                defaultType: 'textfield',

                items: [{
                    fieldLabel: 'First Name',
                    name: 'first',
                    value: 'Jamie'
                },{
                    fieldLabel: 'Last Name',
                    name: 'last',
                    value: 'Avins'
                },{
                    fieldLabel: 'Company',
                    name: 'company',
                    value: 'Ext JS'
                }, {
                    fieldLabel: 'Email',
                    name: 'email',
                    vtype:'email'
                }]
            },{
                title:'Phone Numbers',
                defaults: {
                    width: 230
                },
                defaultType: 'textfield',

                items: [{
                    fieldLabel: 'Home',
                    name: 'home',
                    value: '(888) 555-1212'
                },{
                    fieldLabel: 'Business',
                    name: 'business'
                },{
                    fieldLabel: 'Mobile',
                    name: 'mobile'
                },{
                    fieldLabel: 'Fax',
                    name: 'fax'
                }]
            },{
                cls: 'x-plain',
                title: 'Biography',
                layout: 'fit',
                items: {
                    xtype: 'htmleditor',
                    name: 'bio2',
                    fieldLabel: 'Biography'
                }
            }]
        }],

        buttons: [{
            text: 'Save',
            handler: function() {
                this.up('form').getForm().isValid();
            }
        },{
            text: 'Cancel',
            handler: function() {
                this.up('form').getForm().reset();
            }
        }]
    });

    tab2.render(document.body);
});
