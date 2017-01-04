/**
 * This class manages state information for a component or element during a layout.
 * 
 * # Blocks
 *
 * A "block" is a required value that is preventing further calculation. When a layout has
 * encountered a situation where it cannot possibly calculate results, it can associate
 * itself with the context item and missing property so that it will not be rescheduled
 * until that property is set.
 * 
 * Blocks are a one-shot registration. Once the property changes, the block is removed.
 * 
 * Be careful with blocks. If *any* further calculations can be made, a block is not the
 * right choice.
 * 
 * # Triggers
 *
 * Whenever any call to {@link #getProp}, {@link #getDomProp}, {@link #hasProp} or
 * {@link #hasDomProp} is made, the current layout is automatically registered as being
 * dependent on that property in the appropriate state. Any changes to the property will
 * trigger the layout and it will be queued in the {@link Ext.layout.Context}.
 *
 * Triggers, once added, remain for the entire layout. Any changes to the property will
 * reschedule all unfinished layouts in their trigger set.
 *
 * @private
 */
Ext.define('Ext.layout.ContextItem', {
    
    requires: ['Ext.layout.ClassList'],

    heightModel: null,
    widthModel: null,
    sizeModel: null,

    boxChildren: null,

    boxParent: null,

    children: [],

    dirty: null,

    // The number of dirty properties
    dirtyCount: 0,

    hasRawContent: true,

    isContextItem: true,

    isTopLevel: false,

    consumersContentHeight: 0,
    consumersContentWidth: 0,
    consumersContainerHeight: 0,
    consumersContainerWidth: 0,
    consumersHeight: 0,
    consumersWidth: 0,

    ownerCtContext: null,

    remainingChildLayouts: 0,
    remainingComponentChildLayouts: 0,
    remainingContainerChildLayouts: 0,

    // the current set of property values:
    props: null,

    /**
     * @property {Object} state
     * State variables that are cleared when invalidated. Only applies to component items.
     */
    state: null,

    /**
     * @property {Boolean} wrapsComponent
     * True if this item wraps a Component (rather than an Element).
     * @readonly
     */
    wrapsComponent: false,

    constructor: function (config) {
        var me = this,
            el, ownerCt, ownerCtContext, sizeModel, target;

        Ext.apply(me, config);

        el = me.el;
        me.id = el.id;
        me.lastBox = el.lastBox;

        // These hold collections of layouts that are either blocked or triggered by sets
        // to our properties (either ASAP or after flushing to the DOM). All of them have
        // the same structure:
        //
        //      me.blocks = {
        //          width: {
        //              'layout-1001': layout1001
        //          }
        //      }
        //
        // The property name is the primary key which yields an object keyed by layout id
        // with the layout instance as the value. This prevents duplicate entries for one
        // layout and gives O(1) access to the layout instance when we need to iterate and
        // process them.
        // 
        // me.blocks = {};
        // me.domBlocks = {};
        // me.domTriggers = {};
        // me.triggers = {};

        me.flushedProps = {};
        me.props = {};

        // the set of cached styles for the element:
        me.styles = {};

        target = me.target;
        if (target.isComponent) {
            me.wrapsComponent = true;

            // These items are created top-down, so the ContextItem of our ownerCt should
            // be available (if it is part of this layout run).
            ownerCt = target.ownerCt;
            if (ownerCt && (ownerCtContext = me.context.items[ownerCt.el.id])) {
                me.ownerCtContext = ownerCtContext;
            }

            // If our ownerCtContext is in the run, it will have a SizeModel that we use to
            // optimize the determination of our sizeModel.
            me.sizeModel = sizeModel = target.getSizeModel(ownerCtContext &&
                ownerCtContext.widthModel.pairsByHeightOrdinal[ownerCtContext.heightModel.ordinal]);

            me.widthModel = sizeModel.width;
            me.heightModel = sizeModel.height;

            // NOTE: The initial determination of sizeModel is valid (thankfully) and is
            // needed to cope with adding components to a layout run on-the-fly (e.g., in
            // the menu overflow handler of a box layout). Since this is the case, we do
            // not need to recompute the sizeModel in init unless it is a "full" init (as
            // our ownerCt's sizeModel could have changed in that case).
        }
    },

    /**
     * Clears all properties on this object except (perhaps) those not calculated by this
     * component. This is more complex than it would seem because a layout can decide to
     * invalidate its results and run the component's layouts again, but since some of the
     * values may be calculated by the container, care must be taken to preserve those
     * values.
     *
     * @param {Boolean} full True if all properties are to be invalidated, false to keep
     * those calculated by the ownerCt.
     * @return {Mixed} A value to pass as the first argument to {@link #initContinue}.
     * @private
     */
    init: function (full, options) {
        var me = this,
            oldProps = me.props,
            oldDirty = me.dirty,
            ownerCtContext = me.ownerCtContext,
            ownerLayout = me.target.ownerLayout,
            firstTime = !me.state,
            ret = full || firstTime,
            children, i, n, ownerCt, sizeModel, target,
            oldHeightModel = me.heightModel,
            oldWidthModel = me.widthModel,
            newHeightModel, newWidthModel;

        me.dirty = me.invalid = false;
        me.props = {};

        if (me.boxChildren) {
            me.boxChildren.length = 0; // keep array (more GC friendly)
        }

        if (!firstTime) {
            me.clearAllBlocks('blocks');
            me.clearAllBlocks('domBlocks');
        }

        // For Element wrappers, we are done...
        if (!me.wrapsComponent) {
            return ret;
        }

        // From here on, we are only concerned with Component wrappers...
        target = me.target;
        me.state = {}; // only Component wrappers need a "state"

        if (firstTime) {
            // This must occur before we proceed since it can do many things (like add
            // child items perhaps):
            if (target.beforeLayout) {
                target.beforeLayout();
            }

            // Determine the ownerCtContext if we aren't given one. Normally the firstTime
            // we meet a component is before the context is run, but it is possible for
            // components to be added to a run that is already in progress. If so, we have
            // to lookup the ownerCtContext since the odds are very high that the new
            // component is a child of something already in the run. It is currently
            // unsupported to drag in the owner of a running component (needs testing).
            if (!ownerCtContext && (ownerCt = target.ownerCt)) {
                ownerCtContext = me.context.items[ownerCt.el.id];
            }

            if (ownerCtContext) {
                me.ownerCtContext = ownerCtContext;
                me.isBoxParent = target.ownerLayout.isItemBoxParent(me);
            } else {
                me.isTopLevel = true; // this is used by initAnimation...
            }

            me.frameBodyContext = me.getEl('frameBody');
        } else {
            ownerCtContext = me.ownerCtContext;

            // In theory (though untested), this flag can change on-the-fly...
            me.isTopLevel = !ownerCtContext;

            // Init the children element items since they may have dirty state (no need to
            // do this the firstTime).
            children = me.children;
            for (i = 0, n = children.length; i < n; ++i) {
                children[i].init(true);
            }
        }

        // We need to know how we will determine content size: containers can look at the
        // results of their items but non-containers or item-less containers with just raw
        // markup need to be measured in the DOM:
        me.hasRawContent = !(target.isContainer && target.items.items.length > 0);

        if (full) {
            // We must null these out or getSizeModel will assume they are the correct,
            // dynamic size model and return them (the previous dynamic sizeModel).
            me.widthModel = me.heightModel = null;
            sizeModel = target.getSizeModel(ownerCtContext && 
                ownerCtContext.widthModel.pairsByHeightOrdinal[ownerCtContext.heightModel.ordinal]);

            if (firstTime) {
                me.sizeModel = sizeModel;
            }

            me.widthModel = sizeModel.width;
            me.heightModel = sizeModel.height;
        } else if (oldProps) {
            // these are almost always calculated by the ownerCt (we might need to track
            // this at some point more carefully):
            me.recoverProp('x', oldProps, oldDirty);
            me.recoverProp('y', oldProps, oldDirty);

            // if these are calculated by the ownerCt, don't trash them:
            if (me.widthModel.calculated) {
                me.recoverProp('width', oldProps, oldDirty);
            }
            if (me.heightModel.calculated) {
                me.recoverProp('height', oldProps, oldDirty);
            }
        }

        if (oldProps && ownerLayout && ownerLayout.manageMargins) {
            me.recoverProp('margin-top', oldProps, oldDirty);
            me.recoverProp('margin-right', oldProps, oldDirty);
            me.recoverProp('margin-bottom', oldProps, oldDirty);
            me.recoverProp('margin-left', oldProps, oldDirty);
        }

        // Process any invalidate options present. These can only come from explicit calls
        // to the invalidate() method.
        if (options) {
            // Consider a container box with wrapping text. If the box is made wider, the
            // text will take up less height (until there is no more wrapping). Conversely,
            // if the box is made narrower, the height starts to increase due to wrapping.
            //
            // Imposing a minWidth constraint would increase the width. This may decrease
            // the height. If the box is shrinkWrap, however, the width will already be
            // such that there is no wrapping, so the height will not further decrease.
            // Since the height will also not increase if we widen the box, there is no
            // problem simultaneously imposing a minHeight or maxHeight constraint.
            //
            // When we impose as maxWidth constraint, however, we are shrinking the box
            // which may increase the height. If we are imposing a maxHeight constraint,
            // that is fine because a further increased height will still need to be
            // constrained. But if we are imposing a minHeight constraint, we cannot know
            // whether the increase in height due to wrapping will be greater than the
            // minHeight. If we impose a minHeight constraint at the same time, then, we
            // could easily be locking in the wrong height.
            //
            // It is important to note that this logic applies to simultaneously *adding*
            // both a maxWidth and a minHeight constraint. It is perfectly fine to have
            // a state with both constraints, but we cannot add them both at once.
            newHeightModel = options.heightModel;
            newWidthModel = options.widthModel;
            if (newWidthModel && newHeightModel && oldWidthModel && oldHeightModel) {
                if (oldWidthModel.shrinkWrap && oldHeightModel.shrinkWrap) {
                    if (newWidthModel.constrainedMax && newHeightModel.constrainedMin) {
                        newHeightModel = null;
                    }
                }
            }

            // Apply size model updates (if any) and state updates (if any).
            if (newWidthModel) {
                me.widthModel = newWidthModel;
            }
            if (newHeightModel) {
                me.heightModel = newHeightModel;
            }

            if (options.state) {
                Ext.apply(me.state, options.state);
            }
        }

        return ret;
    },

    /**
     * @private
     */
    initContinue: function (full) {
        var me = this,
            ownerCtContext = me.ownerCtContext,
            widthModel = me.widthModel,
            boxParent;

        if (full) {
            if (ownerCtContext && widthModel.shrinkWrap) {
                boxParent = ownerCtContext.isBoxParent ? ownerCtContext : ownerCtContext.boxParent;
                if (boxParent) {
                    boxParent.addBoxChild(me);
                }
            } else if (widthModel.natural) {
                me.boxParent = ownerCtContext;
            }
        }

        return full;
    },

    /**
     * @private
     */
    initDone: function (full, componentChildrenDone, containerChildrenDone, containerLayoutDone) {
        var me = this,
            props = me.props,
            state = me.state;

        // These properties are only set when they are true:
        if (componentChildrenDone) {
            props.componentChildrenDone = true;
        }
        if (containerChildrenDone) {
            props.containerChildrenDone = true;
        }
        if (containerLayoutDone) {
            props.containerLayoutDone = true;
        }

        if (me.boxChildren && me.boxChildren.length && me.widthModel.shrinkWrap) {
            // set a very large width to allow the children to measure their natural
            // widths (this is cleared once all children have been measured):
            me.el.setWidth(10000);

            // don't run layouts for this component until we clear this width...
            state.blocks = (state.blocks || 0) + 1;
        }
    },

    /**
     * @private
     */
    initAnimation: function() {
        var me = this,
            target = me.target,
            ownerCtContext = me.ownerCtContext;

        if (ownerCtContext && ownerCtContext.isTopLevel) {
            // See which properties we are supposed to animate to their new state.
            // If there are any, queue ourself to be animated by the owning Context
            me.animatePolicy = target.ownerLayout.getAnimatePolicy(me);
        } else if (!ownerCtContext && target.isCollapsingOrExpanding && target.animCollapse) {
            // Collapsing/expnding a top level Panel with animation. We need to fabricate
            // an animatePolicy depending on which dimension the collapse is using,
            // isCollapsingOrExpanding is set during the collapse/expand process.
            me.animatePolicy = target.componentLayout.getAnimatePolicy(me);
        }

        if (me.animatePolicy) {
            me.context.queueAnimation(me);
        }
    },

    noFraming: { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 },

    /**
     * Queue the addition of a class name (or array of class names) to this ContextItem's target when next flushed.
     */
    addCls: function(newCls) {
        this.getClassList().addMany(newCls);
    },

    /**
     * Queue the removal of a class name (or array of class names) from this ContextItem's target when next flushed.
     */
    removeCls: function(removeCls) {
        this.getClassList().removeMany(removeCls);
    },

    /**
     * Adds a block.
     * 
     * @param {String} name The name of the block list ('blocks' or 'domBlocks').
     * @param {Ext.layout.Layout} layout The layout that is blocked.
     * @param {String} propName The property name that blocked the layout (e.g., 'width').
     * @private
     */
    addBlock: function (name, layout, propName) {
        var me = this,
            collection = me[name] || (me[name] = {}),
            blockedLayouts = collection[propName] || (collection[propName] = {});

        if (!blockedLayouts[layout.id]) {
            blockedLayouts[layout.id] = layout;
            ++layout.blockCount;
            ++me.context.blockCount;
        }
    },

    addBoxChild: function (boxChildItem) {
        var me = this,
            children,
            widthModel = boxChildItem.widthModel;

        boxChildItem.boxParent = this;

        // Children that are widthModel.auto (regardless of heightModel) that measure the
        // DOM (by virtue of hasRawContent), need to wait for their "box parent" to be sized.
        // If they measure too early, they will be wrong results. In the widthModel.shrinkWrap
        // case, the boxParent "crushes" the child. In the case of widthModel.natural, the
        // boxParent's width is likely a key part of the child's width (e.g., "50%" or just
        // normal block-level behavior of 100% width)
        boxChildItem.measuresBox = widthModel.shrinkWrap ? boxChildItem.hasRawContent : widthModel.natural;

        if (boxChildItem.measuresBox) {
            children = me.boxChildren;

            if (children) {
                children.push(boxChildItem);
            } else {
                me.boxChildren = [ boxChildItem ];
            }
        }
    },

    /**
     * Adds a trigger.
     * 
     * @param {String} propName The property name that triggers the layout (e.g., 'width').
     * @param {Boolean} inDom True if the trigger list is `domTriggers`, false if `triggers`.
     * @private
     */
    addTrigger: function (propName, inDom) {
        var me = this,
            name = inDom ? 'domTriggers' : 'triggers',
            collection = me[name] || (me[name] = {}),
            context = me.context,
            layout = context.currentLayout,
            triggers = collection[propName] || (collection[propName] = {});

        if (!triggers[layout.id]) {
            triggers[layout.id] = layout;
            ++layout.triggerCount;

            triggers = context.triggers[inDom ? 'dom' : 'data'];
            (triggers[layout.id] || (triggers[layout.id] = [])).push({
                item: this,
                prop: propName
            });

            if (me.props[propName] !== undefined) {
                if (!inDom || !(me.dirty && (propName in me.dirty))) {
                    ++layout.firedTriggers;
                }
            }
        }
    },

    boxChildMeasured: function () {
        var me = this,
            state = me.state,
            count = (state.boxesMeasured = (state.boxesMeasured || 0) + 1);

        if (count == me.boxChildren.length) {
            // all of our children have measured themselves, so we can clear the width
            // and resume layouts for this component...
            state.clearBoxWidth = 1;
            ++me.context.progressCount;
            me.markDirty();
        }
    },

    borderNames: [ 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'],
    marginNames: [ 'margin-top', 'margin-right', 'margin-bottom', 'margin-left' ],
    paddingNames: [ 'padding-top', 'padding-right', 'padding-bottom', 'padding-left' ],
    trblNames: [ 'top', 'right', 'bottom', 'left' ],

    cacheMissHandlers: {
        borderInfo: function (me) {
            var info = me.getStyles(me.borderNames, me.trblNames);

            info.width = info.left + info.right;
            info.height = info.top + info.bottom;

            return info;
        },

        marginInfo: function (me) {
            var info = me.getStyles(me.marginNames, me.trblNames);

            info.width = info.left + info.right;
            info.height = info.top + info.bottom;

            return info;
        },

        paddingInfo: function (me) {
            // if this context item's target is a framed component the padding is on the frameBody, not on the main el
            var item = me.frameBodyContext || me,
                info = item.getStyles(me.paddingNames, me.trblNames);

            info.width = info.left + info.right;
            info.height = info.top + info.bottom;

            return info;
        }
    },

    checkCache: function (entry) {
        return this.cacheMissHandlers[entry](this);
    },

    clearAllBlocks: function (name) {
        var collection = this[name],
            propName;

        if (collection) {
            for (propName in collection) {
                this.clearBlocks(name, propName);
            }
        }
    },

    /**
     * Removes any blocks on a property in the specified set. Any layouts that were blocked
     * by this property and are not still blocked (by other properties) will be rescheduled.
     * 
     * @param {String} name The name of the block list ('blocks' or 'domBlocks').
     * @param {String} propName The property name that blocked the layout (e.g., 'width').
     * @private
     */
    clearBlocks: function (name, propName) {
        var collection = this[name],
            blockedLayouts = collection && collection[propName],
            context, layout, layoutId;

        if (blockedLayouts) {
            delete collection[propName];

            context = this.context;

            for (layoutId in blockedLayouts) {
                layout = blockedLayouts[layoutId];

                --context.blockCount;
                if (! --layout.blockCount && !layout.pending && !layout.done) {
                    context.queueLayout(layout);
                }
            }
        }
    },

    /**
     * Registers a layout in the block list for the given property. Once the property is
     * set in the {@link Ext.layout.Context}, the layout is unblocked.
     * 
     * @param {Ext.layout.Layout} layout
     * @param {String} propName The property name that blocked the layout (e.g., 'width').
     */
    block: function (layout, propName) {
        this.addBlock('blocks', layout, propName);
    },

    /**
     * Registers a layout in the DOM block list for the given property. Once the property
     * flushed to the DOM by the {@link Ext.layout.Context}, the layout is unblocked.
     * 
     * @param {Ext.layout.Layout} layout
     * @param {String} propName The property name that blocked the layout (e.g., 'width').
     */
    domBlock: function (layout, propName) {
        this.addBlock('domBlocks', layout, propName);
    },

    /**
     * Reschedules any layouts associated with a given trigger.
     * 
     * @param {String} name The name of the trigger list ('triggers' or 'domTriggers').
     * @param {String} propName The property name that triggers the layout (e.g., 'width').
     * @private
     */
    fireTriggers: function (name, propName) {
        var collection = this[name],
            triggers = collection && collection[propName],
            context = this.context,
            layout, layoutId;

        if (triggers) {
            for (layoutId in triggers) {
                layout = triggers[layoutId];
                ++layout.firedTriggers;
                if (!layout.done && !layout.blockCount && !layout.pending) {
                    context.queueLayout(layout);
                }
            }
        }
    },

    /**
     * Flushes any updates in the dirty collection to the DOM. This is only called if there
     * are dirty entries because this object is only added to the flushQueue of the
     * {@link Ext.layout.Context} when entries become dirty.
     */
    flush: function () {
        var me = this,
            dirty = me.dirty,
            state = me.state,
            targetEl = me.el;

        me.dirtyCount = 0;

        // Flush added/removed classes
        if (me.classList && me.classList.dirty) {
            me.classList.flush();
        }

        // Set any queued DOM attributes
        if ('attributes' in me) {
            targetEl.set(me.attributes);
            delete me.attributes;
        }

        // Set any queued DOM HTML content
        if ('innerHTML' in me) {
            targetEl.innerHTML = me.innerHTML;
            delete me.innerHTML;
        }

        if (state && state.clearBoxWidth) {
            state.clearBoxWidth = 0;
            me.el.setStyle('width', null);

            if (! --state.blocks) {
                me.context.queueItemLayouts(me);
            }
        }

        if (dirty) {
            delete me.dirty;
            me.writeProps(dirty, true);
        }
    },

    /**
     * @private
     */
    flushAnimations: function() {
        var me = this,
            animateFrom = me.lastBox,
            target, targetAnim, duration, animateProps, anim,
            changeCount, j, propsLen, propName, oldValue, newValue;

        // Only animate if the Component has been previously layed out: first layout should not animate
        if (animateFrom) {
            target = me.target;
            targetAnim = target.layout && target.layout.animate;
            if (targetAnim) {
                duration = Ext.isNumber(targetAnim) ? targetAnim : targetAnim.duration;
            }
            animateProps = Ext.Object.getKeys(me.animatePolicy);

            // Create an animation block using the targetAnim configuration to provide defaults.
            // They may want custom duration, or easing, or listeners.
            anim = Ext.apply({}, {
                from: {},
                to: {},
                duration: duration || Ext.fx.Anim.prototype.duration
            }, targetAnim);

            for (changeCount = 0, j = 0, propsLen = animateProps.length; j < propsLen; j++) {
                propName = animateProps[j];
                oldValue = animateFrom[propName];
                newValue = me.peek(propName);
                if (oldValue != newValue) {
                    propName = me.translateProps[propName]||propName;
                    anim.from[propName] = oldValue;
                    anim.to[propName] = newValue;
                    ++changeCount;
                }
            }

            // If any values have changed, kick off animation from the cached old values to the new values
            if (changeCount) {
                // It'a Panel being collapsed. rollback, and then fix the class name string
                if (me.isCollapsingOrExpanding === 1) {
                    target.componentLayout.undoLayout(me);
                }

                // Otherwise, undo just the animated properties so the animation can proceed from the old layout.
                else {
                    me.writeProps(anim.from);
                }
                me.el.animate(anim);
                
                Ext.fx.Manager.getFxQueue(me.el.id)[0].on({
                    afteranimate: function() {
                        if (me.isCollapsingOrExpanding === 1) {
                            target.componentLayout.redoLayout(me);
                            target.afterCollapse(true);
                        } else if (me.isCollapsingOrExpanding === 2) {
                            target.afterExpand(true);
                        }
                    }
                });
            }
        }
    },

    /**
     * Gets the border information for the element as an object with left, top, right and
     * bottom properties holding border size in pixels. This object is only read from the
     * DOM on first request and is cached.
     * @return {Object}
     */
    getBorderInfo: function () {
        var me = this,
            info = me.borderInfo;

        if (!info) {
            me.borderInfo = info = me.checkCache('borderInfo');
        }

        return info;
    },

    /**
     * Returns a ClassList-like object to buffer access to this item's element's classes.
     */
    getClassList: function () {
        return this.classList || (this.classList = new Ext.layout.ClassList(this));
    },

    /**
     * Returns the context item for an owned element. This should only be called on a
     * component's item. The list of child items is used to manage invalidating calculated
     * results.
     */
    getEl: function (nameOrEl, owner) {
        var me = this,
            src, el, elContext;

        if (nameOrEl) {
            if (nameOrEl.dom) {
                el = nameOrEl;
            } else {
                src = me.target;
                if (owner) {
                    src = owner;
                }

                el = src[nameOrEl];
                if (typeof el == 'function') { // ex 'getTarget'
                    el = el.call(src);
                    if (el === me.el) {
                        return this; // comp.getTarget() often returns comp.el
                    }
                }
            }

            if (el) {
                elContext = me.context.getEl(me, el);
            }
        }

        return elContext || null;
    },

    getFraming: function () {
        var me = this;
        if (!me.framingInfo) {
            me.framingInfo = me.target.frameSize || me.noFraming;
        }
        return me.framingInfo;
    },

    /**
     * Gets the "frame" information for the element as an object with left, top, right and
     * bottom properties holding border+framing size in pixels. This object is calculated
     * on first request and is cached.
     * @return {Object}
     */
    getFrameInfo: function () {
        var me = this,
            info = me.frameInfo,
            frame, border;

        if (!info) {
            frame = me.getFraming();
            border = me.getBorderInfo();
            
            me.frameInfo = info = {
                top   : frame.top    + border.top,
                right : frame.right  + border.right,
                bottom: frame.bottom + border.bottom,
                left  : frame.left   + border.left,
                width : frame.width  + border.width,
                height: frame.height + border.height
            };
        }

        return info;
    },

    /**
     * Gets the margin information for the element as an object with left, top, right and
     * bottom properties holding margin size in pixels. This object is only read from the
     * DOM on first request and is cached.
     * @return {Object}
     */
    getMarginInfo: function () {
        var me = this,
            info = me.marginInfo,
            comp, manageMargins, margins, ownerLayout, ownerLayoutId;

        if (!info) {
            if (!me.wrapsComponent) {
                info = me.checkCache('marginInfo');
            } else {
                comp = me.target;
                ownerLayout = comp.ownerLayout;
                ownerLayoutId = ownerLayout ? ownerLayout.id : null;
                manageMargins = ownerLayout && ownerLayout.manageMargins;

                // Option #1 for configuring margins on components is the "margin" config
                // property. When supplied, this config is written to the DOM during the
                // render process (see AbstractComponent#initStyles).
                //
                // Option #2 is available to some layouts (e.g., Box, Border, Fit) that
                // handle margin calculations themselves. These layouts support a "margins"
                // config property on their items and they have a "defaultMargins" config
                // property. These margin values are added to the "natural" margins read
                // from the DOM and 0's are written to the DOM after they are added.

                // To avoid having to do all this on every layout, we cache the results on
                // the component in the (private) "margin$" property. We identify the cache
                // results as belonging to the appropriate ownerLayout in case items are
                // moved around.

                info = comp.margin$;
                if (info && info.ownerId !== ownerLayoutId) {
                    // got one but from the wrong owner
                    info = null;

                    //  if (manageMargins) {
                    //      TODO: clear inline margins (the 0's we wrote last time)???
                    //  }
                }

                if (!info) { // if (no cache)
                    // CSS margins are only checked if there isn't a margin property on the component
                    info = me.parseMargins(comp.margin) || me.checkCache('marginInfo');

                    // Some layouts also support margins and defaultMargins, e.g. Fit, Border, Box
                    if (manageMargins) {
                        margins = me.parseMargins(comp.margins, ownerLayout.defaultMargins);

                        if (margins) { // if (using 'margins' and/or 'defaultMargins')
                            // margin and margins can both be present at the same time and must be combined
                            info = {
                                top:    info.top    + margins.top,
                                right:  info.right  + margins.right,
                                bottom: info.bottom + margins.bottom,
                                left:   info.left   + margins.left
                            };
                        }

                        me.setProp('margin-top', 0);
                        me.setProp('margin-right', 0);
                        me.setProp('margin-bottom', 0);
                        me.setProp('margin-left', 0);
                    }

                    // cache the layout margins and tag them with the layout id:
                    info.ownerId = ownerLayoutId;
                    comp.margin$ = info;
                }

                info.width  = info.left + info.right;
                info.height = info.top  + info.bottom;
            }

            me.marginInfo = info;
        }

        return info;
    },

    /**
     * clears the margin cache so that marginInfo get re-read from the dom on the next call to getMarginInfo()
     * This is needed in some special cases where the margins have changed since the last layout, making the cached
     * values invalid.  For example collapsed window headers have different margin than expanded ones.
     */
    clearMarginCache: function() {
        delete this.marginInfo;
        delete this.target.margin$;
    },

    /**
     * Gets the padding information for the element as an object with left, top, right and
     * bottom properties holding padding size in pixels. This object is only read from the
     * DOM on first request and is cached.
     * @return {Object}
     */
    getPaddingInfo: function () {
        var me = this,
            info = me.paddingInfo;

        if (!info) {
            me.paddingInfo = info = me.checkCache('paddingInfo');
        }

        return info;
    },

    /**
     * Gets a property of this object. Also tracks the current layout as dependent on this
     * property so that changes to it will trigger the layout to be recalculated.
     * @param {String} propName The property name that blocked the layout (e.g., 'width').
     * @return {Object} The property value or undefined if not yet set.
     */
    getProp: function (propName) {
        var me = this,
            result = me.props[propName];

        me.addTrigger(propName);
        return result;
    },

    /**
     * Gets a property of this object if it is correct in the DOM. Also tracks the current
     * layout as dependent on this property so that DOM writes of it will trigger the
     * layout to be recalculated.
     * @param {String} propName The property name (e.g., 'width').
     * @return {Object} The property value or undefined if not yet set or is dirty.
     */
    getDomProp: function (propName) {
        var me = this,
            result = (me.dirty && (propName in me.dirty)) ? undefined : me.props[propName];

        me.addTrigger(propName, true);
        return result;
    },

    /**
     * Returns a style for this item. Each style is read from the DOM only once on first
     * request and is then cached. If the value is an integer, it is parsed automatically
     * (so '5px' is not returned, but rather 5).
     *
     * @param {String} styleName The CSS style name.
     * @return {Object} The value of the DOM style (parsed as necessary).
     */
    getStyle: function (styleName) {
        var me = this,
            styles = me.styles,
            info, value;

        if (styleName in styles) {
            value = styles[styleName];
        } else {
            info = me.styleInfo[styleName];
            value = me.el.getStyle(styleName);

            if (info && info.parseInt) {
                value = parseInt(value, 10) || 0;
            }

            styles[styleName] = value;
        }

        return value;
    },

    /**
     * Returns styles for this item. Each style is read from the DOM only once on first
     * request and is then cached. If the value is an integer, it is parsed automatically
     * (so '5px' is not returned, but rather 5).
     *
     * @param {String[]} styleNames The CSS style names.
     * @param {String[]} [altNames] The alternate names for the returned styles. If given,
     * these names must correspond one-for-one to the `styleNames`.
     * @return {Object} The values of the DOM styles (parsed as necessary).
     */
    getStyles: function (styleNames, altNames) {
        var me = this,
            styleCache = me.styles,
            values = {},
            hits = 0,
            n = styleNames.length,
            i, missing, missingAltNames, name, info, styleInfo, styles, value;

        altNames = altNames || styleNames;

        // We are optimizing this for all hits or all misses. If we hit on all styles, we
        // don't create a missing[]. If we miss on all styles, we also don't create one.
        for (i = 0; i < n; ++i) {
            name = styleNames[i];

            if (name in styleCache) {
                values[altNames[i]] = styleCache[name];
                ++hits;

                if (i && hits==1) { // if (first hit was after some misses)
                    missing = styleNames.slice(0, i);
                    missingAltNames = altNames.slice(0, i);
                }
            } else if (hits) {
                (missing || (missing = [])).push(name);
                (missingAltNames || (missingAltNames = [])).push(altNames[i]);
            }
        }

        if (hits < n) {
            missing = missing || styleNames;
            missingAltNames = missingAltNames || altNames;
            styleInfo = me.styleInfo;

            styles = me.el.getStyle(missing);

            for (i = missing.length; i--; ) {
                name = missing[i];
                info = styleInfo[name];
                value = styles[name];

                if (info && info.parseInt) {
                    value = parseInt(value, 10) || 0;
                }

                values[missingAltNames[i]] = value;
                styleCache[name] = value;
            }
        }

        return values;
    },

    /**
     * Returns true if the given property has been set. This is equivalent to calling
     * {@link #getProp} and not getting an undefined result. In particular, this call
     * registers the current layout to be triggered by changes to this property.
     * 
     * @param {String} propName The property name (e.g., 'width').
     * @return {Boolean}
     */
    hasProp: function (propName) {
        var value = this.getProp(propName);
        return typeof value != 'undefined';
    },

    /**
     * Returns true if the given property is correct in the DOM. This is equivalent to
     * calling {@link #getDomProp} and not getting an undefined result. In particular,
     * this call registers the current layout to be triggered by flushes of this property.
     * 
     * @param {String} propName The property name (e.g., 'width').
     * @return {Boolean}
     */
    hasDomProp: function (propName) {
        var value = this.getDomProp(propName);
        return typeof value != 'undefined';
    },

    /**
     * Invalidates the component associated with this item. The layouts for this component
     * and all of its contained items will be re-run after first clearing any computed
     * values.
     * 
     * If state needs to be carried forward beyond the invalidation, the `options` parameter
     * can be used.
     *
     * @param {Object} options An object describing how to handle the invalidation.
     * @param {Object} options.state An object to {@link Ext#apply} to the {@link #state}
     *  of this item after invalidation clears all other properties.
     * @param {Function} options.before A function to call after the context data is cleared
     * and before the {@link Ext.layout.Layout#beginLayoutCycle} methods are called.
     * @param {Ext.layout.ContextItem} options.before.item This ContextItem.
     * @param {Object} options.before.options The options object passed to {@link #invalidate}.
     * @param {Function} options.after A function to call after the context data is cleared
     * and after the {@link Ext.layout.Layout#beginLayoutCycle} methods are called.
     * @param {Ext.layout.ContextItem} options.after.item This ContextItem.
     * @param {Object} options.after.options The options object passed to {@link #invalidate}.
     * @param {Object} options.scope The scope to use when calling the callback functions.
     */
    invalidate: function (options) {
        this.context.queueInvalidate(this, options);
    },

    markDirty: function () {
        if (++this.dirtyCount == 1) {
            // our first dirty property... queue us for flush
            this.context.queueFlush(this);
        }
    },

    onBoxMeasured: function () {
        var boxParent = this.boxParent,
            state = this.state;

        if (boxParent && boxParent.widthModel.shrinkWrap && !state.boxMeasured && this.measuresBox) {
            // since an autoWidth boxParent is holding a width on itself to allow each
            // child to measure
            state.boxMeasured = 1; // best to only call once per child
            boxParent.boxChildMeasured();
        }
    },

    parseMargins: function (margins, defaultMargins) {
        if (margins === true) {
            margins = 5;
        }

        var type = typeof margins,
            ret;

        if (type == 'string' || type == 'number') {
            ret = Ext.util.Format.parseBox(margins);
        } else if (margins || defaultMargins) {
            ret = { top: 0, right: 0, bottom: 0, left: 0 }; // base defaults

            if (defaultMargins) {
                Ext.apply(ret, this.parseMargins(defaultMargins)); // + layout defaults
            }

            Ext.apply(ret, margins); // + config
        }

        return ret;
    },

    peek: function (propName) {
        return this.props[propName];
    },

    /**
     * Recovers a property value from the last computation and restores its value and
     * dirty state.
     * 
     * @param {String} propName The name of the property to recover.
     * @param {Object} oldProps The old "props" object from which to recover values.
     * @param {Object} oldDirty The old "dirty" object from which to recover state.
     */
    recoverProp: function (propName, oldProps, oldDirty) {
        var me = this,
            props = me.props,
            dirty;

        if (propName in oldProps) {
            props[propName] = oldProps[propName];

            if (oldDirty && propName in oldDirty) {
                dirty = me.dirty || (me.dirty = {});
                dirty[propName] = oldDirty[propName];
            }
        }
    },

    redo: function(deep) {
        var me = this,
            items, len, i;

        me.revertProps(me.props);

        if (deep && me.wrapsComponent) {
            // Rollback the state of child Components
            if (me.childItems) {
                for (i = 0, items = me.childItems, len = items.length; i < len; i++) {
                    items[i].redo(deep);
                }
            }

            // Rollback the state of child Elements
            for (i = 0, items = me.children, len = items.length; i < len; i++) {
                items[i].redo();
            }
        }
    },

    revertProps: function (props) {
        var name,
            flushed = this.flushedProps,
            reverted = {};

        for (name in props) {
            if (flushed.hasOwnProperty(name)) {
                reverted[name] = props[name];
            }
        }

        this.writeProps(reverted);
    },

    /**
     * Queue the setting of a DOM attribute on this ContextItem's target when next flushed.
     */
    setAttribute: function(name, value) {
        var me = this;
        if (!me.attributes) {
            me.attributes = {};
        }
        me.attributes[name] = value;
        me.markDirty();
    },

    setBox: function (box) {
        var me = this;

        if ('left' in box) {
            me.setProp('x', box.left);
        }
        if ('top' in box) {
            me.setProp('y', box.top);
        }

        // if sizeModel says we should not be setting these, the appropriate calls will be
        // null operations... otherwise, we must set these values, so what we have in box
        // is what we go with (undefined, NaN and no change are handled at a lower level):
        me.setSize(box.width, box.height);
    },

    /**
     * Sets the contentHeight property. If the component uses raw content, then only the
     * measured height is acceptable.
     *
     * Calculated values can sometimes be NaN or undefined, which generally mean the
     * calculation is not done. To indicate that such as value was passed, 0 is returned.
     * Otherwise, 1 is returned.
     *
     * If the caller is not measuring (i.e., they are calculating) and the component has raw
     * content, 1 is returned indicating that the caller is done.
     */
    setContentHeight: function (height, measured) {
        if (!measured && this.hasRawContent) {
            return 1;
        }

        return this.setProp('contentHeight', height);
    },

    /**
     * Sets the contentWidth property. If the component uses raw content, then only the
     * measured width is acceptable.
     * 
     * Calculated values can sometimes be NaN or undefined, which generally means that the
     * calculation is not done. To indicate that such as value was passed, 0 is returned.
     * Otherwise, 1 is returned.
     *
     * If the caller is not measuring (i.e., they are calculating) and the component has raw
     * content, 1 is returned indicating that the caller is done.
     */
    setContentWidth: function (width, measured) {
        if (!measured && this.hasRawContent) {
            return 1;
        }

        return this.setProp('contentWidth', width);
    },

    /**
     * Sets the contentWidth and contentHeight properties. If the component uses raw content,
     * then only the measured values are acceptable.
     * 
     * Calculated values can sometimes be NaN or undefined, which generally means that the
     * calculation is not done. To indicate that either passed value was such a value, false
     * returned. Otherwise, true is returned.
     *
     * If the caller is not measuring (i.e., they are calculating) and the component has raw
     * content, true is returned indicating that the caller is done.
     */
    setContentSize: function (width, height, measured) {
        return this.setContentWidth(width, measured) +
               this.setContentHeight(height, measured) == 2;
    },

    /**
     * Sets a property value. This will unblock and/or trigger dependent layouts if the
     * property value is being changed. Values of NaN and undefined are not accepted by
     * this method.
     * 
     * @param {String} propName The property name (e.g., 'width').
     * @param {Object} value The new value of the property.
     * @param {Boolean} dirty Optionally specifies if the value is currently in the DOM
     *  (default is `true` which indicates the value is not in the DOM and must be flushed
     *  at some point).
     * @return {Number} 1 if this call specified the property value, 0 if not.
     */
    setProp: function (propName, value, dirty) {
        var me = this,
            valueType = typeof value,
            borderBox, info;

        if (valueType == 'undefined' || (valueType === 'number' && isNaN(value))) {
            return 0;
        }
        if (me.props[propName] === value) {
            return 1;
        }

        me.props[propName] = value;
        ++me.context.progressCount;

        if (dirty === false) {
            // if the prop is equivalent to what is in the DOM (we won't be writing it),
            // we need to clear hard blocks (domBlocks) on that property.
            me.fireTriggers('domTriggers', propName);
            me.clearBlocks('domBlocks', propName);
        } else {
            info = me.styleInfo[propName];
            if (info) {
                if (!me.dirty) {
                    me.dirty = {};
                }

                if (propName == 'width' || propName == 'height') {
                    borderBox = me.isBorderBoxValue;
                    if (borderBox == null) {
                        me.isBorderBoxValue = borderBox = !!me.el.isBorderBox();
                    }

                    if (!borderBox) {
                        me.borderInfo || me.getBorderInfo();
                        me.paddingInfo || me.getPaddingInfo();
                    }
                }
                me.dirty[propName] = value;
                me.markDirty();
            }
        }

        // we always clear soft blocks on set
        me.fireTriggers('triggers', propName);
        me.clearBlocks('blocks', propName);
        return 1;
    },

    /**
     * Sets the height and constrains the height to min/maxHeight range.
     * 
     * @param {Number} height The height.
     * @param {Boolean} [dirty=true] Specifies if the value is currently in the DOM. A
     * value of `false` indicates that the value is already in the DOM.
     * @return {Number} The actual height after constraining.
     */
    setHeight: function (height, dirty /*, private {Boolean} force */) {
        var me = this,
            comp = me.target,
            frameBody, frameInfo, padding;

        if (height < 0) {
            height = 0;
        }
        if (!me.wrapsComponent) {
            if (!me.setProp('height', height, dirty)) {
                return NaN;
            }
        } else {
            height = Ext.Number.constrain(height, comp.minHeight || 0, comp.maxHeight);
            if (!me.setProp('height', height, dirty)) {
                return NaN;
            }

            frameBody = me.frameBodyContext;
            if (frameBody){
                frameInfo = me.getFrameInfo();
                frameBody.setHeight(height - frameInfo.height, dirty);
            }
        }

        return height;
    },

    /**
     * Sets the height and constrains the width to min/maxWidth range.
     * 
     * @param {Number} width The width.
     * @param {Boolean} [dirty=true] Specifies if the value is currently in the DOM. A
     * value of `false` indicates that the value is already in the DOM.
     * @return {Number} The actual width after constraining.
     */
    setWidth: function (width, dirty /*, private {Boolean} force */) {
        var me = this,
            comp = me.target,
            frameBody, frameInfo, padding;

        if (width < 0) {
            width = 0;
        }
        if (!me.wrapsComponent) {
            if (!me.setProp('width', width, dirty)) {
                return NaN;
            }
        } else {
            width = Ext.Number.constrain(width, comp.minWidth || 0, comp.maxWidth);
            if (!me.setProp('width', width, dirty)) {
                return NaN;
            }

            //if ((frameBody = me.target.frameBody) && (frameBody = me.getEl(frameBody))){
            frameBody = me.frameBodyContext;
            if (frameBody) {
                frameInfo = me.getFrameInfo();
                frameBody.setWidth(width - frameInfo.width, dirty);
            }

            /*if (owner.frameMC) {
                frameContext = ownerContext.frameContext ||
                        (ownerContext.frameContext = ownerContext.getEl('frameMC'));
                width += (frameContext.paddingInfo || frameContext.getPaddingInfo()).width;
            }*/
        }

        return width;
    },

    setSize: function (width, height, dirty) {
        this.setWidth(width, dirty);
        this.setHeight(height, dirty);
    },

    translateProps: {
        x: 'left',
        y: 'top'
    },

    undo: function(deep) {
        var me = this,
            items, len, i;

        me.revertProps(me.lastBox);

        if (deep && me.wrapsComponent) {
            // Rollback the state of child Components
            if (me.childItems) {
                for (i = 0, items = me.childItems, len = items.length; i < len; i++) {
                    items[i].undo(deep);
                }
            }

            // Rollback the state of child Elements
            for (i = 0, items = me.children, len = items.length; i < len; i++) {
                items[i].undo();
            }
        }
    },

    unsetProp: function (propName) {
        var dirty = this.dirty;

        delete this.props[propName];
        if (dirty) {
            delete dirty[propName];
        }
    },

    writeProps: function(dirtyProps, flushing) {
        if (!(dirtyProps && typeof dirtyProps == 'object')) {
            //<debug warn>
            Ext.Logger.warn('writeProps expected dirtyProps to be an object');
            //</debug>
            return;
        }

        var me = this,
            el = me.el,
            styles = {},
            styleCount = 0, // used as a boolean, the exact count doesn't matter
            styleInfo = me.styleInfo,
            
            info,
            propName,
            numericValue,
            
            dirtyX = 'x' in dirtyProps,
            dirtyY = 'y' in dirtyProps,
            x = dirtyProps.x,
            y = dirtyProps.y,
            
            width = dirtyProps.width,
            height = dirtyProps.height,
            isBorderBox = me.isBorderBoxValue,
            target = me.target,
            max = Math.max,
            paddingWidth = 0,
            paddingHeight = 0,
            hasWidth, hasHeight, isAbsolute, scrollbarSize, style, targetEl;

        // Process non-style properties:
        if ('displayed' in dirtyProps) {
            el.setDisplayed(dirtyProps.displayed);
        }

        // Unblock any hard blocks (domBlocks) and copy dom styles into 'styles'
        for (propName in dirtyProps) {
            if (flushing) {
                me.fireTriggers('domTriggers', propName);
                me.clearBlocks('domBlocks', propName);
                me.flushedProps[propName] = 1;
            }

            info = styleInfo[propName];
            if (info && info.dom) {
                // Numeric dirty values should have their associated suffix added
                if (info.suffix && (numericValue = parseInt(dirtyProps[propName], 10))) {
                    styles[propName] = numericValue + info.suffix;
                }
                // Non-numeric (eg "auto") go in unchanged.
                else {
                    styles[propName] = dirtyProps[propName];
                }
                ++styleCount;
            }
        }

        // convert x/y into setPosition (for a component) or left/top styles (for an el)
        if (dirtyX || dirtyY) {
            if (target.isComponent) {
                // Ensure we always pass the current coordinate in if one coordinate has not been dirtied by a calculation cycle.
                target.setPosition(x||me.props.x, y||me.props.y);
            } else {
                // we wrap an element, so convert x/y to styles:
                if (dirtyX) {
                    styles.left = x + 'px';
                    ++styleCount;
                }
                if (dirtyY) {
                    styles.top = y + 'px';
                    ++styleCount;
                }
            }
        }

        // Support for the content-box box model...
        if (!isBorderBox && (width > 0 || height > 0)) { // no need to subtract from 0
            // The width and height values assume the border-box box model,
            // so we must remove the padding & border to calculate the content-box.
            //<debug>
            if (!(me.borderInfo && me.paddingInfo)) {
                throw Error("Needed to have gotten the borderInfo and paddingInfo when the width or height was setProp'd");
            }
            //</debug>
            if(!me.frameBodyContext) {
                // Padding needs to be removed only if the element is not framed.
                paddingWidth = me.paddingInfo.width;
                paddingHeight = me.paddingInfo.height;
            }
            if (width) {
                width = max(parseInt(width, 10) - (me.borderInfo.width + paddingWidth), 0);
                styles.width = width + 'px';
                ++styleCount;
            }
            if (height) {
                height = max(parseInt(height, 10) - (me.borderInfo.height + paddingHeight), 0);
                styles.height = height + 'px';
                ++styleCount;
            }
        }

        // IE9 strict subtracts the scrollbar size from the element size when the element
        // is absolutely positioned and uses box-sizing: border-box. To workaround this
        // issue we have to add the the scrollbar size.
        // 
        // See http://social.msdn.microsoft.com/Forums/da-DK/iewebdevelopment/thread/47c5148f-a142-4a99-9542-5f230c78cb3b
        //
        if (me.wrapsComponent && Ext.isIE9 && Ext.isStrict) {
            // when we set a width and we have a vertical scrollbar (overflowY), we need
            // to add the scrollbar width... conversely for the height and overflowX
            if ((hasWidth = width !== undefined && me.hasOverflowY) ||
                (hasHeight = height !== undefined && me.hasOverflowX)) {
                // check that the component is absolute positioned and border-box:
                isAbsolute = me.isAbsolute;
                if (isAbsolute === undefined) {
                    isAbsolute = false;
                    targetEl = me.target.getTargetEl();
                    style = targetEl.getStyle('position');

                    if (style == 'absolute') {
                        style = targetEl.getStyle('box-sizing');
                        isAbsolute = (style == 'border-box');
                    }

                    me.isAbsolute = isAbsolute; // cache it
                }

                if (isAbsolute) {
                    scrollbarSize = Ext.getScrollbarSize();

                    if (hasWidth) {
                        width = parseInt(width, 10) + scrollbarSize.width;
                        styles.width = width + 'px';
                        ++styleCount;
                    }
                    if (hasHeight) {
                        height = parseInt(height, 10) + scrollbarSize.height;
                        styles.height = height + 'px';
                        ++styleCount;
                    }
                }
            }
        }

        // we make only one call to setStyle to allow it to optimize itself:
        if (styleCount) {
            el.setStyle(styles);
        }
    }
}, function () {
    
    var px =    { dom: true, parseInt: true, suffix: 'px' },
        isDom = { dom: true },
        faux =  { dom: false };

    // If a property exists in styleInfo, it participates in some way with the DOM. It may
    // be virtualized (like 'x' and y') and be indirect, but still requires a flush cycle
    // to reach the DOM. Properties (like 'contentWidth' and 'contentHeight') have no real
    // presence in the DOM and hence have no flush intanglements.
    // 
    // For simple styles, the object value on the right contains properties that help in
    // decoding values read by getStyle and preparing values to pass to setStyle.
    //
    this.prototype.styleInfo = {
        childrenDone:           faux,
        componentChildrenDone:  faux,
        containerChildrenDone:  faux,
        containerLayoutDone:    faux,
        displayed:              faux,
        done:                   faux,
        x:                      faux,
        y:                      faux,

        // For Ext.grid.ColumnLayout
        columnWidthsDone:       faux,

        left:                   px,
        top:                    px,
        right:                  px,
        bottom:                 px,
        width:                  px,
        height:                 px,

        'border-top-width':     px,
        'border-right-width':   px,
        'border-bottom-width':  px,
        'border-left-width':    px,

        'margin-top':           px,
        'margin-right':         px,
        'margin-bottom':        px,
        'margin-left':          px,

        'padding-top':          px,
        'padding-right':        px,
        'padding-bottom':       px,
        'padding-left':         px,

        'line-height':          isDom,
        display:                isDom
    };
});
