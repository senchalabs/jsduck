/**
 * @private
 */
Ext.define('Ext.grid.header.DropZone', {
    extend: 'Ext.dd.DropZone',
    colHeaderCls: Ext.baseCSSPrefix + 'column-header',
    proxyOffsets: [-4, -9],

    constructor: function(headerCt){
        this.headerCt = headerCt;
        this.ddGroup = this.getDDGroup();
        this.callParent([headerCt.el]);
    },

    getDDGroup: function() {
        return 'header-dd-zone-' + this.headerCt.up('[scrollerOwner]').id;
    },

    getTargetFromEvent : function(e){
        return e.getTarget('.' + this.colHeaderCls);
    },

    getTopIndicator: function() {
        if (!this.topIndicator) {
            this.topIndicator = Ext.DomHelper.append(Ext.getBody(), {
                cls: "col-move-top",
                html: "&#160;"
            }, true);
        }
        return this.topIndicator;
    },

    getBottomIndicator: function() {
        if (!this.bottomIndicator) {
            this.bottomIndicator = Ext.DomHelper.append(Ext.getBody(), {
                cls: "col-move-bottom",
                html: "&#160;"
            }, true);
        }
        return this.bottomIndicator;
    },

    getLocation: function(e, t) {
        var x      = e.getXY()[0],
            region = Ext.fly(t).getRegion(),
            pos, header;

        if ((region.right - x) <= (region.right - region.left) / 2) {
            pos = "after";
        } else {
            pos = "before";
        }
        return {
            pos: pos,
            header: Ext.getCmp(t.id),
            node: t
        };
    },

    positionIndicator: function(draggedHeader, node, e){
        var location = this.getLocation(e, node),
            header = location.header,
            pos    = location.pos,
            nextHd = draggedHeader.nextSibling('gridcolumn:not([hidden])'),
            prevHd = draggedHeader.previousSibling('gridcolumn:not([hidden])'),
            topIndicator, bottomIndicator, topAnchor, bottomAnchor,
            topXY, bottomXY, headerCtEl, minX, maxX,
            allDropZones, ln, i, dropZone;

        // Cannot drag beyond non-draggable start column
        if (!header.draggable && header.getIndex() === 0) {
            return false;
        }

        this.lastLocation = location;

        if ((draggedHeader !== header) &&
            ((pos === "before" && nextHd !== header) ||
            (pos === "after" && prevHd !== header)) &&
            !header.isDescendantOf(draggedHeader)) {

            // As we move in between different DropZones that are in the same
            // group (such as the case when in a locked grid), invalidateDrop
            // on the other dropZones.
            allDropZones = Ext.dd.DragDropManager.getRelated(this);
            ln = allDropZones.length;
            i  = 0;

            for (; i < ln; i++) {
                dropZone = allDropZones[i];
                if (dropZone !== this && dropZone.invalidateDrop) {
                    dropZone.invalidateDrop();
                }
            }


            this.valid = true;
            topIndicator = this.getTopIndicator();
            bottomIndicator = this.getBottomIndicator();
            if (pos === 'before') {
                topAnchor = 'tl';
                bottomAnchor = 'bl';
            } else {
                topAnchor = 'tr';
                bottomAnchor = 'br';
            }
            topXY = header.el.getAnchorXY(topAnchor);
            bottomXY = header.el.getAnchorXY(bottomAnchor);

            // constrain the indicators to the viewable section
            headerCtEl = this.headerCt.el;
            minX = headerCtEl.getLeft();
            maxX = headerCtEl.getRight();

            topXY[0] = Ext.Number.constrain(topXY[0], minX, maxX);
            bottomXY[0] = Ext.Number.constrain(bottomXY[0], minX, maxX);

            // adjust by offsets, this is to center the arrows so that they point
            // at the split point
            topXY[0] -= 4;
            topXY[1] -= 9;
            bottomXY[0] -= 4;

            // position and show indicators
            topIndicator.setXY(topXY);
            bottomIndicator.setXY(bottomXY);
            topIndicator.show();
            bottomIndicator.show();
        // invalidate drop operation and hide indicators
        } else {
            this.invalidateDrop();
        }
    },

    invalidateDrop: function() {
        this.valid = false;
        this.hideIndicators();
    },

    onNodeOver: function(node, dragZone, e, data) {
        var me = this,
            header = me.headerCt,
            doPosition = true,
            from = data.header,
            to;
            
        if (data.header.el.dom === node) {
            doPosition = false;
        } else {
            to = me.getLocation(e, node).header;
            doPosition = (from.ownerCt === to.ownerCt) || (!from.ownerCt.sealed && !to.ownerCt.sealed);
        }
        
        if (doPosition) {
            me.positionIndicator(data.header, node, e);
        } else {
            me.valid = false;
        }
        return me.valid ? me.dropAllowed : me.dropNotAllowed;
    },

    hideIndicators: function() {
        this.getTopIndicator().hide();
        this.getBottomIndicator().hide();
    },

    onNodeOut: function() {
        this.hideIndicators();
    },

    onNodeDrop: function(node, dragZone, e, data) {
        if (this.valid) {
            var dragHeader   = data.header,
                lastLocation = this.lastLocation,
                targetHeader = lastLocation.header,
                fromCt       = dragHeader.ownerCt,
                fromHeader   = dragHeader.up('headercontainer:not(gridcolumn)'),
                localFromIdx = fromCt.items.indexOf(dragHeader), // Container.items is a MixedCollection
                toCt         = targetHeader.ownerCt,
                toHeader     = targetHeader.up('headercontainer:not(gridcolumn)'),
                localToIdx   = toCt.items.indexOf(targetHeader),
                headerCt     = this.headerCt,
                fromIdx      = headerCt.getHeaderIndex(dragHeader),
                colsToMove   = dragHeader.isGroupHeader ? dragHeader.query(':not([isGroupHeader])').length : 1,
                toIdx        = headerCt.getHeaderIndex(targetHeader),
                groupCt,
                scrollerOwner;

            // Drop position is to the right of the targetHeader, increment the toIdx correctly
            if (lastLocation.pos === 'after') {
                localToIdx++;
                toIdx += targetHeader.isGroupHeader ? targetHeader.query(':not([isGroupHeader])').length : 1;
            }

            // If we are dragging in between two HeaderContainers that have had the lockable
            // mixin injected we will lock/unlock headers in between sections, and then continue
            // with another execution of onNodeDrop to ensure the header is dropped into the correct group
            if (fromHeader !== toHeader && fromHeader.lockableInjected && toHeader.lockableInjected && toHeader.lockedCt) {
                scrollerOwner = fromCt.up('[scrollerOwner]');
                scrollerOwner.lock(dragHeader, localToIdx);

                // Now that the header has been transferred into the correct HeaderContainer, recurse, and continue the drop operation with the same dragData
                this.onNodeDrop(node, dragZone, e, data);
            } else if (fromHeader !== toHeader && fromHeader.lockableInjected && toHeader.lockableInjected && fromHeader.lockedCt) {
                scrollerOwner = fromCt.up('[scrollerOwner]');
                scrollerOwner.unlock(dragHeader, localToIdx);

                // Now that the header has been transferred into the correct HeaderContainer, recurse, and continue the drop operation with the same dragData
                this.onNodeDrop(node, dragZone, e, data);
            }
            
            // This is a drop within the same HeaderContainer.
            else {
                this.invalidateDrop();

                // If dragging rightwards, then after removal, the insertion index will be less when moving
                // within the same container.
                if ((fromCt === toCt) && (localToIdx > localFromIdx)) {

                    // Wer're dragging whole headers, so locally, the adjustment is only one
                    localToIdx -= 1;
                }

                // Suspend layouts while we sort all this out.
                Ext.suspendLayouts();

                // Remove dragged header from where it was.
                if (fromCt !== toCt) {
                    fromCt.remove(dragHeader, false);

                    // Dragged the last header out of the fromCt group... The fromCt group must die
                    if (fromCt.isGroupHeader) {
                        if (!fromCt.items.getCount()) {
                            groupCt = fromCt.ownerCt;
                            groupCt.remove(fromCt, false);
                            fromCt.el.dom.parentNode.removeChild(fromCt.el.dom);
                        }
                    }
                }

                // Move dragged header into its drop position
                if (fromCt === toCt) {
                    toCt.move(localFromIdx, localToIdx);
                } else {
                    toCt.insert(localToIdx, dragHeader);
                }

                // Group headers acquire the aggregate width of their child headers
                // Therefore a child header may not flex; it must contribute a fixed width.
                // But we restore the flex value when moving back into the main header container
                if (toCt.isGroupHeader) {
                    // Adjust the width of the "to" group header only if we dragged in from somewhere else.
                    if (toCt !== fromCt) {
                        dragHeader.savedFlex = dragHeader.flex;
                        delete dragHeader.flex;
                        dragHeader.width = dragHeader.getWidth();
                    }
                } else {
                    if (dragHeader.savedFlex) {
                        dragHeader.flex = dragHeader.savedFlex;
                        delete dragHeader.width;
                    }
                }

                // Refresh columns cache in case we remove an emptied group column
                headerCt.purgeCache();
                Ext.resumeLayouts(true);
                headerCt.onHeaderMoved(dragHeader, colsToMove, fromIdx, toIdx);

                // Emptied group header can only be destroyed after the header and grid have been refreshed
                if (!fromCt.items.getCount()) {
                    fromCt.destroy();
                }
            }
        }
    }
});
