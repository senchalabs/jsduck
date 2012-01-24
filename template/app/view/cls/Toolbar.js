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
    style: 'border-width: 1px 1px 1px 1px !important;',

    /**
     * @cfg {Object} docClass
     * Documentation for a class.
     */
    docClass: {},

    /**
     * @cfg {Object} accessors
     * Accessors map from Overview component.
     */
    accessors: {},

    initComponent: function() {
        this.addEvents(
            /**
             * @event filter
             * Fires when text typed to filter, or one of the hide-checkboxes clicked.
             * @param {String} search  The search text.
             * @param {Object} hide  Flags which members to hide:
             * @param {Boolean} hide.inherited  True when inherited items should get hidden.
             * @param {Boolean} hide.accessors  True when accessor methods should get hidden.
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

        var self = this;

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
            this.filterField = Ext.widget("triggerfield", {
                triggerCls: 'reset',
                cls: 'member-filter',
                hideTrigger: true,
                emptyText: 'Filter class members',
                enableKeyEvents: true,
                listeners: {
                    keyup: function(cmp) {
                        this.fireEvent("filter", cmp.getValue(), this.getHideFlags());
                        cmp.setHideTrigger(cmp.getValue().length === 0);
                    },
                    specialkey: function(cmp, event) {
                        if (event.keyCode === Ext.EventObject.ESC) {
                            cmp.reset();
                            this.fireEvent("filter", "", this.getHideFlags());
                        }
                    },
                    scope: this
                },
                onTriggerClick: function() {
                    this.reset();
                    this.focus();
                    self.fireEvent('filter', '', this.getHideFlags());
                    this.setHideTrigger(true);
                }
            }),
            { xtype: 'tbfill' },
            this.hideInherited = this.createCheckbox("Hide inherited", "inherited"),
            this.hideAccessors = this.createCheckbox("Hide accessors", "accessors"),
            {
                xtype: 'button',
                iconCls: 'expand-all-members',
                tooltip: "Expand all",
                enableToggle: true,
                toggleHandler: function(btn, pressed) {
                    btn.setIconCls(pressed ? 'collapse-all-members' : 'expand-all-members');
                    btn.setTooltip(pressed ? "Collapse all" : "Expand all");
                    this.fireEvent("toggleExpanded", pressed);
                },
                scope: this
            }
        ]);

        this.callParent(arguments);
    },

    getHideFlags: function() {
        return {
            inherited: this.hideInherited.getValue(),
            accessors: this.hideAccessors.getValue()
        };
    },

    createCheckbox: function(title, type) {
        return Ext.widget('checkbox', {
            boxLabel: title,
            boxLabelAlign: 'before',
            margin: '0 5 0 0',
            padding: '0 0 5 0',
            checked: Docs.Settings.get("hide")[type],
            handler: function(el) {
                this.fireEvent("filter", this.filterField.getValue(), this.getHideFlags());
            },
            scope: this
        });
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
            fields: ['id', 'cls', 'url', 'label', 'inherited', 'accessor', 'meta']
        });
        store.add(records);
        return store;
    },

    // Creates link object referencing a class (and optionally a class member)
    createLinkRecord: function(cls, member) {
        return {
            cls: cls,
            url: member ? (cls + "-" + member.id) : cls,
            label: member ? ((member.tagname === "method" && member.name === "constructor") ? "new "+cls : member.name) : cls,
            inherited: member ? member.owner !== cls : false,
            accessor: member ? member.tagname === "method" && this.accessors.hasOwnProperty(member.name) : false,
            meta: member ? member.meta : {}
        };
    },

    /**
     * Hides or unhides inherited members in dropdown menus.
     * @param {Object} hide
     */
    hideMenuItems: function(hide) {
        Ext.Array.forEach(['cfg', 'property', 'method', 'event'], function(type) {
            if (this.memberButtons[type]) {
                var store = this.memberButtons[type].getStore();
                if (hide.inherited || hide.accessors) {
                    store.filterBy(function(m) {
                        return !(hide.inherited && m.get("inherited") || hide.accessors && m.get("accessor"));
                    });
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
