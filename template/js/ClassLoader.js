/**
 * Manages the loading of class documentation.
 */
Ext.define("Docs.ClassLoader", {
    singleton: true,
    cache: {},

    /**
     * Loads class.
     *
     * @param {String} cls  name of the class to load
     * @param {Boolean} noHistory  true to disable adding entry to browser history
     */
    load: function(cls, noHistory) {
        var member,
            hashIdx = cls.indexOf('#');

        if (hashIdx > 0) {
            member = cls.substr(hashIdx + 1);
            cls = cls.substr(0, hashIdx);
        }

        if (!noHistory) {
            Docs.History.push("/api/" + cls);
        }

        Docs.App.setClassMode();
        var docTabPanel = Ext.getCmp('docTabPanel');
        if (docTabPanel) {
            Ext.getCmp('docTabPanel').setActiveTab(0);
        }

        if (this.cache[cls]) {
            this.showClass(this.cache[cls], member);
        } else {
            if (docTabPanel) {
                Ext.getCmp('doc-overview').setLoading(true);
            }

            Ext.Ajax.request({
                url: Docs.App.getBaseUrl() + '/output/' + cls + '.json',
                success: function(response, opts) {
                    var json = Ext.JSON.decode(response.responseText);
                    this.cache[cls] = json;
                    this.showClass(json, member);
                },
                failure : function(response, opts) {
                    console.log('Fail');
                },
                scope: this
            });
        }
    },

    showClass: function(cls, anchor) {
        var docTabPanel = Ext.getCmp('docTabPanel');
        if (!docTabPanel) {
            Ext.create('Docs.ClassPanel');
        }

        Ext.get('docTabPanel').show();
        var pageContent = Ext.get('pageContent');
        if (pageContent) {
            pageContent.setVisibilityMode(Ext.core.Element.DISPLAY).hide();
        }

        Docs.PageHeader.load(cls);

        var docOverviewTab = Ext.getCmp('doc-overview');
        docOverviewTab.load(cls);
        docOverviewTab.setLoading(false);

        if (anchor) {
            Ext.getCmp('doc-overview').scrollToEl("a[name=" + anchor + "]");
        } else {
            var docContent = Ext.get(Ext.query('#doc-overview .x-panel-body')[0]);
            docContent.scrollTo('top', 0);
        }
    }
});

