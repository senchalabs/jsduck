/**
 * A class that manages a group of {@link Ext.Component#floating} Components and provides z-order management,
 * and Component activation behavior, including masking below the active (topmost) Component.
 *
 * {@link Ext.Component#floating Floating} Components which are rendered directly into the document (such as
 * {@link Ext.window.Window Window}s) which are {@link Ext.Component#method-show show}n are managed by a
 * {@link Ext.WindowManager global instance}.
 *
 * {@link Ext.Component#floating Floating} Components which are descendants of {@link Ext.Component#floating floating}
 * *Containers* (for example a {@link Ext.view.BoundList BoundList} within an {@link Ext.window.Window Window},
 * or a {@link Ext.menu.Menu Menu}), are managed by a ZIndexManager owned by that floating Container. Therefore
 * ComboBox dropdowns within Windows will have managed z-indices guaranteed to be correct, relative to the Window.
 */
Ext.define('Ext.ZIndexManager', {
    alternateClassName: 'Ext.WindowGroup',

    statics: {
        zBase : 9000
    },

    constructor: function(container) {
        var me = this;

        me.list = {};
        me.zIndexStack = [];
        me.front = null;

        if (container) {

            // This is the ZIndexManager for an Ext.container.Container, base its zseed on the zIndex of the Container's element
            if (container.isContainer) {
                container.on('resize', me._onContainerResize, me);
                me.zseed = Ext.Number.from(me.rendered ? container.getEl().getStyle('zIndex') : undefined, me.getNextZSeed());
                // The containing element we will be dealing with (eg masking) is the content target
                me.targetEl = container.getTargetEl();
                me.container = container;
            }
            // This is the ZIndexManager for a DOM element
            else {
                Ext.EventManager.onWindowResize(me._onContainerResize, me);
                me.zseed = me.getNextZSeed();
                me.targetEl = Ext.get(container);
            }
        }
        // No container passed means we are the global WindowManager. Our target is the doc body.
        // DOM must be ready to collect that ref.
        else {
            Ext.EventManager.onWindowResize(me._onContainerResize, me);
            me.zseed = me.getNextZSeed();
            Ext.onDocumentReady(function() {
                me.targetEl = Ext.getBody();
            });
        }
    },

    getNextZSeed: function() {
        return (Ext.ZIndexManager.zBase += 10000);
    },

    setBase: function(baseZIndex) {
        this.zseed = baseZIndex;
        var result = this.assignZIndices();
        this._activateLast();
        return result;
    },

    // private
    assignZIndices: function() {
        var a = this.zIndexStack,
            len = a.length,
            i = 0,
            zIndex = this.zseed,
            comp;

        for (; i < len; i++) {
            comp = a[i];
            if (comp && !comp.hidden) {

                // Setting the zIndex of a Component returns the topmost zIndex consumed by
                // that Component.
                // If it's just a plain floating Component such as a BoundList, then the
                // return value is the passed value plus 10, ready for the next item.
                // If a floating *Container* has its zIndex set, it re-orders its managed
                // floating children, starting from that new base, and returns a value 10000 above
                // the highest zIndex which it allocates.
                zIndex = comp.setZIndex(zIndex);
            }
        }

        // Activate new topmost
        this._activateLast();
        return zIndex;
    },

    // private
    _setActiveChild: function(comp, oldFront) {
        var front = this.front;
        if (comp !== front) {

            if (front && !front.destroying) {
                front.setActive(false, comp);
            }
            this.front = comp;
            if (comp && comp != oldFront) {
                comp.setActive(true);
                if (comp.modal) {
                    this._showModalMask(comp);
                }
            }
        }
    },
    
    onComponentHide: function(comp){
        comp.setActive(false);
        this._activateLast();
    },

    // private
    _activateLast: function() {
        var me = this,
            stack = me.zIndexStack,
            i = stack.length - 1,
            oldFront = me.front,
            comp;

        // There may be no visible floater to activate
        me.front = undefined;

        // Go down through the z-index stack.
        // Activate the next visible one down.
        // If that was modal, then we're done
        for (; i >= 0 && stack[i].hidden; --i);
        if ((comp = stack[i])) {
            me._setActiveChild(comp, oldFront);
            if (comp.modal) {
                return;
            }
        }

        // If the new top one was not modal, keep going down to find the next visible
        // modal one to shift the modal mask down under
        for (; i >= 0; --i) {
            comp = stack[i];
            // If we find a visible modal further down the zIndex stack, move the mask to just under it.
            if (comp.isVisible() && comp.modal) {
                me._showModalMask(comp);
                return;
            }
        }

        // No visible modal Component was found in the run down the stack.
        // So hide the modal mask
        me._hideModalMask();
    },

    _showModalMask: function(comp) {
        var me = this,
            zIndex = comp.el.getStyle('zIndex') - 4,
            maskTarget = comp.floatParent ? comp.floatParent.getTargetEl() : comp.container,
            viewSize = maskTarget.getBox();

        if (maskTarget.dom === document.body) {
            viewSize.height = Math.max(document.body.scrollHeight, Ext.dom.Element.getDocumentHeight());
            viewSize.width = Math.max(document.body.scrollWidth, viewSize.width);
        }
        if (!me.mask) {
            me.mask = Ext.getBody().createChild({
                cls: Ext.baseCSSPrefix + 'mask'
            });
            me.mask.setVisibilityMode(Ext.Element.DISPLAY);
            me.mask.on('click', me._onMaskClick, me);
        }
        me.mask.maskTarget = maskTarget;
        maskTarget.addCls(Ext.baseCSSPrefix + 'body-masked');
        me.mask.setStyle('zIndex', zIndex);

        // setting mask box before showing it in an IE7 strict iframe within a quirks page
        // can cause body scrolling [EXTJSIV-6219]
        me.mask.show();
        me.mask.setBox(viewSize);
    },

    _hideModalMask: function() {
        var mask = this.mask;
        if (mask && mask.isVisible()) {
            mask.maskTarget.removeCls(Ext.baseCSSPrefix + 'body-masked');
            mask.maskTarget = undefined;
            mask.hide();
        }
    },

    _onMaskClick: function() {
        if (this.front) {
            this.front.focus();
        }
    },

    _onContainerResize: function() {
        var mask = this.mask,
            maskTarget,
            viewSize;

        if (mask && mask.isVisible()) {

            // At the new container size, the mask might be *causing* the scrollbar, so to find the valid
            // client size to mask, we must temporarily unmask the parent node.
            mask.hide();
            maskTarget = mask.maskTarget;

            if (maskTarget.dom === document.body) {
                viewSize = {
                    height: Math.max(document.body.scrollHeight, Ext.dom.Element.getDocumentHeight()),
                    width: Math.max(document.body.scrollWidth, document.documentElement.clientWidth)
                };
            } else {
                viewSize = maskTarget.getViewSize(true);
            }
            mask.setSize(viewSize);
            mask.show();
        }
    },

    /**
     * Registers a floating {@link Ext.Component} with this ZIndexManager. This should not
     * need to be called under normal circumstances. Floating Components (such as Windows,
     * BoundLists and Menus) are automatically registered with a
     * {@link Ext.Component#zIndexManager zIndexManager} at render time.
     *
     * Where this may be useful is moving Windows between two ZIndexManagers. For example,
     * to bring the Ext.MessageBox dialog under the same manager as the Desktop's
     * ZIndexManager in the desktop sample app:
     *
     *     MyDesktop.getDesktop().getManager().register(Ext.MessageBox);
     *
     * @param {Ext.Component} comp The Component to register.
     */
    register : function(comp) {
        var me = this;
        
        if (comp.zIndexManager) {
            comp.zIndexManager.unregister(comp);
        }
        comp.zIndexManager = me;

        me.list[comp.id] = comp;
        me.zIndexStack.push(comp);
        comp.on('hide', me.onComponentHide, me);
    },

    /**
     * Unregisters a {@link Ext.Component} from this ZIndexManager. This should not
     * need to be called. Components are automatically unregistered upon destruction.
     * See {@link #register}.
     * @param {Ext.Component} comp The Component to unregister.
     */
    unregister : function(comp) {
        var me = this,
            list = me.list;
        
        delete comp.zIndexManager;
        if (list && list[comp.id]) {
            delete list[comp.id];
            comp.un('hide', me.onComponentHide);
            Ext.Array.remove(me.zIndexStack, comp);

            // Destruction requires that the topmost visible floater be activated. Same as hiding.
            me._activateLast();
        }
    },

    /**
     * Gets a registered Component by id.
     * @param {String/Object} id The id of the Component or a {@link Ext.Component} instance
     * @return {Ext.Component}
     */
    get : function(id) {
        return id.isComponent ? id : this.list[id];
    },

   /**
     * Brings the specified Component to the front of any other active Components in this ZIndexManager.
     * @param {String/Object} comp The id of the Component or a {@link Ext.Component} instance
     * @return {Boolean} True if the dialog was brought to the front, else false
     * if it was already in front
     */
    bringToFront : function(comp) {
        var me = this,
            result = false,
            zIndexStack = me.zIndexStack;
        
        comp = me.get(comp);
        if (comp !== me.front) {
            Ext.Array.remove(zIndexStack, comp);
            if (comp.preventBringToFront) {
                // this takes care of cases where a load mask should be displayed under a floated component
                zIndexStack.unshift(comp);
            } else {
                // the default behavior is to push onto the stack
                zIndexStack.push(comp);
            }

            me.assignZIndices();
            result = true;
            this.front = comp;
        }
        if (result && comp.modal) {
            me._showModalMask(comp);
        }
        return result;
    },

    /**
     * Sends the specified Component to the back of other active Components in this ZIndexManager.
     * @param {String/Object} comp The id of the Component or a {@link Ext.Component} instance
     * @return {Ext.Component} The Component
     */
    sendToBack : function(comp) {
        var me = this;
        
        comp = me.get(comp);
        Ext.Array.remove(me.zIndexStack, comp);
        me.zIndexStack.unshift(comp);
        me.assignZIndices();
        this._activateLast();
        return comp;
    },

    /**
     * Hides all Components managed by this ZIndexManager.
     */
    hideAll : function() {
        var list = this.list,
            item,
            id;
            
        for (id in list) {
            if (list.hasOwnProperty(id)) {
                item = list[id];
                if (item.isComponent && item.isVisible()) {
                    item.hide();
                }
            }
        }
    },

    /**
     * @private
     * Temporarily hides all currently visible managed Components. This is for when
     * dragging a Window which may manage a set of floating descendants in its ZIndexManager;
     * they should all be hidden just for the duration of the drag.
     */
    hide: function() {
        var me = this,
            mask = me.mask,
            i = 0,
            stack = me.zIndexStack,
            len = stack.length,
            comp;

        me.tempHidden = me.tempHidden||[];
        for (; i < len; i++) {
            comp = stack[i];
            if (comp.isVisible()) {
                me.tempHidden.push(comp);
                comp.el.hide();
            }
        }
        
        // Also hide modal mask during hidden state
        if (mask) {
            mask.hide();
        }
    },

    /**
     * @private
     * Restores temporarily hidden managed Components to visibility.
     */
    show: function() {
        var me = this,
            mask = me.mask,
            i = 0,
            tempHidden = me.tempHidden,
            len = tempHidden ? tempHidden.length : 0,
            comp;

        for (; i < len; i++) {
            comp = tempHidden[i];
            comp.el.show();
            comp.setPosition(comp.x, comp.y);
        }
        me.tempHidden.length = 0;

        // Also restore mask to visibility and ensure it is aligned with its target element
        if (mask) {
            mask.show();
            mask.alignTo(mask.maskTarget, 'tl-tl');
        }
    },

    /**
     * Gets the currently-active Component in this ZIndexManager.
     * @return {Ext.Component} The active Component
     */
    getActive : function() {
        return this.front;
    },

    /**
     * Returns zero or more Components in this ZIndexManager using the custom search function passed to this method.
     * The function should accept a single {@link Ext.Component} reference as its only argument and should
     * return true if the Component matches the search criteria, otherwise it should return false.
     * @param {Function} fn The search function
     * @param {Object} [scope] The scope (this reference) in which the function is executed.
     * Defaults to the Component being tested. That gets passed to the function if not specified.
     * @return {Array} An array of zero or more matching windows
     */
    getBy : function(fn, scope) {
        var r = [],
            i = 0,
            stack = this.zIndexStack,
            len = stack.length,
            comp;

        for (; i < len; i++) {
            comp = stack[i];
            if (fn.call(scope||comp, comp) !== false) {
                r.push(comp);
            }
        }
        return r;
    },

    /**
     * Executes the specified function once for every Component in this ZIndexManager, passing each
     * Component as the only parameter. Returning false from the function will stop the iteration.
     * @param {Function} fn The function to execute for each item
     * @param {Object} [scope] The scope (this reference) in which the function
     * is executed. Defaults to the current Component in the iteration.
     */
    each : function(fn, scope) {
        var list = this.list,
            id,
            comp;
            
        for (id in list) {
            if (list.hasOwnProperty(id)) {
                comp = list[id];
                if (comp.isComponent && fn.call(scope || comp, comp) === false) {
                    return;
                }
            }
        }
    },

    /**
     * Executes the specified function once for every Component in this ZIndexManager, passing each
     * Component as the only parameter. Returning false from the function will stop the iteration.
     * The components are passed to the function starting at the bottom and proceeding to the top.
     * @param {Function} fn The function to execute for each item
     * @param {Object} scope (optional) The scope (this reference) in which the function
     * is executed. Defaults to the current Component in the iteration.
     */
    eachBottomUp: function (fn, scope) {
        var stack = this.zIndexStack,
            i = 0,
            len = stack.length,
            comp;

        for (; i < len; i++) {
            comp = stack[i];
            if (comp.isComponent && fn.call(scope || comp, comp) === false) {
                return;
            }
        }
    },

    /**
     * Executes the specified function once for every Component in this ZIndexManager, passing each
     * Component as the only parameter. Returning false from the function will stop the iteration.
     * The components are passed to the function starting at the top and proceeding to the bottom.
     * @param {Function} fn The function to execute for each item
     * @param {Object} [scope] The scope (this reference) in which the function
     * is executed. Defaults to the current Component in the iteration.
     */
    eachTopDown: function (fn, scope) {
        var stack = this.zIndexStack,
            i = stack.length,
            comp;

        for (; i-- > 0; ) {
            comp = stack[i];
            if (comp.isComponent && fn.call(scope || comp, comp) === false) {
                return;
            }
        }
    },

    destroy: function() {
        var me   = this,
            list = me.list,
            comp,
            id;

        for (id in list) {
            if (list.hasOwnProperty(id)) {
                comp = list[id];

                if (comp.isComponent) {
                    comp.destroy();
                }
            }
        }

        delete me.zIndexStack;
        delete me.list;
        delete me.container;
        delete me.targetEl;
    }
}, function() {
    /**
     * @class Ext.WindowManager
     * @extends Ext.ZIndexManager
     *
     * The default global floating Component group that is available automatically.
     *
     * This manages instances of floating Components which were rendered programatically without
     * being added to a {@link Ext.container.Container Container}, and for floating Components
     * which were added into non-floating Containers.
     * 
     * *Floating* Containers create their own instance of ZIndexManager, and floating Components
     * added at any depth below there are managed by that ZIndexManager.
     *
     * @singleton
     */
    Ext.WindowManager = Ext.WindowMgr = new this();
});
