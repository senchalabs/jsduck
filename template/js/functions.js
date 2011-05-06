// Bunch of global functions and variables

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(fun /*, thisp*/) {
        var len = this.length;
        if (typeof fun != "function") {
            throw new TypeError();
        }

        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this) {
                fun.call(thisp, this[i], i, this);
            }
        }
    };
}

var classCache = {};
var getDocClass = function(cls, noHistory) {
    var member,
        hashIdx = cls.indexOf('#');

    if (hashIdx > 0) {
        member = cls.substr(hashIdx + 1);
        cls = cls.substr(0, hashIdx);
    }

    if (!noHistory) {
        Docs.History.push(cls);
    }

    var docTabPanel = Ext.getCmp('docTabPanel');
    if (docTabPanel) {
        Ext.getCmp('docTabPanel').setActiveTab(0);
    }

    if (classCache[cls]) {
        showClass(classCache[cls], member);
    } else {
        if (docTabPanel) {
            Ext.getCmp('doc-overview').setLoading(true);
        }

        Ext.Ajax.request({
            url: Docs.App.getBaseUrl() + '/output/' + cls + '.json',
            success: function(response, opts) {
                var json = Ext.JSON.decode(response.responseText);
                classCache[cls] = json;
                showClass(json, member);
            },
            failure : function(response, opts) {
              console.log('Fail');
            }
        });
    }
};

var showClass = function(cls, anchor) {
    var docTabPanel = Ext.getCmp('docTabPanel');
    if (!docTabPanel) {
         Ext.get('docContent').update('');
         Ext.create('Docs.ClassPanel', {
           docClass: cls
         });
    }

    Ext.get('docTabPanel').show();
    var pageContent = Ext.get('pageContent');
    if (pageContent) {
        pageContent.setVisibilityMode(Ext.core.Element.DISPLAY).hide();
    }

    var docOverviewTab = Ext.getCmp('doc-overview');
    docOverviewTab.load(cls);
    docOverviewTab.setLoading(false);

    prettyPrint();

    Ext.get(Ext.DomQuery.selectNode('#top-block > h1')).update(cls.name);
    if (anchor) {
        Ext.getCmp('doc-overview').scrollToEl("a[name=" + anchor + "]");
    } else {
        var docContent = Ext.get(Ext.query('#doc-overview .x-panel-body')[0]);
        docContent.scrollTo('top', 0);
    }
};

var showContent = function(title, html) {
    Ext.getCmp('docTabPanel').hide();
    Ext.get('pageContent').setVisibilityMode(Ext.core.Element.DISPLAY).show().update(html);
};


var resizeWindows;
var resizeWindowFn = function() {
    var treePanelCmp = Ext.getCmp('treePanelCmp'),
        docTabPanel = Ext.getCmp('docTabPanel'),
        container = Ext.get('container'),
        viewportHeight = Ext.core.Element.getViewportHeight(),
        viewportWidth = Ext.core.Element.getViewportWidth();

    if (Ext.get('notice')) {
        viewportHeight = viewportHeight - 40;
    }

    container.setStyle({
        position: 'absolute',
        height: String(viewportHeight - 40) + 'px',
        width: String(viewportWidth - 280) + 'px'
    });

    if (treePanelCmp) {
        treePanelCmp.setHeight(viewportHeight - 140);
    } else {
        Ext.get('docContent').setHeight(viewportHeight - 90);
    }

    if (docTabPanel) {
        docTabPanel.setHeight(viewportHeight - 125);
    }

    resizeWindows = null;
};
