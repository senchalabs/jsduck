/**
 * Browser history management with history.pushState for compliant
 * browsers.
 */
Ext.define("Docs.History", {
    singleton: true,
    compliant: window.history && window.history.pushState,

    init: function() {
        if (!this.compliant) {
            return;
        }

        window.addEventListener('popstate', function(e) {
            e.preventDefault();
            if (e.state && e.state.docClass) {
                Docs.ClassLoader.load(e.state.docClass, true);
                Ext.getCmp('treePanelCmp').selectClass(e.state.docClass);
            }
            return false;
        }, false);

        var matches = document.location.hash.match(/#\/api\/(.*)/);
        if (matches) {
            var className = matches[1];
            Docs.ClassLoader.load(className, true);
            Ext.getCmp('treePanelCmp').selectClass(className);
        }
    },

    push: function(className) {
        if (!this.compliant) {
            return;
        }
        var fullUrl = Docs.App.getBaseUrl() + "#/api/" + className;
        window.history.pushState({docClass: className}, '', fullUrl);
    }
});
