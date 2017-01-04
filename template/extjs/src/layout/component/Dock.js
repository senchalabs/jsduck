/**
 * This ComponentLayout handles docking for Panels. It takes care of panels that are
 * part of a ContainerLayout that sets this Panel's size and Panels that are part of
 * an AutoContainerLayout in which this panel get his height based of the CSS or
 * or its content.
 * @private
 */
Ext.define('Ext.layout.component.Dock', {

    /* Begin Definitions */

    extend: 'Ext.layout.component.Component',

    alias: 'layout.dock',

    alternateClassName: 'Ext.layout.component.AbstractDock',

    /* End Definitions */

    type: 'dock',

    initializedBorders: -1,

    horizontalCollapsePolicy: { width: true, x: true },

    verticalCollapsePolicy: { height: true, y: true },

    finishRender: function () {
        var me = this,
            target, items;

        me.callParent();

        target = me.getRenderTarget();
        items = me.getDockedItems();

        me.finishRenderItems(target, items);
    },

    isItemBoxParent: function (itemContext) {
        return true;
    },

    isItemShrinkWrap: function (item) {
        return true;
    },

    dockOpposites: {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right'
    },

    handleItemBorders: function() {
        var me = this,
            owner = me.owner,
            borders, docked,
            oldBorders = me.borders,
            opposites = me.dockOpposites,
            currentGeneration = owner.dockedItems.generation,
            i, ln, item, dock, side, borderItem,
            collapsed = me.collapsed;

        if (me.initializedBorders == currentGeneration || (owner.border && !owner.manageBodyBorders)) {
            return;
        }

        me.initializedBorders = currentGeneration;

        // Borders have to be calculated using expanded docked item collection.
        me.collapsed = false;
        docked = me.getLayoutItems();
        me.collapsed = collapsed;

        borders = { top: [], right: [], bottom: [], left: [] };

        for (i = 0, ln = docked.length; i < ln; i++) {
            item = docked[i];
            dock = item.dock;

            if (item.ignoreBorderManagement) {
                continue;
            }

            if (!borders[dock].satisfied) {
                borders[dock].push(item);
                borders[dock].satisfied = true;
            }

            if (!borders.top.satisfied && opposites[dock] !== 'top') {
                borders.top.push(item);
            }
            if (!borders.right.satisfied && opposites[dock] !== 'right') {
                borders.right.push(item);
            }
            if (!borders.bottom.satisfied && opposites[dock] !== 'bottom') {
                borders.bottom.push(item);
            }
            if (!borders.left.satisfied && opposites[dock] !== 'left') {
                borders.left.push(item);
            }
        }

        if (oldBorders) {
            for (side in oldBorders) {
                if (oldBorders.hasOwnProperty(side)) {
                    ln = oldBorders[side].length;
                    if (!owner.manageBodyBorders) {
                        for (i = 0; i < ln; i++) {
                            borderItem = oldBorders[side][i];
                            if (!borderItem.isDestroyed) {
                                borderItem.removeCls(Ext.baseCSSPrefix + 'docked-noborder-' + side);
                            }
                        }
                        if (!oldBorders[side].satisfied && !owner.bodyBorder) {
                            owner.removeBodyCls(Ext.baseCSSPrefix + 'docked-noborder-' + side);
                        }
                    }
                    else if (oldBorders[side].satisfied) {
                        owner.setBodyStyle('border-' + side + '-width', '');
                    }
                }
            }
        }

        for (side in borders) {
            if (borders.hasOwnProperty(side)) {
                ln = borders[side].length;
                if (!owner.manageBodyBorders) {
                    for (i = 0; i < ln; i++) {
                        borders[side][i].addCls(Ext.baseCSSPrefix + 'docked-noborder-' + side);
                    }
                    if ((!borders[side].satisfied && !owner.bodyBorder) || owner.bodyBorder === false) {
                        owner.addBodyCls(Ext.baseCSSPrefix + 'docked-noborder-' + side);
                    }
                }
                else if (borders[side].satisfied) {
                    owner.setBodyStyle('border-' + side + '-width', '1px');
                }
            }
        }

        me.borders = borders;
    },

    beforeLayoutCycle: function (ownerContext) {
        var me = this,
            owner = me.owner,
            shrinkWrap = me.sizeModels.shrinkWrap,
            collapsedHorz, collapsedVert;

        if (owner.collapsed) {
            if (owner.collapsedVertical()) {
                collapsedVert = true;
                ownerContext.measureDimensions = 1;
            } else {
                collapsedHorz = true;
                ownerContext.measureDimensions = 2;
            }
        }

        ownerContext.collapsedVert = collapsedVert;
        ownerContext.collapsedHorz = collapsedHorz;

        // If we are collapsed, we want to auto-layout using the placeholder/expander
        // instead of the normal items/dockedItems. This must be done here since we could
        // be in a box layout w/stretchmax which sets the width/heightModel to allow it to
        // control the size.
        if (collapsedVert) {
            ownerContext.heightModel = shrinkWrap;
        } else if (collapsedHorz) {
            ownerContext.widthModel = shrinkWrap;
        }
    },

    beginLayout: function(ownerContext) {
        var me = this,
            owner = me.owner,
            docked = me.getLayoutItems(),
            layoutContext = ownerContext.context,
            dockedItemCount = docked.length,
            dockedItems, i, item, itemContext, offsets,
            collapsed;

        me.callParent(arguments);

        me.handleItemBorders();

        // Cache the children as ContextItems (like a Container). Also setup to handle
        // collapsed state:
        collapsed = owner.getCollapsed();
        if (collapsed !== me.lastCollapsedState && Ext.isDefined(me.lastCollapsedState)) {
            // If we are collapsing...
            if (me.owner.collapsed) {
                ownerContext.isCollapsingOrExpanding = 1;
                // Add the collapsed class now, so that collapsed CSS rules are applied before measurements are taken by the layout.
                owner.addClsWithUI(owner.collapsedCls);
            } else {
                ownerContext.isCollapsingOrExpanding = 2;
                // Remove the collapsed class now, before layout calculations are done.
                owner.removeClsWithUI(owner.collapsedCls);
                ownerContext.lastCollapsedState = me.lastCollapsedState;
            }
        }
        me.lastCollapsedState = collapsed;

        ownerContext.dockedItems = dockedItems = [];

        for (i = 0; i < dockedItemCount; i++) {
            item = docked[i];
            if (item.rendered) {
                itemContext = layoutContext.getCmp(item);
                itemContext.dockedAt = { x: 0, y: 0 };
                itemContext.offsets = offsets = Ext.Element.parseBox(item.offsets || {});
                offsets.width = offsets.left + offsets.right;
                offsets.height = offsets.top + offsets.bottom;
                dockedItems.push(itemContext);
            }
        }

        ownerContext.bodyContext = ownerContext.getEl('body');
    },

    beginLayoutCycle: function(ownerContext) {
        var me = this,
            docked = ownerContext.dockedItems,
            len = docked.length,
            owner = me.owner,
            frameBody = owner.frameBody,
            lastHeightModel = me.lastHeightModel,
            i, item, dock;

        me.callParent(arguments);

        if (lastHeightModel && lastHeightModel.shrinkWrap &&
                    !ownerContext.heightModel.shrinkWrap && !me.owner.manageHeight) {
            owner.body.dom.style.marginBottom = '';
        }

        if (ownerContext.widthModel.auto) {
            if (ownerContext.widthModel.shrinkWrap) {
                owner.el.setWidth(null);
            }
            owner.body.setWidth(null);
            if (frameBody) {
                frameBody.setWidth(null);
            }
        }
        if (ownerContext.heightModel.auto) {
            owner.body.setHeight(null);
            //owner.el.setHeight(null); Disable this for now
            if (frameBody) {
                frameBody.setHeight(null);
            }
        }

        // Each time we begin (2nd+ would be due to invalidate) we need to publish the
        // known contentWidth/Height if we are collapsed:
        if (ownerContext.collapsedVert) {
            ownerContext.setContentHeight(0);
        } else if (ownerContext.collapsedHorz) {
            ownerContext.setContentWidth(0);
        }

        // dock: 'right' items, when a panel gets narrower get "squished". Moving them to
        // left:0px avoids this!
        for (i = 0; i < len; i++) {
            item = docked[i].target;
            dock = item.dock;

            if (dock == 'right') {
                item.el.setLeft(0);
            } else if (dock != 'left') {
                continue;
            }

            // TODO - clear width/height?
        }
    },

    calculate: function (ownerContext) {
        var me = this,
            measure = me.measureAutoDimensions(ownerContext, ownerContext.measureDimensions),
            state = ownerContext.state,
            horzDone = state.horzDone,
            vertDone = state.vertDone,
            bodyContext = ownerContext.bodyContext,
            horz, vert, forward, backward;

        // make sure we can use these value w/o calling methods to get them
        ownerContext.borderInfo  || ownerContext.getBorderInfo();
        ownerContext.paddingInfo || ownerContext.getPaddingInfo();
        ownerContext.framingInfo || ownerContext.getFraming();
        bodyContext.borderInfo   || bodyContext.getBorderInfo();
        bodyContext.paddingInfo  || bodyContext.getPaddingInfo();

        // Start the axes so they are ready to proceed inwards (fixed-size) or outwards
        // (shrinkWrap) and stash key property names as well:
        horz = !horzDone &&
               me.createAxis(ownerContext, measure.contentWidth, ownerContext.widthModel,
                             'left', 'right', 'x', 'width', 'Width', ownerContext.collapsedHorz);
        vert = !vertDone &&
               me.createAxis(ownerContext, measure.contentHeight, ownerContext.heightModel,
                             'top', 'bottom', 'y', 'height', 'Height', ownerContext.collapsedVert);

        // We iterate forward and backward over the dockedItems at the same time based on
        // whether an axis is shrinkWrap or fixed-size. For a fixed-size axis, the outer box
        // axis is allocated to docked items in forward order and is reduced accordingly.
        // To handle a shrinkWrap axis, the box starts at the inner (body) size and is used to
        // size docked items in backwards order. This is because the last docked item shares
        // an edge with the body. The item size is used to adjust the shrinkWrap axis outwards
        // until the first docked item (at the outermost edge) is processed. This backwards
        // order ensures that docked items never get an incorrect size for any dimension.
        for (forward = 0, backward = ownerContext.dockedItems.length; backward--; ++forward) {
            if (horz) {
                me.dockChild(ownerContext, horz, backward, forward);
            }
            if (vert) {
                me.dockChild(ownerContext, vert, backward, forward);
            }
        }

        if (horz && me.finishAxis(ownerContext, horz)) {
            state.horzDone = horzDone = horz;
        }

        if (vert && me.finishAxis(ownerContext, vert)) {
            state.vertDone = vertDone = vert;
        }

        // Once all items are docked, the final size of the outer panel or inner body can
        // be determined. If we can determine both width and height, we are done.
        if (horzDone && vertDone && me.finishConstraints(ownerContext, horzDone, vertDone)) {
            // Size information is published as we dock items but position is hard to do
            // that way (while avoiding published multiple times) so we publish all the
            // positions at the end.
            me.finishPositions(ownerContext, horzDone, vertDone);
        } else {
            me.done = false;
        }
    },

    /**
     * Creates an axis object given the particulars.
     * @private
     */
    createAxis: function (ownerContext, contentSize, sizeModel, dockBegin, dockEnd, posProp,
                          sizeProp, sizePropCap, collapsedAxis) {
        var begin = 0,
            owner = this.owner,
            maxSize = owner['max' + sizePropCap],
            minSize = owner['min' + sizePropCap] || 0,
            hasMaxSize = maxSize != null, // exactly the same as "maxSize !== null && maxSize !== undefined"
            setSize = 'set' + sizePropCap,
            border, bodyContext, frameSize, padding, end;

        if (sizeModel.shrinkWrap) {
            // End position before adding docks around the content is content size plus the body borders in this axis.
            // If collapsed in this axis, the body borders will not be shown.
            if (collapsedAxis) {
                end = 0;
            } else {
                bodyContext = ownerContext.bodyContext;
                end = contentSize + bodyContext.borderInfo[sizeProp];
            }
        } else {
            border    = ownerContext.borderInfo;
            frameSize = ownerContext.framingInfo;
            padding   = ownerContext.paddingInfo;

            end = ownerContext.getProp(sizeProp);
            end -= border[dockEnd] + padding[dockEnd] + frameSize[dockEnd];

            begin = border[dockBegin] + padding[dockBegin] + frameSize[dockBegin];
        }

        return {
            shrinkWrap: sizeModel.shrinkWrap,
            sizeModel: sizeModel,
            // An axis tracks start and end+1 px positions. eg 0 to 10 for 10px high
            begin: begin,
            end: end,
            collapsed: collapsedAxis,
            horizontal: posProp == 'x',
            ignoreFrameBegin: false,
            ignoreFrameEnd: false,
            initialSize: end - begin,
            hasMinMaxConstraints: (minSize || hasMaxSize) && sizeModel.shrinkWrap,
            minSize: minSize,
            maxSize: hasMaxSize ? maxSize : 1e9,
            bodyPosProp: this.owner.manageHeight ? posProp : ('margin-' + dockBegin), // 'margin-left' or 'margin-top'
            dockBegin: dockBegin,    // 'left' or 'top'
            dockEnd: dockEnd,        // 'right' or 'end'
            posProp: posProp,        // 'x' or 'y'
            sizeProp: sizeProp,      // 'width' or 'height'
            sizePropCap: sizePropCap, // 'Width' or 'Height'
            setSize: setSize,
            dockedPixelsEnd: 0
        };
    },

    /**
     * Docks a child item on the specified axis. This boils down to determining if the item
     * is docked at the "beginning" of the axis ("left" if horizontal, "top" if vertical),
     * the "end" of the axis ("right" if horizontal, "bottom" if vertical) or stretches
     * along the axis ("top" or "bottom" if horizontal, "left" or "right" if vertical). It
     * also has to differentiate between fixed and shrinkWrap sized dimensions.
     * @private
     */
    dockChild: function (ownerContext, axis, backward, forward) {
        var me = this,
            itemContext = ownerContext.dockedItems[axis.shrinkWrap ? backward : forward],
            item = itemContext.target,
            dock = item.dock, // left/top/right/bottom
            pos;

        if(item.ignoreParentFrame && ownerContext.isCollapsingOrExpanding) {
            // collapsed window header margins may differ from expanded window header margins
            // so we need to make sure the old cached values are not used in axis calculations
            itemContext.clearMarginCache();
        }

        if (dock == axis.dockBegin) {
            if (axis.shrinkWrap) {
                pos = me.dockOutwardBegin(ownerContext, itemContext, item, axis);
            } else {
                pos = me.dockInwardBegin(ownerContext, itemContext, item, axis);
            }
        } else if (dock == axis.dockEnd) {
            if (axis.shrinkWrap) {
                pos = me.dockOutwardEnd(ownerContext, itemContext, item, axis);
            } else {
                pos = me.dockInwardEnd(ownerContext, itemContext, item, axis);
            }
        } else {
            pos = me.dockStretch(ownerContext, itemContext, item, axis);
        }

        itemContext.dockedAt[axis.posProp] = pos;
    },

    /**
     * Docks an item on a fixed-size axis at the "beginning". The "beginning" of the horizontal
     * axis is "left" and the vertical is "top". For a fixed-size axis, the size works from
     * the outer element (the panel) towards the body.
     * @private
     */
    dockInwardBegin: function (ownerContext, itemContext, item, axis) {
        var pos = axis.begin,
            sizeProp = axis.sizeProp,
            size, 
            dock;

        if (item.ignoreParentFrame) {
            dock = item.dock;
            pos -= ownerContext.borderInfo[dock] + ownerContext.paddingInfo[dock] +
                   ownerContext.framingInfo[dock];
        }

        if (!item.overlay) {
            size = itemContext.getProp(sizeProp) + itemContext.getMarginInfo()[sizeProp];
            axis.begin += size;
        }

        return pos;
    },

    /**
     * Docks an item on a fixed-size axis at the "end". The "end" of the horizontal axis is
     * "right" and the vertical is "bottom".
     * @private
     */
    dockInwardEnd: function (ownerContext, itemContext, item, axis) {
        var sizeProp = axis.sizeProp,
            size = itemContext.getProp(sizeProp) + itemContext.getMarginInfo()[sizeProp],
            pos = axis.end - size;

        if (!item.overlay) {
            axis.end = pos;
        }

        if (item.ignoreParentFrame) {
            pos += ownerContext.borderInfo[item.dock] + ownerContext.paddingInfo[item.dock] +
                   ownerContext.framingInfo[item.dock];
        }

        return pos;
    },

    /**
     * Docks an item on a shrinkWrap axis at the "beginning". The "beginning" of the horizontal
     * axis is "left" and the vertical is "top". For a shrinkWrap axis, the size works from
     * the body outward to the outermost element (the panel).
     * 
     * During the docking process, coordinates are allowed to be negative. We start with the
     * body at (0,0) so items docked "top" or "left" will simply be assigned negative x/y. In
     * the {@link #finishPositions} method these are corrected and framing is added. This way
     * the correction is applied as a simple translation of delta x/y on all coordinates to
     * bring the origin back to (0,0).
     * @private
     */
    dockOutwardBegin: function (ownerContext, itemContext, item, axis) {
        var pos = axis.begin,
            sizeProp = axis.sizeProp,
            dock, size;

        if (axis.collapsed) {
            axis.ignoreFrameBegin = axis.ignoreFrameEnd = true;
        } else if (item.ignoreParentFrame) {
            dock = item.dock;
            pos -= ownerContext.borderInfo[dock] + ownerContext.paddingInfo[dock] +
                   ownerContext.framingInfo[dock];

            axis.ignoreFrameBegin = true;
        }

        if (!item.overlay) {
            size = itemContext.getProp(sizeProp) + itemContext.getMarginInfo()[sizeProp];
            pos -= size;
            axis.begin = pos;
        }

        return pos;
    },

    /**
     * Docks an item on a shrinkWrap axis at the "end". The "end" of the horizontal axis is
     * "right" and the vertical is "bottom".
     * @private
     */
    dockOutwardEnd: function (ownerContext, itemContext, item, axis) {
        var pos = axis.end,
            sizeProp = axis.sizeProp,
            dock, size;

        size = itemContext.getProp(sizeProp) + itemContext.getMarginInfo()[sizeProp];

        if (axis.collapsed) {
            axis.ignoreFrameBegin = axis.ignoreFrameEnd = true;
        } else if (item.ignoreParentFrame) {
            dock = item.dock;
            pos += ownerContext.borderInfo[dock] + ownerContext.paddingInfo[dock] +
                   ownerContext.framingInfo[dock];

            axis.ignoreFrameEnd = true;
        }

        if (!item.overlay) {
            axis.end = pos + size;
            axis.dockedPixelsEnd += size;
        }

        return pos;
    },

    /**
     * Docks an item that might stretch across an axis. This is done for dock "top" and
     * "bottom" items on the horizontal axis and dock "left" and "right" on the vertical.
     * @private
     */
    dockStretch: function (ownerContext, itemContext, item, axis) {
        var dock = item.dock, // left/top/right/bottom (also used to index padding/border)
            sizeProp = axis.sizeProp, // 'width' or 'height'
            horizontal = dock == 'top' || dock == 'bottom',
            offsets = itemContext.offsets,
            border = ownerContext.borderInfo,
            padding = ownerContext.paddingInfo,
            endProp = horizontal ? 'right' : 'bottom',
            startProp = horizontal ? 'left' : 'top',
            pos = axis.begin + offsets[startProp],
            margin, size, framing;

        if (item.stretch !== false) {
            size = axis.end - pos - offsets[endProp];

            if (item.ignoreParentFrame) {
                framing = ownerContext.framingInfo;
                pos -= border[startProp] + padding[startProp] + framing[startProp];
                size += border[sizeProp] + padding[sizeProp] + framing[sizeProp];
            }

            margin = itemContext.getMarginInfo();
            size -= margin[sizeProp];

            itemContext[axis.setSize](size);
        }

        return pos;
    },

    /**
     * Finishes the calculation of an axis by determining its size. In non-shrink-wrap
     * cases, this is also where we set the body size.
     * @private
     */
    finishAxis: function (ownerContext, axis) {
        var size = axis.end - axis.begin,
            setSizeMethod = axis.setSize,
            beginName = axis.dockBegin, // left or top
            endName = axis.dockEnd, // right or bottom
            border = ownerContext.borderInfo,
            padding = ownerContext.paddingInfo,
            framing = ownerContext.framingInfo,
            frameSize = padding[beginName] + border[beginName] + framing[beginName],
            bodyContext = ownerContext.bodyContext,
            bodyPos, bodySize, dirty;

        if (axis.shrinkWrap) {
            // Since items docked left/top on a shrinkWrap axis go into negative coordinates,
            // we apply a delta to all coordinates to adjust their relative origin back to
            // (0,0).
            axis.delta = -axis.begin;  // either 0 or a positive number

            bodySize = axis.initialSize;

            if (axis.ignoreFrameBegin) {
                axis.delta -= border[beginName];
                bodyPos = -axis.begin - frameSize;
            } else {
                size += frameSize;
                axis.delta += padding[beginName] + framing[beginName];
                bodyPos = -axis.begin;
            }

            if (!axis.ignoreFrameEnd) {
                size += padding[endName] + border[endName] + framing[endName];
            }

            axis.size = size; // we have to wait for min/maxWidth/Height processing

            if (!axis.horizontal && !this.owner.manageHeight) {
                // the height of the bodyEl will give the proper height to the outerEl so
                // we don't need to set heights in the DOM
                dirty = false;
            }
        } else {
            // For a fixed-size axis, we started at the outer box and already have the
            // proper origin... almost... except for the owner's border.
            axis.delta = -border[axis.dockBegin]; // 'left' or 'top'

            // Body size is remaining space between ends of Axis.
            bodySize = size;
            bodyPos = axis.begin - frameSize;
        }

        bodyContext[setSizeMethod](bodySize, dirty);
        bodyContext.setProp(axis.bodyPosProp, bodyPos);

        return !isNaN(size);
    },

    /**
     * Finishes processing of each axis by applying the min/max size constraints.
     * @private
     */
    finishConstraints: function (ownerContext, horz, vert) {
        var sizeModels = this.sizeModels,
            publishWidth = horz.shrinkWrap,
            publishHeight = vert.shrinkWrap,
            dirty, height, width, heightModel, widthModel, size;

        if (publishWidth) {
            size = horz.size;

            if (size < horz.minSize) {
                widthModel = sizeModels.constrainedMin;
                width = horz.minSize;
            } else if (size > horz.maxSize) {
                widthModel = sizeModels.constrainedMax;
                width = horz.maxSize;
            } else {
                width = size;
            }
        }

        if (publishHeight) {
            size = vert.size;

            if (size < vert.minSize) {
                heightModel = sizeModels.constrainedMin;
                height = vert.minSize;
            } else if (size > vert.maxSize) {
                heightModel = sizeModels.constrainedMax;
                height = vert.maxSize;
            } else {
                if (!ownerContext.collapsedVert && !this.owner.manageHeight) {
                    // height of the outerEl is provided by the height (including margins)
                    // of the bodyEl, so this value does not need to be written to the DOM
                    dirty = false;

                    // so long as we set top and bottom margins on the bodyEl!
                    ownerContext.bodyContext.setProp('margin-bottom', vert.dockedPixelsEnd);
                }

                height = size;
            }
        }

        // Handle the constraints...

        if (widthModel || heightModel) {
            // See ContextItem#init for an analysis of why this case is special. Basically,
            // in this case, we only know the width and the height could be anything.
            if (widthModel && heightModel &&
                        widthModel.constrainedMax &&  heightModel.constrainedMin) {
                ownerContext.invalidate({ widthModel: widthModel });
                return false;
            }

            // To process a width or height other than that to which we have shrinkWrapped,
            // we need to invalidate our component and carry forward w/these constrains...
            // unless the ownerLayout wants these results and will invalidate us anyway.
            if (!ownerContext.widthModel.calculatedFromShrinkWrap &&
                        !ownerContext.heightModel.calculatedFromShrinkWrap) {
                // nope, just us to handle the constraint...
                ownerContext.invalidate({ widthModel: widthModel, heightModel: heightModel });
                return false;
            }

            // We have a constraint to deal with, so we just adjust the size models and
            // allow the ownerLayout to invalidate us with its contribution to our final
            // size...
        }

        // we only publish the sizes if we are not invalidating the result...

        if (publishWidth) {
            ownerContext.setWidth(width);
            if (widthModel) {
                ownerContext.widthModel = widthModel; // important to the ownerLayout
            }
        }
        if (publishHeight) {
            ownerContext.setHeight(height, dirty);
            if (heightModel) {
                ownerContext.heightModel = heightModel; // important to the ownerLayout
            }
        }

        return true;
    },

    /**
     * Finishes the calculation by setting positions on the body and all of the items.
     * @private
     */
    finishPositions: function (ownerContext, horz, vert) {
        var dockedItems = ownerContext.dockedItems,
            length = dockedItems.length,
            deltaX = horz.delta,
            deltaY = vert.delta,
            index, itemContext;

        for (index = 0; index < length; ++index) {
            itemContext = dockedItems[index];

            itemContext.setProp('x', deltaX + itemContext.dockedAt.x);
            itemContext.setProp('y', deltaY + itemContext.dockedAt.y);
        }
    },

    finishedLayout: function(ownerContext) {
        var me = this,
            target = ownerContext.target;

        me.callParent(arguments);

        if (!ownerContext.animatePolicy) {
            if (ownerContext.isCollapsingOrExpanding === 1) {
                target.afterCollapse(false);
            } else if (ownerContext.isCollapsingOrExpanding === 2) {
                target.afterExpand(false);
            }
        }
    },

    getAnimatePolicy: function(ownerContext) {
        var me = this,
            lastCollapsedState, policy;

        if (ownerContext.isCollapsingOrExpanding == 1) {
            lastCollapsedState = me.lastCollapsedState;
        } else if (ownerContext.isCollapsingOrExpanding == 2) {
            lastCollapsedState = ownerContext.lastCollapsedState;
        }

        if (lastCollapsedState == 'left' || lastCollapsedState == 'right') {
            policy = me.horizontalCollapsePolicy;
        } else if (lastCollapsedState == 'top' || lastCollapsedState == 'bottom') {
            policy = me.verticalCollapsePolicy;
        }

        return policy;
    },

    /**
     * Retrieve an ordered and/or filtered array of all docked Components.
     * @param {String} [order='render'] The desired ordering of the items ('render' or 'visual').
     * @param {Boolean} [beforeBody] An optional flag to limit the set of items to only those
     *  before the body (true) or after the body (false). All components are returned by
     *  default.
     * @return {Ext.Component[]} An array of components.
     * @protected
     */
    getDockedItems: function(order, beforeBody) {
        var me = this,
            renderedOnly = (order === 'visual'),
            all = renderedOnly ? Ext.ComponentQuery.query('[rendered]', me.owner.dockedItems.items) : me.owner.dockedItems.items,
            sort = all && all.length && order !== false,
            renderOrder,
            dock, dockedItems, i, isBefore, length;

        if (beforeBody == null) {
            dockedItems = sort && !renderedOnly ? all.slice() : all;
        } else {
            dockedItems = [];

            for (i = 0, length = all.length; i < length; ++i) {
                dock = all[i].dock;
                isBefore = (dock == 'top' || dock == 'left');
                if (beforeBody ? isBefore : !isBefore) {
                    dockedItems.push(all[i]);
                }
            }

            sort = sort && dockedItems.length;
        }

        if (sort) {
            renderOrder = (order = order || 'render') == 'render';
            Ext.Array.sort(dockedItems, function(a, b) {
                var aw,
                    bw;

                // If the two items are on opposite sides of the body, they must not be sorted by any weight value:
                // For rendering purposes, left/top *always* sorts before right/bottom
                if (renderOrder && ((aw = me.owner.dockOrder[a.dock]) !== (bw = me.owner.dockOrder[b.dock]))) {

                    // The two dockOrder values cancel out when two items are on opposite sides.
                    if (!(aw + bw)) {
                        return aw - bw;
                    }
                }

                aw = me.getItemWeight(a, order);
                bw = me.getItemWeight(b, order);
                if ((aw !== undefined) && (bw !== undefined)) {
                    return aw - bw;
                }
                return 0;
            });
        }

        return dockedItems || [];
    },

    getItemWeight: function (item, order) {
        var weight = item.weight || this.owner.defaultDockWeights[item.dock];
        return weight[order] || weight;
    },

    /**
     * @protected
     * Returns an array containing all the **visible** docked items inside this layout's owner Panel
     * @return {Array} An array containing all the **visible** docked items of the Panel
     */
    getLayoutItems : function() {
        var me = this,
            items,
            itemCount,
            item,
            i,
            result;

        if (me.owner.collapsed) {
            result = me.owner.getCollapsedDockedItems();
        } else {
            items = me.getDockedItems('visual');
            itemCount = items.length;
            result = [];
            for (i = 0; i < itemCount; i++) {
                item = items[i];
                if (!item.hidden) {
                    result.push(item);
                }
            }
        }
        return result;
    },

    // Content size includes padding but not borders, so subtract them off
    measureContentWidth: function (ownerContext) {
        var bodyContext = ownerContext.bodyContext;
        return bodyContext.el.getWidth() - bodyContext.getBorderInfo().width;
    },

    measureContentHeight: function (ownerContext) {
        var bodyContext = ownerContext.bodyContext;
        return bodyContext.el.getHeight() - bodyContext.getBorderInfo().height;
    },
    
    redoLayout: function(ownerContext) {
        var me = this,
            owner = me.owner;
        
        // If we are collapsing...
        if (ownerContext.isCollapsingOrExpanding == 1) {
            if (owner.reExpander) {
                owner.reExpander.el.show();
            }
            // Add the collapsed class now, so that collapsed CSS rules are applied before measurements are taken by the layout.
            owner.addClsWithUI(owner.collapsedCls);
            ownerContext.redo(true);
        } else if (ownerContext.isCollapsingOrExpanding == 2) {
            // Remove the collapsed class now, before layout calculations are done.
            owner.removeClsWithUI(owner.collapsedCls);
            ownerContext.bodyContext.redo();
        } 
    },

    // @private override inherited.
    // We need to render in the correct order, top/left before bottom/right
    renderChildren: function() {
        var me = this,
            items = me.getDockedItems(),
            target = me.getRenderTarget();

        me.renderItems(items, target);
    },

    /**
     * @protected
     * Render the top and left docked items before any existing DOM nodes in our render target,
     * and then render the right and bottom docked items after. This is important, for such things
     * as tab stops and ARIA readers, that the DOM nodes are in a meaningful order.
     * Our collection of docked items will already be ordered via Panel.getDockedItems().
     */
    renderItems: function(items, target) {
        var me = this,
            dockedItemCount = items.length,
            itemIndex = 0,
            correctPosition = 0,
            staticNodeCount = 0,
            targetNodes = me.getRenderTarget().dom.childNodes,
            targetChildCount = targetNodes.length,
            i, j, targetChildNode, item;

        // Calculate the number of DOM nodes in our target that are not our docked items
        for (i = 0, j = 0; i < targetChildCount; i++) {
            targetChildNode = targetNodes[i];
            if (Ext.fly(targetChildNode).hasCls('x-resizable-handle')) {
                break;
            }
            for (j = 0; j < dockedItemCount; j++) {
                item = items[j];
                if (item.rendered && item.el.dom === targetChildNode) {
                    break;
                }
            }
            // Walked off the end of the docked items without matching the found child node;
            // Then it's a static node.
            if (j === dockedItemCount) {
                staticNodeCount++;
            }
        }

        // Now we go through our docked items and render/move them
        for (; itemIndex < dockedItemCount; itemIndex++, correctPosition++) {
            item = items[itemIndex];

            // If we're now at the first right/bottom docked item, we jump over the body element.
            //
            // TODO: This is affected if users provide custom weight values to their
            // docked items, which puts it out of (t,l,r,b) order. Avoiding a second
            // sort operation here, for now, in the name of performance. getDockedItems()
            // needs the sort operation not just for this layout-time rendering, but
            // also for getRefItems() to return a logical ordering (FocusManager, CQ, et al).
            if (itemIndex === correctPosition && (item.dock === 'right' || item.dock === 'bottom')) {
                correctPosition += staticNodeCount;
            }

            // Same logic as Layout.renderItems()
            if (item && !item.rendered) {
                me.renderItem(item, target, correctPosition);
            }
            else if (!me.isValidParent(item, target, correctPosition)) {
                me.moveItem(item, target, correctPosition);
            }
        }
    },

    undoLayout: function(ownerContext) {
        var me = this,
            owner = me.owner;
        
        // If we are collapsing...
        if (ownerContext.isCollapsingOrExpanding == 1) {

            // We do not want to see the re-expander header until the final collapse is complete
            if (owner.reExpander) {
                owner.reExpander.el.hide();
            }
            // Add the collapsed class now, so that collapsed CSS rules are applied before measurements are taken by the layout.
            owner.removeClsWithUI(owner.collapsedCls);
            ownerContext.undo(true);
        } else if (ownerContext.isCollapsingOrExpanding == 2) {
            // Remove the collapsed class now, before layout calculations are done.
            owner.addClsWithUI(owner.collapsedCls);
            ownerContext.bodyContext.undo();
        } 
    },

    sizePolicy: {
        nostretch: {
            setsWidth: 0,
            setsHeight: 0
        },
        stretchH: {
            setsWidth: 1,
            setsHeight: 0
        },
        stretchV: {
            setsWidth: 0,
            setsHeight: 1
        },

        // Circular dependency with partial auto-sized panels:
        //
        // If we have an autoHeight docked item being stretched horizontally (top/bottom),
        // that stretching will determine its width and its width must be set before its
        // autoHeight can be determined. If that item is docked in an autoWidth panel, the
        // body will need its height set before it can determine its width, but the height
        // of the docked item is needed to subtract from the panel height in order to set
        // the body height.
        //
        // This same pattern occurs with autoHeight panels with autoWidth docked items on
        // left or right. If the panel is fully auto or fully fixed, these problems don't
        // come up because there is no dependency between the dimensions.
        //
        // Cutting the Gordian Knot: In these cases, we have to allow something to measure
        // itself without full context. This is OK as long as the managed dimension doesn't
        // effect the auto-dimension, which is often the case for things like toolbars. The
        // managed dimension only effects overflow handlers and such and does not change the
        // auto-dimension. To encourage the item to measure itself without waiting for the
        // managed dimension, we have to tell it that the layout will also be reading that
        // dimension. This is similar to how stretchmax works.

        autoStretchH: {
            readsWidth: 1,
            setsWidth: 1,
            setsHeight: 0
        },
        autoStretchV: {
            readsHeight: 1,
            setsWidth: 0,
            setsHeight: 1
        }
    },

    getItemSizePolicy: function (item) {
        var policy = this.sizePolicy,
            dock, vertical;

        if (item.stretch === false) {
            return policy.nostretch;
        }

        dock = item.dock;
        vertical = (dock == 'left' || dock == 'right');

        /*
        owner = this.owner;
        autoWidth = !owner.isFixedWidth();
        autoHeight = !owner.isFixedHeight();
        if (autoWidth !== autoHeight) { // if (partial auto)
            // see above...
            if (vertical) {
                if (autoHeight) {
                    return policy.autoStretchV;
                }
            } else if (autoWidth) {
                return policy.autoStretchH;
            }
        }*/

        if (vertical) {
            return policy.stretchV;
        }

        return policy.stretchH;
    },

    /**
     * @protected
     * We are overriding the Ext.layout.Layout configureItem method to also add a class that
     * indicates the position of the docked item. We use the itemCls (x-docked) as a prefix.
     * An example of a class added to a dock: right item is x-docked-right
     * @param {Ext.Component} item The item we are configuring
     */
    configureItem : function(item, pos) {
        this.callParent(arguments);

        item.addCls(Ext.baseCSSPrefix + 'docked');
        item.addClsWithUI('docked-' + item.dock);
    },

    afterRemove : function(item) {
        this.callParent(arguments);
        if (this.itemCls) {
            item.el.removeCls(this.itemCls + '-' + item.dock);
        }
        var dom = item.el.dom;

        if (!item.destroying && dom) {
            dom.parentNode.removeChild(dom);
        }
        this.childrenChanged = true;
    }
});
