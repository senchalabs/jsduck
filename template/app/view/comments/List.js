/**
 * Container for recent comments listing.
 */
Ext.define('Docs.view.comments.List', {
    extend: 'Ext.panel.Panel',
    alias: "widget.commentsList",
    requires: ['Docs.Settings'],
    componentCls: 'comment-index-container',

    dockedItems: [
        {
            xtype: 'container',
            dock: 'top',
            height: 35,
            html: [
                '<h1 style="float:left;">Comments</h1>',
                '<p style="float:left; margin: 5px 0 0 25px">',
                '<label style="padding-right: 10px;"><input type="checkbox" name="hideRead" id="hideRead" /> Hide read</label>',
                '</p>'
            ].join(" ")
        }
    ],

    layout: "border",
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
        var container = this.getEl();
        if (container) {
            container[masked ? "mask" : "unmask"]();
        }
    },

    // Initializes the hideRead checkbox from settings.
    initCheckboxes: function() {
        var settings = Docs.Settings.get("comments");
        var cb = Ext.get('hideRead');
        if (cb) {
            cb.dom.checked = settings.hideRead;
            cb.on("change", function() {
                this.saveSetting('hideRead', cb.dom.checked);
                /**
                 * @event settingChange
                 * Fired when one of the comments settings checkboxes is checked/unchecked.
                 * @param {String} name The name of the setting
                 * @param {Boolean} enabled True if setting is turned on, false when off.
                 */
                this.fireEvent("settingChange", 'hideRead', cb.dom.checked);
            }, this);
        }

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
