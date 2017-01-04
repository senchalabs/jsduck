/**
 * A Grid header type which renders an icon, or a series of icons in a grid cell, and offers a scoped click
 * handler for each icon.
 *
 *     @example
 *     Ext.create('Ext.data.Store', {
 *         storeId:'employeeStore',
 *         fields:['firstname', 'lastname', 'seniority', 'dep', 'hired'],
 *         data:[
 *             {firstname:"Michael", lastname:"Scott"},
 *             {firstname:"Dwight", lastname:"Schrute"},
 *             {firstname:"Jim", lastname:"Halpert"},
 *             {firstname:"Kevin", lastname:"Malone"},
 *             {firstname:"Angela", lastname:"Martin"}
 *         ]
 *     });
 *
 *     Ext.create('Ext.grid.Panel', {
 *         title: 'Action Column Demo',
 *         store: Ext.data.StoreManager.lookup('employeeStore'),
 *         columns: [
 *             {text: 'First Name',  dataIndex:'firstname'},
 *             {text: 'Last Name',  dataIndex:'lastname'},
 *             {
 *                 xtype:'actioncolumn',
 *                 width:50,
 *                 items: [{
 *                     icon: 'extjs/examples/shared/icons/fam/cog_edit.png',  // Use a URL in the icon config
 *                     tooltip: 'Edit',
 *                     handler: function(grid, rowIndex, colIndex) {
 *                         var rec = grid.getStore().getAt(rowIndex);
 *                         alert("Edit " + rec.get('firstname'));
 *                     }
 *                 },{
 *                     icon: 'extjs/examples/restful/images/delete.png',
 *                     tooltip: 'Delete',
 *                     handler: function(grid, rowIndex, colIndex) {
 *                         var rec = grid.getStore().getAt(rowIndex);
 *                         alert("Terminate " + rec.get('firstname'));
 *                     }
 *                 }]
 *             }
 *         ],
 *         width: 250,
 *         renderTo: Ext.getBody()
 *     });
 *
 * The action column can be at any index in the columns array, and a grid can have any number of
 * action columns.
 */
