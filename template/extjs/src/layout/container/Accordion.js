/**
 * This is a layout that manages multiple Panels in an expandable accordion style such that by default only
 * one Panel can be expanded at any given time (set {@link #multi} config to have more open). Each Panel has
 * built-in support for expanding and collapsing.
 *
 * Note: Only Ext Panels and all subclasses of Ext.panel.Panel may be used in an accordion layout Container.
 *
 *     @example
 *     Ext.create('Ext.panel.Panel', {
 *         title: 'Accordion Layout',
 *         width: 300,
 *         height: 300,
 *         defaults: {
 *             // applied to each contained panel
 *             bodyStyle: 'padding:15px'
 *         },
 *         layout: {
 *             // layout-specific configs go here
 *             type: 'accordion',
 *             titleCollapse: false,
 *             animate: true,
 *             activeOnTop: true
 *         },
 *         items: [{
 *             title: 'Panel 1',
 *             html: 'Panel content!'
 *         },{
 *             title: 'Panel 2',
 *             html: 'Panel content!'
 *         },{
 *             title: 'Panel 3',
 *             html: 'Panel content!'
 *         }],
 *         renderTo: Ext.getBody()
 *     });
 */
Ext.define('Ext.layout.container.Accordion', {
    extend: 'Ext.layout.container.VBox',
    alias: ['layout.accordion'],
    alternateClassName: 'Ext.layout.AccordionLayout',

    itemCls: [Ext.baseCSSPrefix + 'box-item', Ext.baseCSSPrefix + 'accordion-item'],

    align: 'stretch',

    /**
     * @cfg {Boolean} fill
     * True to adjust the active item's height to fill the available space in the container, false to use the
     * item's current height, or auto height if not explicitly set.
     */
    fill : true,

    /**
     * @cfg {Boolean} autoWidth
     * Child Panels have their width actively managed to fit within the accordion's width.
     * @removed This config is ignored in ExtJS 4
     */

    /**
     * @cfg {Boolean} titleCollapse
     * True to allow expand/collapse of each contained panel by clicking anywhere on the title bar, false to allow
     * expand/collapse only when the toggle tool button is clicked.  When set to false,
     * {@link #hideCollapseTool} should be false also.
     */
    titleCollapse : true,

    /**
     * @cfg {Boolean} hideCollapseTool
     * True to hide the contained Panels' collapse/expand toggle buttons, false to display them.
     * When set to true, {@link #titleCollapse} is automatically set to true.
     */
    hideCollapseTool : false,

    /**
     * @cfg {Boolean} collapseFirst
     * True to make sure the collapse/expand toggle button always renders first (to the left of) any other tools
     * in the contained Panels' title bars, false to render it last.
     */
    collapseFirst : false,

    /**
     * @cfg {Boolean} animate
     * True to slide the contained panels open and closed during expand/collapse using animation, false to open and
     * close directly with no animation. Note: The layout performs animated collapsing
     * and expanding, *not* the child Panels.
     */
    animate : true,
    /**
     * @cfg {Boolean} activeOnTop
     * Only valid when {@link #multi} is `false` and {@link #animate} is `false`.
     *
     * True to swap the position of each panel as it is expanded so that it becomes the first item in the container,
     * false to keep the panels in the rendered order.
     */
    activeOnTop : false,
    /**
     * @cfg {Boolean} multi
     * Set to true to enable multiple accordion items to be open at once.
     */
    multi: false,
    
    defaultAnimatePolicy: {
        y: true,
        height: true
    },

    constructor: function() {
        var me = this;

        me.callParent(arguments);

        if (me.animate) {
            me.animatePolicy = Ext.apply({}, me.defaultAnimatePolicy);
        } else {
            me.animatePolicy = null;
        }
    },

    beforeRenderItems: function (items) {
        var me = this,
            ln = items.length,
            i = 0,
            comp;

        for (; i < ln; i++) {
            comp = items[i];
            if (!comp.rendered) {
                // Set up initial properties for Panels in an accordion.
                if (me.collapseFirst) {
                    comp.collapseFirst = me.collapseFirst;
                }
                if (me.hideCollapseTool) {
                    comp.hideCollapseTool = me.hideCollapseTool;
                    comp.titleCollapse = true;
                }
                else if (me.titleCollapse) {
                    comp.titleCollapse = me.titleCollapse;
                }

                delete comp.hideHeader;
                delete comp.width;
                comp.collapsible = true;
                comp.title = comp.title || '&#160;';
                comp.addBodyCls(Ext.baseCSSPrefix + 'accordion-body');

                // If only one child Panel is allowed to be expanded
                // then collapse all except the first one found with collapsed:false
                if (!me.multi) {
                    // If there is an expanded item, all others must be rendered collapsed.
                    if (me.expandedItem !== undefined) {
                        comp.collapsed = true;
                    }
                    // Otherwise expand the first item with collapsed explicitly configured as false
                    else if (comp.hasOwnProperty('collapsed') && comp.collapsed === false) {
                        me.expandedItem = i;
                    } else {
                        comp.collapsed = true;
                    }

                    // If only one child Panel may be expanded, then intercept expand/show requests.
                    me.owner.mon(comp, {
                        show: me.onComponentShow,
                        beforeexpand: me.onComponentExpand,
                        scope: me
                    });
                }

                // If we must fill available space, a collapse must be listened for and a sibling must
                // be expanded.
                if (me.fill) {
                    me.owner.mon(comp, {
                        beforecollapse: me.onComponentCollapse,
                        scope: me
                    });
                }
            }
        }

        // If no collapsed:false Panels found, make the first one expanded.
        if (ln && me.expandedItem === undefined) {
            me.expandedItem = 0;
            items[0].collapsed = false;
        }
    },

    getItemsRenderTree: function(items) {
        this.beforeRenderItems(items);

        return this.callParent(arguments);
    },

    renderItems : function(items, target) {
        this.beforeRenderItems(items);

        this.callParent(arguments);
    },

    configureItem: function(item) {
        this.callParent(arguments);

        // We handle animations for the expand/collapse of items.
        // Items do not have individual borders
        item.animCollapse = item.border = false;

        // If filling available space, all Panels flex.
        if (this.fill) {
            item.flex = 1;
        }
    },

    onChildPanelRender: function(panel) {
        panel.header.addCls(Ext.baseCSSPrefix + 'accordion-hd');
    },

    beginLayout: function (ownerContext) {
        this.callParent(arguments);
        this.updatePanelClasses(ownerContext);
    },

    updatePanelClasses: function(ownerContext) {
        var children = ownerContext.visibleItems,
            ln = children.length,
            siblingCollapsed = true,
            i, child, header;

        for (i = 0; i < ln; i++) {
            child = children[i];
            header = child.header;
            header.addCls(Ext.baseCSSPrefix + 'accordion-hd');

            if (siblingCollapsed) {
                header.removeCls(Ext.baseCSSPrefix + 'accordion-hd-sibling-expanded');
            } else {
                header.addCls(Ext.baseCSSPrefix + 'accordion-hd-sibling-expanded');
            }

            if (i + 1 == ln && child.collapsed) {
                header.addCls(Ext.baseCSSPrefix + 'accordion-hd-last-collapsed');
            } else {
                header.removeCls(Ext.baseCSSPrefix + 'accordion-hd-last-collapsed');
            }

            siblingCollapsed = child.collapsed;
        }
    },

    // When a Component expands, adjust the heights of the other Components to be just enough to accommodate
    // their headers.
    // The expanded Component receives the only flex value, and so gets all remaining space.
    onComponentExpand: function(toExpand) {
        var me = this,
            owner = me.owner,
            expanded,
            expandedCount, i,
            previousValue;

        if (!me.processing) {
            me.processing = true;
            previousValue = owner.deferLayouts;
            owner.deferLayouts = true;
            expanded = me.multi ? [] : owner.query('>panel:not([collapsed])');
            expandedCount = expanded.length;
            
            // Collapse all other expanded child items (Won't loop if multi is true)
            for (i = 0; i < expandedCount; i++) {
                expanded[i].collapse();
            }
            owner.deferLayouts = previousValue;
            me.processing = false;
        }
    },

    onComponentCollapse: function(comp) {
        var me = this,
            owner = me.owner,
            toExpand,
            expanded,
            previousValue;

        if (me.owner.items.getCount() === 1) {
            // do not allow collapse if there is only one item
            return false;
        }

        if (!me.processing) {
            me.processing = true;
            previousValue = owner.deferLayouts;
            owner.deferLayouts = true;
            toExpand = comp.next() || comp.prev();

            // If we are allowing multi, and the "toCollapse" component is NOT the only expanded Component,
            // then ask the box layout to collapse it to its header.
            if (me.multi) {
                expanded = me.owner.query('>panel:not([collapsed])');

                // If the collapsing Panel is the only expanded one, expand the following Component.
                // All this is handling fill: true, so there must be at least one expanded,
                if (expanded.length === 1) {
                    toExpand.expand();
                }

            } else if (toExpand) {
                toExpand.expand();
            }
            owner.deferLayouts = previousValue;
            me.processing = false;
        }
    },

    onComponentShow: function(comp) {
        // Showing a Component means that you want to see it, so expand it.
        this.onComponentExpand(comp);
    }
});