/**
 * Controller for search.
 */
Ext.define('Docs.controller.Search', {
    extend: 'Ext.app.Controller',

    views: [
        'search.Dropdown'
    ],

    stores: ['Search'],

    refs: [
        {
            ref: 'field',
            selector: '#search-field'
        }
    ],

    // Current page in search results and nr of items on one page
    pageIndex: 0,
    pageSize: 10,

    init: function() {
        this.control({
            '#search-dropdown': {
                itemclick: function(dropdown, record) {
                    this.loadRecord(record);
                },
                changePage: function(dropdown, delta) {
                    // increment page number and update search results display
                    this.pageIndex += delta;
                    this.search(this.getField().getValue());
                },
                footerClick: function(dropdown, delta) {
                    // don't hide dropdown
                    clearTimeout(this.hideTimeout);
                    this.getField().focus();
                }
            },
            '#search-field': {
                keyup: function(el, ev) {
                    var dropdown = this.getDropdown();

                    el.setHideTrigger(el.getValue().length === 0);

                    if (ev.keyCode === Ext.EventObject.ESC || !el.value) {
                        dropdown.hide();
                        el.setValue("");
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
                        record && this.loadRecord(record);
                    }
                    else {
                        // A new search - reset paging back to first page
                        this.pageIndex = 0;
                        // Wait a bit before actually performing the search.
                        // When user is typing fast, the value of el.value
                        // might not right away be the final value.  For example
                        // user might type "tre" but we will get three keyup events
                        // where el.value === "t".
                        clearTimeout(this.searchTimeout);
                        this.searchTimeout = Ext.Function.defer(function() {
                            this.search(el.value);
                        }, 50, this);
                    }
                },
                focus: function(el) {
                    if (el.value && this.getDropdown().store.getCount() > 0) {
                        this.getDropdown().show();
                    }
                },
                blur: function() {
                    // Don't hide the dropdown right away, otherwise
                    // we don't receive the itemclick event when focus
                    // was lost because we clicked on dropdown item.
                    // Not really a good solution, but I can't
                    // currently think of anything better.  Behaves
                    // badly when you make a long mouse press on
                    // dropdown item.
                    var dropdown = this.getDropdown();
                    this.hideTimeout = Ext.Function.defer(dropdown.hide, 500, dropdown);
                }
            }
        });
    },

    getDropdown: function() {
        return this.dropdown || (this.dropdown = Ext.getCmp('search-dropdown'));
    },

    // loads class/method corrseponding to the record
    loadRecord: function(record) {
        Docs.App.getController('Classes').loadClass("#!/api/"+record.get("id"));
        this.getDropdown().hide();
    },

    search: function(term) {
        // perform search and load results to store
        var results = this.filterMembers(term);

        // Don't allow paging before first or after the last page.
        if (this.pageIndex < 0) {
            this.pageIndex = 0;
        }
        else if (this.pageIndex > Math.floor(results.length / this.pageSize)) {
            this.pageIndex = Math.floor(results.length / this.pageSize);
        }
        var start = this.pageIndex * this.pageSize;
        var end = start + this.pageSize;

        this.getDropdown().setTotal(results.length);
        this.getDropdown().setStart(start);
        this.getDropdown().getStore().loadData(results.slice(start, end));
        // position dropdown below search box
        this.getDropdown().alignTo('search-field', 'bl', [-12, -2]);
        // hide dropdown when nothing found
        if (results.length === 0) {
            this.getDropdown().hide();
        }
        else {
            // auto-select first result
            this.getDropdown().getSelectionModel().select(0);
        }
    },

    filterMembers: function(text) {
        // Each record has its relative sorting order: 0..3
        var results = [
            [], [], [], [], // First we sort full matches: 0..3
            [], [], [], [], // Then matches in beginning: 4..7
            [], [], [], []  // Finally matches in middle: 8..11
        ];
        var searchFull = /[.:]/.test(text);
        var safeText = Ext.escapeRe(text);
        var reFull = new RegExp("^" + safeText + "$", "i");
        var reBeg = new RegExp("^" + safeText, "i");
        var reMid = new RegExp(safeText, "i");

        Ext.Array.forEach(Docs.data.search, function(r) {
            // when search text has "." or ":" in it, search from the full name
            // (e.g. "Ext.Component.focus" or "xtype: grid")
            // Otherwise search from just the member name (e.g. "focus" or "Component")
            var name = searchFull ? r.cls + (r.type === "class" ? "" : "." + r.member) : r.member;

            if (reFull.test(name)) {
                results[r.sort].push(r);
            }
            else if (reBeg.test(name)) {
                results[r.sort+4].push(r);
            }
            else if (reMid.test(name)) {
                results[r.sort+8].push(r);
            }
        }, this);

        return Ext.Array.flatten(results);
    }

});
