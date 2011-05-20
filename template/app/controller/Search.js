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
                itemclick: function(panel, item) {
                    this.handleClick(item);
                }
            },
            '#search-field': {
                keyup: function(el, ev) {
                    var panel = Ext.getCmp('quick-search');

                    if (ev.keyCode == Ext.EventObject.ESC || el.value == '') {
                        panel.hide();
                        return;
                    }
                    else {
                        panel.show();
                    }

                    var curItem = panel.store.indexOf(panel.getSelectionModel().getLastSelected()),
                        lastItem = panel.store.data.length - 1,
                        selModel = panel.getSelectionModel();

                    if (ev.keyCode == Ext.EventObject.UP) {
                        if (curItem == undefined) {
                            selModel.select(0);
                        } else {
                            selModel.select(curItem == 0 ? lastItem : (curItem - 1));
                        }
                    }
                    else if (ev.keyCode == Ext.EventObject.DOWN) {
                        if (curItem == undefined) {
                            selModel.select(0);
                        } else {
                            selModel.select(curItem == lastItem ? 0 : curItem + 1);
                        }
                    }
                    else if (ev.keyCode == Ext.EventObject.ENTER) {
                        ev.preventDefault();
                        this.handleClick(selModel.getLastSelected());
                    }
                    else {
                        this.search(el.value);
                    }
                }
            }
        });
    },

    handleClick: function(curItem) {
        curItem = curItem;
        var cls = curItem.data.cls;
        if (curItem.data.type != 'cls') {
            cls += '-' + curItem.data.type + '-' + curItem.data.member;
        }
        Docs.App.getController('Classes').loadClass(cls);
        Ext.getCmp('quick-search').hide();
    },

    search: function(term) {
        Docs.App.getStore('Search').loadData(this.filterMembers(term), false);
        Ext.getCmp('quick-search').alignTo('search-field', 'bl', [-23, 0]);
    },

    filterMembers: function(text, n) {
        var results = [[], [], []];
        var safeText = Ext.escapeRe(text);
        var re0 = new RegExp("^" + safeText + "$", "i");
        var re1 = new RegExp("^" + safeText, "i");
        var re2 = new RegExp(safeText, "i");
        Ext.Array.forEach(Docs.membersData.data, function(r) {
            var member = r.cls;
            if (re0.test(member)) {
                results[0].push(r);
            }
            else if (re1.test(member)) {
                results[1].push(r);
            }
            else if (re2.test(member)) {
                results[2].push(r);
            }
        });

        // flatten results array and returns first n results
        return Ext.Array.flatten(results).slice(0, n || 10);
    }

});
