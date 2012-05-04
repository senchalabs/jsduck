/**
 * Component for running multiple tests in batch mode.
 *
 * Calling the #run method with bunch of Docs.model.Test records will
 * start the runner, firering #start event.  After the completion of
 * every test the #statuschange event is fired.  Finally #finish will
 * fire when all tests are done.
 */
Ext.define('Docs.view.tests.BatchRunner', {
    extend: 'Ext.container.Container',
    requires: ['Docs.view.examples.Inline'],

    initComponent: function() {
        this.addEvents(
            /**
             * @event
             * Fired when running started.
             */
            "start",
            /**
             * @event
             * Fired when running finished.
             */
            "finish",
            /**
             * @event
             * Fired after every test is run.
             * @param {Object} status The current runner status, which contains:
             * @param {Number} status.pass Number of successful tests so far.
             * @param {Number} status.fail Number of failed tests so far.
             * @param {Number} status.total Total number of tests ordered for run,
             * @param {Docs.model.Test[]} status.remaining Remaining tests to be run.
             */
            "statuschange"
        );

        this.callParent(arguments);
    },

    /**
     * Executes a batch of tests.
     *
     * @param {Docs.model.Test[]} tests Array of tests to run
     */
    run: function(tests) {
        this.fireEvent("start");

        this.runNext({
            pass: 0,
            fail: 0,
            total: tests.length,
            remaining: tests
        });
    },

    // Runs the next example
    runNext: function(config) {
        this.fireEvent("statuschange", config);

        // Exit when all done
        if (!config.remaining || config.remaining.length < 1) {
            this.fireEvent("finish");
            return;
        }

        // Take next test from queue
        var record = config.remaining.shift();

        // Disable the preview option (we activate the preview manually)
        var options = record.get('options');
        options.preview = false;

        // Override alert() with empty function, so we don't get
        // disturbing popups during test runs.
        var safeAlert = "var alert = function(){};\n";

        var example = Ext.create('Docs.view.examples.Inline', {
            cls: 'doc-test-preview',
            height: 0,
            value: safeAlert + record.get('code'),
            options: options,
            listeners: {
                previewsuccess: function(preview) {
                    this.onSuccess(record, config);
                },
                previewfailure: function(preview, error) {
                    this.onFailure(record, config, error);
                },
                scope: this
            }
        });

        // Replace previous example with new one
        this.removeAll();
        this.add(example);

        // Execute the example
        example.showPreview();
    },

    onSuccess: function(record, config) {
        record.set('status', 'success');
        record.commit();
        config.pass++;
        this.runNext(config);
    },

    onFailure: function(record, config, error) {
        record.set('status', 'failure');
        record.set('message', error.toString());
        record.commit();
        config.fail++;
        this.runNext(config);
    }
});
