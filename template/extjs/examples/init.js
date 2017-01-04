Ext.ns('Ext.samples');

(function() {

    Ext.define('Ext.samples.SamplePanel', {
        extend: 'Ext.view.View',
        alias: 'widget.samplepanel',
        autoHeight   : true,
        frame        : false,
        cls          : 'demos',
        itemSelector : 'dl',
        overItemCls  : 'over',
        trackOver    : true,
        tpl          : Ext.create('Ext.XTemplate',
            '<div id="sample-ct">',
                '<tpl for=".">',
                '<div><a name="{id}"></a><h2><div>{title}</div></h2>',
                '<dl>',
                    '<tpl for="items">',
                        '<dd ext:url="{url}"><img src="shared/screens/{icon}"/>',
                            '<div><h4>{text}',
                                '<tpl if="this.isNew(values.status)">',
                                    '<span class="new-sample"> (New)</span>',
                                '<tpl elseif="this.isUpdated(values.status)">',
                                    '<span class="updated-sample"> (Updated)</span>',
                                '<tpl elseif="this.isExperimental(values.status)">',
                                    '<span class="new-sample"> (Experimental)</span>',
                                '<tpl elseif="status">',
                                    '<span class="status"> ({status})</span>',
                                '</tpl>',
                            '</h4><p>{desc}</p></div>',
                        '</dd>',
                    '</tpl>',
                '<div style="clear:left"></div></dl></div>',
                '</tpl>',
            '</div>', {
             isExperimental: function(status){
                 return status == 'experimental';
             },
             isNew: function(status){
                 return status == 'new';
             },
             isUpdated: function(status){
                 return status == 'updated';
             }
        }),

        onContainerClick: function(e) {
            var group = e.getTarget('h2', 3, true);

            if (group) {
                group.up('div').toggleCls('collapsed');
            }
        },

        onItemClick : function(record, item, index, e){
            var t = e.getTarget('dd', 5, true);

            if (t && !e.getTarget('a', 2)) {
                var url = t.getAttributeNS('ext', 'url');
                window.open(url);
            }

            return this.callParent(arguments);
        }
    });
})();

Ext.onReady(function() {

    (Ext.defer(function() {
        // Instantiate Ext.App instance
        var App = Ext.create('Ext.App', {});

        var catalog = Ext.samples.samplesCatalog;

        for (var i = 0, c; c = catalog[i]; i++) {
            c.id = 'sample-' + i;
        }

        var store = Ext.create('Ext.data.Store', {
            fields     : ['id', 'title', 'items'],
            data       : catalog
        });

        var panel = Ext.create('Ext.panel.Panel', {
            frame      : false,
            renderTo   : 'all-demos',
            height     : 300,
            autoScroll : true,
            items      : Ext.create('Ext.samples.SamplePanel', {
                store : store
            })
        });

        var tpl = Ext.create('Ext.XTemplate',
            '<tpl for="."><li><a href="#{id}">{title:stripTags}</a></li></tpl>'
        );
        tpl.overwrite('sample-menu', catalog);

        Ext.get('sample-spacer').remove();

        var headerEl  = Ext.get('hd'),
            footerEl  = Ext.get('ft'),
            bodyEl    = Ext.get('bd'),
            sideBoxEl = bodyEl.down('div[class=side-box]'),
            titleEl   = bodyEl.down('h1#pagetitle');

        var doResize = function() {
            var windowHeight = Ext.getDoc().getViewSize(false).height;

            var footerHeight  = footerEl.getHeight() + footerEl.getMargin().top,
                titleElHeight = titleEl.getHeight() + titleEl.getMargin().top,
                headerHeight  = headerEl.getHeight() + titleElHeight;

            var warnEl = Ext.get('fb');
            var warnHeight = warnEl ? warnEl.getHeight() : 0;

            var availHeight = windowHeight - ( footerHeight + headerHeight + 14) - warnHeight;
            var sideBoxHeight = sideBoxEl.getHeight();

            panel.setHeight((availHeight > sideBoxHeight) ? availHeight : sideBoxHeight);
        };

        // Resize on demand
        Ext.EventManager.onWindowResize(doResize);

        var firebugWarning = function () {
            var cp = Ext.create('Ext.state.CookieProvider');

            if(window.console && window.console.firebug && ! cp.get('hideFBWarning')){
                var tpl = Ext.create('Ext.Template',
                    '<div id="fb" style="border: 1px solid #FF0000; background-color:#FFAAAA; display:none; padding:15px; color:#000000;"><b>Warning: </b> Firebug is known to cause performance issues with Ext JS. <a href="#" id="hideWarning">[ Hide ]</a></div>'
                );
                var newEl = tpl.insertFirst('all-demos');

                Ext.fly('hideWarning').on('click', function() {
                    Ext.fly(newEl).slideOut('t',{remove:true});
                    cp.set('hideFBWarning', true);
                    doResize();
                });
                Ext.fly(newEl).slideIn();
                doResize();
            }
        };

        var hideMask = function () {
            Ext.get('loading').remove();
            Ext.fly('loading-mask').animate({
                opacity:0,
                remove:true,
                callback: firebugWarning
            });
        };

        Ext.defer(hideMask, 250);
        doResize();

    },500));
});

