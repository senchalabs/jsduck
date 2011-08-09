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

    initComponent: function() {
        var tpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="doctab overview {cls}{active}">',
                    '<div class="l"></div>',
                    '<div class="m"><a class="tabUrl" href="{href}">&nbsp;</a></div>',
                    '<div class="r"></div>',
                '</div>',
            '</tpl>',
            '<div style="float: left; width: 8px">&nbsp;</div>'
        );

        this.html = tpl.applyTemplate([
            { cls: 'index',    href: '#' },
            { cls: 'classes',  href: '#/api' },
            { cls: 'guides',   href: '#/guide' },
            { cls: 'videos',   href: '#/video' },
            { cls: 'examples', href: '#/example' }
        ]);

        this.callParent();
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
        if (!Ext.Array.contains(this.openTabs, tab.href)) {
            var tpl = Ext.create('Ext.XTemplate',
                '<div class="doctab" style="visibility: hidden">',
                    '<div class="l"></div>',
                    '<div class="m">',
                        '<span class="icn {iconCls}">&nbsp;</span>',
                        '<a class="tabUrl" href="{href}">{text}</a>',
                        '<a class="close" href="#">&nbsp;</a>',
                    '</div>',
                '<div class="r"></div>',
                '</div>'
            );
            var docTab = Ext.get(tpl.append(this.el.dom, tab));

            if (opts.animate) {
                // Effect to 'slide' the tab out when it is created.
                var width = docTab.getWidth();
                docTab.setStyle('width', '10px');
                docTab.setStyle({ visibility: 'visible' });
                docTab.animate({
                    to: { width: width }
                });
            }
            else {
                docTab.setStyle({ visibility: 'visible' });
            }

            this.openTabs.push(tab.href);
            Docs.Settings.set('openTabs', this.openTabs);
        }

        if (opts.activate) {
            this.activateTab(tab.href);
        }
    },

    /**
     * Activates a tab
     *
     * @param {String} url URL of the tab to activate
     */
    activateTab: function(url) {
        this.activeTab = Ext.Array.indexOf(this.openTabs, url);
        Ext.Array.each(Ext.query('.doctab a[class=tabUrl]'), function(d) {
            Ext.get(d).up('.doctab').removeCls(['active', 'highlight']);
        });
        var activeTab = Ext.query('.doctab a[href="' + url + '"]')[0];
        if (activeTab) {
            var docTab = Ext.get(activeTab).up('.doctab');
            docTab.addCls('active');
            if (!docTab.hasCls('overview')) {
                var overviewTab = Ext.query('.doctab.' + this.getControllerName(url).toLowerCase());
                if (overviewTab && overviewTab[0]) {
                    Ext.get(overviewTab[0]).addCls('highlight');
                }
            }
        }
        window.location = url;
    },

    /**
     * Removes a tab from the tab bar. If the tab to be removed is the current tab,
     * activate the tab to the right.
     *
     * @param {String} url URL of the tab to remove
     */
    removeTab: function(url) {
        var idx = Ext.Array.indexOf(this.openTabs, url);
        if (idx !== false) {
            Ext.Array.erase(this.openTabs, idx, 1);
            Docs.Settings.set('openTabs', this.openTabs);
            if (this.activeTab > idx) {
                this.activeTab -= 1;
            }
        }
        if (idx === this.activeTab) {
            if (this.openTabs.length === 0) {
                Docs.App.getController(this.getControllerName(url)).loadIndex();
            }
            else {
                if (idx === this.openTabs.length) {
                    idx -= 1;
                }
                this.activateTab(this.openTabs[idx]);
            }
        }
    },

    // Determines controller name from URL
    getControllerName: function(url) {
        if (/#\/api/.test(url)) {
            return 'Classes';
        }
        else if (/#\/guide/.test(url)) {
            return 'Guides';
        }
        else if (/#\/video/.test(url)) {
            return 'Videos';
        }
        else if (/#\/example/.test(url)) {
            return 'Examples';
        }
        else {
            return 'Index';
        }
    }
});
