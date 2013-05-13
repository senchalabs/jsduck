/**
 * Controller for search.
 */
Ext.define('Docs.controller.Search', {
    extend: 'Ext.app.Controller',

    requires: [
        'Docs.ClassRegistry',
        'Docs.GuideSearch',
        'Docs.store.Search',
        'Docs.History'
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

    // Delay constants
    basicSearchDelay: 50,
    guideSearchDelay: 500,
    dropdownHideDelay: 500,

    init: function() {
        this.control({
            '#search-dropdown': {
                itemclick: function(dropdown, record) {
                    this.loadRecord(record);
                },
                changePage: function(dropdown, delta) {
                    // increment page number and update search results display
                    this.pageIndex += delta;
                    this.displayResults();
                    // footerClick doesn't fire in IE9,
                    // so keep the dropdown visible explicitly.
                    this.keepDropdown();
                },
                footerClick: function(dropdown) {
                    this.keepDropdown();
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
                        }, this.basicSearchDelay, this);
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
                    this.hideTimeout = Ext.Function.defer(dropdown.hide, this.dropdownHideDelay, dropdown);
                }
            }
        });
    },

    getDropdown: function() {
        return this.dropdown || (this.dropdown = Ext.getCmp('search-dropdown'));
    },

    // Cancels hiding of dropdown
    keepDropdown: function() {
        clearTimeout(this.hideTimeout);
        this.getField().focus();
    },

    // loads class/method corrseponding to the record
    loadRecord: function(record) {
        Docs.History.navigate(record.get("url"));
        this.getDropdown().hide();
    },

    // First performs the basic search.
    // Then launches guides search in the background - when that finishes,
    // re-runs the basic search with guides results included.
    search: function(term) {
        // skip search when query hasn't changed.
        if (term === this.previousTerm) {
            return;
        }
        this.previousTerm = term;

        this.basicSearch(term);
        if (Docs.GuideSearch.isEnabled()) {
            this.guideSearch(term);
        }
    },

    guideSearch: function(term) {
        Docs.GuideSearch.deferredSearch(term, function(guideResults) {
            this.basicSearch(term, guideResults);
        }, this, this.guideSearchDelay);
    },

    basicSearch: function(term, guideResults) {
        this.displayResults(Docs.ClassRegistry.search(term, guideResults));
    },

    // Loads results to store and shows the dropdown.
    // When no results provided, displays the results from previous
    // run - this is used for paging.
    displayResults: function(results) {
        results = results || this.previousResults;

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

        if (results.length > 0) {
            // auto-select first result
            this.getDropdown().getSelectionModel().select(0);
        }

        this.previousResults = results;
    }
});
