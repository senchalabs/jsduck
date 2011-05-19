/**
 * Toolbar button with menu that appears when hovered over.
 */
Ext.define('Docs.view.class.HoverMenuButton', {
    extend: 'Ext.toolbar.TextItem',
    componentCls: "hover-menu-button",

    /**
     * @cfg {[String]} links
     * Array of HTML anchor elements to be shown in menu.
     */
    links: [],

    menus: [],

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
        this.text += ' <span class="num">' + this.links.length + '</span>';

        this.callParent(arguments);
    },

    onRender: function() {
        var me = this;

        this.callParent(arguments);

        this.renderMenu();

        this.getEl().on({
            click: function() {
                this.fireEvent("click");
            },
            mouseover: function() {
                // hide other menus
                Ext.Array.forEach(me.menus, function(menu) {
                    if (menu !== this.menu) {
                        menu.setStyle({display: "none"});
                    }
                });
                // stop pending menuhide process
                clearTimeout(this.hideTimeout);
                // position menu right below button and show it
                var p = this.getEl().getXY();
                this.menu.setStyle({
                    left: (p[0] - 10)+"px",
                    top: (p[1]+23)+"px",
                    display: "block"
                });
            },
            mouseout: this.deferHideMenu,
            scope: this
        });

        this.menu.on({
            mouseover: function() {
                clearTimeout(this.hideTimeout);
            },
            mouseout: this.deferHideMenu,
            scope: this
        });
    },

    onDestroy: function() {
        // clean up DOM
        this.menu.remove();
        // remove from global menu list
        Ext.Array.remove(this.menus, this.menu);

        this.callParent(arguments);
    },

    renderMenu: function() {
        this.menu = Ext.get(Ext.core.DomHelper.append(document.body, {
            html: this.renderMenuHtml(),
            cls: 'hover-menu-menu'
        }));
        this.menu.addListener('click', function() {
            this.menu.setStyle({display: "none"});
        }, this);
        this.menus.push(this.menu);
    },

    renderMenuHtml: function() {
        // divide links into columns with at most 25 links in one column
        var columns = [];
        for (var i=0; i<this.links.length; i+=25) {
            columns.push(this.links.slice(i, i+25));
        }

        var tpl = new Ext.XTemplate(
            '<table>',
                '<tr>',
                    '<tpl for="columns">',
                        '<td>',
                            '<tpl for=".">',
                                '{.}',
                            '</tpl>',
                        '</td>',
                    '</tpl>',
                '</tr>',
            '</table>'
        );
        return tpl.apply({columns: columns});
    },

    deferHideMenu: function() {
        this.hideTimeout = Ext.Function.defer(function() {
            this.menu.setStyle({display: "none"});
        }, 200, this);
    }

});
