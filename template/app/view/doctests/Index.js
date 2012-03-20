/**
 * The doctests page.
 */
Ext.define('Docs.view.doctests.Index', {
    extend: 'Ext.container.Container',
    requires: ['Ext.String.format', 'Ext.data.Store', 'Docs.model.DocTest'],
    alias: 'widget.doctestsindex',

    layout: {
        type: 'vbox',
        align: 'stretch',
        shrinkToFit: true
    },

    padding: 10,

    items: [
        {
            html: '<h1>Doc Tests</h1>'
        },
        {
            itemId: 'testrunner',
            margin: 5
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
                    margin: 5,
                    items: [
                        {
                            itemId: 'testResults',
                            margin: 5
                        },
                        {
                            xtype: 'button',
                            itemId: 'runallbutton',
                            text: 'Run All Examples',
                            margin: 5
                        }
                    ]
                },
                {
                    xtype: 'grid',
                    itemId: 'doctestgrid',
                    title: 'Doc Tests',
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
                            text: 'Run',
                            width: 80,
                            tpl:'<a href="#" id="run-{id}" class="doc-test-run" onclick="return false;">run example</a>'
                        },
                        {
                            text: 'Status',
                            width: 80,
                            dataIndex: 'status'
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
        
        var testGrid = Ext.ComponentQuery.query('#doctestgrid', this)[0];
        testGrid.on('itemclick', this.onRunLinkClick, this, {
            delegate: '.doc-test-run',
            stopEvent: true
        });
    },

    /**
     * Returns tab config for the doctests page.
     * @return {Object}
     */
    getTab: function() {
        var enabled = !Ext.isEmpty(Docs.data.doctests);
        return enabled ? {cls: 'doctests', href: '#!/doctests', tooltip: 'DocTests'} : false;
    },

    /**
     * Executes an example
     */
    runExample: function(tests) {
        if (!tests.examples || tests.examples.length < 1) {
            return;
        }
        
        if ((!tests.fail) && (!tests.pass)) {
            Ext.ComponentQuery.query('#testcontainer', this)[0].setDisabled(true);
        }
        
        this.clearTestRunner();
        var testRunner = this.getComponent('testrunner');
        var record = tests.examples.pop();
        
        var example = testRunner.add(
            Ext.create('Docs.view.examples.Inline', {
                cls: 'doc-test-preview',
                value: Ext.String.htmlDecode(Ext.util.Format.stripTags(record.get('code'))),
            })
        );

        example.on('previewsuccess', Ext.bind(this.onPreviewSuccess, this, [record, tests], true), this);
        example.on('previewfailure', Ext.bind(this.onPreviewFailure, this, [record, tests], true), this);
        example.showPreview();
    },

    clearTestRunner: function() {
        var testRunner = this.getComponent('testrunner');
        testRunner.removeAll();
    },

    showResult: function(tests) {
        var cls = 'doc-test-success',
            total = tests.pass + tests.fail,
            testControls = this.getComponent('testcontainer').getComponent('testcontrols');

        if (tests.fail) {
            cls = 'doc-test-failure';
        }

        testControls.remove('testResult');
        testControls.insert(0, {
            itemId: 'testResult',
            html: '<span class="' + cls + '">' + tests.fail.toString() + '/' + total.toString() + ' tests failed</span>'
        });

        if (tests.examples.length < 1) {
            Ext.ComponentQuery.query('#testcontainer', this)[0].setDisabled(false);
        } else {
            this.runExample(tests);
        }
    },

    onRunLinkClick: function(grid, record) {
        this.runExample({
            pass: 0,
            fail: 0,
            examples: [record],
        });
    },
    
    onRunAllButtonClick: function() {
        var examples = [];
        this.store.each(function(record) {
            examples.push(record);
        });
        this.runExample({
            pass: 0,
            fail: 0,
            examples: examples
        });
    },

    onPreviewSuccess: function(preview, obj, record, tests) {
        this.clearTestRunner();
        record.set('status', '<span class="doc-test-success">pass</span>');
        tests.pass++;
        this.showResult(tests);
        
        if (Ext.isDefined(console)) {
            console.log('Test passed: ', record.get('name'));
        }
    },

    onPreviewFailure: function(preview, e, obj, record, tests) {
        this.clearTestRunner();

        if (e.docAssertFailed) {
            record.set('status', '<span class="doc-test-failure">fail</span>');
        } else {
            record.set('status', '<span class="doc-test-error">error</span>');
        }

        record.set('message', '(exception logged to console): ' + e.toString());
        tests.fail++;
        this.showResult(tests);

        if (Ext.isDefined(console)) {
            var stack = 'no stack available';
            if (e.stack) {
                stack = e.stack;
            }
            console.log('Test failure for ' + record.get('name'), e, stack);
        }
    }
});
