/**
 * Guides Controller
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

    cache: {},

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
            },
            '#guide': {
                afterrender: function(cmp) {
                    cmp.el.addListener('scroll', function(cmp, el) {
                        var baseUrl = this.activeUrl;
                        Docs.contentState[baseUrl] = Docs.contentState[baseUrl] || {};
                        Docs.contentState[baseUrl]['scrollOffset'] = el.scrollTop;
                    }, this);
                }
            }
        });
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

    /**
     * Loads the guides index
     */
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

        if (this.activeUrl === url) return this.scrollContent();
        this.activeUrl = url;

        noHistory || Docs.History.push(url);

        var name = url.match(/^\/guide\/(.*)$/);
        if (name) {
            if (this.cache[name[1]]) {
                this.showGuide(this.cache[name[1]], url, name[1]);
            } else {
                Ext.data.JsonP.request({
                    url: this.getBaseUrl() + "/guides/" + name[1] + "/README.js",
                    callbackName: name[1],
                    success: function(json) {
                        this.cache[name[1]] = json;
                        this.showGuide(json, url, name[1]);
                    },
                    failure: function(response, opts) {
                        this.getController('Index').showFailure("Guide <b>"+name[1]+"</b> was not found.");
                    },
                    scope: this
                });
            }
        }
    },

    /**
     * Shows guide.
     *
     * @param {Object} json Guide json
     * @param {String} url URL of the guide
     * @param {Boolean} name Name of the guide
     */
    showGuide: function(json, url, name) {
        this.getViewport().setPageTitle(json.guide.match(/<h1>(.*)<\/h1>/)[1]);
        Ext.getCmp("guide").update(json.guide);

        Docs.Syntax.highlight(Ext.get("guide"));
        this.scrollContent();
        this.fireEvent('showGuide', name);
        this.getTree().selectUrl(url);
    },

    scrollContent: function() {
        var offset = (Docs.contentState[this.activeUrl] && Docs.contentState[this.activeUrl].scrollOffset) || 0;
        Ext.get('guide').scrollTo('top', offset);
    }

});
