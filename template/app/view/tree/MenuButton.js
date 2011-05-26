/**
 * Button with fly-out menu of history/favorites entries.
 */
Ext.define('Docs.view.tree.MenuButton', {
    extend: 'Ext.Component',
    alias: 'widget.menubutton',
    requires: [
        'Docs.view.HoverMenu'
    ],

    /**
     * @cfg {Ext.data.Store} store
     * The store that contains the menu entries.
     */
    /**
     * @cfg {String} text
     * Text for the button.
     */
    text: "",
    /**
     * @cfg {String} emptyText
     * Text to display in menu when store empty.
     */
    emptyText: "",

    initComponent: function() {
        this.addEvents(
            /**
             * @event closeclick
             * Fired when close link in menu clicked.
             * @param {String} cls  Name of the class that was closed.
             */
            "closeclick"
        );
        this.html = '<span></span>' + this.text;

        this.callParent();
    },

    afterRender: function() {
        this.callParent(arguments);

        this.getEl().on({
            mouseover: function() {
                if (!this.hoverMenu) {
                    this.renderMenu();
                }
                this.hoverMenu.show();
                clearTimeout(this.hideTimeout);
            },
            mouseout: this.deferHideMenu,
            scope: this
        });
    },

    renderMenu: function() {
        this.hoverMenu = Ext.create('Docs.view.HoverMenu', {
            store: this.store,
            emptyText: this.emptyText,
            cls: 'hover-menu-menu show',
            showCloseButtons: true
        });

        this.hoverMenu.getEl().setVisibilityMode(Ext.core.Element.DISPLAY);

        this.hoverMenu.getEl().on({
            mouseover: function() {
                clearTimeout(this.hideTimeout);
            },
            mouseout: this.deferHideMenu,
            click: function(e) {
                if (e.getTarget(".close")) {
                    this.fireEvent("closeclick", e.getTarget().rel);
                } else {
                    this.hoverMenu.hide();
                }
                e.preventDefault();
            },
            scope: this
        });

        var p = this.getEl().getXY();
        this.hoverMenu.getEl().setStyle({
            left: "20px",
            top: (p[1]+23)+"px"
        });
    },

    deferHideMenu: function() {
        this.hideTimeout = Ext.Function.defer(function() {
            this.hoverMenu.hide();
        }, 200, this);
    }
});
