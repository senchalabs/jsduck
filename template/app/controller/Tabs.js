Ext.define('Docs.controller.Tabs', {
    extend: 'Ext.app.Controller',

    init: function() {
        this.control({
            'container [componentCls=doctabs]': {
                afterrender: function(cmp) {
                    cmp.el.addListener('click', function(event, el) {
                        Ext.Array.each(Ext.get(el).up('.doctabs').query('.doctab'), function(t) {
                            Ext.get(t).removeCls('active');
                        });
                        Ext.get(el).addCls('active')
                    }, this, {
                        delegate: '.doctab'
                    });
                }
            }
        });
    }

});