Ext.define('Ext.grid.column.Action', {
    extend: 'Ext.grid.column.Column',
    alias: ['widget.actioncolumn'],
    alternateClassName: 'Ext.grid.ActionColumn',

    /**
     * @cfg {String} icon
     * The URL of an image to display as the clickable element in the column.
     *
     * Defaults to `{@link Ext#BLANK_IMAGE_URL}`.
     */
    /**
     * @cfg {String} iconCls
     * A CSS class to apply to the icon image. To determine the class dynamically, configure the Column with
     * a `{@link #getClass}` function.
     */
    /**
     * @cfg {Function} handler
     * A function called when the icon is clicked.
     * @cfg {Ext.view.Table} handler.view The owning TableView.
     * @cfg {Number} handler.rowIndex The row index clicked on.
     * @cfg {Number} handler.colIndex The column index clicked on.
     * @cfg {Object} handler.item The clicked item (or this Column if multiple {@link #cfg-items} were not configured).
     * @cfg {Event} handler.e The click event.
     * @cfg {Ext.data.Model} handler.record The Record underlying the clicked row.
     * @cfg {HtmlElement} row The table row clicked upon.
     */
    /**
     * @cfg {Object} scope
     * The scope (**this** reference) in which the `{@link #handler}` and `{@link #getClass}` fuctions are executed.
     * Defaults to this Column.
     */
    /**
     * @cfg {String} tooltip
     * A tooltip message to be displayed on hover. {@link Ext.tip.QuickTipManager#init Ext.tip.QuickTipManager} must
     * have been initialized.
     */
    /**
     * @cfg {Boolean} disabled
     * If true, the action will not respond to click events, and will be displayed semi-opaque.
     */
    /**
     * @cfg {Boolean} [stopSelection=true]
     * Prevent grid selection upon mousedown.
     */
    /**
     * @cfg {Function} getClass
     * A function which returns the CSS class to apply to the icon image.
     *
     * @cfg {Object} getClass.v The value of the column's configured field (if any).
     *
     * @cfg {Object} getClass.metadata An object in which you may set the following attributes:
     * @cfg {String} getClass.metadata.css A CSS class name to add to the cell's TD element.
     * @cfg {String} getClass.metadata.attr An HTML attribute definition string to apply to the data container
     * element *within* the table cell (e.g. 'style="color:red;"').
     *
     * @cfg {Ext.data.Model} getClass.r The Record providing the data.
     *
     * @cfg {Number} getClass.rowIndex The row index..
     *
     * @cfg {Number} getClass.colIndex The column index.
     *
     * @cfg {Ext.data.Store} getClass.store The Store which is providing the data Model.
     */
    /**
     * @cfg {Object[]} items
     * An Array which may contain multiple icon definitions, each element of which may contain:
     *
     * @cfg {String} items.icon The url of an image to display as the clickable element in the column.
     *
     * @cfg {String} items.iconCls A CSS class to apply to the icon image. To determine the class dynamically,
     * configure the item with a `getClass` function.
     *
     * @cfg {Function} items.getClass A function which returns the CSS class to apply to the icon image.
     * @cfg {Object} items.getClass.v The value of the column's configured field (if any).
     * @cfg {Object} items.getClass.metadata An object in which you may set the following attributes:
     * @cfg {String} items.getClass.metadata.css A CSS class name to add to the cell's TD element.
     * @cfg {String} items.getClass.metadata.attr An HTML attribute definition string to apply to the data
     * container element _within_ the table cell (e.g. 'style="color:red;"').
     * @cfg {Ext.data.Model} items.getClass.r The Record providing the data.
     * @cfg {Number} items.getClass.rowIndex The row index..
     * @cfg {Number} items.getClass.colIndex The column index.
     * @cfg {Ext.data.Store} items.getClass.store The Store which is providing the data Model.
     *
     * @cfg {Function} items.handler A function called when the icon is clicked.
     *
     * @cfg {Object} items.scope The scope (`this` reference) in which the `handler` and `getClass` functions
     * are executed. Fallback defaults are this Column's configured scope, then this Column.
     *
     * @cfg {String} items.tooltip A tooltip message to be displayed on hover.
     * @cfg {Boolean} items.disabled If true, the action will not respond to click events, and will be displayed semi-opaque.
     * {@link Ext.tip.QuickTipManager#init Ext.tip.QuickTipManager} must have been initialized.
     */
    /**
     * @property {Array} items
     * An array of action items copied from the configured {@link #cfg-items items} configuration. Each will have
     * an `enable` and `disable` method added which will enable and disable the associated action, and
     * update the displayed icon accordingly.
     */

    actionIdRe: new RegExp(Ext.baseCSSPrefix + 'action-col-(\\d+)'),

    /**
     * @cfg {String} altText
     * The alt text to use for the image element.
     */
    altText: '',

    /**
     * @cfg {String} menuText=[<i>Actions</i>]
     * Text to display in this column's menu item if no {@link #text} was specified as a header.
     */
    menuText: '<i>Actions</i>',

    sortable: false,

    constructor: function(config) {
        var me = this,
            cfg = Ext.apply({}, config),
            items = cfg.items || [me],
            hasGetClass,
            i,
            len;


        me.origRenderer = cfg.renderer || me.renderer;
        me.origScope = cfg.scope || me.scope;
        
        delete me.renderer;
        delete me.scope;
        delete cfg.renderer;
        delete cfg.scope;
        
        // This is a Container. Delete the items config to be reinstated after construction.
        delete cfg.items;
        me.callParent([cfg]);

        // Items is an array property of ActionColumns
        me.items = items;
        
        for (i = 0, len = items.length; i < len; ++i) {
            if (items[i].getClass) {
                hasGetClass = true;
                break;
            }
        }
        
        // Also need to check for getClass, since it changes how the cell renders
        if (me.origRenderer || hasGetClass) {
            me.hasCustomRenderer = true;
        }
    },
    
    // Renderer closure iterates through items creating an <img> element for each and tagging with an identifying
    // class name x-action-col-{n}
    defaultRenderer: function(v, meta){
        var me = this,
            prefix = Ext.baseCSSPrefix,
            scope = me.origScope || me,
            items = me.items,
            len = items.length,
            i = 0,
            item;
            
        // Allow a configured renderer to create initial value (And set the other values in the "metadata" argument!)
        v = Ext.isFunction(me.origRenderer) ? me.origRenderer.apply(scope, arguments) || '' : '';

        meta.tdCls += ' ' + Ext.baseCSSPrefix + 'action-col-cell';
        for (; i < len; i++) {
            item = items[i];
            
            // Only process the item action setup once.
            if (!item.hasActionConfiguration) {
                
                // Apply our documented default to all items
                item.stopSelection = me.stopSelection;
                item.disable = Ext.Function.bind(me.disableAction, me, [i], 0);
                item.enable = Ext.Function.bind(me.enableAction, me, [i], 0);
                item.hasActionConfiguration = true;
            }
            
            v += '<img alt="' + (item.altText || me.altText) + '" src="' + (item.icon || Ext.BLANK_IMAGE_URL) +
                '" class="' + prefix + 'action-col-icon ' + prefix + 'action-col-' + String(i) + ' ' + (item.disabled ? prefix + 'item-disabled' : ' ') +
                ' ' + (Ext.isFunction(item.getClass) ? item.getClass.apply(item.scope || scope, arguments) : (item.iconCls || me.iconCls || '')) + '"' +
                ((item.tooltip) ? ' data-qtip="' + item.tooltip + '"' : '') + ' />';
        }
        return v;    
    },

    /**
     * Enables this ActionColumn's action at the specified index.
     * @param {Number/Ext.grid.column.Action} index
     * @param {Boolean} [silent=false]
     */
    enableAction: function(index, silent) {
        var me = this;

        if (!index) {
            index = 0;
        } else if (!Ext.isNumber(index)) {
            index = Ext.Array.indexOf(me.items, index);
        }
        me.items[index].disabled = false;
        me.up('tablepanel').el.select('.' + Ext.baseCSSPrefix + 'action-col-' + index).removeCls(me.disabledCls);
        if (!silent) {
            me.fireEvent('enable', me);
        }
    },

    /**
     * Disables this ActionColumn's action at the specified index.
     * @param {Number/Ext.grid.column.Action} index
     * @param {Boolean} [silent=false]
     */
    disableAction: function(index, silent) {
        var me = this;

        if (!index) {
            index = 0;
        } else if (!Ext.isNumber(index)) {
            index = Ext.Array.indexOf(me.items, index);
        }
        me.items[index].disabled = true;
        me.up('tablepanel').el.select('.' + Ext.baseCSSPrefix + 'action-col-' + index).addCls(me.disabledCls);
        if (!silent) {
            me.fireEvent('disable', me);
        }
    },

    destroy: function() {
        delete this.items;
        delete this.renderer;
        return this.callParent(arguments);
    },

    /**
     * @private
     * Process and refire events routed from the GridView's processEvent method.
     * Also fires any configured click handlers. By default, cancels the mousedown event to prevent selection.
     * Returns the event handler's status to allow canceling of GridView's bubbling process.
     */
    processEvent : function(type, view, cell, recordIndex, cellIndex, e, record, row){
        var me = this,
            target = e.getTarget(),
            match,
            item, fn,
            key = type == 'keydown' && e.getKey();

        // If the target was not within a cell (ie it's a keydown event from the View), then
        // rely on the selection data injected by View.processUIEvent to grab the
        // first action icon from the selected cell.
        if (key && !Ext.fly(target).findParent(view.cellSelector)) {
            target = Ext.fly(cell).down('.' + Ext.baseCSSPrefix + 'action-col-icon', true);
        }

        // NOTE: The statement below tests the truthiness of an assignment.
        if (target && (match = target.className.match(me.actionIdRe))) {
            item = me.items[parseInt(match[1], 10)];
            if (item) {
                if (type == 'click' || (key == e.ENTER || key == e.SPACE)) {
                    fn = item.handler || me.handler;
                    if (fn && !item.disabled) {
                        fn.call(item.scope || me.origScope || me, view, recordIndex, cellIndex, item, e, record, row);
                    }
                } else if (type == 'mousedown' && item.stopSelection !== false) {
                    return false;
                }
            }
        }
        return me.callParent(arguments);
    },

    cascade: function(fn, scope) {
        fn.call(scope||this, this);
    },

    // Private override because this cannot function as a Container, and it has an items property which is an Array, NOT a MixedCollection.
    getRefItems: function() {
        return [];
    }
});
