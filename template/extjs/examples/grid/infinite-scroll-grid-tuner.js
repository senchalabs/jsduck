Ext.Loader.setConfig({enabled: true});

Ext.Loader.setPath('Ext.ux', '../ux/');

Ext.require([
    '*',
    'Ext.ux.ajax.JsonSimlet',
    'Ext.ux.ajax.SimManager'
]);

Ext.define('BigDataSimlet', {
    extend: 'Ext.ux.ajax.JsonSimlet',

    data: [],
    numFields: 10,
    numRecords: 50*1000,

    getData: function () {
        var me = this,
            data = me.data;

        if (data.length != me.numRecords || me.lastNumColumns != me.numFields) {
            me.currentOrder = null;
            me.lastNumColumns = me.numFields;

            data.length = 0;
            for (var r = 0, k = me.numRecords; r < k; r++) {
                var rec = {};
                for (var i = 0; i < me.numFields; i++) {
                    rec['field' + i] = 'row' + (r + 1) + '/col' + (i+1);
                }
                data.push(rec);
            }
        }

        return this.callParent(arguments);
    }
});

Ext.onReady(function() {
    var simlet = new BigDataSimlet();

    Ext.ux.ajax.SimManager.init({
        delay: 300
    }).register({
        localAjaxSimulator: simlet
    });

    function createStore (numFields) {
        var fields = [],
            i;

        for (i = 0; i < numFields; ++i) {
            fields.push('field' + i);
        }

        simlet.numFields = numFields;

        return Ext.create('Ext.data.Store', {
            remoteSort: true,
            // allow the grid to interact with the paging scroller by buffering
            buffered: true,
            fields: fields,
            proxy: {
                // Simulating Ajax.
                type: 'ajax',
                url: 'localAjaxSimulator',
                reader: {
                    root: 'topics',
                    totalProperty: 'totalCount'
                }
            }
        });
    }

    var store = createStore(10);

    Ext.data.Store.prototype.prefetch = Ext.Function.createInterceptor(Ext.data.Store.prototype.prefetch, function(options) {
        if (!this.pagesRequested || !this.pagesRequested[options.page]) {
            logPanel.log('Prefetch rows ' + options.start + '-' + (options.start + options.limit));
        }
    });

    Ext.data.Store.prototype.onProxyPrefetch = Ext.Function.createSequence(Ext.data.Store.prototype.onProxyPrefetch, function(operation) {
        logPanel.log('Prefetch returned ' + operation.start + '-' + (operation.start + operation.limit));
    });

    Ext.data.Store.prototype.PageMap.prototype.prune = Ext.Function.createSequence(Ext.data.Store.prototype.PageMap.prototype.prune, function() {
        logPanel.log('Page cache contains pages ' + this.getKeys().join(',') + '<br>&#160;&#160;&#160;&#160;' + this.pageSize * this.getCount() + ' records in cache');
    });

    Ext.grid.PagingScroller.prototype.onViewRefresh = Ext.Function.createSequence(Ext.grid.PagingScroller.prototype.onViewRefresh, function() {
        var me = this,
            table = me.view.el.child('table', true);

        logPanel.log('Table moved to top: ' + table.style.top);
    });

    var grid = Ext.create('Ext.grid.Panel', {
        region: 'center',
        title: 'Random data (' + simlet.numRecords + ' records)',
        store: store,
        loadMask: true,
        selModel: {
            pruneRemoved: false
        },
        multiSelect: true,
        columns: [{
            xtype: 'rownumberer',
            width: 50,
            sortable: false
        }]
    });

    function makeLabel (ns, cls, name) {
        var docs = '../..';
        //docs = '../../../.build/sdk'; // for development/testing
        return '<a href="'+docs+'/docs/#!/api/'+ns+'.'+cls+'-cfg-'+name+'" target="docs">' + cls + ' ' + name + '</a>';
    }

    var logPanel = new Ext.Panel({
        title: 'Log',
        region: 'center',
        autoScroll: true,
        log: function(m) {
            logPanel.body.createChild({
                html: m
            });
            logPanel.body.dom.scrollTop = 1000000;
        },
        tbar: [{
            text: 'Clear',
            handler: function() {
                logPanel.body.update('');
            }
        }]
    });

    var controls = Ext.create('Ext.form.Panel', {
        region: 'north',
        split: true,
        height: 345,
        minHeight: 345,
        bodyPadding: 5,
        layout: 'form',
        defaults: {
            labelWidth: 190
        },
        items: [{
            xtype: 'numberfield',
            fieldLabel: 'Ajax latency (ms)',
            itemId: 'latency',
            value: 1000,
            maxValue: 5000
        }, {
            xtype: 'numberfield',
            fieldLabel: 'Dataset row count',
            itemId: 'rowCount',
            value: 50000,
            minValue: 200
        }, {
            xtype: 'numberfield',
            fieldLabel: makeLabel('Ext.data', 'Store', 'pageSize'),
            itemId: 'pageSize',
            value: 150
        }, {
            xtype: 'numberfield',
            fieldLabel: makeLabel('Ext.data', 'Store', 'trailingBufferZone'),
            itemId: 'storeTrailingBufferZone',
            value: Ext.data.Store.prototype.trailingBufferZone
        }, {
            xtype: 'numberfield',
            fieldLabel: makeLabel('Ext.data', 'Store', 'leadingBufferZone'),
            itemId: 'storeLeadingBufferZone',
            value: Ext.data.Store.prototype.leadingBufferZone
        }, {
            xtype: 'numberfield',
            fieldLabel: makeLabel('Ext.grid', 'PagingScroller', 'numFromEdge'),
            itemId: 'scrollerNumFromEdge',
            value: Ext.grid.PagingScroller.prototype.numFromEdge,
            maxValue: 20
        }, {
            xtype: 'numberfield',
            fieldLabel: makeLabel('Ext.grid', 'PagingScroller', 'trailingBufferZone'),
            itemId: 'scrollerTrailingBufferZone',
            value: Ext.grid.PagingScroller.prototype.trailingBufferZone,
            maxValue: 100
        }, {
            xtype: 'numberfield',
            fieldLabel: makeLabel('Ext.grid', 'PagingScroller', 'leadingBufferZone'),
            itemId: 'scrollerLeadingBufferZone',
            value: Ext.grid.PagingScroller.prototype.leadingBufferZone,
            maxValue: 100
        }, {
            xtype: 'numberfield',
            fieldLabel: 'Num columns',
            itemId: 'numFields',
            value: 10,
            minValue: 1
        }, {
            xtype: 'numberfield',
            fieldLabel: makeLabel('Ext.data', 'Store', 'purgePageCount'),
            itemId: 'purgePageCount',
            value: Ext.data.Store.prototype.purgePageCount,
            minValue: 0
        }, {
            xtype: 'numberfield',
            fieldLabel: makeLabel('Ext.grid', 'PagingScroller', 'scrollToLoadBuffer'),
            itemId: 'scrollToLoadBuffer',
            value: Ext.grid.PagingScroller.prototype.scrollToLoadBuffer,
            minValue: 0,
            maxValue: 1000,
            listeners: {
                change: function(f, newVal, oldVal) {
                    grid.verticalScroller.scrollToLoadBuffer = newVal;
                }
            }
        }],
        tbar: [{
            text: 'Reload',
            handler: initializeGrid
        }]
    });

    function initializeGrid () {
        var numFields = controls.down('#numFields').getValue(),
            columns = [{
                xtype: 'rownumberer',
                width: 50,
                sortable: false
            }],
            i,
            oldStore = store;

        store.removeAll();
        store.pageMap.clear();
        logPanel.body.update('');

        for (i = 0; i < numFields; ++i) {
            columns.push({ text: 'Field ' + (i+1), dataIndex: 'field' + i });
        }

        simlet.numRecords = controls.down('#rowCount').getValue();
        store = createStore(numFields);

        store.pageSize = controls.down('#pageSize').getValue();
        store.trailingBufferZone = controls.down('#storeTrailingBufferZone').getValue();
        store.leadingBufferZone = controls.down('#storeLeadingBufferZone').getValue();
        store.pageMap.maxSize = store.purgePageCount = controls.down('#purgePageCount').getValue();

        grid.verticalScroller.numFromEdge = controls.down('#scrollerNumFromEdge').getValue();
        grid.verticalScroller.trailingBufferZone = controls.down('#scrollerTrailingBufferZone').getValue();
        grid.verticalScroller.leadingBufferZone = controls.down('#scrollerLeadingBufferZone').getValue();

        Ext.ux.ajax.SimManager.delay = controls.down('#latency').getValue();

        grid.setTitle('Random data (' + simlet.numRecords + ' records)');
        var start = new Date().getTime();
        grid.reconfigure(store, columns);
        logPanel.log(simlet.numRecords + ' rows x ' + numFields + ' columns in ' + (new Date().getTime() - start) + 'ms');

        // Load the first page. It will be diverted through the prefetch buffer.
        store.loadPage(1);
        oldStore.destroy();
    }

    new Ext.Viewport({
        layout: {
            type: 'border',
            padding: 5
        },
        items: [
            {
                border: false,
                listeners: {
                    render: function(p) {
                        Ext.EventManager.idleEvent.addListener(function() {
                            p.header.removeCls('x-docked-noborder-left x-docked-noborder-right x-docked-noborder-top');
                            p.updateLayout({isRoot:true});
                        }, null, {single: true});
                    },
                    single: true
                },
                title: 'Configuration',
                collapsible: true,
                layout: 'border',
                region: 'west',
                bodyBorder: false,
                width: 270,
                split: true,
                minWidth: 270,
                items: [ controls, logPanel ]
            },
            grid
        ]
    })
});
