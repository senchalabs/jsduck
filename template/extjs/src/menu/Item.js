/**
 * A base class for all menu items that require menu-related functionality such as click handling,
 * sub-menus, icons, etc.
 *
 *     @example
 *     Ext.create('Ext.menu.Menu', {
 *         width: 100,
 *         height: 100,
 *         floating: false,  // usually you want this set to True (default)
 *         renderTo: Ext.getBody(),  // usually rendered by it's containing component
 *         items: [{
 *             text: 'icon item',
 *             iconCls: 'add16'
 *         },{
 *             text: 'text item'
 *         },{
 *             text: 'plain item',
 *             plain: true
 *         }]
 *     });
 */
Ext.define('Ext.menu.Item', {
    extend: 'Ext.Component',
    alias: 'widget.menuitem',
    alternateClassName: 'Ext.menu.TextItem',

    /**
     * @property {Boolean} activated
     * Whether or not this item is currently activated
     */

    /**
     * @property {Ext.menu.Menu} parentMenu
     * The parent Menu of this item.
     */

    /**
     * @cfg {String} activeCls
     * The CSS class added to the menu item when the item is activated (focused/mouseover).
     */
    activeCls: Ext.baseCSSPrefix + 'menu-item-active',

    /**
     * @cfg {String} ariaRole
     * @private
     */
    ariaRole: 'menuitem',

    /**
     * @cfg {Boolean} canActivate
     * Whether or not this menu item can be activated when focused/mouseovered.
     */
    canActivate: true,

    /**
     * @cfg {Number} clickHideDelay
     * The delay in milliseconds to wait before hiding the menu after clicking the menu item.
     * This only has an effect when `hideOnClick: true`.
     */
    clickHideDelay: 1,

    /**
     * @cfg {Boolean} destroyMenu
     * Whether or not to destroy any associated sub-menu when this item is destroyed.
     */
    destroyMenu: true,

    /**
     * @cfg {String} disabledCls
     * The CSS class added to the menu item when the item is disabled.
     */
    disabledCls: Ext.baseCSSPrefix + 'menu-item-disabled',

    /**
     * @cfg {String} [href='#']
     * The href attribute to use for the underlying anchor link.
     */

    /**
     * @cfg {String} hrefTarget
     * The target attribute to use for the underlying anchor link.
     */

    /**
     * @cfg {Boolean} hideOnClick
     * Whether to not to hide the owning menu when this item is clicked.
     */
    hideOnClick: true,

    /**
     * @cfg {String} icon
     * The path to an icon to display in this item.
     *
     * Defaults to `Ext.BLANK_IMAGE_URL`.
     */

    /**
     * @cfg {String} iconCls
     * A CSS class that specifies a `background-image` to use as the icon for this item.
     */

    isMenuItem: true,

    /**
     * @cfg {Ext.menu.Menu/Object} menu
     * Either an instance of {@link Ext.menu.Menu} or a config object for an {@link Ext.menu.Menu}
     * which will act as a sub-menu to this item.
     */

    /**
     * @property {Ext.menu.Menu} menu The sub-menu associated with this item, if one was configured.
     */

    /**
     * @cfg {String} menuAlign
     * The default {@link Ext.Element#getAlignToXY Ext.Element.getAlignToXY} anchor position value for this
     * item's sub-menu relative to this item's position.
     */
    menuAlign: 'tl-tr?',

    /**
     * @cfg {Number} menuExpandDelay
     * The delay in milliseconds before this item's sub-menu expands after this item is moused over.
     */
    menuExpandDelay: 200,

    /**
     * @cfg {Number} menuHideDelay
     * The delay in milliseconds before this item's sub-menu hides after this item is moused out.
     */
    menuHideDelay: 200,

    /**
     * @cfg {Boolean} plain
     * Whether or not this item is plain text/html with no icon or visual activation.
     */

    /**
     * @cfg {String/Object} tooltip
     * The tooltip for the button - can be a string to be used as innerHTML (html tags are accepted) or
     * QuickTips config object.
     */

    /**
     * @cfg {String} tooltipType
     * The type of tooltip to use. Either 'qtip' for QuickTips or 'title' for title attribute.
     */
    tooltipType: 'qtip',

    arrowCls: Ext.baseCSSPrefix + 'menu-item-arrow',

    childEls: [
        'itemEl', 'iconEl', 'textEl', 'arrowEl'
    ],

    renderTpl: [
        '<tpl if="plain">',
            '{text}',
        '<tpl else>',
            '<a id="{id}-itemEl" class="' + Ext.baseCSSPrefix + 'menu-item-link" href="{href}" <tpl if="hrefTarget">target="{hrefTarget}"</tpl> hidefocus="true" unselectable="on">',
                '<img id="{id}-iconEl" src="{icon}" class="' + Ext.baseCSSPrefix + 'menu-item-icon {iconCls}" />',
                '<span id="{id}-textEl" class="' + Ext.baseCSSPrefix + 'menu-item-text" <tpl if="arrowCls">style="margin-right: 17px;"</tpl> >{text}</span>',
                '<img id="{id}-arrowEl" src="{blank}" class="{arrowCls}" />',
            '</a>',
        '</tpl>'
    ],

    maskOnDisable: false,

    /**
     * @cfg {String} text
     * The text/html to display in this item.
     */

    /**
     * @cfg {Function} handler
     * A function called when the menu item is clicked (can be used instead of {@link #click} event).
     * @cfg {Ext.menu.Item} handler.item The item that was clicked
     * @cfg {Ext.EventObject} handler.e The underyling {@link Ext.EventObject}.
     */

    activate: function() {
        var me = this;

        if (!me.activated && me.canActivate && me.rendered && !me.isDisabled() && me.isVisible()) {
            me.el.addCls(me.activeCls);
            me.focus();
            me.activated = true;
            me.fireEvent('activate', me);
        }
    },

    getFocusEl: function() {
        return this.itemEl;
    },

    deactivate: function() {
        var me = this;

        if (me.activated) {
            me.el.removeCls(me.activeCls);
            me.blur();
            me.hideMenu();
            me.activated = false;
            me.fireEvent('deactivate', me);
        }
    },

    deferExpandMenu: function() {
        var me = this;

        if (me.activated && (!me.menu.rendered || !me.menu.isVisible())) {
            me.parentMenu.activeChild = me.menu;
            me.menu.parentItem = me;
            me.menu.parentMenu = me.menu.ownerCt = me.parentMenu;
            me.menu.showBy(me, me.menuAlign);
        }
    },

    deferHideMenu: function() {
        if (this.menu.isVisible()) {
            this.menu.hide();
        }
    },
    
    cancelDeferHide: function(){
        clearTimeout(this.hideMenuTimer);
    },

    deferHideParentMenus: function() {
        var ancestor;
        Ext.menu.Manager.hideAll();

        if (!Ext.Element.getActiveElement()) {
            // If we have just hidden all Menus, and there is no currently focused element in the dom, transfer focus to the first visible ancestor if any.
            ancestor = this.up(':not([hidden])');
            if (ancestor) {
                ancestor.focus();
            }
        }
    },

    expandMenu: function(delay) {
        var me = this;

        if (me.menu) {
            me.cancelDeferHide();
            if (delay === 0) {
                me.deferExpandMenu();
            } else {
                me.expandMenuTimer = Ext.defer(me.deferExpandMenu, Ext.isNumber(delay) ? delay : me.menuExpandDelay, me);
            }
        }
    },

    getRefItems: function(deep){
        var menu = this.menu,
            items;

        if (menu) {
            items = menu.getRefItems(deep);
            items.unshift(menu);
        }
        return items || [];
    },

    hideMenu: function(delay) {
        var me = this;

        if (me.menu) {
            clearTimeout(me.expandMenuTimer);
            me.hideMenuTimer = Ext.defer(me.deferHideMenu, Ext.isNumber(delay) ? delay : me.menuHideDelay, me);
        }
    },

    initComponent: function() {
        var me = this,
            prefix = Ext.baseCSSPrefix,
            cls = [prefix + 'menu-item'],
            menu;

        me.addEvents(
            /**
             * @event activate
             * Fires when this item is activated
             * @param {Ext.menu.Item} item The activated item
             */
            'activate',

            /**
             * @event click
             * Fires when this item is clicked
             * @param {Ext.menu.Item} item The item that was clicked
             * @param {Ext.EventObject} e The underyling {@link Ext.EventObject}.
             */
            'click',

            /**
             * @event deactivate
             * Fires when this tiem is deactivated
             * @param {Ext.menu.Item} item The deactivated item
             */
            'deactivate'
        );

        if (me.plain) {
            cls.push(prefix + 'menu-item-plain');
        }

        if (me.cls) {
            cls.push(me.cls);
        }

        me.cls = cls.join(' ');

        if (me.menu) {
            menu = me.menu;
            delete me.menu;
            me.setMenu(menu);
        }

        me.callParent(arguments);
    },

    onClick: function(e) {
        var me = this;

        if (!me.href) {
            e.stopEvent();
        }

        if (me.disabled) {
            return;
        }

        if (me.hideOnClick) {
            me.deferHideParentMenusTimer = Ext.defer(me.deferHideParentMenus, me.clickHideDelay, me);
        }

        Ext.callback(me.handler, me.scope || me, [me, e]);
        me.fireEvent('click', me, e);

        if (!me.hideOnClick) {
            me.focus();
        }
    },

    onRemoved: function() {
        var me = this;

        // Removing the active item, must deactivate it.
        if (me.activated && me.parentMenu.activeItem === me) {
            me.parentMenu.deactivateActiveItem();
        }
        me.callParent(arguments);
        delete me.parentMenu;
        delete me.ownerButton;
    },

    // private
    beforeDestroy: function() {
        var me = this;
        if (me.rendered) {
            me.clearTip();
        }
        me.callParent();
    },

    onDestroy: function() {
        var me = this;

        clearTimeout(me.expandMenuTimer);
        me.cancelDeferHide();
        clearTimeout(me.deferHideParentMenusTimer);

        me.setMenu(null);
        me.callParent(arguments);
    },

    beforeRender: function() {
        var me = this,
            blank = Ext.BLANK_IMAGE_URL,
            iconCls,
            arrowCls;

        me.callParent();

        if (me.iconAlign === 'right') {
            iconCls = me.checkChangeDisabled ? me.disabledCls : '';
            arrowCls = Ext.baseCSSPrefix + 'menu-item-icon-right ' + me.iconCls;
        } else {
            iconCls = me.iconCls + (me.checkChangeDisabled ? ' ' + me.disabledCls : '');
            arrowCls = me.menu ? me.arrowCls : '';
        }
        Ext.applyIf(me.renderData, {
            href: me.href || '#',
            hrefTarget: me.hrefTarget,
            icon: me.icon || blank,
            iconCls: iconCls,
            plain: me.plain,
            text: me.text,
            arrowCls: arrowCls,
            blank: blank
        });
    },

    onRender: function() {
        var me = this;

        me.callParent(arguments);

        if (me.tooltip) {
            me.setTooltip(me.tooltip, true);
        }
    },
    
    /**
     * Set a child menu for this item. See the {@link #cfg-menu} configuration.
     * @param {Ext.menu.Menu/Object} menu A menu, or menu configuration. null may be
     * passed to remove the menu.
     * @param {Boolean} [destroyMenu] True to destroy any existing menu. False to
     * prevent destruction. If not specified, the {@link #destroyMenu} configuration
     * will be used.
     */
    setMenu: function(menu, destroyMenu) {
        var me = this,
            oldMenu = me.menu,
            arrowEl = me.arrowEl;
            
        if (oldMenu) {
            delete oldMenu.parentItem;
            delete oldMenu.parentMenu;
            delete oldMenu.ownerCt;
            delete oldMenu.ownerItem;
            
            if (destroyMenu === true || (destroyMenu !== false && me.destroyMenu)) {
                Ext.destroy(oldMenu);
            }
        }
        if (menu) {
            me.menu = Ext.menu.Manager.get(menu);
            me.menu.ownerItem = me;
        } else {
            me.menu = null;
        }
        
        if (me.rendered && !me.destroying && arrowEl) {
            arrowEl[me.menu ? 'addCls' : 'removeCls'](me.arrowCls);
        }
    },

    /**
     * Sets the {@link #click} handler of this item
     * @param {Function} fn The handler function
     * @param {Object} [scope] The scope of the handler function
     */
    setHandler: function(fn, scope) {
        this.handler = fn || null;
        this.scope = scope;
    },
    
    /**
     * Sets the {@link #icon} on this item.
     * @param {String} icon The new icon 
     */
    setIcon: function(icon){
        var iconEl = this.iconEl;
        if (iconEl) {
            iconEl.src = icon || Ext.BLANK_IMAGE_URL;
        }
        this.icon = icon;
    },

    /**
     * Sets the {@link #iconCls} of this item
     * @param {String} iconCls The CSS class to set to {@link #iconCls}
     */
    setIconCls: function(iconCls) {
        var me = this,
            iconEl = me.iconEl;

        if (iconEl) {
            if (me.iconCls) {
                iconEl.removeCls(me.iconCls);
            }

            if (iconCls) {
                iconEl.addCls(iconCls);
            }
        }

        me.iconCls = iconCls;
    },

    /**
     * Sets the {@link #text} of this item
     * @param {String} text The {@link #text}
     */
    setText: function(text) {
        var me = this,
            el = me.textEl || me.el;

        me.text = text;

        if (me.rendered) {
            el.update(text || '');
            // cannot just call layout on the component due to stretchmax
            me.ownerCt.updateLayout();
        }
    },

    getTipAttr: function(){
        return this.tooltipType == 'qtip' ? 'data-qtip' : 'title';
    },

    //private
    clearTip: function() {
        if (Ext.isObject(this.tooltip)) {
            Ext.tip.QuickTipManager.unregister(this.itemEl);
        }
    },

    /**
     * Sets the tooltip for this menu item.
     *
     * @param {String/Object} tooltip This may be:
     *
     *   - **String** : A string to be used as innerHTML (html tags are accepted) to show in a tooltip
     *   - **Object** : A configuration object for {@link Ext.tip.QuickTipManager#register}.
     *
     * @return {Ext.menu.Item} this
     */
    setTooltip: function(tooltip, initial) {
        var me = this;

        if (me.rendered) {
            if (!initial) {
                me.clearTip();
            }

            if (Ext.isObject(tooltip)) {
                Ext.tip.QuickTipManager.register(Ext.apply({
                    target: me.itemEl.id
                },
                tooltip));
                me.tooltip = tooltip;
            } else {
                me.itemEl.dom.setAttribute(me.getTipAttr(), tooltip);
            }
        } else {
            me.tooltip = tooltip;
        }

        return me;
    }
});
