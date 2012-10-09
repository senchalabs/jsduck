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
            "<h1>Oops...</h1>",
            "<p>{msg}</p>",
            "<p>Maybe it was renamed to something else? Or maybe your internet connection has failed? ",
            "This would be sad. Hopefully it's just a bug on our side. ",
            "Report it to <a href='https://github.com/senchalabs/jsduck/issues'>JSDuck issue tracker</a> if you feel so.</p>",
            "<p>Sorry for all this :(</p>"
        );
        Ext.getCmp("failure").update(tpl.apply({msg: msg}));
        Ext.getCmp('card-panel').layout.setActiveItem("failure");
    }
});
