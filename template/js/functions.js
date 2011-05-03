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

    if (req.standAloneMode) {
        if (window.location.href.match(/api/)) {
            window.location = cls + '.html';
        } else if (window.location.href.match(/guide/)){
            window.location = '../api/' + cls + '.html';
        } else {
            window.location = 'api/' + cls + '.html';
        }
        return;
    }

    var fullUrl = req.baseDocURL + "/api/" + cls;
    if (!noHistory && window.history && window.history.pushState) {
        window.history.pushState({
            docClass: cls
        },
        '', fullUrl);
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

        Ext.data.JsonP.request({
            callbackKey: 'docsCallback',
            url     : req.baseDocURL + '/api/' + cls + '/ajax',
            success : function(response, opts) {
                classCache[response.cls] = response;
                showClass(response, member);
            },
            failure : function(response, opts) {
              console.log('Fail');
            }
        });
    }
};

var showClass = function(resp, anchor) {
    var docTabPanel = Ext.getCmp('docTabPanel');

    clsInfo = resp.clsInfo;
    req.docClass = resp.cls;
    req.source = resp.source;

    if (!docTabPanel) {
         Ext.get('docContent').update('');
         Ext.create('Docs.ClassPanel');
    }

    Ext.get('docTabPanel').show();
    var pageContent = Ext.get('pageContent');
    if (pageContent) {
        pageContent.setVisibilityMode(Ext.core.Element.DISPLAY).hide();
    }

    var docOverviewTab = Ext.getCmp('doc-overview');

    docOverviewTab.update(resp.content);
    docOverviewTab.removeDocked(Ext.getCmp('overview-toolbar'), true);
    docOverviewTab.addDocked(Ext.create('Docs.OverviewToolbar'));
    docOverviewTab.setLoading(false);

    prettyPrint();

    Ext.get('top-block').update(resp.title);
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
