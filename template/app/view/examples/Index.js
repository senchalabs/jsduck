Ext.define('Docs.view.examples.Index', {
    extend: 'Ext.container.Container',
    alias : 'widget.examplesindex',
    autoScroll : true,

    cls : 'all-demos',

    initComponent: function() {

        var catalog = Ext.samples.samplesCatalog;

        for (var i = 0, c; c = catalog[i]; i++) {
            c.id = 'sample-' + i;
        }

        var store = Ext.create('Ext.data.JsonStore', {
            idProperty : 'id',
            fields     : ['id', 'title', 'samples'],
            data       : catalog
        });

        this.items = [
            Ext.create('Docs.view.examples.List', {
                store: store
            })
        ]

        this.callParent(arguments);
    }
});

// Ext.onReady(function() {
//
//     (Ext.defer(function() {
//         // Instantiate Ext.App instance
//         var App = Ext.create('Ext.App', {});
//
//         var catalog = Ext.samples.samplesCatalog;
//
//         for (var i = 0, c; c = catalog[i]; i++) {
//             c.id = 'sample-' + i;
//         }
//
//         var store = Ext.create('Ext.data.JsonStore', {
//             idProperty : 'id',
//             fields     : ['id', 'title', 'samples'],
//             data       : catalog
//         });
//
//         var panel = Ext.create('Ext.Panel', {
//             frame      : false,
//             renderTo   : Ext.get('all-demos'),
//             height     : 300,
//             autoScroll : true,
//             items      : Ext.create('Ext.samples.SamplePanel', {
//                 store : store
//             })
//         });
//
//         var tpl = Ext.create('Ext.XTemplate',
//             '<tpl for="."><li><a href="#{id}">{title:stripTags}</a></li></tpl>'
//         );
//         tpl.overwrite('sample-menu', catalog);
//
//         Ext.select('#sample-spacer').remove();
//
//         var headerEl  = Ext.get('hd'),
//             footerEl  = Ext.get('ft'),
//             bodyEl    = Ext.get('bd'),
//             sideBoxEl = bodyEl.down('div[class=side-box]'),
//             titleEl   = bodyEl.down('h1#pagetitle');
//
//         var doResize = function() {
//             var windowHeight = Ext.getDoc().getViewSize(false).height;
//
//             var footerHeight  = footerEl.getHeight() + footerEl.getMargin().top,
//                 titleElHeight = titleEl.getHeight() + titleEl.getMargin().top,
//                 headerHeight  = headerEl.getHeight() + titleElHeight;
//
//             var warnEl = Ext.get('fb');
//             var warnHeight = warnEl ? warnEl.getHeight() : 0;
//
//             var availHeight = windowHeight - ( footerHeight + headerHeight + 14) - warnHeight;
//             var sideBoxHeight = sideBoxEl.getHeight();
//
//             panel.setHeight((availHeight > sideBoxHeight) ? availHeight : sideBoxHeight);
//         };
//
//         // Resize on demand
//         Ext.EventManager.onWindowResize(doResize);
//
//         var firebugWarning = function () {
//             var cp = Ext.create('Ext.state.CookieProvider');
//
//             if(window.console && window.console.firebug && ! cp.get('hideFBWarning')){
//                 var tpl = Ext.create('Ext.Template',
//                     '<div id="fb" style="border: 1px solid #FF0000; background-color:#FFAAAA; display:none; padding:15px; color:#000000;"><b>Warning: </b> Firebug is known to cause performance issues with Ext JS. <a href="#" id="hideWarning">[ Hide ]</a></div>'
//                 );
//                 var newEl = tpl.insertFirst('all-demos');
//
//                 Ext.fly('hideWarning').on('click', function() {
//                     Ext.fly(newEl).slideOut('t',{remove:true});
//                     cp.set('hideFBWarning', true);
//                     doResize();
//                 });
//                 Ext.fly(newEl).slideIn();
//                 doResize();
//             }
//         };
//
//         var hideMask = function () {
//             Ext.get('loading').remove();
//             Ext.fly('loading-mask').animate({
//                 opacity:0,
//                 remove:true,
//                 callback: firebugWarning
//             });
//         };
//
//         Ext.defer(hideMask, 250);
//         doResize();
//
//     },500));
// });
