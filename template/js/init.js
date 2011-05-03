Ext.onReady(function() {
    resizeWindowFn();

    // Resize the main window and tree on resize
    window.onresize = function() {
        if (!resizeWindows) {
            resizeWindows = setTimeout(resizeWindowFn, 100);
        }
    };

    if (req.standAloneMode) {
        if (window.location.href.match(/api/)) {
            req.baseDocURL = '../';
        } else if (window.location.href.match(/guide/)) {
            req.baseDocURL = '../';
        }
    }

    // History manager for compliant browsers
    if (window.history && window.history.pushState && !req.standAloneMode) {
        var ignoreInitialHistory = true;

        window.addEventListener('popstate', function(e) {
            e.preventDefault();

            if (ignoreInitialHistory) {
                ignoreInitialHistory = false;
                return false;
            }

            if (e.state && e.state.docClass) {
                getDocClass(e.state.docClass, true);
            }
            return false;
        }, false);
    }

    Docs.classData.expanded = true;
    Docs.classData.children[0].expanded = true;
    Ext.create('Docs.ClassTree', {
      root: Docs.classData
    });
});
