/**
 * Container for recent comments listing.
 */
Ext.define('Docs.view.comments.Index', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.commentindex',
    mixins: ['Docs.view.Scrolling'],
    requires: ['Docs.Settings'],

    cls: 'comment-index',
    margin: '10 0 0 0',
    layout: 'border',

    items: [
        {
            region: "center",
            layout: "border",
            id: 'comment-index-container',
            dockedItems: [
                {
                    xtype: 'container',
                    dock: 'top',
                    height: 35,
                    html: [
                        '<h1 style="float:left;">Comments</h1>',
                        '<p style="float:left; margin: 5px 0 0 25px">',
                        '<label style="padding-right: 10px;"><input type="checkbox" name="hideRead" id="hideRead" /> Hide read</label>',
                        '<label><input type="checkbox" name="hideCurrentUser" id="hideCurrentUser" /> Hide current User</label>',
                        '</p>'
                    ].join(" ")
                }
            ],
            items: [
                {
                    xtype: 'tabpanel',
                    cls: "comments-tabpanel",
                    plain: true,
                    region: "north",
                    height: 25,
                    items: [
                        {
                            title: "Recent"
                        },
                        {
                            title: "Votes"
                        }
                    ]
                },
                {
                    region: "center",
                    xtype: 'container',
                    id: 'recentcomments',
                    cls: "iScroll",
                    autoScroll: true
                }
            ]
        },
        {
            region: "east",
            width: 300,
            layout: "border",
            margin: '0 0 0 20',
            dockedItems: [
                {
                    xtype: 'container',
                    dock: 'top',
                    height: 35,
                    html: '<h1>Users</h1>'
                }
            ],
            items: [
                {
                    xtype: "tabpanel",
                    plain: true,
                    region: "north",
                    height: 25,
                    items: [
                        {
                            title: "Votes"
                        }
                    ]
                },
                {
                    region: "center",
                    xtype: 'container',
                    id: 'top-users',
                    cls: "iScroll",
                    autoScroll: true
                }
            ]
        }
    ],

    afterRender: function() {
        this.callParent(arguments);

        this.initCheckboxes();
        this.initTabs();

        this.setMasked(true);
    },

    /**
     * Masks or unmasks the container
     * @param {Boolean} masked True to show mask.
     */
    setMasked: function(masked) {
        var container = Ext.get('comment-index-container');
        if (container) {
            container[masked ? "mask" : "unmask"]();
        }
    },

    // Initializes all checkboxes from settings.
    // Bind event handlers to fire changeSetting event when checked/unchecked.
    initCheckboxes: function() {
        var settings = Docs.Settings.get("comments");
        Ext.Array.forEach(['hideRead', 'hideCurrentUser'], function(id) {
            var cb = Ext.get(id);
            if (cb) {
                cb.dom.checked = settings[id];
                cb.on("change", function() {
                    this.saveSetting(id, cb.dom.checked);
                    /**
                     * @event settingChange
                     * Fired when one of the comments settings checkboxes is checked/unchecked.
                     * @param {String} name The name of the setting
                     * @param {Boolean} enabled True if setting is turned on, false when off.
                     */
                    this.fireEvent("settingChange", id, cb.dom.checked);
                }, this);
            }
        }, this);

        // Hide the hideRead checkbox if user is not moderator
        this.setHideReadVisibility();
        var Auth = Docs.App.getController("Auth");
        Auth.on("available", this.setHideReadVisibility, this);
        Auth.on("loggedIn", this.setHideReadVisibility, this);
        Auth.on("loggedOut", this.setHideReadVisibility, this);
    },

    setHideReadVisibility: function() {
        var mod = Docs.App.getController("Auth").isModerator();
        Ext.get("hideRead").up("label").setStyle("display", mod ? "inline" : "none");
    },

    initTabs: function() {
        if (Docs.Settings.get("comments").sortByScore) {
            this.down("tabpanel[cls=comments-tabpanel]").setActiveTab(1);
        }

        this.down("tabpanel[cls=comments-tabpanel]").on("tabchange", function(panel, newTab) {
            if (newTab.title === "Recent") {
                this.saveSetting("sortByScore", false);
                this.fireEvent("settingChange", "sortByScore", false);
            }
            else {
                this.saveSetting("sortByScore", true);
                this.fireEvent("settingChange", "sortByScore", true);
            }
        }, this);
    },

    saveSetting: function(name, enabled) {
        var settings = Docs.Settings.get('comments');
        settings[name] = enabled;
        Docs.Settings.set('comments', settings);
    },

    /**
     * Returns tab config for comments page.
     * @return {Object}
     */
    getTab: function() {
        return Docs.enableComments ? {cls: 'comments', href: '#!/comment', tooltip: 'Comments'} : false;
    }
});
