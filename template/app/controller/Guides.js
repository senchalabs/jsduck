/**
 * Controller for Welcome page
 */
Ext.define('Docs.controller.Guides', {
    extend: 'Ext.app.Controller',

    init: function() {
        this.addEvents(
            /**
             * @event showGuide
             * Fired after guide shown. Used for analytics event tracking.
             * @param {String} guide  name of the guide.
             */
            "showGuide"
        );

        this.control({
            'indexcontainer': {
                afterrender: function(cmp) {
                    cmp.el.addListener('click', function(event, el) {
                        this.handleUrlClick(el.href, event);
                    }, this, {
                        preventDefault: true,
                        delegate: '.guide'
                    });
                }
            }
        })
    },

    loadIndex: function() {
        Ext.getCmp('doctabs').activateTab('#/guide');
        Ext.getCmp('card-panel').layout.setActiveItem('guides');
        Ext.getCmp('tree-container').hide();
    },

    /**
     * Loads guide.
     *
     * @param {String} url  URL of the guide
     * @param {Boolean} noHistory  true to disable adding entry to browser history
     */
    loadGuide: function(url, noHistory) {
        if (this.activeUrl === url) return;
        this.activeUrl = url;

        noHistory || Docs.History.push(url);

        var name = url.match(/^\/guide\/(.*)$/);
        if (name) {
            Ext.data.JsonP.request({
                url: this.getBaseUrl() + "/guides/" + name[1] + "/README.js",
                callbackName: name[1],
                success: function(json) {
                    this.getViewport().setPageTitle(json.guide.match(/<h1>(.*)<\/h1>/)[1]);
                    Ext.getCmp("guide").update(json.guide);
                    Ext.getCmp('card-panel').layout.setActiveItem(2);
                    Docs.Syntax.highlight(Ext.get("guide"));
                    this.fireEvent('showGuide', name[1]);
                    this.getTree().selectUrl(url);
                },
                failure: function(response, opts) {
                    this.getController('Index').showFailure("Guide <b>"+name[1]+"</b> was not found.");
                },
                scope: this
            });
        }
    },

    /**
     * Returns base URL used for making AJAX requests.
     * @return {String} URL
     */
    getBaseUrl: function() {
        return document.location.href.replace(/#.*/, "").replace(/index.html/, "");
    }

});
