/**
 * Handles the Tab bar functionality and tracking of Tabs.
 * This is a custom implementation and has nothing to do with regular Ext tabs.
 */
Ext.define('Docs.view.Tabs', {
    extend: 'Ext.container.Container',
    alias: 'widget.doctabs',
    id: 'doctabs',

    componentCls: 'doctabs',

    openTabs: [],
    tabBarTabs: [],
    overflowTabs: [],

    tabWidth: 140,
    minTabWidth: 80,

    initComponent: function() {
        var tpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="doctab overview {cls}{active}">',
                    '<div class="l"></div>',
                    '<div class="m"><a class="tabUrl" href="{href}">&nbsp;</a></div>',
                    '<div class="r"></div>',
                '</div>',
            '</tpl>',
            '<div style="float: left; width: 8px">&nbsp;</div>',
            '<div id="tabOverflow"></div>'
        );

        this.html = tpl.applyTemplate([
            { cls: 'index',    href: '#' },
            { cls: 'classes',  href: '#!/api' },
            { cls: 'guides',   href: '#!/guide' },
            { cls: 'videos',   href: '#!/video' },
            { cls: 'examples', href: '#!/example' }
        ]);

        this.callParent();
    },

    listeners: {
        afterrender: function() {
            Ext.create('Ext.button.Button', {
                baseCls: null,
                renderTo: 'tabOverflow',
                menu: {
                    id: 'tabOverflowMenu',
                    plain: true,
                    items: []
                }
            });
        }
    },

    tabQueue: [],

    /**
     * Adds a new tab to the Tab bar
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

        // If there is room add tab
        // If no room, move last tab to overflow menu and update with current tab

        if (!Ext.Array.contains(this.openTabs, tab.href)) {

            this.openTabs.push(tab.href);
            Docs.Settings.set('openTabs', this.openTabs);

            if (this.overflowing()) {
                Ext.get('tabOverflow').show();
            } else {
                this.addTabToBar(tab, opts);
            }

            Ext.getCmp('tabOverflowMenu').add({
                text: tab.text,
                iconCls: tab.iconCls,
                origIcon: tab.iconCls,
                href: tab.href,
                cls: 'x-menu-item-checked' + (this.overflowing() ? ' overflow' : '')
            });
        }

        if (opts.activate) {
            this.activateTab(tab.href);
        }

        this.resizeTabs();
    },

    addTabToBar: function(tab, opts) {

        this.tabBarTabs.push(tab.url);

        var tpl = Ext.create('Ext.XTemplate',
            '<div class="doctab" style="visibility: hidden">',
                '<div class="l"></div>',
                '<div class="m">',
                    '<span class="icn {iconCls}">&nbsp;</span>',
                    '<a class="tabUrl" href="{href}">{text}</a>',
                '</div>',
            '<div class="r"><a class="close" href="#">&nbsp;</a></div>',
            '</div>'
        );
        var docTab = Ext.get(tpl.append(this.el.dom, tab));

        if (opts.animate) {
            // Effect to 'slide' the tab out when it is created.
            docTab.setStyle('width', '10px');
            docTab.setStyle({ visibility: 'visible' });
            docTab.animate({
                to: { width: this.tabWidth - this.tabDelta() }
            });
        }
        else {
            docTab.setStyle({ visibility: 'visible' });
        }
    },

    /**
     * Returns the width of the Tab Bar
     * @return {Number} Tab bar width
     */
    tabBarWidth: function() {
        return Ext.getCmp('doctabs').getWidth() - 240;
    },

    /**
     * Returns the cumulative width of all visible tabs
     * @return {Number} Tabs width
     */
    totalTabsWidth: function() {
        return this.openTabs.length * this.tabWidth;
    },

    /**
     * Returns the cumulative width of all visible tabs
     * @return {Number} Tabs width
     */
    minTabsWidth: function() {
        return this.openTabs.length * this.minTabWidth;
    },

    maxVisibleTabs: function() {
        return Math.ceil(this.tabBarWidth() / this.minTabWidth);
    },

    /**
     * Returns the width delta to be applied to each tab for them to fit within the tab bar
     * @return {Number} Number of pixels
     */
    tabDelta: function() {

        var numTabs = this.maxVisibleTabs();
        if (this.openTabs.length < numTabs) numTabs = this.openTabs.length;

        var delta = Math.ceil((this.totalTabsWidth() - this.tabBarWidth()) / this.openTabs.length);
        return (delta < 0) ? 0 : delta;
    },

    /**
     * Returns true if the tab bar is overflowing
     */
    overflowing: function() {
        return ((this.openTabs.length - 1) * this.minTabWidth) > this.tabBarWidth();
    },

    /**
     * Resizes the tabs
     */
    resizeTabs: function() {

        clearTimeout(this.resizeTabsTimer);

        if (this.totalTabsWidth() > this.tabBarWidth()) {

            var tabDelta = this.tabDelta();

            Ext.Array.each(Ext.query('.doctab'), function(t){
                var docTab = Ext.get(t);
                if (!docTab.dom.removed && !docTab.hasCls('overview')) {
                    var newWidth = (this.tabWidth - tabDelta) > this.minTabWidth ? (this.tabWidth - tabDelta) : this.minTabWidth;
                    docTab.animate({
                        to: { width: newWidth }
                    });
                }
            }, this);
        }
    },

    /**
     * Activates a tab
     *
     * @param {String} url URL of the tab to activate
     */
    activateTab: function(url, activateOverview) {
        this.activeTab = Ext.Array.indexOf(this.openTabs, url);
        Ext.Array.each(Ext.query('.doctab a[class=tabUrl]'), function(d) {
            Ext.get(d).up('.doctab').removeCls(['active', 'highlight']);
        });
        var activeTab = Ext.query('.doctab a[href="' + url + '"]')[0];
        if (activeTab) {
            var docTab = Ext.get(activeTab).up('.doctab');
            docTab.addCls('active');
            if (!docTab.hasCls('overview')) {
                activateOverview = true;
            }
        }
        if (activateOverview) {
            var overviewTab = Ext.query('.doctab.' + this.getControllerName(url).toLowerCase());
            if (overviewTab && overviewTab[0]) {
                Ext.get(overviewTab[0]).addCls('highlight');
            }
        }

        Ext.Array.each(Ext.ComponentQuery.query('#tabOverflowMenu menuitem'), function(menuItem) {
            menuItem.setIconCls(menuItem.href == url ? undefined : menuItem.origIcon);
        });
    },

    /**
     * Removes a tab from the tab bar. If the tab to be removed is the current tab,
     * returns url of the tab on the right.
     *
     * @param {String} url URL of the tab to remove
     * @return {String} URL of the tab to activate next, or undefined.
     */
    removeTab: function(url) {
        var idx = Ext.Array.indexOf(this.openTabs, url);
        if (idx !== false) {
            Ext.Array.erase(this.openTabs, idx, 1);
            Docs.Settings.set('openTabs', this.openTabs);
            if (this.activeTab > idx) {
                this.activeTab -= 1;
            }

            Ext.Array.each(Ext.ComponentQuery.query('#tabOverflowMenu menuitem[href=' + url + ']'), function(menuItem) {
                Ext.getCmp('tabOverflowMenu').remove(menuItem);
            });
        }

        if (this.resizeTabsTimer) {
            clearTimeout(this.resizeTabsTimer);
        }

        var self = this;
        this.resizeTabsTimer = setTimeout(function(){
            self.resizeTabs();
        }, 1000);

        if (idx === this.activeTab) {
            if (this.openTabs.length === 0) {
                Docs.App.getController(this.getControllerName(url)).loadIndex();
            }
            else {
                if (idx === this.openTabs.length) {
                    idx -= 1;
                }
                return this.openTabs[idx];
            }
        }
        return undefined;
    },

    // Determines controller name from URL
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
        else {
            return 'Index';
        }
    }
});
