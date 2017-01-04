/**
 * A small abstract class that contains the shared behaviour for any summary
 * calculations to be used in the grid.
 */
Ext.define('Ext.grid.feature.AbstractSummary', {
    
    /* Begin Definitions */

    extend: 'Ext.grid.feature.Feature',
    
    alias: 'feature.abstractsummary',

    /* End Definitions */

   /**
    * @cfg
    * True to show the summary row.
    */
    showSummaryRow: true,

    // @private
    nestedIdRe: /\{\{id\}([\w\-]*)\}/g,

    // Listen for store updates. Eg, from an Editor.
    init: function() {
        var me = this;

        // Summary rows must be kept in column order, so view must be refreshed on column move
        me.grid.optimizedColumnMove = false;

        me.view.mon(me.view.store, {
            update: me.onStoreUpdate,
            scope: me
        });
    },

    // Refresh the whole view on edit so that the Summary gets updated
    onStoreUpdate: function() {
        var v = this.view;
        if (this.showSummaryRow) {
            v.saveScrollState();
            v.refresh();
            v.restoreScrollState();
        }
    },

    /**
     * Toggle whether or not to show the summary row.
     * @param {Boolean} visible True to show the summary row
     */
    toggleSummaryRow: function(visible){
        this.showSummaryRow = !!visible;
    },

    /**
     * Gets any fragments to be used in the tpl
     * @private
     * @return {Object} The fragments
     */
    getSummaryFragments: function(){
        var fragments = {};
        if (this.showSummaryRow) {
            Ext.apply(fragments, {
                printSummaryRow: Ext.bind(this.printSummaryRow, this)
            });
        }
        return fragments;
    },

    /**
     * Prints a summary row
     * @private
     * @param {Object} index The index in the template
     * @return {String} The value of the summary row
     */
    printSummaryRow: function(index){
        var inner = this.view.getTableChunker().metaRowTpl.join(''),
            prefix = Ext.baseCSSPrefix;

        inner = inner.replace(prefix + 'grid-row', prefix + 'grid-row-summary');
        inner = inner.replace('{{id}}', '{gridSummaryValue}');
        inner = inner.replace(this.nestedIdRe, '{id$1}');  
        inner = inner.replace('{[this.embedRowCls()]}', '{rowCls}');
        inner = inner.replace('{[this.embedRowAttr()]}', '{rowAttr}');
        inner = new Ext.XTemplate(inner, {
            firstOrLastCls: Ext.view.TableChunker.firstOrLastCls
        });

        return inner.applyTemplate({
            columns: this.getPrintData(index)
        });
    },

    /**
     * Gets the value for the column from the attached data.
     * @param {Ext.grid.column.Column} column The header
     * @param {Object} data The current data
     * @return {String} The value to be rendered
     */
    getColumnValue: function(column, summaryData){
        var comp     = Ext.getCmp(column.id),
            value    = summaryData[column.id],
            renderer = comp.summaryRenderer;
            
        if (!value && value !== 0) {
            value = '\u00a0';
        }

        if (renderer) {
            value = renderer.call(
                comp.scope || this,
                value,
                summaryData,
                column.dataIndex
            );
        }
        return value;
    },

    /**
     * Get the summary data for a field.
     * @private
     * @param {Ext.data.Store} store The store to get the data from
     * @param {String/Function} type The type of aggregation. If a function is specified it will
     * be passed to the stores aggregate function.
     * @param {String} field The field to aggregate on
     * @param {Boolean} group True to aggregate in grouped mode 
     * @return {Number/String/Object} See the return type for the store functions.
     */
    getSummary: function(store, type, field, group){
        if (type) {
            if (Ext.isFunction(type)) {
                return store.aggregate(type, null, group);
            }

            switch (type) {
                case 'count':
                    return store.count(group);
                case 'min':
                    return store.min(field, group);
                case 'max':
                    return store.max(field, group);
                case 'sum':
                    return store.sum(field, group);
                case 'average':
                    return store.average(field, group);
                default:
                    return group ? {} : '';
                    
            }
        }
    }

});
