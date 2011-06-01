/**
 * Listeners should be defined here instead of in the view classes
 */
Ext.define('Docs.controller.Classes', {
    extend: 'Ext.app.Controller',
    requires: [
        'Docs.History',
        'Docs.Syntax'
    ],

    stores: [
        'Favorites',
        'History',
        'Settings'
    ],

    models: [
        'Favorite',
        'History',
        'Setting'
    ],

    refs: [
        {
            ref: 'tabPanel',
            selector: 'classtabpanel'
        }
    ],

    init: function() {
        Ext.getBody().addListener('click', function(cmp, el) {
            this.loadClass(el.rel);
        }, this, {
            preventDefault: true,
            delegate: '.docClass'
        });

        this.control({
            '#treePanelCmp': {
                // Can't simply assign the loadClass function as event
                // handler, because an extra event options object is
                // appended to the event arguments, which we don't
                // want to give to the loadClass, as this would render
                // the noHistory parameter to true.
                classclick: function(cls) {
                    this.loadClass(cls);
                }
            },

            '#classlist': {
                afterrender: function(cmp) {
                    cmp.el.addListener('click', function(cmp, el) {
                        this.showGuide(el.rel);
                    }, this, {
                        preventDefault: true,
                        delegate: '.guide'
                    });
                }
            },

            '#doc-overview': {
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

        Ext.getCmp('container').layout.setActiveItem(1);

        // separate class and member name
        var matches = clsUrl.match(/^(.*?)(?:-(.*))?$/);
        if (matches) {
            cls = matches[1];
            member = matches[2];
        }

        if (!noHistory) {
            Docs.History.push("/api/" + clsUrl);
        }

        if (this.cache[cls]) {
            this.showClass(this.cache[cls], member);
        } else {
            if (this.getTabPanel()) {
                this.getTabPanel().setLoading(true);
            }

            Ext.data.JsonP.request({
                url: this.getBaseUrl() + '/output/' + cls + '.js',
                callbackName: cls.replace(/\./g, '_'),
                success: function(json, opts) {
                    this.cache[cls] = json;
                    this.showClass(json, member);
                },
                failure : function(response, opts) {
                    console.log('Fail');
                },
                scope: this
            });
        }
    },

    showClass: function(cls, anchor) {
        if (this.currentCls != cls) {
            var container = Ext.getCmp('container'),
                showClass = container.down('showclass'),
                classHeader = showClass.down('classheader'),
                classOverview = showClass.down('classoverview');

            classHeader.update(classHeader.tpl.apply(cls));
            classOverview.load(cls);

            if (this.getTabPanel()) {
                this.getTabPanel().setActiveTab(0);
                this.getTabPanel().setLoading(false);
            }

            Ext.getCmp('treePanelCmp').selectClass(cls.name);
        }

        if (anchor) {
            Ext.getCmp('doc-overview').scrollToEl("#" + anchor);
        } else {
            var docContent = Ext.get(Ext.query('#doc-overview .x-panel-body')[0]);
            docContent.scrollTo('top', 0);
        }

        this.currentCls = cls;
    },

    showGuide: function(name, noHistory) {
        noHistory || Docs.History.push("/guide/" + name);

        Ext.data.JsonP.request({
            url: this.getBaseUrl() + "/guides/" + name + "/README.js",
            callbackName: name,
            success: function(json) {
                Ext.getCmp("guide").update(json.guide);
                Ext.getCmp('container').layout.setActiveItem(2);
                Docs.Syntax.highlight(Ext.get("guide"));
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
