/**
 * Toolbar with menus providing quick access to class members.
 */
Ext.define('Docs.OverviewToolbar', {
    extend: 'Ext.toolbar.Toolbar',
    dock: 'top',
    cls: 'member-links',
    padding: '3 5',

    /**
     * @cfg {Object} docClass
     * Documentation for a class.
     */
    docClass: {},

    initComponent: function() {
        this.items = [];

        var memberTitles = {
            cfg: "Configs",
            property: "Properties",
            method: "Methods",
            event: "Events"
        };
        for (var type in memberTitles) {
            var members = this.docClass[type];
            if (members.length) {
                this.items.push(this.createMemberButton({
                    text: memberTitles[type],
                    type: type,
                    members: members
                }));
            }
        }

        if (this.docClass.subclasses.length) {
            this.items.push(this.createSubClassesButton({
                items: this.docClass.subclasses,
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
                tooltip: "Expand all",
                handler: function() {
                    Ext.Array.forEach(Ext.query('.side.expandable'), function(el) {
                        Ext.get(el).parent().addCls('open');
                    });
                }
            },
            {
                xtype: 'button',
                iconCls: 'collapseAllMembers',
                tooltip: "Collapse all",
                handler: function() {
                    Ext.Array.forEach(Ext.query('.side.expandable'), function(el) {
                        Ext.get(el).parent().removeCls('open');
                    });
                }
            }
        ]);

        this.callParent(arguments);
    },

    createMemberButton: function(cfg) {
        return Ext.create('Docs.HoverMenuButton', {
            text: cfg.text,
            cls: 'icon-'+cfg.type,
            links: Ext.Array.map(cfg.members, function(m) {
                return this.createLink(this.docClass.name, m);
            }, this),
            listeners: {
                click: function() {
                    Ext.getCmp('doc-overview').scrollToEl("#m-" + cfg.type);
                }
            }
        });
    },

    createLink: function(cls, member) {
        var url = cls+"-"+member.tagname+"-"+member.name;
        return Ext.String.format('<a href="#/api/{0}" rel="{0}" class="docClass">{1}</a>', url, member.name);
    },

    createSubClassesButton: function(cfg) {
        var menu = Ext.create('Ext.menu.Menu', {
            items: Ext.Array.map(cfg.items, function(className) {
                return {text: className, clsName: className};
            }),
            plain: true,
            listeners: {
                click: function(menu, item) {
                    Docs.ClassLoader.load(item.clsName);
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
        var hide = el.checked;

        // show/hide all inherited members
        Ext.Array.forEach(Ext.query('.member.inherited'), function(m) {
            Ext.get(m).setStyle({display: hide ? 'none' : 'block'});
        });

        // Remove all first-child classes
        Ext.Array.forEach(Ext.query('.member.first-child'), function(m) {
            Ext.get(m).removeCls('first-child');
        });

        Ext.Array.forEach(['cfg', 'property', 'method', 'event'], function(m) {
            var sectionId = '#m-' + m;

            // Hide the section completely if all items in it are inherited
            if (Ext.query(sectionId+' .member.not-inherited').length === 0) {
                var section = Ext.query(sectionId)[0];
                section && Ext.get(section).setStyle({display: hide ? 'none' : 'block'});
            }

            // add first-child class to first member in section
            var sectionMembers = Ext.query(sectionId+' .member' + (hide ? ".not-inherited" : ""));
            if (sectionMembers.length > 0) {
                Ext.get(sectionMembers[0]).addCls('first-child');
            }
        });
    }
});
