/**
 * The doctests page.
 */
Ext.define('Docs.view.doctests.Index', {
    extend: 'Ext.container.Container',
    requires: ['Docs.model.DocTest'],
    alias: 'widget.doctestsindex',

    layout: {
        type: 'vbox',
        align: 'stretch',
        shrinkToFit: true
    },

    padding: 10,

    items: [
        {
            html: '<h1>Inline examples test page</h1>',
            height: 30
        },
        {
            itemId: 'testrunner',
            height: 0
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
                            itemId: 'runallbutton',
                            text: 'Run All Examples',
                            margin: 5
                        },
                        {
                            itemId: 'testStatus',
                            margin: "5 5 5 15"
                        }
                    ]
                },
                {
                    xtype: 'grid',
                    itemId: 'doctestsgrid',
                    padding: '5 0 5 0',
                    autoScroll: true,
                    flex: 1,
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
                    ]
                }
            ]
        }
    ],

    initComponent: function() {
        var testConfig = this.items[this.items.length - 1];
        var gridConfig = testConfig.items[testConfig.items.length - 1];
        gridConfig.store = this.store = Ext.create('Ext.data.Store', {
            model: 'Docs.model.DocTest',
            data: []
        });

        this.callParent(arguments);

        var runAllButton = Ext.ComponentQuery.query('#runallbutton', this)[0];
        runAllButton.on('click', this.onRunAllButtonClick, this);

        var testGrid = Ext.ComponentQuery.query('#doctestsgrid', this)[0];
        testGrid.on('itemdblclick', this.onRunLinkClick, this, {
            delegate: '.doc-test-run',
            stopEvent: true
        });
    },

    /**
     * Returns tab config for the doctests page.
     *
     * @return {Object}
     */
    getTab: function() {
        return Docs.data.doctests ? {cls: 'doctests', href: '#!/doctests', tooltip: 'DocTests'} : false;
    },

    /**
     * Adds new example to full list of examples.
     * @param {Docs.model.DocTest} examples The DocTest model instance or config for it.
     */
    addExamples: function(examples) {
        this.store.add(examples);
        this.setStatus(true, this.store.getCount() + " examples loaded.");
    },

    /**
     * Executes an example.
     *
     * @param {Object} config The test configuration.
     * @private
     */
    runExample: function(config) {
        if (!config.examples || config.examples.length < 1) {
            return;
        }

        if (config.fail + config.pass === 0) {
            this.disable();
        }

        this.clearTestRunner();
        var testRunner = this.getComponent('testrunner');
        var record = config.examples.shift();

        var example = testRunner.add(
            Ext.create('Docs.view.examples.Inline', {
                cls: 'doc-test-preview',
                height: 0,
                value: record.get('code')
            })
        );

        example.on('previewsuccess', Ext.bind(this.onPreviewSuccess, this, [record, config], true), this);
        example.on('previewfailure', Ext.bind(this.onPreviewFailure, this, [record, config], true), this);
        example.showPreview();
    },

    /**
     * Removes child elements from testrunner component.
     *
     * @private
     */
    clearTestRunner: function() {
        var testRunner = this.getComponent('testrunner');
        testRunner.removeAll();
    },

    /**
     * Renders test result to dom.
     *
     * @param {Object} config The test configuration.
     * @private
     */
    showResult: function(config) {
        var totalTested = config.pass+config.fail;
        this.setStatus(config.fail === 0, totalTested + '/' + config.total + ' examples tested, ' + config.fail + ' failures');

        if (config.examples.length < 1) {
            this.enable();
        } else {
            this.runExample(config);
        }
    },

    /**
     * Sets the status text displayed on doctests panel.
     * @param {Boolean} ok True to show positive status.
     * @param {String} message The text to display.
     * @private
     */
    setStatus: function(ok, message) {
        var cls = ok ? 'doc-test-success' : 'doc-test-failure';
        this.down("#testStatus").update('<span class="' + cls + '">' + message + '</span>');
    },

    /**
     * Run link click handler.
     *
     * @param {Ext.grid.Panel} grid The grid that was clicked.
     * @param {Docs.model.DocTest} record The record that was clicked.
     * @private
     */
    onRunLinkClick: function(grid, record) {
        this.runExample({
            pass: 0,
            fail: 0,
            total: 1,
            examples: [record]
        });
    },

    /**
     * RunAll button click handler.
     *
     * @private
     */
    onRunAllButtonClick: function() {
        var examples = [];
        this.store.each(function(record) {
            examples.push(record);
        });
        this.runExample({
            pass: 0,
            fail: 0,
            total: examples.length,
            examples: examples
        });
    },

    /**
     * previewsuccess event handler
     *
     * @param {Ext.Component} preview The preview component.
     * @param {Object} options The event options.
     * @param {Docs.model.DocTest} record The successful record.
     * @param {Object} config The test configuration.
     * @private
     */
    onPreviewSuccess: function(preview, options, record, config) {
        this.clearTestRunner();
        record.set('status', 'success');
        record.commit();
        config.pass++;
        this.showResult(config);
    },

    /**
     * previewfailure event handler
     *
     * @param {Ext.Component} preview The preview component.
     * @param {Error} error The Error thrown during the example.
     * @param {Object} options The event options.
     * @param {Docs.model.DocTest} record The successful record.
     * @param {Object} config The test configuration.
     * @private
     */
    onPreviewFailure: function(preview, e, obj, record, config) {
        this.clearTestRunner();
        record.set('status', 'failure');
        record.set('message', e.toString());
        record.commit();
        config.fail++;
        this.showResult(config);
    }
});
