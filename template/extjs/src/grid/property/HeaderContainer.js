/**
 * A custom HeaderContainer for the {@link Ext.grid.property.Grid}.
 * Generally it should not need to be used directly.
 */
Ext.define('Ext.grid.property.HeaderContainer', {

    extend: 'Ext.grid.header.Container',

    alternateClassName: 'Ext.grid.PropertyColumnModel',
    
    nameWidth: 115,

    // private - strings used for locale support
    //<locale>
    nameText : 'Name',
    //</locale>
    //<locale>
    valueText : 'Value',
    //</locale>
    //<locale>
    dateFormat : 'm/j/Y',
    //</locale>
    //<locale>
    trueText: 'true',
    //</locale>
    //<locale>
    falseText: 'false',
    //</locale>

    // private
    nameColumnCls: Ext.baseCSSPrefix + 'grid-property-name',

    /**
     * Creates new HeaderContainer.
     * @param {Ext.grid.property.Grid} grid The grid this store will be bound to
     * @param {Object} source The source data config object
     */
    constructor : function(grid, store) {
        var me = this;
        
        me.grid = grid;
        me.store = store;
        me.callParent([{
            items: [{
                header: me.nameText,
                width: grid.nameColumnWidth || me.nameWidth,
                sortable: grid.sortableColumns,
                dataIndex: grid.nameField,
                renderer: Ext.Function.bind(me.renderProp, me),
                itemId: grid.nameField,
                menuDisabled :true,
                tdCls: me.nameColumnCls
            }, {
                header: me.valueText,
                renderer: Ext.Function.bind(me.renderCell, me),
                getEditor: Ext.Function.bind(me.getCellEditor, me),
                sortable: grid.sortableColumns,
                flex: 1,
                fixed: true,
                dataIndex: grid.valueField,
                itemId: grid.valueField,
                menuDisabled: true
            }]
        }]);
    },
    
    getCellEditor: function(record){
        return this.grid.getCellEditor(record, this);
    },

    // private
    // Render a property name cell
    renderProp : function(v) {
        return this.getPropertyName(v);
    },

    // private
    // Render a property value cell
    renderCell : function(val, meta, rec) {
        var me = this,
            renderer = me.grid.customRenderers[rec.get(me.grid.nameField)],
            result = val;

        if (renderer) {
            return renderer.apply(me, arguments);
        }
        if (Ext.isDate(val)) {
            result = me.renderDate(val);
        } else if (Ext.isBoolean(val)) {
            result = me.renderBool(val);
        }
        return Ext.util.Format.htmlEncode(result);
    },

    // private
    renderDate : Ext.util.Format.date,

    // private
    renderBool : function(bVal) {
        return this[bVal ? 'trueText' : 'falseText'];
    },

    // private
    // Renders custom property names instead of raw names if defined in the Grid
    getPropertyName : function(name) {
        var pn = this.grid.propertyNames;
        return pn && pn[name] ? pn[name] : name;
    }
});