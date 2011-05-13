/**
 * Manages the front page and switching between the main parts of docs
 * app.
 */
Ext.define("Docs.App", {
    singleton: true,

    /**
     * Returns base URL used for making AJAX requests.
     * @return {String} URL
     */
    getBaseUrl: function() {
        return document.location.href.replace(/#.*/, "").replace(/index.html/, "");
    },

    /**
     * Initializes listeners for all kind of links on front page.
     */
    init: function() {
        this.initResizeWindow();

        // load front page when clicked on logo
        Ext.get(Ext.query(".header > h2 > a")[0]).addListener('click', function() {
            this.setIndexMode();
        }, this, {preventDefault: true});

        // load guide when clicked on guide link
        Ext.Array.forEach(Ext.query("#api-overview .guides a"), function(el) {
            Ext.get(el).addListener('click', function() {
                this.setGuideMode();
                Docs.Guides.load(el.href);
            }, this, {preventDefault: true});
        }, this);

        // render classes tree
        Ext.create('Docs.ClassTree', {
            root: Docs.classData
        });

        Ext.tip.QuickTipManager.init();
        Docs.History.init();
    },

    setIndexMode: function() {
        Ext.get("top-block").setStyle({display: 'block'});
        Ext.get("top-block").update('<h1>Ext JS 4.0 API Documentation</h1>');

        Ext.get("api-overview").setStyle({display: 'block'});
        Ext.get("api-guide").setStyle({display: 'none'}).update("");
        Ext.get("api-class").setStyle({display: 'none'});
    },

    setGuideMode: function() {
        Ext.get("top-block").setStyle({display: 'none'});

        Ext.get("api-overview").setStyle({display: 'none'});
        Ext.get("api-guide").setStyle({display: 'block'});
        Ext.get("api-class").setStyle({display: 'none'});
    },

    setClassMode: function() {
        Ext.get("top-block").setStyle({display: 'block'});

        Ext.get("api-overview").setStyle({display: 'none'});
        Ext.get("api-guide").setStyle({display: 'none'}).update("");
        Ext.get("api-class").setStyle({display: 'block'});
    },

    initResizeWindow: function() {
        this.resizeWindow();
        // Resize the main window and tree on resize
        window.onresize = Ext.bind(function() {
            if (!this.resizeTimeout) {
                this.resizeTimeout = setTimeout(this.resizeWindow, 100);
            }
        }, this);
    },

    resizeWindow: function() {
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

        this.resizeTimeout = null;
    }
});
