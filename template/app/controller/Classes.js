/**
 * Listeners should be defined here instead of in the view classes
 */
Ext.define('Docs.controller.Classes', {
    extend: 'Ext.app.Controller',

    requires: [
        'Docs.History',
        'Docs.Syntax',
        'Docs.view.cls.Overview'
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
            this.opensNewWindow(event) ? window.open(el.href) : this.loadClass(el.rel);
        }, this, {
            preventDefault: true,
            delegate: '.docClass'
        });

        this.control({
            'classtree': {
                classclick: function(cls, event) {
                    this.handleClassClick(cls, event, this.getTree());
                }
            },
            'classgrid': {
                classclick: function(cls, event) {
                    this.handleClassClick(cls, event, this.getFavoritesGrid());
                }
            },

            'indexcontainer': {
                afterrender: function(cmp) {
                    cmp.el.addListener('click', function(event, el) {
                        this.opensNewWindow(event) ? window.open(el.href) : this.showGuide(el.rel);
                    }, this, {
                        preventDefault: true,
                        delegate: '.guide'
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
    handleClassClick: function(cls, event, view) {
        if (this.opensNewWindow(event)) {
            window.open("#/api/" + cls);
            view.selectClass(this.currentCls ? this.currentCls.name : "");
        }
        else {
            this.loadClass(cls);
        }
    },

    // Code for the middle mouse button
    MIDDLE: 1,

    // True when middle mouse button pressed or shift/ctrl key pressed
    // together with mouse button (for Mac)
    opensNewWindow: function(event) {
        return event.button === this.MIDDLE || event.shiftKey || event.ctrlKey;
    },

    cache: {},

    /**
     * Loads class.
     *
     * @param {String} clsUrl  name of the class + optionally name of the method, separated with dash.
     * @param {Boolean} noHistory  true to disable adding entry to browser history
     */
    loadClass: function(clsUrl, noHistory) {
        var cls = clsUrl;
        var member;

        if (this.activeUrl == clsUrl) return;
        this.activeUrl = clsUrl;

        if (!noHistory) {
            Docs.History.push("/api/" + clsUrl);
        }

        Ext.getCmp('card-panel').layout.setActiveItem(1);

        // separate class and member name
        var matches = clsUrl.match(/^(.*?)(?:-(.*))?$/);
        if (matches) {
            cls = matches[1];
            member = matches[2];
        }

        if (this.cache[cls]) {
            this.showClass(this.cache[cls], member);
        } else {
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
                failure : function(response, opts) {
                    // console.log('Fail');
                },
                scope: this
            });
        }
    },

    showClass: function(cls, anchor) {
        var classOverview = this.getTabPanel().down('classoverview');

        if (this.currentCls != cls) {
            this.getViewport().setPageTitle(cls.name);
            this.getHeader().load(cls);

            if (!classOverview) {
                classOverview = Ext.create('Docs.view.cls.Overview');
                this.getTabPanel().add(classOverview);
                this.getTabPanel().setActiveTab(0);
            }
            classOverview.load(cls);

            this.getOverview().load(cls);

            this.getOverview().setLoading(false);

            this.getTree().selectClass(cls.name);
            this.fireEvent('showClass', cls.name);
        }

        if (anchor) {
            this.getOverview().scrollToEl("#" + anchor);
            this.fireEvent('showMember', cls.name, anchor);
        } else {
            this.getOverview().getEl().down('.x-panel-body').scrollTo('top', 0);
        }

        this.currentCls = cls;

        this.getFavoritesGrid().selectClass(cls.name);
    },

    showGuide: function(name, noHistory) {

        if (this.activeUrl == name) return;
        this.activeUrl = name;

        noHistory || Docs.History.push("/guide/" + name);

        Ext.data.JsonP.request({
            url: this.getBaseUrl() + "/guides/" + name + "/README.js",
            callbackName: name,
            success: function(json) {
                this.getViewport().setPageTitle(json.guide.match(/<h1>(.*)<\/h1>/)[1]);
                Ext.getCmp("guide").update(json.guide);
                Ext.getCmp('card-panel').layout.setActiveItem(2);
                Docs.Syntax.highlight(Ext.get("guide"));
                this.fireEvent('showGuide', name);
            },
            scope: this
        });
    },

    /**
     * Returns base URL used for making AJAX requests.
     * @return {String} URL
     */
    getBaseUrl: function() {
        return document.location.href.replace(/#.*/, "").replace(/index.html/, "");
    }

});
