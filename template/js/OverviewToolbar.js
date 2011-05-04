/**
 * Toolbar with menus providing quick access to class members.
 */
Ext.define('Docs.OverviewToolbar', {
    extend: 'Ext.toolbar.Toolbar',
    dock: 'top',
    id: 'overview-toolbar',
    cls: 'member-links',
    padding: '3 5',

    initComponent: function() {
        this.items = [];

        var memberTitles = {
            cfg: "Configs",
            property: "Properties",
            method: "Methods",
            event: "Events"
        };
        for (var type in memberTitles) {
            var members = clsInfo[type];
            if (members.length) {
                this.items.push(this.createMemberButton({
                    items: members,
                    type: type,
                    title: memberTitles[type]
                }));
            }
        }

        if (clsInfo.subclasses.length) {
            this.items.push(this.createSubClassesButton({
                items: clsInfo.subclasses,
                title: "Sub Classes"
            }));
        }

        this.items = this.items.concat([
            { xtype: 'tbfill' },
            {
                boxLabel: 'Hide inherited',
                boxLabelAlign: 'before',
                xtype: 'checkbox',
                margin: '0 5 0 0',
                padding: '0 0 5 0',
                handler: this.hideInherited
            },
            {
                xtype: 'button',
                iconCls: 'expandAllMembers',
                handler: function() {
                    Ext.Array.forEach(Ext.query('.member'), function(el) {
                        Ext.get(el).addCls('open');
                    });
                }
            },
            {
                xtype: 'button',
                iconCls: 'collapseAllMembers',
                handler: function() {
                    Ext.Array.forEach(Ext.query('.member'), function(el) {
                        Ext.get(el).removeCls('open');
                    });
                }
            }
        ]);

        this.callParent(arguments);
    },

    createMemberButton: function(cfg) {
        var menu = Ext.create('Ext.menu.Menu', {
            items: Ext.Array.map(cfg.items, function(m) {
                return {
                    text: m.name,
                    memberName: cfg.type + '-' + m.name
                };
            }),
            plain: true,
            listeners: {
                click: function(menu, item) {
                    Ext.getCmp('doc-overview').scrollToEl("a[name=" + item.memberName + "]");
                }
            }
        });

        return Ext.create('Ext.button.Split', {
            cls: cfg.type,
            iconCls: 'icon-' + cfg.type,
            text: cfg.title + ' <span class="num">' + cfg.items.length + '</span>',
            listeners: {
                click: function() {
                    Ext.getCmp('doc-overview').scrollToEl("a[name=" + cfg.cls + "]");
                }
            },
            menu: menu
        });
    },

    createSubClassesButton: function(cfg) {
        var menu = Ext.create('Ext.menu.Menu', {
            items: Ext.Array.map(cfg.items, function(className) {
                return {text: className, clsName: className};
            }),
            plain: true,
            listeners: {
                click: function(menu, item) {
                    getDocClass(item.clsName);
                }
            }
        });

        return Ext.create('Ext.button.Button', {
            cls: 'subcls',
            iconCls: 'icon-subclass',
            text: cfg.title + ' <span class="num">' + cfg.items.length + '</span>',
            menu: menu
        });
    },

    hideInherited: function(el) {
        Ext.Array.forEach(Ext.query('.member.inherited'), function(m) {
            if (el.checked) {
                Ext.get(m).setStyle({display: 'none'});
            } else {
                Ext.get(m).setStyle({display: 'block'});
            }
        });

        Ext.Array.forEach(Ext.query('.member.f'), function(m) {
            Ext.get(m).removeCls('f');
        });

        Ext.Array.forEach(['cfgs', 'properties', 'methods', 'events'], function(m) {
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
});
