/**
 * Provides a way to perform queries to the comments backend.
 */
Ext.define('Docs.Comments', {
    singleton: true,

    /**
     * @inheritdoc Docs.controller.AuthHelpers#request
     */
    request: function(type, config) {
        Docs.App.getController("Comments").request(type, config);
    }

});
