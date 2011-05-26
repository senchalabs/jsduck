/**
 * Toolbar with menus providing quick access to class members.
 */
Ext.define('Docs.view.cls.Toolbar', {
    extend: 'Ext.toolbar.Toolbar',
    requires: [
        'Docs.view.cls.HoverMenuButton'
    ],

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
        this.memberButtons = {};

        var memberTitles = {
            cfg: "Configs",
            property: "Properties",
            method: "Methods",
            event: "Events"
        };
        for (var type in memberTitles) {
            var members = this.docClass[type];
            if (members.length) {
                var btn = this.createMemberButton({
                    text: memberTitles[type],
                    type: type,
                    members: members
                });
                this.memberButtons[type] = btn;
                this.items.push(btn);
            }
        }

        if (this.docClass.subclasses.length) {
            this.items.push(this.createClassListButton("Sub Classes", this.docClass.subclasses));
        }
        if (this.docClass.mixedInto.length) {
            this.items.push(this.createClassListButton("Mixed Into", this.docClass.mixedInto));
        }

        this.items = this.items.concat([
            { xtype: 'tbfill' },
            {
                boxLabel: 'Hide inherited',
                boxLabelAlign: 'before',
                xtype: 'checkbox',
                margin: '0 5 0 0',
                padding: '0 0 5 0',
                handler: this.hideInherited,
                scope: this
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
        return Ext.create('Docs.view.cls.HoverMenuButton', {
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

    createClassListButton: function(text, classes) {
        return Ext.create('Docs.view.cls.HoverMenuButton', {
            text: text,
            cls: 'icon-subclass',
            links: Ext.Array.map(classes, function(cls) {
                return this.createLink(cls);
            }, this)
        });
    },

    // Creates link object referencing a class (and optionally a class member)
    createLink: function(cls, member) {
        if (member) {
            var url = cls+"-"+member.tagname+"-"+member.name;
            var label = member.name;
        }
        else {
            var url = cls;
            var label = cls;
        }
        return {
            cls: cls,
            url: url,
            label: label
        };
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

        Ext.Array.forEach(['cfg', 'property', 'method', 'event'], function(type) {
            var sectionId = '#m-' + type;

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

            if (this.memberButtons[type]) {
                var members = this.docClass[type];
                if (hide) {
                    members = Ext.Array.filter(members, function(m) {
                        return m.member === this.docClass.name;
                    }, this);
                }
                var links = Ext.Array.map(members, function(m) {
                    return this.createLink(this.docClass.name, m);
                }, this);
                this.memberButtons[type].setLinks(links);
            }
        }, this);
    }
});
