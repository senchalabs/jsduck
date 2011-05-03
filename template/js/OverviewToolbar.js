Ext.define('Docs.OverviewToolbar', {
    extend: 'Ext.toolbar.Toolbar',
    dock: 'top',
    id: 'overview-toolbar',
    cls: 'member-links',
    padding: '3 5',

    items: [],

    initComponent: function() {

        var self = this;
        var members = [
            ['cfgs', 'Configs', 'configs', 'config'],
            ['properties', 'Properties', 'properties', 'property'],
            ['methods', 'Methods', 'methods', 'method'],
            ['events', 'Events', 'events', 'event']
        ];
        this.items = [];

        members.forEach(function(member) {

            if (clsInfo[member[0]] && clsInfo[member[0]].length) {

                var menuItems = [];
                for(var i=0; i< clsInfo[member[0]].length; i++) {
                    var memberName = clsInfo[member[0]][i];
                    menuItems.push({text: memberName, memberName: member[3] + '-' + memberName});
                }

                var butMenu = Ext.create('Ext.menu.Menu', {
                    items: menuItems,
                    plain: true,
                    listeners: {
                        click: function(menu, item) {
                            Ext.getCmp('doc-overview').scrollToEl("a[name=" + item.memberName + "]");
                        }
                    }
                });

                self.items.push({
                    xtype: 'splitbutton',
                    iconCls: 'icon-' + member[3],
                    cls: member[2],
                    text: member[1] + ' <span class="num">' + clsInfo[member[0]].length + '</span>',
                    listeners: {
                        click: function() {
                            Ext.getCmp('doc-overview').scrollToEl("a[name=" + member[2] + "]");
                        }
                    },
                    menu: butMenu
                });
            }
        });

        if (clsInfo.subclasses.length) {
            var menuItems = [];
            for(var i=0; i< clsInfo.subclasses.length; i++) {
                menuItems.push({text: clsInfo.subclasses[i], clsName: clsInfo.subclasses[i]});
            }

            var butMenu = Ext.create('Ext.menu.Menu', {
                items: menuItems,
                plain: true,
                listeners: {
                    click: function(menu, item) {
                        getDocClass(item.clsName);
                    }
                }
            });

            self.items.push({
                xtype: 'button',
                cls: 'subcls',
                iconCls: 'icon-subclass',
                text: 'Sub Classes <span class="num">' + clsInfo.subclasses.length + '</span>',
                menu: butMenu
            });
        }

        self.items = self.items.concat([
            { xtype: 'tbfill' },
            {
                boxLabel: 'Hide inherited',
                boxLabelAlign: 'before',
                xtype: 'checkbox',
                margin: '0 5 0 0',
                padding: '0 0 5 0',
                handler: function(el) {
                    Ext.query('.member.inherited').forEach(function(m) {
                        if(el.checked) {
                            Ext.get(m).setStyle({display: 'none'});
                        } else {
                            Ext.get(m).setStyle({display: 'block'});
                        }
                    });

                    Ext.query('.member.f').forEach(function(m) {
                        Ext.get(m).removeCls('f');
                    });

                    ['cfgs', 'properties', 'methods', 'events'].forEach(function(m) {
                        // If the number of inherited members is the same as the total number of members...
                        if (Ext.query('.m-'+m+' .member').length == Ext.query('.m-'+m+' .member.inherited').length) {
                            var first = Ext.query('.m-'+m)[0];
                            if (first) {
                                if (el.checked) {
                                    Ext.get(Ext.query('.m-'+m)[0]).setStyle({display: 'none'});
                                } else {
                                    Ext.get(Ext.query('.m-'+m)[0]).setStyle({display: 'block'});
                                }
                            }
                        }
                        var t = el.checked ? 'ni' : 'member';
                        var firstMemberEl = Ext.query('.m-'+m+' .member.' + t);
                        if (firstMemberEl.length > 0) {
                            Ext.get(firstMemberEl[0]).addCls('f');
                        }
                    });
                }
            },
            {
                xtype: 'button',
                iconCls: 'expandAllMembers',
                handler: function() {
                    Ext.query('.member').forEach(function(el) {
                        Ext.get(el).addCls('open');
                    });
                }
            },
            {
                xtype: 'button',
                iconCls: 'collapseAllMembers',
                handler: function() {
                    Ext.query('.member').forEach(function(el) {
                        Ext.get(el).removeCls('open');
                    });
                }
            }
        ]);

        this.callParent(arguments);
    }
});
