/**
 * This is the layout style of choice for creating structural layouts in a multi-column format where the width of each
 * column can be specified as a percentage or fixed width, but the height is allowed to vary based on the content. This
 * class is intended to be extended or created via the layout:'column' {@link Ext.container.Container#layout} config,
 * and should generally not need to be created directly via the new keyword.
 *
 * ColumnLayout does not have any direct config options (other than inherited ones), but it does support a specific
 * config property of `columnWidth` that can be included in the config of any panel added to it. The layout will use
 * the columnWidth (if present) or width of each panel during layout to determine how to size each panel. If width or
 * columnWidth is not specified for a given panel, its width will default to the panel's width (or auto).
 *
 * The width property is always evaluated as pixels, and must be a number greater than or equal to 1. The columnWidth
 * property is always evaluated as a percentage, and must be a decimal value greater than 0 and less than 1 (e.g., .25).
 *
 * The basic rules for specifying column widths are pretty simple. The logic makes two passes through the set of
 * contained panels. During the first layout pass, all panels that either have a fixed width or none specified (auto)
 * are skipped, but their widths are subtracted from the overall container width.
 *
 * During the second pass, all panels with columnWidths are assigned pixel widths in proportion to their percentages
 * based on the total **remaining** container width. In other words, percentage width panels are designed to fill
 * the space left over by all the fixed-width and/or auto-width panels. Because of this, while you can specify any
 * number of columns with different percentages, the columnWidths must always add up to 1 (or 100%) when added
 * together, otherwise your layout may not render as expected.
 *
 *     @example
 *     // All columns are percentages -- they must add up to 1
 *     Ext.create('Ext.panel.Panel', {
 *         title: 'Column Layout - Percentage Only',
 *         width: 350,
 *         height: 250,
 *         layout:'column',
 *         items: [{
 *             title: 'Column 1',
 *             columnWidth: 0.25
 *         },{
 *             title: 'Column 2',
 *             columnWidth: 0.55
 *         },{
 *             title: 'Column 3',
 *             columnWidth: 0.20
 *         }],
 *         renderTo: Ext.getBody()
 *     });
 *
 *     // Mix of width and columnWidth -- all columnWidth values must add up
 *     // to 1. The first column will take up exactly 120px, and the last two
 *     // columns will fill the remaining container width.
 *
 *     Ext.create('Ext.Panel', {
 *         title: 'Column Layout - Mixed',
 *         width: 350,
 *         height: 250,
 *         layout:'column',
 *         items: [{
 *             title: 'Column 1',
 *             width: 120
 *         },{
 *             title: 'Column 2',
 *             columnWidth: 0.7
 *         },{
 *             title: 'Column 3',
 *             columnWidth: 0.3
 *         }],
 *         renderTo: Ext.getBody()
 *     });
 */
