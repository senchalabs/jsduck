/**
 * Toolbar with menus providing quick access to class members.
 */
Ext.define('Docs.view.cls.Toolbar', {
    extend: 'Ext.toolbar.Toolbar',
    requires: [
        'Docs.view.HoverMenuButton',
        'Docs.Settings',
        'Ext.form.field.Checkbox'
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
        this.addEvents(
            /**
             * @event hideInherited
             * Fires when hideInherited checkbox toggled.
             * @param {Boolean} hide  True when inherited items should get hidden.
             */
            "hideInherited",
            /**
             * @event filter
             * Fires when text typed to filter.
             * @param {String} search  The search text.
             */
            "filter",
            /**
             * @event toggleExpanded
             * Fires expandAll/collapseAll buttons clicked.
             * @param {Boolean} expand  True to expand all, false to collapse all.
             */
            "toggleExpanded"
        );

        this.items = [];
        this.memberButtons = {};

        var memberTitles = {
            cfg: "Configs",
            property: "Properties",
            method: "Methods",
            event: "Events"
        };
        for (var type in memberTitles) {
            var members = this.docClass.members[type];
            var statics = this.docClass.statics[type];
            if (members.length || statics.length) {
                var btn = this.createMemberButton({
                    text: memberTitles[type],
                    type: type,
                    members: members.concat(statics)
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
            { xtype: 'tbspacer', width: 10 },
            this.filterField = Ext.widget("textfield", {
                emptyText: 'Find class members...',
                enableKeyEvents: true,
                listeners: {
                    keyup: function(cmp) {
                        this.fireEvent("filter", cmp.getValue());
                    },
                    specialkey: function(cmp, event) {
                        if (event.keyCode === Ext.EventObject.ESC) {
                            cmp.reset();
                            this.fireEvent("filter", "");
                        }
                    },
                    scope: this
                }
            }),
            { xtype: 'tbfill' },
            {
                boxLabel: 'Hide inherited',
                boxLabelAlign: 'before',
                xtype: 'checkbox',
                margin: '0 5 0 0',
                padding: '0 0 5 0',
                checked: Docs.Settings.get("hideInherited"),
                handler: function(el) {
                    this.fireEvent("hideInherited", el.checked);
                },
                scope: this
            },
            {
                xtype: 'button',
                iconCls: 'expandAllMembers',
                tooltip: "Expand all",
                enableToggle: true,
                toggleHandler: function(btn, pressed) {
                    btn.setIconCls(pressed ? 'collapseAllMembers' : 'expandAllMembers');
                    btn.setTooltip(pressed ? "Collapse all" : "Expand all");
                    this.fireEvent("toggleExpanded", pressed);
                },
                scope: this
            }
        ]);

        this.callParent(arguments);
    },

    createMemberButton: function(cfg) {
        var data = Ext.Array.map(cfg.members, function(m) {
            return this.createLinkRecord(this.docClass.name, m);
        }, this);

        return Ext.create('Docs.view.HoverMenuButton', {
            text: cfg.text,
            cls: 'icon-'+cfg.type,
            store: this.createStore(data),
            showCount: true,
            listeners: {
                click: function() {
                    this.up('classoverview').scrollToEl("#m-" + cfg.type);
                },
                scope: this
            }
        });
    },

    createClassListButton: function(text, classes) {
        var data = Ext.Array.map(classes, function(cls) {
            return this.createLinkRecord(cls);
        }, this);

        return Ext.create('Docs.view.HoverMenuButton', {
            text: text,
            cls: 'icon-subclass',
            showCount: true,
            store: this.createStore(data)
        });
    },

    // creates store tha holds link records
    createStore: function(records) {
        var store = Ext.create('Ext.data.Store', {
            fields: ['id', 'cls', 'url', 'label', 'inherited', 'static']
        });
        store.add(records);
        return store;
    },

    // Creates link object referencing a class (and optionally a class member)
    createLinkRecord: function(cls, member) {
        return {
            cls: cls,
            url: member ? cls+"-"+member.tagname+"-"+member.name : cls,
            label: member ? ((member.name === "constructor") ? cls : member.name) : cls,
            inherited: member ? member.owner !== cls : false,
            'static': member ? member['static'] : false
        };
    },

    /**
     * Hides or unhides inherited members in dropdown menus.
     * @param {Boolean} hide
     */
    hideInherited: function(hide) {
        Ext.Array.forEach(['cfg', 'property', 'method', 'event'], function(type) {
            if (this.memberButtons[type]) {
                var store = this.memberButtons[type].getStore();
                if (hide) {
                    store.filterBy(function(m) { return !m.get("inherited"); });
                }
                else {
                    store.clearFilter();
                }
            }
        }, this);
    },

    /**
     * Returns the current text in filter field.
     * @return {String}
     */
    getFilterValue: function() {
        return this.filterField.getValue();
    }
});
