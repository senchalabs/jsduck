/**
 * Controller responsible for loading classes, guides, and switching
 * between pages.
 */
Ext.define('Docs.controller.Classes', {
    extend: 'Ext.app.Controller',

    requires: [
        'Docs.History',
        'Docs.Syntax'
    ],

    stores: [
        'Favorites',
        'Settings'
    ],

    models: [
        'Favorite',
        'Setting'
    ],

    refs: [
        {
            ref: 'viewport',
            selector: '#viewport'
        },
        {
            ref: 'header',
            selector: 'classheader'
        },
        {
            ref: 'overview',
            selector: 'classoverview'
        },
        {
            ref: 'tabPanel',
            selector: 'classtabpanel'
        },
        {
            ref: 'tree',
            selector: 'classtree'
        },
        {
            ref: 'favoritesGrid',
            selector: '#favorites-grid'
        }
    ],

    activeUrl: null,

    init: function() {
        this.addEvents(
            /**
             * @event showClass
             * Fired after class shown. Used for analytics event tracking.
             * @param {String} cls  name of the class.
             */
            "showClass",
            /**
             * @event showMember
             * Fired after class member scrolled to view. Used for analytics event tracking.
             * @param {String} cls  name of the class.
             * @param {String} anchor  name of the member in form type-name like "method-bind".
             */
            "showMember",
            /**
             * @event showGuide
             * Fired after guide shown. Used for analytics event tracking.
             * @param {String} guide  name of the guide.
             */
            "showGuide"
        );

        Ext.getBody().addListener('click', function(event, el) {
            this.handleUrlClick(el.href, event);
        }, this, {
            preventDefault: true,
            delegate: '.docClass'
        });

        this.control({
            'classtree': {
                urlclick: function(url, event) {
                    this.handleUrlClick(url, event, this.getTree());
                }
            },
            'classgrid': {
                urlclick: function(url, event) {
                    this.handleUrlClick(url, event, this.getFavoritesGrid());
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

            'toolbar': {
                toggleExpanded: function(expanded) {
                    Ext.Array.forEach(Ext.query('.side.expandable'), function(el) {
                        Ext.get(el).parent()[expanded ? "addCls" : "removeCls"]('open');
                    });
                }
            },

            'classoverview': {
                afterrender: function(cmp) {
                    // Expand member when clicked
                    cmp.el.addListener('click', function(cmp, el) {
                        Ext.get(Ext.get(el).up('.member')).toggleCls('open');
                    }, this, {
                        preventDefault: true,
                        delegate: '.expandable'
                    });

                    // Do nothing when clicking on not-expandable items
                    cmp.el.addListener('click', Ext.emptyFn, this, {
                        preventDefault: true,
                        delegate: '.not-expandable'
                    });
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
            if (/^\/api\//.test(url)) {
                this.loadClass(url);
            }
            else {
                this.loadGuide(url);
            }
        }
    },

    // Code for the middle mouse button
    MIDDLE: 1,

    // True when middle mouse button pressed or shift/ctrl key pressed
    // together with mouse button (for Mac)
    opensNewWindow: function(event) {
        return event.button === this.MIDDLE || event.shiftKey || event.ctrlKey;
    },

    /**
     * Loads main page.
     *
     * @param {Boolean} noHistory  true to disable adding entry to browser history
     */
    loadIndex: function(noHistory) {
        this.activeUrl = "";
        if (!noHistory) {
            Docs.History.push("");
        }
        this.getViewport().setPageTitle("");
        Ext.getCmp('card-panel').layout.setActiveItem(0);
    },

    cache: {},

    /**
     * Loads class.
     *
     * @param {String} url  name of the class + optionally name of the method, separated with dash.
     * @param {Boolean} noHistory  true to disable adding entry to browser history
     */
    loadClass: function(url, noHistory) {
        if (this.activeUrl === url) return;
        this.activeUrl = url;

        if (!noHistory) {
            Docs.History.push(url);
        }

        Ext.getCmp('card-panel').layout.setActiveItem(1);

        // separate class and member name
        var matches = url.match(/^\/api\/(.*?)(?:-(.*))?$/);
        var cls = matches[1];
        var member = matches[2];

        if (this.cache[cls]) {
            this.showClass(this.cache[cls], member);
        }
        else {
            if (this.getOverview()) {
                this.getOverview().setLoading(true);
            }

            Ext.data.JsonP.request({
                url: this.getBaseUrl() + '/output/' + cls + '.js',
                callbackName: cls.replace(/\./g, '_'),
                success: function(json, opts) {
                    this.cache[cls] = json;
                    this.showClass(json, member);
                },
                failure: function(response, opts) {
                    this.showFailure("Class <b>"+cls+"</b> was not found.");
                },
                scope: this
            });
        }
    },

    showClass: function(cls, anchor) {
        if (this.currentCls !== cls) {
            this.getViewport().setPageTitle(cls.name);
            this.getHeader().load(cls);
            this.getOverview().load(cls);
            this.getOverview().setLoading(false);

            this.getTree().selectUrl("/api/"+cls.name);
            this.fireEvent('showClass', cls.name);
        }

        if (anchor) {
            this.getOverview().scrollToEl("#" + anchor);
            this.fireEvent('showMember', cls.name, anchor);
        } else {
            this.getOverview().getEl().down('.x-panel-body').scrollTo('top', 0);
        }

        this.currentCls = cls;

        this.getFavoritesGrid().selectUrl("/api/"+cls.name);
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

        var name = url.match(/^\/guide\/(.*)$/)[1];
        Ext.data.JsonP.request({
            url: this.getBaseUrl() + "/guides/" + name + "/README.js",
            callbackName: name,
            success: function(json) {
                this.getViewport().setPageTitle(json.guide.match(/<h1>(.*)<\/h1>/)[1]);
                Ext.getCmp("guide").update(json.guide);
                Ext.getCmp('card-panel').layout.setActiveItem(2);
                Docs.Syntax.highlight(Ext.get("guide"));
                this.fireEvent('showGuide', name);
                this.getTree().selectUrl(url);
                this.getFavoritesGrid().selectUrl(url);
            },
            failure: function(response, opts) {
                this.showFailure("Guide <b>"+name+"</b> was not found.");
            },
            scope: this
        });
    },

    /**
     * Displays page with 404 error message.
     * @param {String} msg
     * @private
     */
    showFailure: function(msg) {
        this.getOverview().setLoading(false);
        var tpl = new Ext.XTemplate(
            "<h1>Oops...</h1>",
            "<p>{msg}</p>",
            "<p>Maybe it was renamed to something else? Or maybe it has passed away permanently to the 404 land? ",
            "This would be sad. Hopefully it's just a bug in our side. ",
            "Report it to <a href='http://www.sencha.com/forum/showthread.php?135036'>Sencha Forum</a> if you feel so.</p>",
            "<p>Sorry for all this :(</p>"
        );
        Ext.getCmp("failure").update(tpl.apply({msg: msg}));
        Ext.getCmp('card-panel').layout.setActiveItem("failure");
    },

    /**
     * Returns base URL used for making AJAX requests.
     * @return {String} URL
     */
    getBaseUrl: function() {
        return document.location.href.replace(/#.*/, "").replace(/index.html/, "");
    }

});
