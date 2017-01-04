/**
 * A selection model that renders a column of checkboxes that can be toggled to
 * select or deselect rows. The default mode for this selection model is MULTI.
 *
 * The selection model will inject a header for the checkboxes in the first view
 * and according to the 'injectCheckbox' configuration.
 */
Ext.define('Ext.selection.CheckboxModel', {
    alias: 'selection.checkboxmodel',
    extend: 'Ext.selection.RowModel',

    /**
     * @cfg {String} mode
     * Modes of selection.
     * Valid values are SINGLE, SIMPLE, and MULTI.
     */
    mode: 'MULTI',

    /**
     * @cfg {Number/String} [injectCheckbox=0]
     * The index at which to insert the checkbox column.
     * Supported values are a numeric index, and the strings 'first' and 'last'.
     */
    injectCheckbox: 0,

    /**
     * @cfg {Boolean} checkOnly
     * True if rows can only be selected by clicking on the checkbox column.
     */
    checkOnly: false,
    
    /**
     * @cfg {Boolean} showHeaderCheckbox
     * Configure as `false` to not display the header checkbox at the top of the column.
     */
    showHeaderCheckbox: true,

    headerWidth: 24,

    // private
    checkerOnCls: Ext.baseCSSPrefix + 'grid-hd-checker-on',

    // private
    refreshOnRemove: true,

    beforeViewRender: function(view) {
        var me = this;
        me.callParent(arguments);

        // if we have a locked header, only hook up to the first
        if (!me.hasLockedHeader() || view.headerCt.lockedCt) {
            if (me.showHeaderCheckbox !== false) {
                view.headerCt.on('headerclick', me.onHeaderClick, me);
            }
            me.addCheckbox(view, true);
            me.mon(view.ownerCt, 'reconfigure', me.onReconfigure, me);
        }
    },

    bindComponent: function(view) {
        var me = this;
        me.sortable = false;
        me.callParent(arguments);
    },

    hasLockedHeader: function(){
        var views     = this.views,
            vLen      = views.length,
            v;

        for (v = 0; v < vLen; v++) {
            if (views[v].headerCt.lockedCt) {
                return true;
            }
        }
        return false;
    },

    /**
     * Add the header checkbox to the header row
     * @private
     * @param {Boolean} initial True if we're binding for the first time.
     */
    addCheckbox: function(view, initial){
        var me = this,
            checkbox = me.injectCheckbox,
            headerCt = view.headerCt;

        // Preserve behaviour of false, but not clear why that would ever be done.
        if (checkbox !== false) {
            if (checkbox == 'first') {
                checkbox = 0;
            } else if (checkbox == 'last') {
                checkbox = headerCt.getColumnCount();
            }
            Ext.suspendLayouts();
            headerCt.add(checkbox,  me.getHeaderConfig());
            Ext.resumeLayouts();
        }

        if (initial !== true) {
            view.refresh();
        }
    },

    /**
     * Handles the grid's reconfigure event.  Adds the checkbox header if the columns have been reconfigured.
     * @private
     * @param {Ext.panel.Table} grid
     * @param {Ext.data.Store} store
     * @param {Object[]} columns
     */
    onReconfigure: function(grid, store, columns) {
        if(columns) {
            this.addCheckbox(this.views[0]);
        }
    },

    /**
     * Toggle the ui header between checked and unchecked state.
     * @param {Boolean} isChecked
     * @private
     */
    toggleUiHeader: function(isChecked) {
        var view     = this.views[0],
            headerCt = view.headerCt,
            checkHd  = headerCt.child('gridcolumn[isCheckerHd]');

        if (checkHd) {
            if (isChecked) {
                checkHd.el.addCls(this.checkerOnCls);
            } else {
                checkHd.el.removeCls(this.checkerOnCls);
            }
        }
    },

    /**
     * Toggle between selecting all and deselecting all when clicking on
     * a checkbox header.
     */
    onHeaderClick: function(headerCt, header, e) {
        if (header.isCheckerHd) {
            e.stopEvent();
            var me = this,
                isChecked = header.el.hasCls(Ext.baseCSSPrefix + 'grid-hd-checker-on');
                
            // Prevent focus changes on the view, since we're selecting/deselecting all records
            me.preventFocus = true;
            if (isChecked) {
                me.deselectAll();
            } else {
                me.selectAll();
            }
            delete me.preventFocus;
        }
    },

    /**
     * Retrieve a configuration to be used in a HeaderContainer.
     * This should be used when injectCheckbox is set to false.
     */
    getHeaderConfig: function() {
        var me = this,
            showCheck = me.showHeaderCheckbox !== false;

        return {
            isCheckerHd: showCheck,
            text : '&#160;',
            width: me.headerWidth,
            sortable: false,
            draggable: false,
            resizable: false,
            hideable: false,
            menuDisabled: true,
            dataIndex: '',
            cls: showCheck ? Ext.baseCSSPrefix + 'column-header-checkbox ' : '',
            renderer: Ext.Function.bind(me.renderer, me),
            editRenderer: me.editRenderer || me.renderEmpty,
            locked: me.hasLockedHeader()
        };
    },
    
    renderEmpty: function(){
        return '&#160;';    
    },

    /**
     * Generates the HTML to be rendered in the injected checkbox column for each row.
     * Creates the standard checkbox markup by default; can be overridden to provide custom rendering.
     * See {@link Ext.grid.column.Column#renderer} for description of allowed parameters.
     */
    renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
        var baseCSSPrefix = Ext.baseCSSPrefix;
        metaData.tdCls = baseCSSPrefix + 'grid-cell-special ' + baseCSSPrefix + 'grid-cell-row-checker';
        return '<div class="' + baseCSSPrefix + 'grid-row-checker">&#160;</div>';
    },

    // override
    onRowMouseDown: function(view, record, item, index, e) {
        view.el.focus();
        var me = this,
            checker = e.getTarget('.' + Ext.baseCSSPrefix + 'grid-row-checker'),
            mode;
            
        if (!me.allowRightMouseSelection(e)) {
            return;
        }

        // checkOnly set, but we didn't click on a checker.
        if (me.checkOnly && !checker) {
            return;
        }

        if (checker) {
            mode = me.getSelectionMode();
            // dont change the mode if its single otherwise
            // we would get multiple selection
            if (mode !== 'SINGLE') {
                me.setSelectionMode('SIMPLE');
            }
            me.selectWithEvent(record, e);
            me.setSelectionMode(mode);
        } else {
            me.selectWithEvent(record, e);
        }
    },

    /**
     * Synchronize header checker value as selection changes.
     * @private
     */
    onSelectChange: function() {
        var me = this;
        me.callParent(arguments);
        me.updateHeaderState();
    },

    /**
     * @private
     */
    onStoreLoad: function() {
        var me = this;
        me.callParent(arguments);
        me.updateHeaderState();
    },

    /**
     * @private
     */
    updateHeaderState: function() {
        // check to see if all records are selected
        var hdSelectStatus = this.selected.getCount() === this.store.getCount();
        this.toggleUiHeader(hdSelectStatus);
    }
});
