/**
 *  Component layout for {@link Ext.view.Table}
 *  @private
 * 
 */
Ext.define('Ext.view.TableLayout', {
    extend: 'Ext.layout.component.Auto',

    alias: ['layout.tableview'],
    type: 'tableview',

    beginLayout: function(ownerContext) {
        var me = this;

        me.callParent(arguments);

        // Grab ContextItem for the driving HeaderContainer and the table only if their is a table to size
        if (me.owner.table.dom) {
            ownerContext.tableContext = ownerContext.getEl(me.owner.table);

            // Grab a ContextItem for the header container
            ownerContext.headerContext = ownerContext.context.getCmp(me.headerCt);
        }
    },

    calculate: function(ownerContext) {
        var me = this;

        me.callParent(arguments);

        if (ownerContext.tableContext) {
            if (ownerContext.state.columnWidthsSynced) {
                if (ownerContext.hasProp('columnWidthsFlushed')) {
                    ownerContext.tableContext.setHeight(ownerContext.tableContext.el.dom.offsetHeight, false);
                } else {
                    me.done = false;
                }
            } else {
                if (ownerContext.headerContext.hasProp('columnWidthsDone')) {
                    ownerContext.context.queueFlush(me);
                    ownerContext.state.columnWidthsSynced = true;
                }

                // Either our base class (Auto) needs to measureContentHeight
                // if we are shrinkWrapHeight OR we need to measure the table
                // element height if we are not shrinkWrapHeight
                me.done = false;
            }
        }
    },

    measureContentHeight: function(ownerContext) {
        // Only able to produce a valid contentHeight if we have flushed all column widths to the table (or there's no table at all).
        if (!ownerContext.headerContext || ownerContext.hasProp('columnWidthsFlushed')) {
            return this.callParent(arguments);
        }
    },

    flush: function() {
        var me = this,
            context = me.ownerContext.context,
            columns = me.headerCt.getGridColumns(),
            i = 0, len = columns.length,
            el = me.owner.el,
            tableWidth = 0,
            colWidth;

        // So that the setProp can trigger this layout.
        context.currentLayout = me;

        // Set column width corresponding to each header
        for (i = 0; i < len; i++) {
            colWidth = columns[i].hidden ? 0 : context.getCmp(columns[i]).props.width;
            tableWidth += colWidth;

            // Grab the col and set the width.
            // CSS class is generated in TableChunker.
            // Select composites because there may be several chunks.
            el.select(me.getColumnSelector(columns[i])).setWidth(colWidth);
        }
        el.select('table.' + Ext.baseCSSPrefix + 'grid-table-resizer').setWidth(tableWidth);

        // Now we can measure contentHeight if necessary (if we are height shrinkwrapped)
        me.ownerContext.setProp('columnWidthsFlushed', true);
    },
    
    finishedLayout: function(){
        var me = this,
            first;
            
        me.callParent(arguments);   
        // In FF, in some cases during a resize or column hide/show, the <td> cells in
        // the grid won't respond to the new width set in the <th> at the top. So we
        // force a reflow of the table which seems to correct it. Related to EXTJSIV-6410
        if (Ext.isGecko) {
            first = me.headerCt.getGridColumns()[0];
            if (first) {
                first = me.owner.el.down(me.getColumnSelector(first));
                if (first) {
                    first.setStyle('display', 'none');
                    first.dom.scrollWidth;
                    first.setStyle('display', '');
                }
            }
        } 
    },

    getColumnSelector: function(column) {
        return 'th.' + Ext.baseCSSPrefix + 'grid-col-resizer-' + column.id;
    }
});