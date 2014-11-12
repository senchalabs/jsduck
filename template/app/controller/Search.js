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
    basicSearchDelay: 250,
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

        if (Docs.otherProducts) {
            // Use SOLR for production version
            var url = window.location.href,
                type = 'titanium',
                suffix = '*',
                match = term.match(/\"/g);
            eso = this;
            requestId = 0;

            // Switch to correct product
            if (url.match(/platform/g)) {
                type = 'platform';
            }
            else if (url.match(/cloud/g)) {
                type = 'cloud';
            }

            // Do a wildcard search unless we are doing so already
            if (match && match.length % 2 == 1) {
                suffix = '*"';
            }
            else if (term.match(/\*$/)) {
                suffix = "";
            }
            else if (match && match.length % 2 == 0 && term.match(/\"$/)) {
                suffix = "";
            }
            else if (term.match(/ $/)) {
                suffix = "";
            }

            // Do the search
            Ext.Ajax.request({
                url: 'http://docs.appcelerator.com/solrsearch.php',
                method: 'GET',
                params: {
                    query:encodeURIComponent(term + suffix),
                    type:type
                },
                callback: function(options, success, response) {
                    var rv = [],
                        keyword_match = [],
                        name_match = [];
                    if (success && response && response.requestId > requestId) {
                        // If successful, retrieve and prepare results
                        var results = JSON.parse(response.responseText);
                        requestId = response.requestId;
                        results.response.docs.forEach(function(doc) {
                            if ("title" in doc) {
                                var elem, re;
                                elem = {
                                    fullName: doc.title,
                                    name: doc.title,
                                    url: '#!/guide/' + doc.url,
                                    icon: 'icon-guide',
                                    meta: {}
                                };
                                // If result matches title name, store in separate array
                                // to be pushed at beginning of results
                                re = new RegExp(term, 'gi');
                                if (doc.title.match(re)) {
                                    name_match.push(elem);
                                } else {
                                    rv.push(elem);
                                }
                            }
                            else if ("name" in doc) {
                                var api_type = 'class',
                                    tokens = doc.name.split('.'),
                                    api_name,
                                    elem = {},
                                    re;

                                // Determine API type
                                if (doc.url.match(/\-method\-/g)) {
                                    api_type = 'method';
                                }
                                else if (doc.url.match(/\-event\-/g)) {
                                    api_type = 'event';
                                }
                                else if (doc.url.match(/\-property\-/g)) {
                                    api_type = 'property';
                                }

                                api_name = tokens[tokens.length - 1];
                                elem = {
                                    fullName: doc.name,
                                    name: api_name,
                                    url: '#!/api/' + doc.url,
                                    icon: 'icon-' + api_type,
                                    meta: {}
                                };
                                // If result matches API name, store in separate arrays
                                // to be pushed at beginning of results
                                api_name = api_name.toLowerCase();
                                doc.name = doc.name.toLowerCase();
                                term = term.toLowerCase();
                                re = new RegExp(term.replace(/\./g, '\\.'), 'gi');
                                if (api_name === term || doc.name === term) {
                                    name_match.unshift(elem);
                                }
                                else if (api_name.indexOf(term) == 0 || doc.name.indexOf(term) == 0) {
                                    name_match.push(elem);
                                }
                                else if (doc.name.match(re)) {
                                    keyword_match.push(elem);
                                } else {
                                    rv.push(elem);
                                }
                            }
                        });

                        // Place API name matches ahead of others
                        rv = name_match.concat(keyword_match.concat(rv));
                    }
                    eso.displayResults(rv);
                }
            });
        } else {
            // Use old search for offline version
            this.basicSearch(term);
            if (Docs.GuideSearch.isEnabled()) {
                this.guideSearch(term);
            }
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
