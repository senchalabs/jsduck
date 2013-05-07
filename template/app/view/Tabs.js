/**
 * Handles the Tab bar functionality and tracking of Tabs.
 * This is a custom implementation and has nothing to do with regular Ext tabs.
 */
Ext.define('Docs.view.Tabs', {
    extend: 'Ext.container.Container',
    alias: 'widget.doctabs',
    id: 'doctabs',
    componentCls: 'doctabs',
    requires: [
        'Docs.History',
        'Docs.ClassRegistry',
        'Docs.view.TabMenu'
    ],

    minTabWidth: 80,
    maxTabWidth: 160,
    animDuration: 150,

    tabs: [],
    tabsInBar: [],
    tabCache: {},
    staticTabs: [],

    initComponent: function() {
        this.addEvents(
            /**
             * @event
             * Fired when one of the tabs gets activated.
             * @param {String} url The URL of the page associated with the tab.
             * @param {Object} opts Might contain `{navigate: true}`.
             */
            "tabActivate",
            /**
             * @event
             * Fired when one of the tabs gets closed from close button.
             * @param {String} url The URL of the page associated with the tab.
             */
            "tabClose"
        );

        this.tpl = Ext.create('Ext.XTemplate',
            '<tpl for=".">',
                '<div class="doctab overview {cls}{active}">',
                    '<div class="l"></div>',
                    '<div class="m">',
                        '<tpl if="text">',
                            '<a class="tabUrl ov-tab-text" href="{href}">{text}</a>',
                        '<tpl else>',
                            '<a class="tabUrl ov-tab" href="{href}">&nbsp;</a>',
                        '</tpl>',
                    '</div>',
                    '<div class="r"></div>',
                '</div>',
            '</tpl>',
            '<div style="float: left; width: 8px">&nbsp;</div>',
            '<div class="tab-overflow"></div>'
        );

        this.html = this.tpl.applyTemplate(this.staticTabs);

        this.tabTpl = Ext.create('Ext.XTemplate',
            '<div class="doctab',
                    '{[values.active ? (" active") : ""]}',
                '" style="',
                    '{[values.width ? ("width: " + values.width + "px;") : ""]}',
                    '{[values.visible ? "" : "visibility: hidden;"]}">',
                '<div class="l"></div>',
                '<div class="m">',
                    '<span class="icn {iconCls}">&nbsp;</span>',
                    '<a class="tabUrl main-tab" href="{href}">{text}</a>',
                '</div>',
            '<div class="r"><a class="close" href="#">&nbsp;</a></div>',
            '</div>'
        );

        this.on("afterrender", this.initListeners, this);

        this.on("resize", this.refresh, this);

        this.callParent();
    },

    initListeners: function() {
        // Hover effect for tab close button
        this.el.on('mouseover', function(event, el) {
            Ext.get(el).addCls('ovr');
        }, this, {
            delegate: '.close'
        });
        this.el.on('mouseout', function(event, el) {
            Ext.get(el).removeCls('ovr');
        }, this, {
            delegate: '.close'
        });

        // Close tab when clicked on close button
        this.el.on('click', function(event, el) {
            var url = Ext.get(el).up('.doctab').down('.tabUrl').getAttribute('href');
            url = Docs.History.cleanUrl(url);
            this.removeTab(url);
            this.fireEvent("tabClose", url);
        }, this, {
            delegate: '.close',
            preventDefault: true
        });

        // Navigate to page when tab clicked
        this.el.on('click', function(event, el) {
            // Do nothing when close button within the tab was clicked.
            if (Ext.fly(event.getTarget()).hasCls("close")) {
                return;
            }
            var url = Ext.get(el).down('.tabUrl').getAttribute('href');
            this.fireEvent("tabActivate", url, {navigate: true});
        }, this, {
            delegate: '.doctab'
        });

        // On right-click open the overflow menu as context-menu
        this.el.on('contextmenu', function(event, el) {
            // don't show the menu on static tabs
            if (!Ext.get(el).hasCls('overview')) {
                this.createMenu().showBy(el);
            }
        }, this, {
            delegate: '.doctab',
            preventDefault: true
        });

        // Don't follow the URL when the <a> element inside tab clicked
        this.el.on('click', Ext.emptyFn, this, {
            delegate: '.tabUrl',
            preventDefault: true
        });

        // when tabs are to be resized, do it after mouse has left tab-bar
        this.el.on('mouseleave', function() {
            if (this.shouldResize) {
                this.resizeTabs({animate: true});
            }
        }, this);
    },

    /**
     * Sets the static tabs to display.
     *
     * @param {Object[]} tabs Array of tab configs with the following structure:
     * @param {String} tabs.cls CSS classname for tab
     * @param {String} tabs.href URL to activate when clicking tab
     * @param {String} tabs.tooltip Tooltip to show when hovering the tab
     */
    setStaticTabs: function(tabs) {
        this.staticTabs = tabs;
        this.refresh();
    },

    /**
     * Returns array of static tab configs.
     * @return {Object[]} See {@link #setStaticTabs} for details.
     */
    getStaticTabs: function(tab) {
        return this.staticTabs;
    },

    /**
     * Adds a new tab
     *
     * @param {Object} tab
     * @param {String} tab.href URL of the resource
     * @param {String} tab.text Text to be used on the tab
     * @param {String} tab.iconCls CSS class to be used as the icon
     * @param {Object} opts Options object:
     * @param {Boolean} opts.animate True to animate the addition
     * @param {Boolean} opts.activate True to activate the tab
     */
    addTab: function(tab, opts) {
        tab = this.formatTabTexts(tab);

        this.tabCache[tab.href] = tab;

        if (!this.hasTab(tab.href)) {
            this.tabs.push(tab.href);

            if (this.roomForNewTab()) {
                this.addTabToBar(tab, opts);
            }
            this.addTabToMenu(this.overflowButton.menu, tab);
        }
        if (opts.activate) {
            this.activateTab(tab.href);
        }

        this.saveTabs();
    },

    // For API tabs always use the full class name as tooltip and
    // short name as the tab title.  For other tabs, make the tooltip
    // text be the same as tab title - useful for seeing the full
    // title for tabs with long titles.
    formatTabTexts: function(tab) {
        if (/#!?\/api\//.test(tab.href)) {
            var fullClsName = tab.href.replace(/^.*#!?\/api\//, "");
            tab.text = Docs.ClassRegistry.shortName(fullClsName);
            tab.tooltip = fullClsName;
        }
        else {
            tab.tooltip = tab.text;
        }
        return tab;
    },

    /**
     * Removes a tab. If the tab to be closed is currently active, activate a neighboring tab.
     *
     * @param {String} url URL of the tab to remove
     */
    removeTab: function(url) {
        if (!this.hasTab(url)) {
            return;
        }

        // Remove the tab both from tab-bar and all-tabs array
        this.removeFromArray(this.tabs, url);
        var removedIndex = this.removeFromArray(this.tabsInBar, url);

        // An empty space in tab-bar has now become available
        // If the all-tabs array has an item to fill this spot,
        // add the item from all-tabs array to tab-bar.
        var firstHiddenTab = this.tabs[this.tabsInBar.length];
        if (firstHiddenTab) {
            this.tabsInBar.push(firstHiddenTab);
        }

        // Was the active tab closed?
        if (this.activeTab === url) {
            if (this.tabs.length === 0) {
                // When all tabs were closed
                // open index page corresponding to the last closed tab type
                Docs.App.getController(this.getControllerName(url)).loadIndex();
            }
            else {
                // When more tabs remaining
                // activate the tab at the position of last closed tab.
                // Except when the last tab was closed - then choose one before it.
                if (removedIndex === this.tabs.length) {
                    removedIndex -= 1;
                }
                this.activateTab(this.tabs[removedIndex]);
                this.fireEvent("tabActivate", this.tabs[removedIndex]);
            }
        }

        // When removed tab got replaced with hidden tab do a full refresh of tabs.
        // Otherwise just remove the single tab.
        if (this.tabs.length >= this.maxTabsInBar()) {
            this.refresh();
        } else {
            this.removeTabFromBar(url);
        }

        this.saveTabs();
    },

    // Removes item from array
    // Returns the index from which the item was removed.
    removeFromArray: function(array, item) {
        var idx = Ext.Array.indexOf(array, item);
        if (idx !== -1) {
            Ext.Array.erase(array, idx, 1);
        }
        return idx;
    },

    /**
     * Activates a tab
     *
     * @param {String} url URL of tab
     */
    activateTab: function(url) {
        this.activeTab = url;

        if (!this.inTabs(url)) {
            this.swapLastTabWith(url);
        }

        Ext.Array.each(Ext.query('.doctab a.tabUrl'), function(d) {
            Ext.get(d).up('.doctab').removeCls(['active', 'highlight']);
        });

        var activeTab = Ext.query('.doctab a[href="' + url + '"]')[0];
        if (activeTab) {
            var docTab = Ext.get(activeTab).up('.doctab');
            docTab.addCls('active');
        }

        this.highlightOverviewTab(url);
    },

    /**
     *  Re-renders tabs and overflow. Useful for window resize event.
     */
    refresh: function() {
        var html = this.tpl.applyTemplate(this.staticTabs);

        var len = this.maxTabsInBar() < this.tabs.length ? this.maxTabsInBar() : this.tabs.length;
        this.tabsInBar = this.tabs.slice(0, len);

        for (var i=0; i< len; i++) {
            var tab = this.tabCache[this.tabs[i]];

            var tabData = Ext.apply(tab, {
                visible: true,
                active: this.activeTab === tab.href,
                width: this.tabWidth()
            });

            html += this.tabTpl.applyTemplate(tabData);
        }

        this.el.dom.innerHTML = html;

        if (this.activeTab && this.activeTab !== this.tabs[len-1]) {
            this.activateTab(this.activeTab);
            this.fireEvent("tabActivate", this.activeTab);
        }

        this.highlightOverviewTab(this.activeTab);
        this.createOverflowButton();
        this.addToolTips();
    },

    closeAllTabs: function() {
        if (this.inTabBar(this.activeTab)) {
            this.tabs = this.tabsInBar = [ this.activeTab ];
        } else {
            this.tabs = this.tabsInBar = [];
        }
        this.refresh();
        this.saveTabs();
    },

    // Private methods

    tabData: function() {
        return Ext.Array.map(this.tabs, function(t){
            return this.tabCache[t];
        }, this);
    },

    /**
     * @private
     * Determines if the tab bar has room for a new tab.
     * @return {Boolean} True if tab bar has room for a new tab
     */
    roomForNewTab: function() {
        return this.tabsInBar.length < this.maxTabsInBar();
    },

    /**
     * @private
     * @return {Boolean} True if we are already tracking a tab with the given URL
     */
    hasTab: function(url) {
        return Ext.Array.contains(this.tabs, url);
    },

    /**
     * @private
     * Adds a tab to the tab bar
     */
    addTabToBar: function(tab, opts) {
        this.tabsInBar.push(tab.href);

        var docTab = Ext.get(this.tabTpl.append(this.el.dom, tab));

        this.addMainTabTooltip(docTab, tab);

        if (opts.animate && !Ext.isIE) {
            // Effect to 'slide' the tab out when it is created.
            docTab.setStyle('width', '10px');
            docTab.setStyle({ visibility: 'visible' });
            docTab.animate({
                to: { width: this.tabWidth() }
            });
        }
        else {
            docTab.setStyle({ visibility: 'visible' });
        }

        this.resizeTabs(opts);
    },

    /**
     * @private
     * @return {Boolean} true if the tab is in the tab bar
     */
    inTabBar: function(url) {
        return Ext.Array.contains(this.tabsInBar, url);
    },

    /**
     * @private
     * @return {Boolean} true if the tab is in the tab bar or static tabs
     */
    inTabs: function(url) {
        var urls = Ext.Array.pluck(this.staticTabs, 'href').concat(this.tabsInBar);
        return Ext.Array.contains(urls, url);
    },

    /**
     * @private
     */
    removeTabFromBar: function(url) {
        var docTab = this.getTabEl(url);

        docTab.dom.removed = true;
        if (Ext.isIE) {
            docTab.remove();
            this.createOverflowButton();
        } else {
            docTab.animate({
                to: { top: 30 },
                duration: this.animDuration
            }).animate({
                to: { width: 10 },
                duration: this.animDuration,
                listeners: {
                    afteranimate: function() {
                        docTab.remove();
                        this.shouldResize = true;
                        this.createOverflowButton();
                    },
                    scope: this
                }
            });
        }
    },

    /**
     * @private
     * Swaps the last tab with the given tab currently in the overflow list
     */
    swapLastTabWith: function(url) {
        var lastTab = this.getTabEl(this.tabsInBar[this.tabsInBar.length - 1]);
        if (lastTab) {
            var newTab = this.tabTpl.append(document.body, this.tabCache[url]);
            lastTab.dom.parentNode.replaceChild(newTab, lastTab.dom);
            this.tabsInBar[this.tabsInBar.length - 1] = url;
            Ext.get(newTab).setStyle({ visibility: 'visible', width: String(this.tabWidth()) + 'px' });

            this.addMainTabTooltip(newTab, this.tabCache[url]);
        }
    },

    /**
     * @private
     */
    highlightOverviewTab: function(url) {
        var overviewTab = Ext.query('.doctab.' + this.getControllerName(url).toLowerCase());
        if (overviewTab && overviewTab[0]) {
            Ext.get(overviewTab[0]).addCls('highlight');
        }
    },

    /**
     * @private
     * @return {Number} Maximum number of tabs we can fit in the tab bar
     */
    maxTabsInBar: function() {
        return Math.floor(this.tabBarWidth() / this.minTabWidth);
    },

    /**
     * @private
     * @return {Number} Width of a tab in the tab bar
     */
    tabWidth: function() {
        var width = Math.floor(this.tabBarWidth() / this.tabsInBar.length) + 6;

        if (width > this.maxTabWidth) {
            return this.maxTabWidth;
        }
        else if (width < this.minTabWidth) {
            return this.minTabWidth;
        }
        else {
            return width;
        }
    },

    /**
     * @private
     * @return {Number} Width of the tab bar (not including the static tabs)
     */
    tabBarWidth: function() {
        return this.getWidth() - (this.staticTabs.length * 50) - 15;
    },

    /**
     * @private
     * Resize tabs in the tab bar
     */
    resizeTabs: function(opts) {
        this.shouldResize = false;
        Ext.Array.each(Ext.query('.doctab'), function(t){
            var docTab = Ext.get(t);
            if (!docTab.dom.removed && !docTab.hasCls('overview')) {
                if (opts && opts.animate && !Ext.isIE) {
                    docTab.animate({
                        to: { width: this.tabWidth() }
                    });
                } else {
                    docTab.setWidth(this.tabWidth());
                }
            }
        }, this);
    },

    getTabEl: function(url) {
        var doctab = Ext.query('.doctab a[href="' + url + '"]');
        if (doctab && doctab[0]) {
            return Ext.get(doctab[0]).up('.doctab');
        }
    },

    // Creates new overflow button, replacing the existing one
    createOverflowButton: function() {
        if (this.overflowButton) {
            this.overflowButton.destroy();
        }

        this.overflowButton = Ext.create('Ext.button.Button', {
            baseCls: "",
            renderTo: this.getEl().down('.tab-overflow'),
            menu: this.createMenu()
        });
    },

    // creates menu listing all tabs
    createMenu: function() {
        var menu = new Docs.view.TabMenu({
            listeners: {
                closeAllTabs: this.closeAllTabs,
                tabItemClick: function(item) {
                    this.fireEvent("tabActivate", item.href, { navigate: true });
                },
                scope: this
            }
        });

        Ext.Array.each(this.tabs, function(tab) {
            this.addTabToMenu(menu, this.tabCache[tab]);
        }, this);

        return menu;
    },

    // Adds a tab to the menu
    addTabToMenu: function(menu, tab) {
        var idx = Ext.Array.indexOf(this.tabs, tab.href);

        if (this.tabs.length > this.tabsInBar.length && idx === this.maxTabsInBar()) {
            // Add 'overflow' class to last visible tab in overflow dropdown
            menu.addTabCls(tab, 'overflow');
        }

        var inTabBar = this.inTabBar(tab.href);
        menu.addTab(tab, inTabBar ? '' : 'overflow');
    },

    addToolTips: function() {
        Ext.Array.each(this.staticTabs, function(tab) {
            var el = Ext.get(Ext.query('.doctab.' + tab.cls)[0]);
            if (el) {
                Ext.create('Ext.tip.ToolTip', {
                    target: el,
                    html: tab.tooltip
                });
            }
        });

        Ext.Array.each(this.tabsInBar, function(url) {
            var el = Ext.get(Ext.query('a.main-tab[href="' + url + '"]')[0]);
            var tab = this.tabCache[url];
            if (el) {
                this.addMainTabTooltip(el.up(".doctab"), tab);
            }
        }, this);
    },

    addMainTabTooltip: function(tabEl, tab) {
        if (tab.tooltip) {
            Ext.create('Ext.tip.ToolTip', {
                target: tabEl,
                html: tab.tooltip
            });
        }
    },

    saveTabs: function() {
        Docs.Settings.set('tabs', this.tabs);
    },

    /**
     * @private
     * Determines controller name from a URL
     */
    getControllerName: function(url) {
        if (/#!?\/api/.test(url)) {
            return 'Classes';
        }
        else if (/#!?\/guide/.test(url)) {
            return 'Guides';
        }
        else if (/#!?\/video/.test(url)) {
            return 'Videos';
        }
        else if (/#!?\/example/.test(url)) {
            return 'Examples';
        }
        else if (/#!?\/tests/.test(url)) {
            return 'Tests';
        }
        else if (/#!?\/comment/.test(url)) {
            return 'Comments';
        }
        else {
            return 'Index';
        }
    }
});
