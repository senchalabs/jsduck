/**
 * Assertions for use by DocTests.
 */
Ext.define('Docs.Assert', {
    singleton: true,

    assert: function(value, message) {
        if (!value) {
            if (Ext.isEmpty(message)) {
                message = 'value expected to be truthy: ' + value.toString();
            }
            var e = new Error(message);
            e.docAssertFailed = true;
            throw e;
        }
    }
});
