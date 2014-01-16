/**
 * Editor for adding tags.
 */
Ext.define("Docs.view.comments.TagEditor", {
    extend: "Ext.container.Container",
    requires: [
        "Docs.model.Tag"
    ],
    floating: true,
    hidden: true,
    componentCls: "comments-tageditor",

    statics: {
        cachedStore: undefined,
        getStore: function() {
            if (!this.cachedStore) {
                this.cachedStore = Ext.create('Ext.data.Store', {
                    model: "Docs.model.Tag",
                    listeners: {
                        load: function() {
                            this.cachedStore.sort("tagname", "ASC");
                        },
                        scope: this
                    }
                });
                this.cachedStore.load();
            }

            return this.cachedStore;
        }
    },

    initComponent: function() {
        this.items = [
            {
                xtype: 'combobox',
                listConfig: {
                    cls: "comments-tageditor-boundlist"
                },
                store: this.statics().getStore(),
                queryMode: "local",
                displayField: "tagname",
                valueField: "tagname",
                enableKeyEvents: true,
                emptyText: "New tag name...",
                listeners: {
                    select: this.handleSelect,
                    blur: this.destroy,
                    keyup: this.onKeyUp,
                    scope: this
                }
            }
        ];

        this.callParent(arguments);
    },

    popup: function(el) {
        this.show();
        this.alignTo(el, 'bl', [-12, -2]);
        this.down("combobox").focus(true, 100);
    },

    onKeyUp: function(field, ev) {
        if (ev.keyCode === Ext.EventObject.ENTER) {
            this.handleSelect();
        }
        else if (ev.keyCode === Ext.EventObject.ESC) {
            this.destroy();
        }
    },

    handleSelect: function() {
        var value = Ext.String.trim(this.down("combobox").getValue() || "");
        if (value) {
            /**
             * @event select
             * Fired when a tagname entered to the field and ENTER pressed.
             * @param {String} tagname
             */
            var tagname = this.rememberNewTag(value);
            this.fireEvent("select", tagname);
        }
        this.destroy();
    },

    // when tagname doesn't exist in our tags story yet, add it there.
    // in either case return the tagname that's going to be added to
    // the current comment.
    rememberNewTag: function(tagname) {
        var store = this.statics().getStore();
        var re = new RegExp("^" + Ext.String.escapeRegex(tagname) + "$", "i");
        var matches = store.query("tagname", re);
        if (matches.getCount() === 0) {
            store.add({tagname: tagname});
            store.sort("tagname", "ASC");
            return tagname;
        }
        else {
            return matches.get(0).get("tagname");
        }
    }
});