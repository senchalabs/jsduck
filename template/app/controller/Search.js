/**
 * Controller for search.
 */
Ext.define('Docs.controller.Search', {
    extend: 'Ext.app.Controller',

    views: [
        'search.Dropdown'
    ],

    stores: ['Search'],

    init: function() {
        this.control({
            '#quick-search': {
                itemclick: function(dropdown, record) {
                    this.loadRecord(record);
                }
            },
            '#search-field': {
                keyup: function(el, ev) {
                    var dropdown = Ext.getCmp('quick-search');

                    if (ev.keyCode === Ext.EventObject.ESC || !el.value) {
                        dropdown.hide();
                        return;
                    }
                    else {
                        dropdown.show();
                    }

                    var selModel = dropdown.getSelectionModel();
                    var record = selModel.getLastSelected();
                    var curIndex = dropdown.store.indexOf(record);
                    var lastIndex = dropdown.store.getCount() - 1;

                    if (ev.keyCode === Ext.EventObject.UP) {
                        if (curIndex === undefined) {
                            selModel.select(0);
                        } else {
                            selModel.select(curIndex === 0 ? lastIndex : (curIndex - 1));
                        }
                    }
                    else if (ev.keyCode === Ext.EventObject.DOWN) {
                        if (curIndex === undefined) {
                            selModel.select(0);
                        } else {
                            selModel.select(curIndex === lastIndex ? 0 : curIndex + 1);
                        }
                    }
                    else if (ev.keyCode === Ext.EventObject.ENTER) {
                        ev.preventDefault();
                        this.loadRecord(record);
                    }
                    else {
                        this.search(el.value);
                    }
                },
                focus: function(el) {
                    var dropdown = Ext.getCmp('quick-search');
                    if (el.value && dropdown.store.getCount() > 0) {
                        dropdown.show();
                    }
                },
                blur: function() {
                    Ext.getCmp('quick-search').hide();
                }
            }
        });
    },

    // loads class/method corrseponding to the record
    loadRecord: function(record) {
        var name = record.get("cls");
        if (record.get("type") !== 'cls') {
            name += '-' + record.get("type") + '-' + record.get("member");
        }
        Docs.App.getController('Classes').loadClass(name);
        Ext.getCmp('quick-search').hide();
    },

    search: function(term) {
        // perform search and load results to store
        var results = this.filterMembers(term);
        Docs.App.getStore('Search').loadData(results, false);
        // position dropdown below search box
        var dropdown = Ext.getCmp('quick-search');
        dropdown.alignTo('search-field', 'bl', [-23, 0]);
        // hide dropdown when nothing found
        if (results.length === 0) {
            dropdown.hide();
        }
    },

    filterMembers: function(text, n) {
        var results = [[], [], []];
        var hasDot = /\./.test(text);
        var safeText = Ext.escapeRe(text);
        var re0 = new RegExp("^" + safeText + "$", "i");
        var re1 = new RegExp("^" + safeText, "i");
        var re2 = new RegExp(safeText, "i");
        Ext.Array.forEach(Docs.membersData.data, function(r) {
            // when search text has "." in it, search from the full name (e.g. "Ext.Component.focus")
            // Otherwise search from just the member name (e.g. "focus" or "Component")
            var name = hasDot ? r.cls + (r.type === "cls" ? "" : "." + r.member) : r.member;

            if (re0.test(name)) {
                results[0].push(r);
            }
            else if (re1.test(name)) {
                results[1].push(r);
            }
            else if (re2.test(name)) {
                results[2].push(r);
            }
        });

        // flatten results array and returns first n results
        return Ext.Array.flatten(results).slice(0, n || 10);
    }

});
