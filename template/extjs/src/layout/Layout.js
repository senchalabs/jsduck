/**
 * Base Layout class - extended by ComponentLayout and ContainerLayout
 */
Ext.define('Ext.layout.Layout', {

    requires: [
        'Ext.XTemplate'
    ],

    uses: [ 'Ext.layout.Context' ],

    /**
     * @property {Boolean} isLayout
     * `true` in this class to identify an object as an instantiated Layout, or subclass thereof.
     */
    isLayout: true,
    initialized: false,
    running: false,

    autoSizePolicy: {
        setsWidth: 0,
        setsHeight: 0
    },

    statics: {
        layoutsByType: {},

        create: function(layout, defaultType) {
            var ClassManager = Ext.ClassManager,
                layoutsByType = this.layoutsByType,
                alias, className, config, layoutClass, type, load;

            if (!layout || typeof layout === 'string') {
                type = layout || defaultType;
                config = {};                    
            } else if (layout.isLayout) {
                return layout;
            } else {
                config = layout;
                type = layout.type || defaultType;
            }

            if (!(layoutClass = layoutsByType[type])) {
                alias = 'layout.' + type;
                className = ClassManager.getNameByAlias(alias);

                // this is needed to support demand loading of the class
                if (!className) {
                    load = true;
                }
                
                layoutClass = ClassManager.get(className);
                if (load || !layoutClass) {
                    return ClassManager.instantiateByAlias(alias, config || {});
                }
                layoutsByType[type] = layoutClass;
            }

            return new layoutClass(config);
        }
    },

    constructor : function(config) {
        var me = this;

        me.id = Ext.id(null, me.type + '-');
        Ext.apply(me, config);
        me.layoutCount = 0;
    },

    /**
     * @property {Boolean} done Used only during a layout run, this value indicates that a
     * layout has finished its calculations. This flag is set to true prior to the call to
     * {@link #calculate} and should be set to false if this layout has more work to do.
     */

    /**
     * Called before any calculation cycles to prepare for layout.
     * 
     * This is a write phase and DOM reads should be strictly avoided when overridding
     * this method.
     * 
     * @param {Ext.layout.ContextItem} ownerContext The context item for the layout's owner
     * component.
     * @method beginLayout
     */
    beginLayout: Ext.emptyFn,

    /**
     * Called before any calculation cycles to reset DOM values and prepare for calculation.
     * 
     * This is a write phase and DOM reads should be strictly avoided when overridding
     * this method.
     * 
     * @param {Ext.layout.ContextItem} ownerContext The context item for the layout's owner
     * component.
     * @method beginLayoutCycle
     */
    beginLayoutCycle: function (ownerContext) {
        var me = this,
            context = me.context,
            changed;

        if (me.lastWidthModel != ownerContext.widthModel) {
            if (me.lastWidthModel) {
                changed = true;
            }
            me.lastWidthModel = ownerContext.widthModel;
        }

        if (me.lastHeightModel != ownerContext.heightModel) {
            if (me.lastWidthModel) {
                changed = true;
            }
            me.lastHeightModel = ownerContext.heightModel;
        }

        if (changed) {
            (context = ownerContext.context).clearTriggers(me, false);
            context.clearTriggers(me, true);
            me.triggerCount = 0;
        }
    },

    /**
     * Called to perform the calculations for this layout. This method will be called at
     * least once and may be called repeatedly if the {@link #done} property is cleared
     * before return to indicate that this layout is not yet done. The {@link #done} property
     * is always set to `true` before entering this method.
     * 
     * This is a read phase and DOM writes should be strictly avoided in derived classes.
     * Instead, DOM writes need to be written to {@link Ext.layout.ContextItem} objects to
     *  be flushed at the next opportunity.
     * 
     * @param {Ext.layout.ContextItem} ownerContext The context item for the layout's owner
     * component.
     * @method calculate
     * @abstract
     */

    /**
     * This method (if implemented) is called at the end of the cycle in which this layout
     * completes (by not setting {@link #done} to `false` in {@link #calculate}). It is
     * possible for the layout to complete and yet become invalid before the end of the cycle,
     * in which case, this method will not be called. It is also possible for this method to
     * be called and then later the layout becomes invalidated. This will result in
     * {@link #calculate} being called again, followed by another call to this method.
     * 
     * This is a read phase and DOM writes should be strictly avoided in derived classes.
     * Instead, DOM writes need to be written to {@link Ext.layout.ContextItem} objects to
     * be flushed at the next opportunity.
     * 
     * This method need not be implemented by derived classes and, in fact, should only be
     * implemented when needed.
     * 
     * @param {Ext.layout.ContextItem} ownerContext The context item for the layout's owner
     * component.
     * @method completeLayout
     */

    /**
     * This method (if implemented) is called after all layouts have completed. In most
     * ways this is similar to {@link #completeLayout}. This call can cause this (or any
     * layout) to be become invalid (see {@link Ext.layout.Context#invalidate}), but this
     * is best avoided. This method is intended to be where final reads are made and so it
     * is best to avoid invalidating layouts at this point whenever possible. Even so, this
     * method can be used to perform final checks that may require all other layouts to be
     * complete and then invalidate some results.
     * 
     * This is a read phase and DOM writes should be strictly avoided in derived classes.
     * Instead, DOM writes need to be written to {@link Ext.layout.ContextItem} objects to
     * be flushed at the next opportunity.
     * 
     * This method need not be implemented by derived classes and, in fact, should only be
     * implemented when needed.
     * 
     * @param {Ext.layout.ContextItem} ownerContext The context item for the layout's owner
     * component.
     * @method finalizeLayout
     */

    /**
     * This method is called after all layouts are complete and their calculations flushed
     * to the DOM. No further layouts will be run and this method is only called once per
     * layout run. The base component layout caches `lastComponentSize`.
     * 
     * This is a write phase and DOM reads should be avoided if possible when overridding
     * this method.
     * 
     * This method need not be implemented by derived classes and, in fact, should only be
     * implemented when needed.
     * 
     * @param {Ext.layout.ContextItem} ownerContext The context item for the layout's owner
     * component.
     */
    finishedLayout: function () {
        this.ownerContext = null;
    },
    
    /**
     * This method (if implemented) is called after all layouts are finished, and all have
     * a `lastComponentSize` cached. No further layouts will be run and this method is only
     * called once per layout run. It is the bookend to {@link #beginLayout}.
     * 
     * This is a write phase and DOM reads should be avoided if possible when overridding
     * this method. This is the catch-all tail method to a layout and so the rules are more
     * relaxed. Even so, for performance reasons, it is best to avoid reading the DOM. If
     * a read is necessary, consider implementing a {@link #finalizeLayout} method to do the
     * required reads.
     * 
     * This method need not be implemented by derived classes and, in fact, should only be
     * implemented when needed.
     * 
     * @param {Ext.layout.ContextItem} ownerContext The context item for the layout's owner
     * component.
     * @method notifyOwner
     */
    
    redoLayout: Ext.emptyFn,
    undoLayout: Ext.emptyFn,

    getAnimatePolicy: function() {
        return this.animatePolicy;
    },

    /**
     * Returns an object describing how this layout manages the size of the given component.
     * This method must be implemented by any layout that manages components.
     *
     * @param {Ext.Component} item
     *
     * @return {Object} An object describing the sizing done by the layout for this item or
     * null if the layout mimics the size policy of its ownerCt (e.g., 'fit' and 'card').
     * @return {Boolean} return.readsWidth True if the natural/auto width of this component
     * is used by the ownerLayout.
     * @return {Boolean} return.readsHeight True if the natural/auto height of this component
     * is used by the ownerLayout.
     * @return {Boolean} return.setsWidth True if the ownerLayout set this component's width.
     * @return {Boolean} return.setsHeight True if the ownerLayout set this component's height.
     *
     * @protected
     */
    getItemSizePolicy: function (item) {
        return this.autoSizePolicy;
    },

    isItemBoxParent: function (itemContext) {
        return false;
    },

    isItemLayoutRoot: function (item) {
        var sizeModel = item.getSizeModel(),
            width = sizeModel.width,
            height = sizeModel.height;

        // If this component has never had a layout and some of its dimensions are set by
        // its ownerLayout, we cannot be the layoutRoot...
        if (!item.componentLayout.lastComponentSize && (width.calculated || height.calculated)) {
            return false;
        }

        // otherwise an ownerCt whose size is not effected by its content is a root
        return !width.shrinkWrap && !height.shrinkWrap;
    },

    isItemShrinkWrap: function (item) {
        return item.shrinkWrap;
    },

    isRunning: function () {
        return !!this.ownerContext;
    },

    //-----------------------------------------------------
    /*
     * Clears any styles which must be cleared before layout can take place.
     * Only DOM WRITES must be performed at this stage.
     *
     * An entry for the owner's element ID must be created in the layoutContext containing
     * a reference to the target which must be sized/positioned/styled by the layout at
     * the flush stage:
     *
     *     {
     *         target: me.owner
     *     }
     *
     * Component layouts should iterate through managed Elements,
     * pushing an entry for each element:
     *
     *     {
     *         target: childElement
     *     }
     */
    //-----------------------------------------------------

    getItemsRenderTree: function (items, renderCfgs) {
        var length = items.length,
            i, item, itemConfig, result;

        if (length) {
            result = [];
            for (i = 0; i < length; ++i) {
                item = items[i];

                // If we are being asked to move an already rendered Component, we must not recalculate its renderTree
                // and rerun its render process. The Layout's isValidParent check will ensure that the DOM is moved into place.
                if (!item.rendered) {

                    // If we've already calculated the item's element config, don't calculate it again.
                    // This may happen if the rendering process mutates the owning Container's items
                    // collection, and Ext.layout.Container#getRenderTree runs through the collection again.
                    // Note that the config may be null if a beforerender listener vetoed the operation, so
                    // we must compare to undefined.
                    if (renderCfgs && (renderCfgs[item.id] !== undefined)) {
                        itemConfig = renderCfgs[item.id];
                    } else {
                        // Perform layout preprocessing in the bulk render path
                        this.configureItem(item);
                        itemConfig = item.getRenderTree();
                        if (renderCfgs) {
                            renderCfgs[item.id] = itemConfig;
                        }
                    }

                    // itemConfig mey be null if a beforerender listener vetoed the operation.
                    if (itemConfig) {
                        result.push(itemConfig);
                    }
                }
            }
        }

        return result;
    },

    finishRender: Ext.emptyFn,

    finishRenderItems: function (target, items) {
        var length = items.length,
            i, item;

        for (i = 0; i < length; i++) {
            item = items[i];

            // Only postprocess items which are being rendered. deferredRender may mean that only one has been rendered.
            if (item.rendering) {

                // Tell the item at which index in the Container it is
                item.finishRender(i);

                this.afterRenderItem(item);
            }
        }
    },

    renderChildren: function () {
        var me = this,
            items = me.getLayoutItems(),
            target = me.getRenderTarget();

        me.renderItems(items, target);
    },

    /**
     * Iterates over all passed items, ensuring they are rendered.  If the items are already rendered,
     * also determines if the items are in the proper place in the dom.
     * @protected
     */
    renderItems : function(items, target) {
        var me = this,
            ln = items.length,
            i = 0,
            item;

        if (ln) {
            Ext.suspendLayouts();
            for (; i < ln; i++) {
                item = items[i];
                if (item && !item.rendered) {
                    me.renderItem(item, target, i);
                } else if (!me.isValidParent(item, target, i)) {
                    me.moveItem(item, target, i);
                } else {
                    // still need to configure the item, it may have moved in the container.
                    me.configureItem(item);
                }
            }
            Ext.resumeLayouts(true);
        }
    },

    /**
     * Validates item is in the proper place in the dom.
     * @protected
     */
    isValidParent : function(item, target, position) {
        var itemDom = item.el ? item.el.dom : Ext.getDom(item),
            targetDom = (target && target.dom) || target;

        // If it's resizable+wrapped, the position element is the wrapper.
        if (itemDom.parentNode && itemDom.parentNode.className.indexOf(Ext.baseCSSPrefix + 'resizable-wrap') !== -1) {
            itemDom = itemDom.parentNode;
        }

        // Test DOM nodes for equality using "===" : http://jsperf.com/dom-equality-test
        if (itemDom && targetDom) {
            if (typeof position == 'number') {
                return itemDom === targetDom.childNodes[position];
            }
            return itemDom.parentNode === targetDom;
        }

        return false;
    },

    /**
     * Called before an item is rendered to allow the layout to configure the item.
     * @param {Ext.Component} item The item to be configured
     * @protected
     */
    configureItem: function(item) {
        item.ownerLayout = this;
    },

    /**
     * Renders the given Component into the target Element.
     * @param {Ext.Component} item The Component to render
     * @param {Ext.dom.Element} target The target Element
     * @param {Number} position The position within the target to render the item to
     * @private
     */
    renderItem : function(item, target, position) {
        var me = this;
        if (!item.rendered) {
            me.configureItem(item);
            item.render(target, position);
            me.afterRenderItem(item);
        }
    },

    /**
     * Moves Component to the provided target instead.
     * @private
     */
    moveItem : function(item, target, position) {
        target = target.dom || target;
        if (typeof position == 'number') {
            position = target.childNodes[position];
        }
        target.insertBefore(item.el.dom, position || null);
        item.container = Ext.get(target);
        this.configureItem(item);
    },

    /**
     * This method is called when a child item changes in some way. By default this calls
     * {@link Ext.AbstractComponent#updateLayout} on this layout's owner.
     * 
     * @param {Ext.Component} child The child item that has changed.
     * @return {Boolean} True if this layout has handled the content change.
     */
    onContentChange: function () {
        this.owner.updateLayout();
        return true;
    },

    /**
     * A one-time initialization method called just before rendering.
     * @protected
     */
    initLayout : function() {
        this.initialized = true;
    },

    // @private Sets the layout owner
    setOwner : function(owner) {
        this.owner = owner;
    },

    /**
     * Returns the set of items to layout (empty by default).
     * @protected
     */
    getLayoutItems : function() {
        return [];
    },

    // Placeholder empty functions for subclasses to extend
    afterRenderItem: Ext.emptyFn,
    onAdd : Ext.emptyFn,
    onRemove : Ext.emptyFn,
    onDestroy : Ext.emptyFn,

    /**
     * Removes layout's itemCls and owning Container's itemCls.
     * Clears the managed dimensions flags
     * @protected
     */
    afterRemove : function(item) {
        var me = this,
            el = item.el,
            owner = me.owner,
            removeClasses;

        if (item.rendered) {
            removeClasses = [].concat(me.itemCls || []);
            if (owner.itemCls) {
                removeClasses = Ext.Array.push(removeClasses, owner.itemCls);
            }
            if (removeClasses.length) {
                el.removeCls(removeClasses);
            }
        }

        delete item.ownerLayout;
    },

    /**
     * Destroys this layout. This method removes a `targetCls` from the `target`
     * element and calls `onDestroy`.
     * 
     * A derived class can override either this method or `onDestroy` but in all
     * cases must call the base class versions of these methods to allow the base class to
     * perform its cleanup.
     * 
     * This method (or `onDestroy`) are overridden by subclasses most often to purge
     * event handlers or remove unmanged DOM nodes.
     *
     * @protected
     */
    destroy : function() {
        var me = this,
            target;

        if (me.targetCls) {
            target = me.getTarget();
            if (target) {
                target.removeCls(me.targetCls);
            }
        }

        me.onDestroy();
    },

    sortWeightedItems: function (items, reverseProp) {
        for (var i = 0, length = items.length; i < length; ++i) {
            items[i].$i = i;
        }

        Ext.Array.sort(items, function (item1, item2) {
            var ret = item2.weight - item1.weight;

            if (!ret) {
                ret = item1.$i - item2.$i;
                if (item1[reverseProp]) {
                    ret = -ret;
                }
            }

            return ret;
        });

        for (i = 0; i < length; ++i) {
            delete items[i].$i;
        }
    }
}, function () {
    var Layout = this,
        sizeModels = {},
        sizeModelsArray = [],
        i, j, n, pairs, sizeModel;

    Layout.prototype.sizeModels = Layout.sizeModels = sizeModels;

    /**
    * This class describes a size determination strategy or algorithm used by the layout
    * system. There are special instances of this class stored as static properties to
    * avoid needless object instantiation. These instances should be treated as readonly.
    * 
    *  * `calculated`
    *  * `configured`
    *  * `constrainedMax`
    *  * `constrainedMin`
    *  * `natural`
    *  * `shrinkWrap`
    *  * `calculatedFromConfigured`
    *  * `calculatedFromNatural`
    *  * `calculatedFromShrinkWrap`
    *
    * Using one of these instances is simply:
    *
    *       var calculated = Ext.layout.SizeModel.calculated;
    *
    * @class Ext.layout.SizeModel
    * @protected
    */
    var SizeModel = function (config) {
        var me = this,
            name = config.name;

        Ext.apply(Ext.apply(me, defaults), config);

        me[name] = true; // set the one special flag that matches our name
        SizeModel[name] = sizeModels[name] = me;

        me.fixed = !(me.auto = me.natural || me.shrinkWrap);

        /**
         * @prop {Number} ordinal
         * The 0-based ordinal for this `SizeModel` instance.
         * @readonly
         */
        me.ordinal = sizeModelsArray.length;
        sizeModelsArray.push(me);
    };

    Ext.layout.SizeModel = SizeModel;

    var defaults = {
        /**
        * @property {String} name
        * The name of this size model (e.g., "calculated").
        * @readonly
        */

        /**
        * @property {Boolean} auto
        * True if the size is either `natural` or `shrinkWrap`, otherwise false.
        * @readonly
        */

        /**
        * @property {Boolean} calculated
        * True if the size is calculated by the `ownerLayout`.
        * @readonly
        */
        calculated: false,

        /**
        * @property {Boolean} configured
        * True if the size is configured (e.g., by a `width` or `minWidth`). The names of
        * configuration properties can be found in the {@link #names} property.
        * @readonly
        */
        configured: false,

        /**
        * @property {Boolean} constrainedMax
        * True if the size is constrained by a `maxWidth` or `maxHeight` configuration. This
        * is a flavor of `configured` (since `maxWidth` and `maxHeight` are config options).
        * If true, the {@link #names} property will be defined as well.
        * @readonly
        */
        constrainedMax: false,

        /**
        * @property {Boolean} constrainedMin
        * True if the size is constrained by a `minWidth` or `minHeight` configuration. This
        * is a flavor of `configured` (since `minWidth` and `minHeight` are config options).
        * If true, the {@link #names} property will be defined as well.
        * @readonly
        */
        constrainedMin: false,

        /**
        * @property {Boolean} fixed
        * True if the size is either `calculated` or `configured`, otherwise false.
        * @readonly
        */

        /**
        * @property {Boolean} natural
        * True if the size is determined by CSS and not by content. Such sizes are assumed to
        * be dependent on the container box and measurement occurs on the outer-most element.
        * @readonly
        */
        natural: false,

        /**
        * @property {Boolean} shrinkWrap
        * True if the size is determined by content irrespective of the container box.
        * @readonly
        */
        shrinkWrap: false,

        /**
        * @property {Boolean} calculatedFromConfigured
        * True if the size is calculated by the `ownerLayout` based on a configured size.
        * @readonly
        */
        calculatedFromConfigured: false,

        /**
        * @property {Boolean} calculatedFromNatural
        * True if the size is calculated by the `ownerLayout` based on `natural` size model
        * results.
        * @readonly
        */
        calculatedFromNatural: false,

        /**
        * @property {Boolean} calculatedFromShrinkWrap
        * True if the size is calculated by the `ownerLayout` based on `shrinkWrap` size model
        * results.
        * @readonly
        */
        calculatedFromShrinkWrap: false,

        /**
        * @property {Object} names An object with the config property names that determine the
        * size.
        * @property {String} names.width The width property name (e.g., 'width').
        * @property {String} names.height The height property name (e.g., 'minHeight').
        * @readonly
        */
        names: null
    };

    //-------------------------------------------------------------------------------
    // These are the 4 fundamental size models.

    new SizeModel({
        name: 'calculated'
    });

    new SizeModel({
        name: 'configured',
        names: { width: 'width', height: 'height' }
    });

    new SizeModel({
        name: 'natural'
    });

    new SizeModel({
        name: 'shrinkWrap'
    });

    //-------------------------------------------------------------------------------
    // These are the size models are flavors of the above but with some extra detail
    // about their dynamic use.

    new SizeModel({
        name: 'calculatedFromConfigured',
        configured: true,
        names: { width: 'width', height: 'height' }
    });

    new SizeModel({
        name: 'calculatedFromNatural',
        natural: true
    });

    new SizeModel({
        name: 'calculatedFromShrinkWrap',
        shrinkWrap: true
    });

    new SizeModel({
        name: 'constrainedMax',
        configured: true,
        constrained: true,
        names: { width: 'maxWidth', height: 'maxHeight' }
    });

    new SizeModel({
        name: 'constrainedMin',
        configured: true,
        constrained: true,
        names: { width: 'minWidth', height: 'minHeight' }
    });

    for (i = 0, n = sizeModelsArray.length; i < n; ++i) {
        sizeModel = sizeModelsArray[i];
        /**
         * An array of objects indexed by the {@link #ordinal} of a height `SizeModel` on
         * a width `SizeModel` to yield an object describing both height and width size
         * models.
         * 
         * Used like this:
         *
         *      widthModel.pairsByHeightOrdinal[heightModel.ordinal]
         *
         * This provides a reusable object equivalent to the following:
         * 
         *      {
         *          width: widthModel,
         *          height: heightModel
         *      }
         *
         * @property {Object[]} pairsByHeightOrdinal
         * @property {Ext.layout.SizeModel} pairsByHeightOrdinal.width The `SizeModel` for
         * the width.
         * @property {Ext.layout.SizeModel} pairsByHeightOrdinal.height The `SizeModel` for
         * the height.
         */
        sizeModel.pairsByHeightOrdinal = pairs = [];

        for (j = 0; j < n; ++j) {
            pairs.push({
                width: sizeModel,
                height: sizeModelsArray[j]
            });
        }
    }
});