Ext.define('Ext.layout.container.Column', {

    extend: 'Ext.layout.container.Container',
    alias: ['layout.column'],
    alternateClassName: 'Ext.layout.ColumnLayout',

    type: 'column',

    itemCls: Ext.baseCSSPrefix + 'column',

    targetCls: Ext.baseCSSPrefix + 'column-layout-ct',

    // Columns with a columnWidth have their width managed.
    columnWidthSizePolicy: {
        setsWidth: 1,
        setsHeight: 0
    },

    childEls: [
        'innerCt'
    ],

    manageOverflow: 2,

    renderTpl: [
        '<div id="{ownerId}-innerCt" class="',Ext.baseCSSPrefix,'column-inner">',
            '{%this.renderBody(out,values)%}',
            '<div class="',Ext.baseCSSPrefix,'clear"></div>',
        '</div>',
        '{%this.renderPadder(out,values)%}'
    ],

    getItemSizePolicy: function (item) {
        if (item.columnWidth) {
            return this.columnWidthSizePolicy;
        }
        return this.autoSizePolicy;
    },

    beginLayout: function() {
        this.callParent(arguments);
        this.innerCt.dom.style.width = '';
    },

    calculate: function (ownerContext) {
        var me = this,
            containerSize = me.getContainerSize(ownerContext),
            state = ownerContext.state;

        if (state.calculatedColumns || (state.calculatedColumns = me.calculateColumns(ownerContext))) {
            if (me.calculateHeights(ownerContext)) {
                me.calculateOverflow(ownerContext, containerSize);
                return;
            }
        }

        me.done = false;
    },

    calculateColumns: function (ownerContext) {
        var me = this,
            containerSize = me.getContainerSize(ownerContext),
            innerCtContext = ownerContext.getEl('innerCt', me),
            items = ownerContext.childItems,
            len = items.length,
            contentWidth = 0,
            blocked, availableWidth, i, itemContext, itemMarginWidth, itemWidth;

        // Can never decide upon necessity of vertical scrollbar (and therefore, narrower
        // content width) until the component layout has published a height for the target
        // element.
        if (!ownerContext.heightModel.shrinkWrap && !ownerContext.targetContext.hasProp('height')) {
            return false;
        }

        // No parallel measurement, cannot lay out boxes.
        if (!containerSize.gotWidth) { //\\ TODO: Deal with target padding width
            ownerContext.targetContext.block(me, 'width');
            blocked = true;
        } else {
            availableWidth = containerSize.width;

            innerCtContext.setWidth(availableWidth);
        }

        // we need the widths of the columns we don't manage to proceed so we block on them
        // if they are not ready...
        for (i = 0; i < len; ++i) {
            itemContext = items[i];

            // this is needed below for non-calculated columns, but is also needed in the
            // next loop for calculated columns... this way we only call getMarginInfo in
            // this loop and use the marginInfo property in the next...
            itemMarginWidth = itemContext.getMarginInfo().width;

            if (!itemContext.widthModel.calculated) {
                itemWidth = itemContext.getProp('width');
                if (typeof itemWidth != 'number') {
                    itemContext.block(me, 'width');
                    blocked = true;
                }

                contentWidth += itemWidth + itemMarginWidth;
            }
        }

        if (!blocked) {
            availableWidth = (availableWidth < contentWidth) ? 0 : availableWidth - contentWidth;

            for (i = 0; i < len; ++i) {
                itemContext = items[i];
                if (itemContext.widthModel.calculated) {
                    itemMarginWidth = itemContext.marginInfo.width; // always set by above loop
                    itemWidth = itemContext.target.columnWidth;
                    itemWidth = Math.floor(itemWidth * availableWidth) - itemMarginWidth;
                    itemWidth = itemContext.setWidth(itemWidth); // constrains to min/maxWidth
                    contentWidth += itemWidth + itemMarginWidth;
                }
            }

            ownerContext.setContentWidth(contentWidth);
        }

        // we registered all the values that block this calculation, so abort now if blocked...
        return !blocked;
    },

    calculateHeights: function (ownerContext) {
        var me = this,
            items = ownerContext.childItems,
            len = items.length,
            blocked, i, itemContext;

        // in order for innerCt to have the proper height, all the items must have height
        // correct in the DOM...
        blocked = false;
        for (i = 0; i < len; ++i) {
            itemContext = items[i];

            if (!itemContext.hasDomProp('height')) {
                itemContext.domBlock(me, 'height');
                blocked = true;
            }
        }

        if (!blocked) {
            ownerContext.setContentHeight(me.innerCt.getHeight() + ownerContext.targetContext.getPaddingInfo().height);
        }

        return !blocked;
    },

    finishedLayout: function (ownerContext) {
        var bc = ownerContext.bodyContext;

        // Owner may not have a body - this seems to only be needed for Panels.
        if (bc && (Ext.isIE6 || Ext.isIE7 || Ext.isIEQuirks)) {
            // Fix for https://sencha.jira.com/browse/EXTJSIV-4979
            bc.el.repaint();
        }

        this.callParent(arguments);
    },

    getRenderTarget : function() {
        return this.innerCt;
    }
});
