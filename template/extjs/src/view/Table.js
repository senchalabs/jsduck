/**
 * This class encapsulates the user interface for a tabular data set.
 * It acts as a centralized manager for controlling the various interface
 * elements of the view. This includes handling events, such as row and cell
 * level based DOM events. It also reacts to events from the underlying {@link Ext.selection.Model}
 * to provide visual feedback to the user.
 *
 * This class does not provide ways to manipulate the underlying data of the configured
 * {@link Ext.data.Store}.
 *
 * This is the base class for both {@link Ext.grid.View} and {@link Ext.tree.View} and is not
 * to be used directly.
 */
Ext.define('Ext.view.Table', {
    extend: 'Ext.view.View',
    alias: 'widget.tableview',
    uses: [
        'Ext.view.TableLayout',
        'Ext.view.TableChunker',
        'Ext.util.DelayedTask',
        'Ext.util.MixedCollection'
    ],

    componentLayout: 'tableview',

    baseCls: Ext.baseCSSPrefix + 'grid-view',

    // row
    itemSelector: 'tr.' + Ext.baseCSSPrefix + 'grid-row',
    // cell
    cellSelector: 'td.' + Ext.baseCSSPrefix + 'grid-cell',

    // keep a separate rowSelector, since we may need to select the actual row elements
    rowSelector: 'tr.' + Ext.baseCSSPrefix + 'grid-row',

    /**
     * @cfg {String} [firstCls='x-grid-cell-first']
     * A CSS class to add to the *first* cell in every row to enable special styling for the first column.
     * If no styling is needed on the first column, this may be configured as `null`.
     */
    firstCls: Ext.baseCSSPrefix + 'grid-cell-first',

    /**
     * @cfg {String} [lastCls='x-grid-cell-last']
     * A CSS class to add to the *last* cell in every row to enable special styling for the last column.
     * If no styling is needed on the last column, this may be configured as `null`.
     */
    lastCls: Ext.baseCSSPrefix + 'grid-cell-last',

    headerRowSelector: 'tr.' + Ext.baseCSSPrefix + 'grid-header-row',

    selectedItemCls: Ext.baseCSSPrefix + 'grid-row-selected',
    selectedCellCls: Ext.baseCSSPrefix + 'grid-cell-selected',
    focusedItemCls: Ext.baseCSSPrefix + 'grid-row-focused',
    overItemCls: Ext.baseCSSPrefix + 'grid-row-over',
    altRowCls:   Ext.baseCSSPrefix + 'grid-row-alt',
    rowClsRe: new RegExp('(?:^|\\s*)' + Ext.baseCSSPrefix + 'grid-row-(first|last|alt)(?:\\s+|$)', 'g'),
    cellRe: new RegExp(Ext.baseCSSPrefix + 'grid-cell-([^\\s]+) ', ''),

    // cfg docs inherited
    trackOver: true,

    /**
     * Override this function to apply custom CSS classes to rows during rendering. This function should return the
     * CSS class name (or empty string '' for none) that will be added to the row's wrapping div. To apply multiple
     * class names, simply return them space-delimited within the string (e.g. 'my-class another-class').
     * Example usage:
     *
     *     viewConfig: {
     *         getRowClass: function(record, rowIndex, rowParams, store){
     *             return record.get("valid") ? "row-valid" : "row-error";
     *         }
     *     }
     *
     * @param {Ext.data.Model} record The record corresponding to the current row.
     * @param {Number} index The row index.
     * @param {Object} rowParams **DEPRECATED.** For row body use the
     * {@link Ext.grid.feature.RowBody#getAdditionalData getAdditionalData} method of the rowbody feature.
     * @param {Ext.data.Store} store The store this grid is bound to
     * @return {String} a CSS class name to add to the row.
     * @method
     */
    getRowClass: null,

    /**
     * @cfg {Boolean} stripeRows
     * True to stripe the rows.
     *
     * This causes the CSS class **`x-grid-row-alt`** to be added to alternate rows of
     * the grid. A default CSS rule is provided which sets a background color, but you can override this
     * with a rule which either overrides the **background-color** style using the `!important`
     * modifier, or which uses a CSS selector of higher specificity.
     */
    stripeRows: true,
    
    /**
     * @cfg {Boolean} markDirty
     * True to show the dirty cell indicator when a cell has been modified.
     */
    markDirty : true,

    /**
     * @cfg {Boolean} enableTextSelection
     * True to enable text selections.
     */

    /**
     * @private
     * Simple initial tpl for TableView just to satisfy the validation within AbstractView.initComponent.
     */
    initialTpl: '<div></div>',

    initComponent: function() {
        var me = this,
            scroll = me.scroll;

        /**
         * @private
         * @property {Ext.dom.AbstractElement.Fly} table
         * A flyweight Ext.Element which encapsulates a reference to the transient `<table>` element within this View.
         * *Note that the `dom` reference will not be present until the first data refresh*
         */
        me.table = new Ext.dom.Element.Fly();
        me.table.id = me.id + 'gridTable';

        // Scrolling within a TableView is controlled by the scroll config of its owning GridPanel
        // It must see undefined in this property in order to leave the scroll styles alone at afterRender time
        me.autoScroll = undefined;

        // Convert grid scroll config to standard Component scrolling configurations.
        if (scroll === true || scroll === 'both') {
            me.autoScroll = true;
        } else if (scroll === 'horizontal') {
            me.overflowX = 'auto';
        } else if (scroll === 'vertical') {
            me.overflowY = 'auto';
        }
        me.selModel.view = me;
        me.headerCt.view = me;
        me.headerCt.markDirty = me.markDirty;

        // Features need a reference to the grid.
        me.initFeatures(me.grid);
        delete me.grid;

        // The real tpl is generated, but AbstractView.initComponent insists upon the presence of a fully instantiated XTemplate at construction time.
        me.tpl = me.getTpl('initialTpl');
        me.callParent();
    },
    
    /**
     * @private
     * Move a grid column from one position to another
     * @param {Number} fromIdx The index from which to move columns
     * @param {Number} toIdx The index at which to insert columns.
     * @param {Number} [colsToMove=1] The number of columns to move beginning at the `fromIdx`
     */
    moveColumn: function(fromIdx, toIdx, colsToMove) {
        var me = this,
            fragment = (colsToMove > 1) ? document.createDocumentFragment() : undefined,
            destinationCellIdx = toIdx,
            colCount = me.getGridColumns().length,
            lastIdx = colCount - 1,
            doFirstLastClasses = (me.firstCls || me.lastCls) && (toIdx === 0 || toIdx == colCount || fromIdx === 0 || fromIdx == lastIdx),
            i,
            j,
            rows, len, tr, headerRows;

        if (me.rendered) {
            // Use select here. In most cases there will only be one row. In
            // the case of a grouping grid, each group also has a header.
            headerRows = me.el.query(me.headerRowSelector);
            rows = me.el.query(me.rowSelector);

            if (toIdx > fromIdx && fragment) {
                destinationCellIdx -= colsToMove;
            }

            // Move the column sizing header to match
            for (i = 0, len = headerRows.length; i < len; ++i) {
                tr = headerRows[i];
                if (fragment) {
                    for (j = 0; j < colsToMove; j++) {
                        fragment.appendChild(tr.cells[fromIdx]);
                    }
                    tr.insertBefore(fragment, tr.cells[destinationCellIdx] || null);
                } else {
                    tr.insertBefore(tr.cells[fromIdx], tr.cells[destinationCellIdx] || null);
                }
            }

            for (i = 0, len = rows.length; i < len; i++) {
                tr = rows[i];

                // Keep first cell class and last cell class correct *only if needed*
                if (doFirstLastClasses) {

                    if (fromIdx === 0) {
                        Ext.fly(tr.cells[0]).removeCls(me.firstCls);
                        Ext.fly(tr.cells[1]).addCls(me.firstCls);
                    } else if (fromIdx === lastIdx) {
                        Ext.fly(tr.cells[lastIdx]).removeCls(me.lastCls);
                        Ext.fly(tr.cells[lastIdx - 1]).addCls(me.lastCls);
                    }
                    if (toIdx === 0) {
                        Ext.fly(tr.cells[0]).removeCls(me.firstCls);
                        Ext.fly(tr.cells[fromIdx]).addCls(me.firstCls);
                    } else if (toIdx === colCount) {
                        Ext.fly(tr.cells[lastIdx]).removeCls(me.lastCls);
                        Ext.fly(tr.cells[fromIdx]).addCls(me.lastCls);
                    }
                }

                if (fragment) {
                    for (j = 0; j < colsToMove; j++) {
                        fragment.appendChild(tr.cells[fromIdx]);
                    }
                    tr.insertBefore(fragment, tr.cells[destinationCellIdx] || null);
                } else {
                    tr.insertBefore(tr.cells[fromIdx], tr.cells[destinationCellIdx] || null);
                }
            }
            me.setNewTemplate();
        }
    },

    // scroll the view to the top
    scrollToTop: Ext.emptyFn,

    /**
     * Add a listener to the main view element. It will be destroyed with the view.
     * @private
     */
    addElListener: function(eventName, fn, scope){
        this.mon(this, eventName, fn, scope, {
            element: 'el'
        });
    },

    /**
     * Get the columns used for generating a template via TableChunker.
     * See {@link Ext.grid.header.Container#getGridColumns}.
     * @private
     */
    getGridColumns: function() {
        return this.headerCt.getGridColumns();
    },

    /**
     * Get a leaf level header by index regardless of what the nesting
     * structure is.
     * @private
     * @param {Number} index The index
     */
    getHeaderAtIndex: function(index) {
        return this.headerCt.getHeaderAtIndex(index);
    },

    /**
     * Get the cell (td) for a particular record and column.
     * @param {Ext.data.Model} record
     * @param {Ext.grid.column.Column} column
     * @private
     */
    getCell: function(record, column) {
        var row = this.getNode(record);
        return Ext.fly(row).down(column.getCellSelector());
    },

    /**
     * Get a reference to a feature
     * @param {String} id The id of the feature
     * @return {Ext.grid.feature.Feature} The feature. Undefined if not found
     */
    getFeature: function(id) {
        var features = this.featuresMC;
        if (features) {
            return features.get(id);
        }
    },

    /**
     * Initializes each feature and bind it to this view.
     * @private
     */
    initFeatures: function(grid) {
        var me = this,
            i,
            features,
            feature,
            len;

        me.featuresMC = new Ext.util.MixedCollection();
        features = me.features = me.constructFeatures();
        len = features ? features.length : 0;
        for (i = 0; i < len; i++) {
            feature = features[i];

            // inject a reference to view and grid - Features need both
            feature.view = me;
            feature.grid = grid;
            me.featuresMC.add(feature);
            feature.init();
        }
    },

    /**
     * @private
     * Converts the features array as configured, into an array of instantiated Feature objects.
     * 
     * This is borrowed by Lockable which clones and distributes Features to both child grids of a locking grid.
     * 
     * Must have no side effects other than Feature instantiation.
     * 
     * MUST NOT update the this.features property, and MUST NOT update the instantiated Features.
     */
    constructFeatures: function() {
        var me = this,
            features = me.features,
            feature,
            result,
            i = 0, len;
        
        if (features) {
            result = [];
            len = features.length;
            for (; i < len; i++) {
                feature = features[i];
                if (!feature.isFeature) {
                    feature = Ext.create('feature.' + feature.ftype, feature);
                }
                result[i] = feature;
            }
        }
        return result;
    },

    /**
     * Gives features an injection point to attach events to the markup that
     * has been created for this view.
     * @private
     */
    attachEventsForFeatures: function() {
        var features = this.features,
            ln       = features.length,
            i        = 0;

        for (; i < ln; i++) {
            if (features[i].isFeature) {
                features[i].attachEvents();
            }
        }
    },

    afterRender: function() {
        var me = this;
        me.callParent();

        if (!me.enableTextSelection) {
            me.el.unselectable();
        }
        me.attachEventsForFeatures();
    },

    // Private template method implemented starting at the AbstractView class.
    onViewScroll: function(e, t) {
        this.callParent(arguments);
        this.fireEvent('bodyscroll', e, t);
    },

    /**
     * Uses the headerCt (Which is the repository of all information relating to Column definitions)
     * to transform data from dataIndex keys in a record to headerId keys in each header and then run
     * them through each feature to get additional data for variables they have injected into the view template.
     * @private
     */
    prepareData: function(data, idx, record) {
        var me       = this,
            result   = me.headerCt.prepareData(data, idx, record, me, me.ownerCt),
            features = me.features,
            ln       = features.length,
            i        = 0,
            feature;

        for (; i < ln; i++) {
            feature = features[i];
            if (feature.isFeature) {
                Ext.apply(result, feature.getAdditionalData(data, idx, record, result, me));
            }
        }

        return result;
    },

    // TODO: Refactor headerCt dependency here to colModel
    collectData: function(records, startIndex) {
        var me = this,
            preppedRecords = me.callParent(arguments),
            headerCt  = me.headerCt,
            fullWidth = headerCt.getFullWidth(),
            features  = me.features,
            ln = features.length,
            o = {
                rows: preppedRecords,
                fullWidth: fullWidth
            },
            i  = 0,
            feature,
            j = 0,
            jln,
            rowParams,
            rec,
            cls;

        jln = preppedRecords.length;
        // process row classes, rowParams has been deprecated and has been moved
        // to the individual features that implement the behavior.
        if (me.getRowClass) {
            for (; j < jln; j++) {
                rowParams = {};
                rec = preppedRecords[j];
                cls = rec.rowCls || '';
                rec.rowCls = this.getRowClass(records[j], j, rowParams, me.store) + ' ' + cls;
                //<debug>
                if (rowParams.alt) {
                    Ext.Error.raise("The getRowClass alt property is no longer supported.");
                }
                if (rowParams.tstyle) {
                    Ext.Error.raise("The getRowClass tstyle property is no longer supported.");
                }
                if (rowParams.cells) {
                    Ext.Error.raise("The getRowClass cells property is no longer supported.");
                }
                if (rowParams.body) {
                    Ext.Error.raise("The getRowClass body property is no longer supported. Use the getAdditionalData method of the rowbody feature.");
                }
                if (rowParams.bodyStyle) {
                    Ext.Error.raise("The getRowClass bodyStyle property is no longer supported.");
                }
                if (rowParams.cols) {
                    Ext.Error.raise("The getRowClass cols property is no longer supported.");
                }
                //</debug>
            }
        }
        // currently only one feature may implement collectData. This is to modify
        // what's returned to the view before its rendered
        for (; i < ln; i++) {
            feature = features[i];
            if (feature.isFeature && feature.collectData && !feature.disabled) {
                o = feature.collectData(records, preppedRecords, startIndex, fullWidth, o);
                break;
            }
        }
        return o;
    },

    // Private. Called when the table changes height.
    // For example, see examples/grid/group-summary-grid.html
    // If we have flexed column headers, we need to update the header layout
    // because it may have to accommodate (or cease to accommodate) a vertical scrollbar.
    // Only do this on platforms which have a space-consuming scrollbar.
    // Only do it when vertical scrolling is enabled.
    refreshSize: function() {
        var me = this,
            cmp;

        // On every update of the layout system due to data update, capture the table's DOM in our private flyweight
        me.table.attach(me.el.child('table', true));

        if (!me.hasLoadingHeight) {
            cmp = me.up('tablepanel');

            // Suspend layouts in case the superclass requests a layout. We might too, so they
            // must be coalescsed.
            Ext.suspendLayouts();

            me.callParent();

            // If the OS displays scrollbars, and we are overflowing vertically, ensure the
            // HeaderContainer accounts for the scrollbar.
            if (cmp && Ext.getScrollbarSize().width && (me.autoScroll || me.overflowY)) {
                cmp.updateLayout();
            }

            Ext.resumeLayouts(true);
        }
    },

    /**
     * Set a new template based on the current columns displayed in the grid.
     * @private
     */
    setNewTemplate: function() {
        var me = this,
            columns = me.headerCt.getColumnsForTpl(true);

        // Template generation requires the rowCount as well as the column definitions and features.
        me.tpl = me.getTableChunker().getTableTpl({
            rowCount: me.store.getCount(),
            columns: columns,
            features: me.features,
            enableTextSelection: me.enableTextSelection
        });
    },

    /**
     * Returns the configured chunker or default of Ext.view.TableChunker
     */
    getTableChunker: function() {
        return this.chunker || Ext.view.TableChunker;
    },

    /**
     * Adds a CSS Class to a specific row.
     * @param {HTMLElement/String/Number/Ext.data.Model} rowInfo An HTMLElement, index or instance of a model
     * representing this row
     * @param {String} cls
     */
    addRowCls: function(rowInfo, cls) {
        var row = this.getNode(rowInfo);
        if (row) {
            Ext.fly(row).addCls(cls);
        }
    },

    /**
     * Removes a CSS Class from a specific row.
     * @param {HTMLElement/String/Number/Ext.data.Model} rowInfo An HTMLElement, index or instance of a model
     * representing this row
     * @param {String} cls
     */
    removeRowCls: function(rowInfo, cls) {
        var row = this.getNode(rowInfo);
        if (row) {
            Ext.fly(row).removeCls(cls);
        }
    },

    // GridSelectionModel invokes onRowSelect as selection changes
    onRowSelect : function(rowIdx) {
        this.addRowCls(rowIdx, this.selectedItemCls);
    },

    // GridSelectionModel invokes onRowDeselect as selection changes
    onRowDeselect : function(rowIdx) {
        var me = this;

        me.removeRowCls(rowIdx, me.selectedItemCls);
        me.removeRowCls(rowIdx, me.focusedItemCls);
    },

    onCellSelect: function(position) {
        var cell = this.getCellByPosition(position, true);
        if (cell) {
            Ext.fly(cell).addCls(this.selectedCellCls);
        }
    },

    onCellDeselect: function(position) {
        var cell = this.getCellByPosition(position, true);
        if (cell) {
            Ext.fly(cell).removeCls(this.selectedCellCls);
        }

    },

    onCellFocus: function(position) {
        this.focusCell(position);
    },

    getCellByPosition: function(position, returnDom) {
        if (position) {
            var node   = this.getNode(position.row),
                header = this.headerCt.getHeaderAtIndex(position.column);

            if (header && node) {
                return Ext.fly(node).down(header.getCellSelector(), returnDom);
            }
        }
        return false;
    },

    // GridSelectionModel invokes onRowFocus to 'highlight'
    // the last row focused
    onRowFocus: function(rowIdx, highlight, supressFocus) {
        var me = this;

        if (highlight) {
            me.addRowCls(rowIdx, me.focusedItemCls);
            if (!supressFocus) {
                me.focusRow(rowIdx);
            }
            //this.el.dom.setAttribute('aria-activedescendant', row.id);
        } else {
            me.removeRowCls(rowIdx, me.focusedItemCls);
        }
    },

    /**
     * Focuses a particular row and brings it into view. Will fire the rowfocus event.
     * @param {HTMLElement/String/Number/Ext.data.Model} rowIdx
     * An HTMLElement template node, index of a template node, the id of a template node or the
     * record associated with the node.
     */
    focusRow: function(rowIdx) {
        var me         = this,
            row        = me.getNode(rowIdx),
            el         = me.el,
            adjustment = 0,
            panel      = me.ownerCt,
            rowRegion,
            elTop,
            elBottom,
            record;

        if (row && el) {
            // Viewable region must not include scrollbars, so use
            // DOM clientHeight to determine height
            elTop = el.getY();
            elBottom = elTop + el.dom.clientHeight;
            rowRegion = Ext.fly(row).getRegion();
            // row is above
            if (rowRegion.top < elTop) {
                adjustment = rowRegion.top - elTop;
            // row is below
            } else if (rowRegion.bottom > elBottom) {
                adjustment = rowRegion.bottom - elBottom;
            }
            record = me.getRecord(row);
            rowIdx = me.store.indexOf(record);

            if (adjustment) {
                panel.scrollByDeltaY(adjustment);
            }
            me.fireEvent('rowfocus', record, row, rowIdx);
        }
    },

    focusCell: function(position) {
        var me          = this,
            cell        = me.getCellByPosition(position),
            el          = me.el,
            adjustmentY = 0,
            adjustmentX = 0,
            elRegion    = el.getRegion(),
            panel       = me.ownerCt,
            cellRegion,
            record;

        // Viewable region must not include scrollbars, so use
        // DOM client dimensions
        elRegion.bottom = elRegion.top + el.dom.clientHeight;
        elRegion.right = elRegion.left + el.dom.clientWidth;
        if (cell) {
            cellRegion = cell.getRegion();
            // cell is above
            if (cellRegion.top < elRegion.top) {
                adjustmentY = cellRegion.top - elRegion.top;
            // cell is below
            } else if (cellRegion.bottom > elRegion.bottom) {
                adjustmentY = cellRegion.bottom - elRegion.bottom;
            }

            // cell is left
            if (cellRegion.left < elRegion.left) {
                adjustmentX = cellRegion.left - elRegion.left;
            // cell is right
            } else if (cellRegion.right > elRegion.right) {
                adjustmentX = cellRegion.right - elRegion.right;
            }

            if (adjustmentY) {
                panel.scrollByDeltaY(adjustmentY);
            }
            if (adjustmentX) {
                panel.scrollByDeltaX(adjustmentX);
            }
            el.focus();
            me.fireEvent('cellfocus', record, cell, position);
        }
    },

    /**
     * Scrolls by delta. This affects this individual view ONLY and does not
     * synchronize across views or scrollers.
     * @param {Number} delta
     * @param {String} [dir] Valid values are scrollTop and scrollLeft. Defaults to scrollTop.
     * @private
     */
    scrollByDelta: function(delta, dir) {
        dir = dir || 'scrollTop';
        var elDom = this.el.dom;
        elDom[dir] = (elDom[dir] += delta);
    },

    // private
    onUpdate : function(store, record, operation, changedFieldNames) {
        var me = this,
            index,
            newRow, newAttrs, attLen, i, attName, oldRow, oldRowDom,
            oldCells, newCells, len, i,
            columns, overItemCls,
            isHovered, row,
            // See if an editing plugin is active.
            isEditing = me.editingPlugin && me.editingPlugin.editing;

        if (me.viewReady) {

            index = me.store.indexOf(record);
            columns = me.headerCt.getGridColumns();
            overItemCls = me.overItemCls;

            // If we have columns which may *need* updating (think lockable grid child with all columns either locked or unlocked)
            // and the changed record is within our view, then update the view
            if (columns.length && index > -1) {
                newRow = me.bufferRender([record], index)[0];
                oldRow = me.all.item(index);
                if (oldRow) {
                    oldRowDom = oldRow.dom;
                    isHovered = oldRow.hasCls(overItemCls);

                    // Copy new row attributes across. Use IE-specific method if possible.
                    if (oldRowDom.mergeAttributes) {
                        oldRowDom.mergeAttributes(newRow, true);
                    } else {
                        newAttrs = newRow.attributes;
                        attLen = newAttrs.length;
                        for (i = 0; i < attLen; i++) {
                            attName = newAttrs[i].name;
                            if (attName !== 'id') {
                                oldRowDom.setAttribute(attName, newAttrs[i].value);
                            }
                        }
                    }

                    if (isHovered) {
                        oldRow.addCls(overItemCls);
                    }

                    // Replace changed cells in the existing row structure with the new version from the rendered row.
                    oldCells = oldRow.query(me.cellSelector);
                    newCells = Ext.fly(newRow).query(me.cellSelector);
                    len = newCells.length;
                    // row is the element that contains the cells.  This will be a different element from oldRow when using a rowwrap feature     
                    row = oldCells[0].parentNode;
                    for (i = 0; i < len; i++) {
                        // If the field at this column index was changed, or column has a custom renderer
                        // (which means value could rely on any other changed field) the update the cell's content.
                        if (me.shouldUpdateCell(columns[i], changedFieldNames)) {
                            // If an editor plugin is active, we carefully replace just the *contents* of the cell.
                            if (isEditing) {
                                Ext.fly(oldCells[i]).syncContent(newCells[i]);
                            }
                            // Otherwise, we simply replace whole TDs with a new version
                            else {
                                row.insertBefore(newCells[i], oldCells[i]);
                                row.removeChild(oldCells[i]);
                            }
                        }
                    }
                }
                me.fireEvent('itemupdate', record, index, newRow);
            }
        }
    },
    
    shouldUpdateCell: function(column, changedFieldNames){
        // Though this may not be the most efficient, a renderer could be dependent on any field in the
        // store, so we must always update the cell
        if (column.hasCustomRenderer) {
            return true;
        }
        return !changedFieldNames || Ext.Array.contains(changedFieldNames, column.dataIndex);
    },

    /**
     * Refreshes the grid view. Saves and restores the scroll state, generates a new template, stripes rows and
     * invalidates the scrollers.
     */
    refresh: function() {
        var me = this;
        me.setNewTemplate();
        me.callParent(arguments);
        me.doStripeRows(0);
        me.headerCt.setSortState();
    },

    clearViewEl: function() {
        this.callParent();
        delete this.table.dom;
    },

    processItemEvent: function(record, row, rowIndex, e) {
        var me = this,
            cell = e.getTarget(me.cellSelector, row),
            cellIndex = cell ? cell.cellIndex : -1,
            map = me.statics().EventMap,
            selModel = me.getSelectionModel(),
            type = e.type,
            result;

        if (type == 'keydown' && !cell && selModel.getCurrentPosition) {
            // CellModel, otherwise we can't tell which cell to invoke
            cell = me.getCellByPosition(selModel.getCurrentPosition());
            if (cell) {
                cell = cell.dom;
                cellIndex = cell.cellIndex;
            }
        }

        result = me.fireEvent('uievent', type, me, cell, rowIndex, cellIndex, e, record, row);

        if (result === false || me.callParent(arguments) === false) {
            return false;
        }

        // Don't handle cellmouseenter and cellmouseleave events for now
        if (type == 'mouseover' || type == 'mouseout') {
            return true;
        }

        if(!cell) {
            // if the element whose event is being processed is not an actual cell (for example if using a rowbody
            // feature and the rowbody element's event is being processed) then do not fire any "cell" events
            return true;
        }

        return !(
            // We are adding cell and feature events
            (me['onBeforeCell' + map[type]](cell, cellIndex, record, row, rowIndex, e) === false) ||
            (me.fireEvent('beforecell' + type, me, cell, cellIndex, record, row, rowIndex, e) === false) ||
            (me['onCell' + map[type]](cell, cellIndex, record, row, rowIndex, e) === false) ||
            (me.fireEvent('cell' + type, me, cell, cellIndex, record, row, rowIndex, e) === false)
        );
    },

    processSpecialEvent: function(e) {
        var me = this,
            map = me.statics().EventMap,
            features = me.features,
            ln = features.length,
            type = e.type,
            i, feature, prefix, featureTarget,
            beforeArgs, args,
            panel = me.ownerCt;

        me.callParent(arguments);

        if (type == 'mouseover' || type == 'mouseout') {
            return;
        }

        for (i = 0; i < ln; i++) {
            feature = features[i];
            if (feature.hasFeatureEvent) {
                featureTarget = e.getTarget(feature.eventSelector, me.getTargetEl());
                if (featureTarget) {
                    prefix = feature.eventPrefix;
                    // allows features to implement getFireEventArgs to change the
                    // fireEvent signature
                    beforeArgs = feature.getFireEventArgs('before' + prefix + type, me, featureTarget, e);
                    args = feature.getFireEventArgs(prefix + type, me, featureTarget, e);

                    if (
                        // before view event
                        (me.fireEvent.apply(me, beforeArgs) === false) ||
                        // panel grid event
                        (panel.fireEvent.apply(panel, beforeArgs) === false) ||
                        // view event
                        (me.fireEvent.apply(me, args) === false) ||
                        // panel event
                        (panel.fireEvent.apply(panel, args) === false)
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    },

    onCellMouseDown: Ext.emptyFn,
    onCellMouseUp: Ext.emptyFn,
    onCellClick: Ext.emptyFn,
    onCellDblClick: Ext.emptyFn,
    onCellContextMenu: Ext.emptyFn,
    onCellKeyDown: Ext.emptyFn,
    onBeforeCellMouseDown: Ext.emptyFn,
    onBeforeCellMouseUp: Ext.emptyFn,
    onBeforeCellClick: Ext.emptyFn,
    onBeforeCellDblClick: Ext.emptyFn,
    onBeforeCellContextMenu: Ext.emptyFn,
    onBeforeCellKeyDown: Ext.emptyFn,

    /**
     * Expands a particular header to fit the max content width.
     * This will ONLY expand, not contract.
     * @private
     */
    expandToFit: function(header) {
        if (header) {
            var maxWidth = this.getMaxContentWidth(header);
            delete header.flex;
            header.setWidth(maxWidth);
        }
    },

    /**
     * Returns the max contentWidth of the header's text and all cells
     * in the grid under this header.
     * @private
     */
    getMaxContentWidth: function(header) {
        var cellSelector = header.getCellInnerSelector(),
            cells        = this.el.query(cellSelector),
            i = 0,
            ln = cells.length,
            maxWidth = header.el.dom.scrollWidth,
            scrollWidth;

        for (; i < ln; i++) {
            scrollWidth = cells[i].scrollWidth;
            if (scrollWidth > maxWidth) {
                maxWidth = scrollWidth;
            }
        }
        return maxWidth;
    },

    getPositionByEvent: function(e) {
        var me       = this,
            cellNode = e.getTarget(me.cellSelector),
            rowNode  = e.getTarget(me.itemSelector),
            record   = me.getRecord(rowNode),
            header   = me.getHeaderByCell(cellNode);

        return me.getPosition(record, header);
    },

    getHeaderByCell: function(cell) {
        if (cell) {
            var m = cell.className.match(this.cellRe);
            if (m && m[1]) {
                return Ext.getCmp(m[1]);
            }
        }
        return false;
    },

    /**
     * @param {Object} position The current row and column: an object containing the following properties:
     *
     * - row - The row index
     * - column - The column index
     *
     * @param {String} direction 'up', 'down', 'right' and 'left'
     * @param {Ext.EventObject} e event
     * @param {Boolean} preventWrap Set to true to prevent wrap around to the next or previous row.
     * @param {Function} verifierFn A function to verify the validity of the calculated position.
     * When using this function, you must return true to allow the newPosition to be returned.
     * @param {Object} scope Scope to run the verifierFn in
     * @returns {Object} newPosition An object containing the following properties:
     *
     * - row - The row index
     * - column - The column index
     *
     * @private
     */
    walkCells: function(pos, direction, e, preventWrap, verifierFn, scope) {

        // Caller (probably CellModel) had no current position. This can happen
        // if the main el is focused and any navigation key is presssed.
        if (!pos) {
            return;
        }

        var me       = this,
            row      = pos.row,
            column   = pos.column,
            rowCount = me.store.getCount(),
            firstCol = me.getFirstVisibleColumnIndex(),
            lastCol  = me.getLastVisibleColumnIndex(),
            newPos   = {row: row, column: column},
            activeHeader = me.headerCt.getHeaderAtIndex(column);

        // no active header or its currently hidden
        if (!activeHeader || activeHeader.hidden) {
            return false;
        }

        e = e || {};
        direction = direction.toLowerCase();
        switch (direction) {
            case 'right':
                // has the potential to wrap if its last
                if (column === lastCol) {
                    // if bottom row and last column, deny right
                    if (preventWrap || row === rowCount - 1) {
                        return false;
                    }
                    if (!e.ctrlKey) {
                        // otherwise wrap to nextRow and firstCol
                        newPos.row = row + 1;
                        newPos.column = firstCol;
                    }
                // go right
                } else {
                    if (!e.ctrlKey) {
                        newPos.column = column + me.getRightGap(activeHeader);
                    } else {
                        newPos.column = lastCol;
                    }
                }
                break;

            case 'left':
                // has the potential to wrap
                if (column === firstCol) {
                    // if top row and first column, deny left
                    if (preventWrap || row === 0) {
                        return false;
                    }
                    if (!e.ctrlKey) {
                        // otherwise wrap to prevRow and lastCol
                        newPos.row = row - 1;
                        newPos.column = lastCol;
                    }
                // go left
                } else {
                    if (!e.ctrlKey) {
                        newPos.column = column + me.getLeftGap(activeHeader);
                    } else {
                        newPos.column = firstCol;
                    }
                }
                break;

            case 'up':
                // if top row, deny up
                if (row === 0) {
                    return false;
                // go up
                } else {
                    if (!e.ctrlKey) {
                        newPos.row = row - 1;
                    } else {
                        newPos.row = 0;
                    }
                }
                break;

            case 'down':
                // if bottom row, deny down
                if (row === rowCount - 1) {
                    return false;
                // go down
                } else {
                    if (!e.ctrlKey) {
                        newPos.row = row + 1;
                    } else {
                        newPos.row = rowCount - 1;
                    }
                }
                break;
        }

        if (verifierFn && verifierFn.call(scope || window, newPos) !== true) {
            return false;
        } else {
            return newPos;
        }
    },
    getFirstVisibleColumnIndex: function() {
        var firstVisibleHeader = this.getHeaderCt().getVisibleGridColumns()[0];

        return firstVisibleHeader ? firstVisibleHeader.getIndex() : -1;
    },

    getLastVisibleColumnIndex: function() {
        var visHeaders = this.getHeaderCt().getVisibleGridColumns(),
            lastHeader = visHeaders[visHeaders.length - 1];

        return lastHeader.getIndex();
    },

    getHeaderCt: function() {
        return this.headerCt;
    },

    // TODO: have this use the new Ext.grid.CellContext class
    getPosition: function(record, header) {
        var me = this,
            store = me.store,
            gridCols = me.headerCt.getGridColumns();

        return {
            row: store.indexOf(record),
            column: Ext.Array.indexOf(gridCols, header)
        };
    },

    /**
     * Determines the 'gap' between the closest adjacent header to the right
     * that is not hidden.
     * @private
     */
    getRightGap: function(activeHeader) {
        var headerCt        = this.getHeaderCt(),
            headers         = headerCt.getGridColumns(),
            activeHeaderIdx = Ext.Array.indexOf(headers, activeHeader),
            i               = activeHeaderIdx + 1,
            nextIdx;

        for (; i <= headers.length; i++) {
            if (!headers[i].hidden) {
                nextIdx = i;
                break;
            }
        }

        return nextIdx - activeHeaderIdx;
    },

    beforeDestroy: function() {
        if (this.rendered) {
            this.el.removeAllListeners();
        }
        this.callParent(arguments);
    },

    /**
     * Determines the 'gap' between the closest adjacent header to the left
     * that is not hidden.
     * @private
     */
    getLeftGap: function(activeHeader) {
        var headerCt        = this.getHeaderCt(),
            headers         = headerCt.getGridColumns(),
            activeHeaderIdx = Ext.Array.indexOf(headers, activeHeader),
            i               = activeHeaderIdx - 1,
            prevIdx;

        for (; i >= 0; i--) {
            if (!headers[i].hidden) {
                prevIdx = i;
                break;
            }
        }

        return prevIdx - activeHeaderIdx;
    },

    // after adding a row stripe rows from then on
    onAdd: function(ds, records, index) {
        this.callParent(arguments);
        this.doStripeRows(index);
    },
    
    // after removing a row stripe rows from then on
    onRemove: function(ds, records, index) {
        this.callParent(arguments);
        this.doStripeRows(index);
    },
    
    /**
     * Stripes rows from a particular row index.
     * @param {Number} startRow
     * @param {Number} [endRow] argument specifying the last row to process.
     * By default process up to the last row.
     * @private
     */
    doStripeRows: function(startRow, endRow) {
        var me = this,
            rows,
            rowsLn,
            i,
            row;
            
        // ensure stripeRows configuration is turned on
        if (me.rendered && me.stripeRows) {
            rows = me.getNodes(startRow, endRow);
                
            for (i = 0, rowsLn = rows.length; i < rowsLn; i++) {
                row = rows[i];
                // Remove prior applied row classes.
                row.className = row.className.replace(me.rowClsRe, ' ');
                startRow++;
                // Every odd row will get an additional cls
                if (startRow % 2 === 0) {
                    row.className += (' ' + me.altRowCls);
                }
            }
        }
    }
 
});
