Ext.onReady(function() {
    resizeWindowFn();

    // Resize the main window and tree on resize
    window.onresize = function() {
        if (!resizeWindows) {
            resizeWindows = setTimeout(resizeWindowFn, 100);
        }
    };

    Ext.tip.QuickTipManager.init();
    Docs.History.init();

    Ext.create('Docs.ClassTree', {
      root: Docs.classData
    });
});
