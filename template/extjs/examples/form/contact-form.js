Ext.require([
    'Ext.form.*',
    'Ext.tip.QuickTipManager'
]);

Ext.onReady(function() {

    var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';
    var win;

    Ext.QuickTips.init();

    function showContactForm() {
        if (!win) {
            var form = Ext.widget('form', {
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                border: false,
                bodyPadding: 10,

                fieldDefaults: {
                    labelAlign: 'top',
                    labelWidth: 100,
                    labelStyle: 'font-weight:bold'
                },
                items: [{
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Your Name',
                    labelStyle: 'font-weight:bold;padding:0',
                    layout: 'hbox',
                    defaultType: 'textfield',

                    fieldDefaults: {
                        labelAlign: 'top'
                    },

                    items: [{
                        flex: 1,
                        name: 'firstName',
                        afterLabelTextTpl: required,
                        fieldLabel: 'First',
                        allowBlank: false
                    }, {
                        width: 30,
                        name: 'middleInitial',
                        fieldLabel: 'MI',
                        margins: '0 0 0 5'
                    }, {
                        flex: 2,
                        name: 'lastName',
                        afterLabelTextTpl: required,
                        fieldLabel: 'Last',
                        allowBlank: false,
                        margins: '0 0 0 5'
                    }]
                }, {
                    xtype: 'textfield',
                    fieldLabel: 'Your Email Address',
                    afterLabelTextTpl: required,
                    vtype: 'email',
                    allowBlank: false
                }, {
                    xtype: 'textfield',
                    fieldLabel: 'Subject',
                    afterLabelTextTpl: required,
                    allowBlank: false
                }, {
                    xtype: 'textareafield',
                    fieldLabel: 'Message',
                    labelAlign: 'top',
                    flex: 1,
                    margins: '0',
                    afterLabelTextTpl: required,
                    allowBlank: false
                }],

                buttons: [{
                    text: 'Cancel',
                    handler: function() {
                        this.up('form').getForm().reset();
                        this.up('window').hide();
                    }
                }, {
                    text: 'Send',
                    handler: function() {
                        if (this.up('form').getForm().isValid()) {
                            // In a real application, this would submit the form to the configured url
                            // this.up('form').getForm().submit();
                            this.up('form').getForm().reset();
                            this.up('window').hide();
                            Ext.MessageBox.alert('Thank you!', 'Your inquiry has been sent. We will respond as soon as possible.');
                        }
                    }
                }]
            });

            win = Ext.widget('window', {
                title: 'Contact Us',
                closeAction: 'hide',
                width: 400,
                height: 400,
                layout: 'fit',
                resizable: true,
                modal: true,
                items: form
            });
        }
        win.show();
    }

    var mainPanel = Ext.widget('panel', {
        renderTo: Ext.getBody(),
        title: 'Welcome!',
        width: 500,
        bodyPadding: 20,

        items: [{
            xtype: 'component',
            html: 'Thank you for visiting our site! We welcome your feedback; please click the button below to ' +
                  'send us a message. We will respond to your inquiry as quickly as possible.',
            style: 'margin-bottom: 20px;'
        }, {
            xtype: 'container',
            style: 'text-align:center',
            items: [{
                xtype: 'button',
                cls: 'contactBtn',
                scale: 'large',
                text: 'Contact Us',
                handler: showContactForm
            }]
        }]
    });

});