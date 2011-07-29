Ext.define('Docs.controller.Tabs', {
    extend: 'Ext.app.Controller',

    init: function() {
        this.control({
            'container [componentCls=doctabs]': {
                afterrender: function(cmp) {
                    cmp.el.addListener('mouseover', function(event, el) {
                        Ext.get(el).addCls('ovr');
                    }, this, {
                        delegate: '.icn'
                    });
                    cmp.el.addListener('mouseout', function(event, el) {
                        Ext.get(el).removeCls('ovr');
                    }, this, {
                        delegate: '.icn'
                    });
                    cmp.el.addListener('click', function(evt, el) {
                        cmp.justClosed = true;
                        var docTab = Ext.get(el).up('.doctab');
                        docTab.animate({
                            to: { top: 30 }
                        }).animate({
                            to: { width: 10 },
                            listeners: {
                                afteranimate: function() {
                                    Ext.getCmp('doctabs').removeTab(docTab.down('.docClass').getAttribute('href'));
                                    docTab.remove();
                                },
                                scope: this
                            }
                        });
                    }, this, {
                        delegate: '.icn',
                        preventDefault: true
                    });

                    cmp.el.addListener('click', function(event, el) {
                        if (cmp.justClosed) {
                            cmp.justClosed = false;
                            return;
                        }
                        Ext.Array.each(Ext.get(el).up('.doctabs').query('.doctab'), function(t) {
                            Ext.get(t).removeCls('active');
                        });
                        Ext.get(el).addCls('active');
                    }, this, {
                        delegate: '.doctab'
                    });

                    cmp.el.addListener('mouseover', function(event, el) {
                        var icn = Ext.get(el).down('.icn');
                        if (icn) {
                            icn.addCls('close');
                        }
                    }, this, {
                        delegate: '.doctab'
                    });
                    cmp.el.addListener('mouseout', function(event, el) {
                        var icn = Ext.get(el).down('.icn');
                        if (icn) {
                            icn.removeCls('close');
                        }
                    }, this, {
                        delegate: '.doctab'
                    });
                }
            }
        });
    }

});
