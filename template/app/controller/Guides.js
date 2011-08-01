/**
 * Controller for Welcome page
 */
Ext.define('Docs.controller.Guides', {
    extend: 'Docs.controller.Content',

    refs: [
        {
            ref: 'viewport',
            selector: '#viewport'
        },
        {
            ref: 'tree',
            selector: 'classtree[cmpName=guidetree]'
        }
    ],

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
            'classtree[cmpName=guidetree]': {
                urlclick: function(url, event) {
                    this.handleUrlClick(url, event, this.getTree());
                }
            },
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

    // We don't want to select the class that was opened in another window,
    // so restore the previous selection.
    handleUrlClick: function(url, event, view) {
        // Remove everything up to #
        url = url.replace(/.*#/, "");

        if (this.opensNewWindow(event)) {
            window.open("#"+url);
            view && view.selectUrl(this.activeUrl ? this.activeUrl : "");
        }
        else {
            this.loadGuide(url);
        }
    },

    loadIndex: function() {
        Ext.getCmp('doctabs').activateTab('#/guide');
        Ext.getCmp('card-panel').layout.setActiveItem('guides');
        Ext.getCmp('tree-container').show();
        Ext.getCmp('tree-container').layout.setActiveItem(2);
    },

    /**
     * Loads guide.
     *
     * @param {String} url  URL of the guide
     * @param {Boolean} noHistory  true to disable adding entry to browser history
     */
    loadGuide: function(url, noHistory) {
        Ext.getCmp('card-panel').layout.setActiveItem('guide');
        Ext.getCmp('tree-container').show();
        Ext.getCmp('tree-container').layout.setActiveItem(2);

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
    }

});
