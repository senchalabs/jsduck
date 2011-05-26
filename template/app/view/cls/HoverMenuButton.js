/**
 * Toolbar button with menu that appears when hovered over.
 */
Ext.define('Docs.view.cls.HoverMenuButton', {
    extend: 'Ext.toolbar.TextItem',
    componentCls: "hover-menu-button",
    requires: [
        'Docs.view.HoverMenu'
    ],

    /**
     * @cfg {[String]} links
     * Array of HTML anchor elements to be shown in menu.
     */
    links: [],

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

        // Append links count to button text
        this.initialText = this.text;
        this.text += ' <span class="num">' + this.links.length + '</span>';

        this.callParent(arguments);
    },

    onRender: function() {
        this.callParent(arguments);

        this.renderMenu();

        this.getEl().on({
            click: function() {
                this.fireEvent("click");
            },
            mouseover: function() {
                // hide other menus
                Ext.Array.forEach(Docs.view.cls.HoverMenuButton.menus, function(menu) {
                    if (menu !== this.menu) {
                        menu.hide();
                    }
                });
                // stop pending menuhide process
                clearTimeout(this.hideTimeout);
                // position menu right below button and show it
                var p = this.getEl().getXY();
                this.menu.show();
                this.menu.getEl().setStyle({
                    left: (p[0] - 10)+"px",
                    top: (p[1]+23)+"px"
                });
            },
            mouseout: this.deferHideMenu,
            scope: this
        });

        this.menu.getEl().on({
            mouseover: function() {
                clearTimeout(this.hideTimeout);
            },
            mouseout: this.deferHideMenu,
            scope: this
        });
    },

    onDestroy: function() {
        // clean up DOM
        this.menu.destroy();
        // remove from global menu list
        Ext.Array.remove(Docs.view.cls.HoverMenuButton.menus, this.menu);

        this.callParent(arguments);
    },

    renderMenu: function() {
        this.store = Ext.create('Ext.data.Store', {
            fields: ['id', 'cls', 'url', 'label']
        });
        this.store.add(this.links);

        this.menu = Ext.create('Docs.view.HoverMenu', {
            store: this.store,
            cls: 'hover-menu-menu'
        });
        this.menu.getEl().setVisibilityMode(Ext.core.Element.DISPLAY);
        this.menu.hide();

        this.menu.getEl().addListener('click', function() {
            this.menu.hide();
        }, this);
        Docs.view.cls.HoverMenuButton.menus.push(this.menu);
    },

    /**
     * Changes the list of links in menu.
     * @param {[Object]} links
     */
    setLinks: function(links) {
        this.links = links;
        this.setText(this.initialText + ' <span class="num">' + this.links.length + '</span>');
        this.store.removeAll();
        this.store.add(this.links);
    },

    deferHideMenu: function() {
        this.hideTimeout = Ext.Function.defer(function() {
            this.menu.hide();
        }, 200, this);
    }

});
