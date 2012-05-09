/**
 * The page for testing inline examples.
 */
Ext.define('Docs.view.tests.Index', {
    extend: 'Ext.container.Container',
    requires: [
        'Docs.model.Test',
        'Docs.view.tests.BatchRunner'
    ],
    mixins: ['Docs.view.Scrolling'],
    alias: 'widget.testsindex',

    layout: {
        type: 'vbox',
        align: 'stretch',
        shrinkToFit: true
    },

    padding: 10,

    initComponent: function() {
        this.store = Ext.create('Ext.data.Store', {
            model: 'Docs.model.Test',
            data: []
        });

        this.grid = Ext.create('Ext.grid.Panel', {
            itemId: 'testsgrid',
            padding: '5 0 5 0',
            autoScroll: true,
            flex: 1,
            store: this.store,
            selModel: {
                mode: "MULTI"
            },
            columns: [
                {
                    xtype:'templatecolumn',
                    text: 'Name',
                    width: 300,
                    tpl:'<a href="{href}">{name}</a>'
                },
                {
                    xtype:'templatecolumn',
                    text: 'Status',
                    width: 80,
                    tpl: '<span class="doc-test-{status}">{status}</span>'
                },
                {
                    text: 'Message',
                    flex: 1,
                    dataIndex: 'message'
                }
            ],
            listeners: {
                itemdblclick: function(grid, record) {
                    this.batchRunner.run([record]);
                },
                scope: this
            }
        });

        this.batchRunner = Ext.create('Docs.view.tests.BatchRunner', {
            height: 0,
            listeners: {
                start: this.disable,
                finish: this.enable,
                statuschange: this.updateTestStatus,
                scope: this
            }
        });

        this.items = [
            {
                html: '<h1>Inline examples test page</h1>',
                height: 30
            },
            {
                itemId: 'testcontainer',

                layout: {
                    type: 'vbox',
                    align: 'stretch',
                    shrinkToFit: true
                },

                flex: 1,
                items: [
                    {
                        itemId: 'testcontrols',
                        layout: 'hbox',
                        items: [
                            {
                                html: '<b>Double-click</b> to run an example, or',
                                margin: "5 5 5 0"
                            },
                            {
                                xtype: 'button',
                                itemId: 'run-selected-button',
                                text: 'Run Selected',
                                margin: 5,
                                handler: function() {
                                    this.batchRunner.run(this.grid.getSelectionModel().getSelection());
                                },
                                scope: this
                            },
                            {
                                html: 'or',
                                margin: 5
                            },
                            {
                                xtype: 'button',
                                itemId: 'run-all-button',
                                text: 'Run All Examples',
                                margin: 5,
                                handler: function() {
                                    this.batchRunner.run(this.store.getRange());
                                },
                                scope: this
                            },
                            {
                                itemId: 'testStatus',
                                margin: "5 5 5 15"
                            }
                        ]
                    },
                    this.grid
                ]
            },
            this.batchRunner
        ];

        this.callParent(arguments);
    },

    /**
     * Returns tab config for the tests page.
     *
     * @return {Object}
     */
    getTab: function() {
        return Docs.data.tests ? {cls: 'tests', href: '#!/tests', tooltip: 'Tests', text: "Tests"} : false;
    },

    /**
     * Adds new example to full list of examples.
     * @param {Docs.model.Test} examples The DocTest model instance or config for it.
     */
    addExamples: function(examples) {
        this.store.add(examples);
        this.setStatus(true, this.store.getCount() + " examples loaded.");
    },

    // updates current running status of tests
    updateTestStatus: function(status) {
        var totalTested = status.pass + status.fail;
        this.setStatus(status.fail === 0, totalTested + '/' + status.total + ' examples tested, ' + status.fail + ' failures');
    },

    /**
     * Sets the status text displayed on tests panel.
     * @param {Boolean} ok True to show positive status.
     * @param {String} message The text to display.
     * @private
     */
    setStatus: function(ok, message) {
        var cls = ok ? 'doc-test-success' : 'doc-test-failure';
        this.down("#testStatus").update('<span class="' + cls + '">' + message + '</span>');
    }

});
