/**
 * Toolbar button with menu that appears when hovered over.
 */
Ext.define('Docs.view.HoverMenuButton', {
    extend: 'Ext.toolbar.TextItem',
    alias: 'widget.hovermenubutton',
    componentCls: "hover-menu-button",
    requires: [
        'Docs.view.HoverMenu'
    ],

    /**
     * @cfg {Ext.data.Store} store (required)
     * Store with menu items.
     */

    /**
     * @cfg {Boolean} showCount
     * True to show small number in button indicating the number of items in menu.
     */
    showCount: false,

    statics: {
        // Global list of all menus.
        // So we can hide all other menus while showing a specific one.
        menus: []
    },

    initComponent: function() {
        this.addEvents(
            /**
             * @event click
             * Fired when button clicked.
             */
            "click"
        );

        // Append links count to button text, update it when store filtered
        if (this.showCount) {
            this.initialText = this.text;
            this.text += ' <sup>' + this.store.getCount() + '</sup>';
            this.store.on("datachanged", function() {
                this.setText(this.initialText + ' <sup>' + this.store.getCount() + '</sup>');
            }, this);
        }

        this.callParent(arguments);
    },

    getColumnHeight: function() {
        var compensation = 200;
        var lineHeight = 18;
        return Math.floor((Ext.Element.getViewportHeight() - compensation) / lineHeight);
    },

    onRender: function() {
        this.callParent(arguments);

        this.getEl().on({
            click: function() {
                this.fireEvent("click");
            },
            mouseover: this.deferShowMenu,
            mouseout: this.deferHideMenu,
            scope: this
        });
    },

    onDestroy: function() {
        if (this.menu) {
            // clean up DOM
            this.menu.destroy();
            // remove from global menu list
            Ext.Array.remove(Docs.view.HoverMenuButton.menus, this.menu);
        }

        this.callParent(arguments);
    },

    renderMenu: function() {
        this.menu = Ext.create('Docs.view.HoverMenu', {
            store: this.store,
            columnHeight: this.getColumnHeight()
        });

        this.menu.getEl().on({
            click: function(e) {
                this.menu.hide();
                e.preventDefault();
            },
            mouseover: function() {
                clearTimeout(this.hideTimeout);
            },
            mouseout: this.deferHideMenu,
            scope: this
        });

        Docs.view.HoverMenuButton.menus.push(this.menu);
    },

    deferHideMenu: function() {
        // when showing in progress, stop it
        clearTimeout(Docs.view.HoverMenuButton.showTimeout);
        // skip if nothing to hide
        if (!this.menu) {
            return;
        }

        this.hideTimeout = Ext.Function.defer(function() {
            this.menu.hide();
        }, 200, this);
    },

    deferShowMenu: function() {
        clearTimeout(Docs.view.HoverMenuButton.showTimeout);
        Docs.view.HoverMenuButton.showTimeout = Ext.Function.defer(function() {
            // Create menu if needed
            if (!this.menu) {
                this.renderMenu();
            }

            // hide other menus
            Ext.Array.forEach(Docs.view.HoverMenuButton.menus, function(menu) {
                if (menu !== this.menu) {
                    menu.hide();
                }
            }, this);

            // stop pending menuhide process
            clearTimeout(this.hideTimeout);
            this.menu.show();

            // position menu right below button and show it
            var p = this.getEl().getXY(),
                toolbar = Ext.ComponentQuery.query('classoverview toolbar')[0],
                leftOffset = p[0]-10,
                toolbarOffset = toolbar.getEl().getXY(),
                toolbarWidth = toolbar.getWidth(),
                menuWidth = this.menu.getEl().getWidth(),
                pageWidth = Ext.getCmp('doctabs').getWidth();

            if (menuWidth > pageWidth) {
                leftOffset = 0;
            }
            else if ((leftOffset + menuWidth) > pageWidth) {
                leftOffset = pageWidth - menuWidth - 30;
            }

            if (leftOffset < toolbarOffset[0]) {
                leftOffset = toolbarOffset[0];
            }

            this.menu.getEl().setStyle({
                left: leftOffset+"px",
                top: (p[1]+25)+"px"
            });
        }, 200, this);
    },

    /**
     * Returns the store used by menu.
     * @return {Ext.data.Store}
     */
    getStore: function() {
        return this.store;
    }

});
