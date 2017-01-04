/**
 * A subclass of Ext.dd.DragTracker which handles dragging any Component.
 *
 * This is configured with a Component to be made draggable, and a config object for the {@link Ext.dd.DragTracker}
 * class.
 *
 * A {@link #delegate} may be provided which may be either the element to use as the mousedown target or a {@link
 * Ext.DomQuery} selector to activate multiple mousedown targets.
 *
 * When the Component begins to be dragged, its `beginDrag` method will be called if implemented.
 *
 * When the drag ends, its `endDrag` method will be called if implemented.
 */
Ext.define('Ext.util.ComponentDragger', {
    extend: 'Ext.dd.DragTracker',

    /**
     * @cfg {Boolean} constrain
     * Specify as `true` to constrain the Component to within the bounds of the {@link #constrainTo} region.
     */

    /**
     * @cfg {String/Ext.Element} delegate
     * A {@link Ext.DomQuery DomQuery} selector which identifies child elements within the Component's encapsulating
     * Element which are the drag handles. This limits dragging to only begin when the matching elements are
     * mousedowned.
     *
     * This may also be a specific child element within the Component's encapsulating element to use as the drag handle.
     */

    /**
     * @cfg {Boolean} constrainDelegate
     * Specify as `true` to constrain the drag handles within the {@link #constrainTo} region.
     */

    autoStart: 500,

    /**
     * Creates new ComponentDragger.
     * @param {Object} comp The Component to provide dragging for.
     * @param {Object} [config] Config object
     */
    constructor: function(comp, config) {
        this.comp = comp;
        this.initialConstrainTo = config.constrainTo;
        this.callParent([ config ]);
    },

    onStart: function(e) {
        var me = this,
            comp = me.comp;

        // Cache the start [X, Y] array
        this.startPosition = comp.el.getXY();

        // If client Component has a ghost method to show a lightweight version of itself
        // then use that as a drag proxy unless configured to liveDrag.
        if (comp.ghost && !comp.liveDrag) {
             me.proxy = comp.ghost();
             me.dragTarget = me.proxy.header.el;
        }

        // Set the constrainTo Region before we start dragging.
        if (me.constrain || me.constrainDelegate) {
            me.constrainTo = me.calculateConstrainRegion();
        }

        if (comp.beginDrag) {
            comp.beginDrag();
        }
    },

    calculateConstrainRegion: function() {
        var me = this,
            comp = me.comp,
            c = me.initialConstrainTo,
            delegateRegion,
            elRegion,
            dragEl = me.proxy ? me.proxy.el : comp.el,
            shadowSize = (!me.constrainDelegate && dragEl.shadow && !dragEl.shadowDisabled) ? dragEl.shadow.getShadowSize() : 0;

        // The configured constrainTo might be a Region or an element
        if (!(c instanceof Ext.util.Region)) {
            c =  Ext.fly(c).getViewRegion();
        }

        // Reduce the constrain region to allow for shadow
        if (shadowSize) {
            c.adjust(shadowSize[0], -shadowSize[1], -shadowSize[2], shadowSize[3]);
        }

        // If they only want to constrain the *delegate* to within the constrain region,
        // adjust the region to be larger based on the insets of the delegate from the outer
        // edges of the Component.
        if (!me.constrainDelegate) {
            delegateRegion = Ext.fly(me.dragTarget).getRegion();
            elRegion = dragEl.getRegion();

            c.adjust(
                delegateRegion.top - elRegion.top,
                delegateRegion.right - elRegion.right,
                delegateRegion.bottom - elRegion.bottom,
                delegateRegion.left - elRegion.left
            );
        }
        return c;
    },

    // Move either the ghost Component or the target Component to its new position on drag
    onDrag: function(e) {
        var me = this,
            comp = (me.proxy && !me.comp.liveDrag) ? me.proxy : me.comp,
            offset = me.getOffset(me.constrain || me.constrainDelegate ? 'dragTarget' : null);

        comp.setPagePosition(me.startPosition[0] + offset[0], me.startPosition[1] + offset[1]);
    },

    onEnd: function(e) {
        var comp = this.comp;
        if (this.proxy && !comp.liveDrag) {
            comp.unghost();
        }
        if (comp.endDrag) {
            comp.endDrag();
        }
    }
});