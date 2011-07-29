Ext.define('Docs.view.Tabs', {
    extend: 'Ext.container.Container',
    alias: 'widget.doctabs',
    id: 'doctabs',

    componentCls: 'doctabs',

    openTabs: [],

    initComponent: function() {

        this.html = [
            '<div class="doctab home"><div class="l"></div><div class="m"><a class="docClass" href="#">&nbsp;</a></div><div class="r"></div></div>',
            '<div class="doctab api active"><div class="l"></div><div class="m"><a class="docClass" href="#">&nbsp;</a></div><div class="r"></div></div>',
            '<div class="doctab videos"><div class="l"></div><div class="m"><a class="docClass" href="#">&nbsp;</a></div><div class="r"></div></div>',
            '<div class="doctab guides"><div class="l"></div><div class="m"><a class="docClass" href="#">&nbsp;</a></div><div class="r"></div></div>',
            '<div class="doctab themes"><div class="l"></div><div class="m"><a class="docClass" href="#">&nbsp;</a></div><div class="r"></div></div>',
            '<div style="float: left; width: 8px">&nbsp;</div>'
        ].join('');

        this.callParent();
    },

    addTab: function(item) {

        if (!Ext.Array.contains(this.openTabs, item.cls)) {
            var tpl = Ext.create('Ext.XTemplate',
                '<div class="doctab" style="visibility: hidden">',
                    '<div class="l"></div>',
                    '<div class="m">',
                        '<a class="icn {icn}" href="#">&nbsp;</a>',
                        '<a class="docClass" href="{cls}">{clsName}</a>',
                    '</div>',
                '<div class="r"></div>',
                '</div>'
            )
            var docTab = Ext.get(tpl.append(this.el.dom, item));
            var width = docTab.getWidth();
            docTab.setStyle('width', '10px')
            docTab.setStyle({visibility: 'visible'})
            docTab.animate({
                to: { width: width }
            });

            this.openTabs.push(item.cls);
        }
        this.activateTab(item.cls)
    },

    activateTab: function(url) {
        this.activeTab = Ext.Array.indexOf(this.openTabs, url);
        Ext.Array.each(Ext.query('.doctab a[class=docClass]'), function(d) {
            Ext.get(d).up('.doctab').removeCls('active');
        });
        var activeTab = Ext.query('.doctab a[href="' + url + '"]')[0];
        if (activeTab) Ext.get(activeTab).up('.doctab').addCls('active');
    },

    removeTab: function(url) {
        var idx = Ext.Array.indexOf(this.openTabs, url);
        if (idx !== false) {
            Ext.Array.erase(this.openTabs, idx, 1);
            if (this.activeTab > idx) this.activeTab -= 1;
        }
        // console.log("Total", this.openTabs.length, "Clicked: ", idx, "Active: ", this.activeTab, this.openTabs)
        if (idx == this.activeTab) {
            if (this.openTabs.length == 0) {
                // Go to home screen
            } else  {
                if (idx == 0) idx = 1;
                Docs.App.getController('Classes').handleUrlClick(this.openTabs[idx - 1], {});
            }
        }
    }
});







































