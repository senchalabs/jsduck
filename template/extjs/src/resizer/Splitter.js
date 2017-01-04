/**
 * This class functions **between siblings of a {@link Ext.layout.container.VBox VBox} or {@link Ext.layout.container.HBox HBox}
 * layout** to resize both immediate siblings.
 *
 * A Splitter will preserve the flex ratio of any flexed siblings it is required to resize. It does this by setting the `flex` property of *all* flexed siblings
 * to equal their pixel size. The actual numerical `flex` property in the Components will change, but the **ratio** to the total flex value will be preserved.
 *
 * A Splitter may be configured to show a centered mini-collapse tool orientated to collapse the {@link #collapseTarget}.
 * The Splitter will then call that sibling Panel's {@link Ext.panel.Panel#method-collapse collapse} or {@link Ext.panel.Panel#method-expand expand} method
 * to perform the appropriate operation (depending on the sibling collapse state). To create the mini-collapse tool but take care
 * of collapsing yourself, configure the splitter with `{@link #performCollapse}: false`.
 */
Ext.define('Ext.resizer.Splitter', {
    extend: 'Ext.Component',
    requires: ['Ext.XTemplate'],
    uses: ['Ext.resizer.SplitterTracker'],
    alias: 'widget.splitter',

    childEls: [
        'collapseEl'
    ],

    renderTpl: [
        '<tpl if="collapsible===true">',
            '<div id="{id}-collapseEl" class="', Ext.baseCSSPrefix, 'collapse-el ',
                Ext.baseCSSPrefix, 'layout-split-{collapseDir}">&#160;</div>',
        '</tpl>'
    ],

    baseCls: Ext.baseCSSPrefix + 'splitter',
    collapsedClsInternal: Ext.baseCSSPrefix + 'splitter-collapsed',
    
    // Default to tree, allow internal classes to disable resizing
    canResize: true,

    /**
     * @cfg {Boolean} collapsible
     * True to show a mini-collapse tool in the Splitter to toggle expand and collapse on the {@link #collapseTarget} Panel.
     * Defaults to the {@link Ext.panel.Panel#collapsible collapsible} setting of the Panel.
     */
    collapsible: false,

    /**
     * @cfg {Boolean} performCollapse
     * Set to false to prevent this Splitter's mini-collapse tool from managing the collapse
     * state of the {@link #collapseTarget}.
     */

    /**
     * @cfg {Boolean} collapseOnDblClick
     * True to enable dblclick to toggle expand and collapse on the {@link #collapseTarget} Panel.
     */
    collapseOnDblClick: true,

    /**
     * @cfg {Number} defaultSplitMin
     * Provides a default minimum width or height for the two components
     * that the splitter is between.
     */
    defaultSplitMin: 40,

    /**
     * @cfg {Number} defaultSplitMax
     * Provides a default maximum width or height for the two components
     * that the splitter is between.
     */
    defaultSplitMax: 1000,

    /**
     * @cfg {String} collapsedCls
     * A class to add to the splitter when it is collapsed. See {@link #collapsible}.
     */

    /**
     * @cfg {String/Ext.panel.Panel} collapseTarget
     * A string describing the relative position of the immediate sibling Panel to collapse. May be 'prev' or 'next'.
     *
     * Or the immediate sibling Panel to collapse.
     *
     * The orientation of the mini-collapse tool will be inferred from this setting.
     *
     * **Note that only Panels may be collapsed.**
     */
    collapseTarget: 'next',

    /**
     * @property {String} orientation
     * Orientation of this Splitter. `'vertical'` when used in an hbox layout, `'horizontal'`
     * when used in a vbox layout.
     */

    horizontal: false,
    vertical: false,

    /**
     * Returns the config object (with an `xclass` property) for the splitter tracker. This
     * is overridden by {@link Ext.resizer.BorderSplitter BorderSplitter} to create a
     * {@link Ext.resizer.BorderSplitterTracker BorderSplitterTracker}.
     * @protected
     */
    getTrackerConfig: function () {
        return {
            xclass: 'Ext.resizer.SplitterTracker',
            el: this.el,
            splitter: this
        };
    },

    beforeRender: function() {
        var me = this,
            target = me.getCollapseTarget(),
            collapseDir = me.getCollapseDirection(),
            vertical = me.vertical,
            fixedSizeProp = vertical ? 'width' : 'height',
            stretchSizeProp = vertical ? 'height' : 'width',
            cls;

        me.callParent();

        if (!me.hasOwnProperty(stretchSizeProp)) {
            me[stretchSizeProp] = '100%';
        }
        if (!me.hasOwnProperty(fixedSizeProp)) {
            me[fixedSizeProp] = 5;
        }

        if (target.collapsed) {
            me.addCls(me.collapsedClsInternal);
        }
        
        cls = me.baseCls + '-' + me.orientation;
        me.addCls(cls);
        if (!me.canResize) {
            me.addCls(cls + '-noresize');
        }
        
        Ext.applyIf(me.renderData, {
            collapseDir: collapseDir,
            collapsible: me.collapsible || target.collapsible
        });
    },

    onRender: function() {
        var me = this;

        me.callParent(arguments);

        // Add listeners on the mini-collapse tool unless performCollapse is set to false
        if (me.performCollapse !== false) {
            if (me.renderData.collapsible) {
                me.mon(me.collapseEl, 'click', me.toggleTargetCmp, me);
            }
            if (me.collapseOnDblClick) {
                me.mon(me.el, 'dblclick', me.toggleTargetCmp, me);
            }
        }

        // Ensure the mini collapse icon is set to the correct direction when the target is collapsed/expanded by any means
        me.mon(me.getCollapseTarget(), {
            collapse: me.onTargetCollapse,
            expand: me.onTargetExpand,
            scope: me
        });

        me.el.unselectable();
        if (me.canResize) {
            me.tracker = Ext.create(me.getTrackerConfig());
            // Relay the most important events to our owner (could open wider later):
            me.relayEvents(me.tracker, [ 'beforedragstart', 'dragstart', 'dragend' ]);
        }
    },

    getCollapseDirection: function() {
        var me = this,
            dir = me.collapseDirection,
            collapseTarget, idx, items, type;

        if (!dir) {
            collapseTarget = me.collapseTarget;
            if (collapseTarget.isComponent) {
                dir = collapseTarget.collapseDirection;
            }

            if (!dir) {
                // Avoid duplication of string tests.
                // Create a two bit truth table of the configuration of the Splitter:
                // Collapse Target | orientation
                //        0              0             = next, horizontal
                //        0              1             = next, vertical
                //        1              0             = prev, horizontal
                //        1              1             = prev, vertical
                type = me.ownerCt.layout.type;
                if (collapseTarget.isComponent) {
                    items = me.ownerCt.items;
                    idx = Number(items.indexOf(collapseTarget) == items.indexOf(me) - 1) << 1 | Number(type == 'hbox');
                } else {
                    idx = Number(me.collapseTarget == 'prev') << 1 | Number(type == 'hbox');
                }

                // Read the data out the truth table
                dir = ['bottom', 'right', 'top', 'left'][idx];
            }

            me.collapseDirection = dir;
        }

        me.orientation = (dir == 'top' || dir == 'bottom') ? 'horizontal' : 'vertical';
        me[me.orientation] = true;

        return dir;
    },

    getCollapseTarget: function() {
        var me = this;

        return me.collapseTarget.isComponent ? me.collapseTarget : me.collapseTarget == 'prev' ? me.previousSibling() : me.nextSibling();
    },

    onTargetCollapse: function(target) {
        this.el.addCls([this.collapsedClsInternal, this.collapsedCls]);
    },

    onTargetExpand: function(target) {
        this.el.removeCls([this.collapsedClsInternal, this.collapsedCls]);
    },

    toggleTargetCmp: function(e, t) {
        var cmp = this.getCollapseTarget(),
            placeholder = cmp.placeholder,
            toggle;

        if (placeholder && !placeholder.hidden) {
            toggle = true;
        } else {
            toggle = !cmp.hidden;
        }

        if (toggle) {
            if (cmp.collapsed) {
                cmp.expand();
            } else if (cmp.collapseDirection) {
                cmp.collapse();
            } else {
                cmp.collapse(this.renderData.collapseDir);
            }
        }
    },

    /*
     * Work around IE bug. %age margins do not get recalculated on element resize unless repaint called.
     */
    setSize: function() {
        var me = this;
        me.callParent(arguments);
        if (Ext.isIE && me.el) {
            me.el.repaint();
        }
    },
    
    beforeDestroy: function(){
        Ext.destroy(this.tracker);
        this.callParent();
    }
});
