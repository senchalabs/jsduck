Ext.define('Docs.controller.AuthHelpers', {

    addSid: function(url) {
        var sid = this.getController('Auth').sid;
        return url + (url.match(/\?/) ? '&' : '?') + 'sid=' + sid;
    },

    loggedIn: function() {
        return this.getController('Auth').isLoggedIn();
    }
});