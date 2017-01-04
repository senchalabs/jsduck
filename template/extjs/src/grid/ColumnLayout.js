/**
 * @private
 *
 * This class is used only by the grid's HeaderContainer docked child.
 *
 * It adds the ability to shrink the vertical size of the inner container element back if a grouped
 * column header has all its child columns dragged out, and the whole HeaderContainer needs to shrink back down.
 *
 * Also, after every layout, after all headers have attained their 'stretchmax' height, it goes through and calls
 * `setPadding` on the columns so that they lay out correctly.
 */
Ext.define('Ext.grid.ColumnLayout', {
    extend: 'Ext.layout.container.HBox',
    alias: 'layout.gridcolumn',
    type : 'gridcolumn',

    reserveOffset: false,

    firstHeaderCls: Ext.baseCSSPrefix + 'column-header-first',
    lastHeaderCls: Ext.baseCSSPrefix + 'column-header-last',

    initLayout: function() {
        this.grid = this.owner.up('[scrollerOwner]');
        this.callParent();
    },

    // Collect the height of the table of data upon layout begin
    beginLayout: function (ownerContext) {
        var me = this,
            grid = me.grid,
            view = grid.view,
            i = 0,
            items = me.getVisibleItems(),
            len = items.length,
            item;

        ownerContext.gridContext = ownerContext.context.getCmp(me.grid);

        // If we are one side of a locking grid, then if we are on the "normal" side, we have to grab the normal view
        // for use in determining whether to subtract scrollbar width from available width.
        // The locked side does not have scrollbars, so it should not look at the view.
        if (grid.lockable) {
            if (me.owner.up('tablepanel') === view.normalGrid) {
                view = view.normalGrid.getView();
            } else {
                view = null;
            }
        }

        me.callParent(arguments);

        // Unstretch child items before the layout which stretches them.
        for (; i < len; i++) {
            item = items[i];
            item.removeCls([me.firstHeaderCls, me.lastHeaderCls]);
            item.el.setStyle({
                height: 'auto'
            });
            item.titleEl.setStyle({
                height: 'auto',
                paddingTop: ''  // reset back to default padding of the style
            });
        }

        // Add special first/last classes
        if (len > 0) {
            items[0].addCls(me.firstHeaderCls);
            items[len - 1].addCls(me.lastHeaderCls);
        }

        // If the owner is the grid's HeaderContainer, and the UI displays old fashioned scrollbars and there is a rendered View with data in it,
        // AND we are scrolling vertically:
        // collect the View context to interrogate it for overflow, and possibly invalidate it if there is overflow
        if (!me.owner.isHeader && Ext.getScrollbarSize().width && !grid.collapsed && view &&
                view.table.dom && (view.autoScroll || view.overflowY)) {
            ownerContext.viewContext = ownerContext.context.getCmp(view);
        }
    },

    roundFlex: function(width) {
        return Math.floor(width);
    },

    calculate: function(ownerContext) {
        var me = this,
            viewContext = ownerContext.viewContext,
            tableHeight,
            viewHeight;

        me.callParent(arguments);

        if (ownerContext.state.parallelDone) {
            ownerContext.setProp('columnWidthsDone', true);
        }

        // If we have a viewContext (Only created if there is an existing <table> within the view, AND we are scolling vertically AND scrollbars take up space)
        //     we are not already in the second pass, and we are not shrinkWrapping...
        //     Then we have to see if we know enough to determine whether there is vertical opverflow so that we can
        //     invalidate and loop back for the second pass with a narrower target width.
        if (viewContext && !ownerContext.state.overflowAdjust.width && !ownerContext.gridContext.heightModel.shrinkWrap) {
            tableHeight = viewContext.tableContext.getProp('height');
            viewHeight = viewContext.getProp('height');

            // Heights of both view and its table content have not both been published; we cannot complete
            if (isNaN(tableHeight + viewHeight)) {
                me.done = false;
            }

            // Heights have been published, and there is vertical overflow; invalidate with a width adjustment to allow for the scrollbar
            else if (tableHeight >= viewHeight) {
                ownerContext.gridContext.invalidate({
                    after: function() {
                        ownerContext.state.overflowAdjust = {
                            width: Ext.getScrollbarSize().width,
                            height: 0
                        };
                    }
                });
            }
        }
    },
 
    completeLayout: function(ownerContext) {
        var me = this,
            owner = me.owner,
            state = ownerContext.state,
            needsInvalidate = false,
            calculated = me.sizeModels.calculated,
            childItems, len, i, childContext, item;

        me.callParent(arguments);

        // If we have not been through this already, and the owning Container is configured
        // forceFit, is not a group column and and there is a valid width, then convert
        // widths to flexes, and loop back.
        if (!state.flexesCalculated && owner.forceFit && !owner.isHeader) {
            childItems = ownerContext.childItems;
            len = childItems.length;

            for (i = 0; i < len; i++) {
                childContext = childItems[i];
                item = childContext.target;

                // For forceFit, just use allocated width as the flex value, and the proportions
                // will end up the same whatever HeaderContainer width they are being forced into.
                if (item.width) {
                    item.flex = ownerContext.childItems[i].flex = item.width;
                    delete item.width;
                    childContext.widthModel = calculated;
                    needsInvalidate = true;
                }
            }

            // Recalculate based upon all columns now being flexed instead of sized.
            // Set flag, so that we do not do this infinitely
            if (needsInvalidate) {
                me.cacheFlexes(ownerContext);
                ownerContext.invalidate({
                    state: {
                        flexesCalculated: true
                    }
                });
            }
        }
    },

    finalizeLayout: function() {
        var me = this,
            i = 0,
            items,
            len,
            itemsHeight,
            owner = me.owner,
            titleEl = owner.titleEl;

        // Set up padding in items
        items = me.getVisibleItems();
        len = items.length;
        // header container's items take up the whole height
        itemsHeight = owner.el.getViewSize().height;
        if (titleEl) {
        // if owner is a grouped column with children, we need to subtract the titleEl's height
        // to determine the remaining available height for the child items
            itemsHeight -= titleEl.getHeight();
        }
        for (; i < len; i++) {
            items[i].setPadding(itemsHeight);
        }
    },

    // FIX: when flexing we actually don't have enough space as we would
    // typically because of the scrollOffset on the GridView, must reserve this
    publishInnerCtSize: function(ownerContext) {
        var me = this,
            size = ownerContext.state.boxPlan.targetSize,
            cw = ownerContext.peek('contentWidth'),
            view;

        // InnerCt MUST stretch to accommodate all columns so that left/right scrolling is enabled in the header container.
        if ((cw != null) && !me.owner.isHeader) {
            size.width = cw;

            // innerCt must also encompass any vertical scrollbar width if there may be one
            view = me.owner.ownerCt.view;
            if (view.autoScroll || view.overflowY) {
                size.width += Ext.getScrollbarSize().width;
            }
        }

        return me.callParent(arguments);
    }
});
