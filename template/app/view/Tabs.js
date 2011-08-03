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
                '<div class="doctab {cls}{active}">',
                    '<div class="l"></div>',
                    '<div class="m"><a class="tabUrl" href="{href}">&nbsp;</a></div>',
                    '<div class="r"></div>',
                '</div>',
            '</tpl>',
            '<div style="float: left; width: 8px">&nbsp;</div>'
        );

        this.html = tpl.applyTemplate([
            { cls: 'home',   href: '#' },
            { cls: 'api',    href: '#/api' },
            { cls: 'videos', href: '#/videos' },
            { cls: 'guides', href: '#/guide' },
            { cls: 'themes', href: '#/examples' }
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
     */
    addTab: function(tab, noAnimate) {

        if (!Ext.Array.contains(this.openTabs, tab.href)) {
            var tpl = Ext.create('Ext.XTemplate',
                '<div class="doctab" style="visibility: hidden">',
                    '<div class="l"></div>',
                    '<div class="m">',
                        '<a class="icn {iconCls}" href="#">&nbsp;</a>',
                        '<a class="tabUrl" href="{href}">{text}</a>',
                    '</div>',
                '<div class="r"></div>',
                '</div>'
            )
            var docTab = Ext.get(tpl.append(this.el.dom, tab));

            if (noAnimate) {
                docTab.setStyle({ visibility: 'visible' });
            } else {
                // Effect to 'slide' the tab out when it is created.
                var width = docTab.getWidth();
                docTab.setStyle('width', '10px');
                docTab.setStyle({ visibility: 'visible' });
                docTab.animate({
                    to: { width: width }
                });
            }

            this.openTabs.push(tab.href);
        }

        this.activateTab(tab.href)
    },

    /**
     * Activates a tab
     *
     * @param {String} url URL of the tab to activate
     */
    activateTab: function(url) {
        this.activeTab = Ext.Array.indexOf(this.openTabs, url);
        Ext.Array.each(Ext.query('.doctab a[class=tabUrl]'), function(d) {
            Ext.get(d).up('.doctab').removeCls('active');
        });
        var activeTab = Ext.query('.doctab a[href="' + url + '"]')[0];
        if (activeTab) Ext.get(activeTab).up('.doctab').addCls('active');
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
            if (this.activeTab > idx) this.activeTab -= 1;
        }
        if (idx == this.activeTab) {
            if (this.openTabs.length == 0) {
                Docs.App.getController('Classes').loadIndex();
            } else {
                if (idx == this.openTabs.length) idx -= 1;
                window.location = this.openTabs[idx];
            }
        }
    }
});
