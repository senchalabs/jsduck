/**
 * Controller for Error messages.
 */
Ext.define('Docs.controller.Failure', {
    extend: 'Docs.controller.Content',
    baseUrl: "#",

    refs: [
        {
            ref: 'viewport',
            selector: '#viewport'
        },
        {
            ref: 'index',
            selector: '#failure'
        }
    ],

    /**
     * Displays page with 404 error message.
     * @param {String} msg
     * @private
     */
    show404: function(msg) {
        var tpl = new Ext.XTemplate(
            "<h1>Page not found...</h1>",
            "<p>{msg}</p>",
            "<p>If you think this is an error, please <a href='https://jira.appcelerator.org'>file a bug</a>.</p>"
        );
        Ext.getCmp("failure").update(tpl.apply({msg: msg}));
        Ext.getCmp('card-panel').layout.setActiveItem("failure");
    }
});
