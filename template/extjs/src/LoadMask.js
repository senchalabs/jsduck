/**
 * A modal, floating Component which may be shown above a specified {@link Ext.Component Component} while loading data.
 * When shown, the configured owning Component will be covered with a modality mask, and the LoadMask's {@link #msg} will be
 * displayed centered, accompanied by a spinner image.
 *
 * If the {@link #store} config option is specified, the masking will be automatically shown and then hidden synchronized with
 * the Store's loading process.
 *
 * Because this is a floating Component, its z-index will be managed by the global {@link Ext.WindowManager ZIndexManager}
 * object, and upon show, it will place itsef at the top of the hierarchy.
 *
 * Example usage:
 *
 *     // Basic mask:
 *     var myMask = new Ext.LoadMask(myPanel, {msg:"Please wait..."});
 *     myMask.show();
 */
Ext.define('Ext.LoadMask', {

    extend: 'Ext.Component',

    alias: 'widget.loadmask',

    /* Begin Definitions */

    mixins: {
        floating: 'Ext.util.Floating',
        bindable: 'Ext.util.Bindable'
    },

    uses: ['Ext.data.StoreManager'],

    /* End Definitions */

    /**
     * @cfg {Ext.data.Store} store
     * Optional Store to which the mask is bound. The mask is displayed when a load request is issued, and
     * hidden on either load success, or load fail.
     */

    //<locale>
    /**
     * @cfg {String} [msg="Loading..."]
     * The text to display in a centered loading message box.
     */
    msg : 'Loading...',
    //</locale>

    /**
     * @cfg {String} [msgCls="x-mask-loading"]
     * The CSS class to apply to the loading message element.
     */
    msgCls : Ext.baseCSSPrefix + 'mask-loading',

    /**
     * @cfg {String} [maskCls="x-mask"]
     * The CSS class to apply to the mask element
     */
    maskCls: Ext.baseCSSPrefix + 'mask',

    /**
     * @cfg {Boolean} [useMsg=true]
     * Whether or not to use a loading message class or simply mask the bound element.
     */
    useMsg: true,

    /**
     * @cfg {Boolean} [useTargetEl=false]
     * True to mask the {@link Ext.Component#getTargetEl targetEl} of the bound Component. By default,
     * the {@link Ext.Component#getEl el} will be masked.
     */
    useTargetEl: false,

    baseCls: Ext.baseCSSPrefix + 'mask-msg',

    childEls: [
        'msgEl'
    ],

    renderTpl: '<div id="{id}-msgEl" style="position:relative" class="{[values.$comp.msgCls]}"></div>',

    // Private. Obviously, it's floating.
    floating: {
        shadow: 'frame'
    },

    // Private. Masks are not focusable
    focusOnToFront: false,

    // When we put the load mask to the front of it's owner, we generally don't want to also bring the owning
    // component to the front.
    bringParentToFront: false,

    /**
     * Creates new LoadMask.
     * @param {Ext.Component} comp The Component you wish to mask. The the mask will be automatically sized
     * upon Component resize, and the message box will be kept centered.</p>
     * @param {Object} [config] The config object
     */
    constructor : function(comp, config) {
        var me = this;

        // Element support to be deprecated
        if (!comp.isComponent) {
            //<debug>
            if (Ext.isDefined(Ext.global.console)) {
                Ext.global.console.warn('Ext.LoadMask: LoadMask for elements has been deprecated, use Ext.dom.Element.mask & Ext.dom.Element.unmask');
            }
            //</debug>
            comp = Ext.get(comp);
            this.isElement = true;
        }

        me.ownerCt = comp;
        if (!this.isElement) {
            me.bindComponent(comp);
        }
        me.callParent([config]);

        if (me.store) {
            me.bindStore(me.store, true);
        }
    },

    bindComponent: function(comp){
        var me = this,
            listeners = {
                scope: this,
                resize: me.sizeMask,
                added: me.onComponentAdded,
                removed: me.onComponentRemoved
            },
            hierarchyEventSource = Ext.container.Container.hierarchyEventSource;
            
        if (comp.floating) {
            listeners.move = me.sizeMask;
            me.activeOwner = comp;
        } else if (comp.ownerCt) {
            me.onComponentAdded(comp.ownerCt);
        } else {
            // if the target comp is non-floating and under a floating comp don't bring the load mask to the front of the stack
            me.preventBringToFront = true;
        }

        me.mon(comp, listeners);
        
        // subscribe to the observer that manages the hierarchy
        me.mon(hierarchyEventSource, {
            show: me.onContainerShow,
            hide: me.onContainerHide,
            expand: me.onContainerExpand,
            collapse: me.onContainerCollapse,
            scope: me
        });
    },

    onComponentAdded: function(owner){
        var me = this;
        delete me.activeOwner;
        me.floatParent = owner;
        if (!owner.floating) {
            owner = owner.up('[floating]');
        }
        if (owner) {
            me.activeOwner = owner;
            me.mon(owner, 'move', me.sizeMask, me);
        }
        owner = me.floatParent.ownerCt;
        if (me.rendered && me.isVisible() && owner) {
            me.floatOwner = owner;
            me.mon(owner, 'afterlayout', me.sizeMask, me, {single: true});
        }
    },

    onComponentRemoved: function(owner){
        var me = this,
            activeOwner = me.activeOwner,
            floatOwner = me.floatOwner;

        if (activeOwner) {
            me.mun(activeOwner, 'move', me.sizeMask, me);
        }
        if (floatOwner) {
            me.mun(floatOwner, 'afterlayout', me.sizeMask, me);
        }
        delete me.activeOwner;
        delete me.floatOwner;
    },

    afterRender: function() {
        this.callParent(arguments);
        this.container = this.floatParent.getContentTarget();
    },

    onContainerShow: function(container){
        if (this.isActiveContainer(container)) {
            this.onComponentShow();
        }
    },

    onContainerHide: function(container){
        if (this.isActiveContainer(container)) {
            this.onComponentHide();
        }
    },

    onContainerExpand: function(container){
        if (this.isActiveContainer(container)) {
            this.onComponentShow();
        }
    },

    onContainerCollapse: function(container){
        if (this.isActiveContainer(container)) {
            this.onComponentHide();
        }
    },

    isActiveContainer: function(container){
        return this.isDescendantOf(container);
    },

    onComponentHide: function(){
        var me = this;

        if (me.rendered && me.isVisible()) {
            me.hide();
            me.showNext = true;
        }
    },

    onComponentShow: function(){
        if (this.showNext) {
            this.show();
        }
        delete this.showNext;
    },

    /**
     * @private
     * Called when this LoadMask's Component is resized. The toFront method rebases and resizes the modal mask.
     */
    sizeMask: function() {
        var me = this,
            target;

        if (me.rendered && me.isVisible()) {
            me.center();

            target = me.getMaskTarget();
            me.getMaskEl().show().setSize(target.getSize()).alignTo(target, 'tl-tl');

        }
    },

    /**
     * Changes the data store bound to this LoadMask.
     * @param {Ext.data.Store} store The store to bind to this LoadMask
     */
    bindStore : function(store, initial) {
        var me = this;
        me.mixins.bindable.bindStore.apply(me, arguments);
        store = me.store;
        if (store && store.isLoading()) {
            me.onBeforeLoad();
        }
    },

    getStoreListeners: function(){
        return {
            beforeload: this.onBeforeLoad,
            load: this.onLoad,
            exception: this.onLoad,

            // Fired when a range is requested for rendering that is not in the cache
            cachemiss: this.onBeforeLoad,

            // Fired when a range for rendering which was previously missing from the cache is loaded
            cachefilled: this.onLoad
        };
    },

    onDisable : function() {
        this.callParent(arguments);
        if (this.loading) {
            this.onLoad();
        }
    },

    getOwner: function(){
        return this.ownerCt || this.floatParent;
    },

    getMaskTarget: function(){
        var owner = this.getOwner();
        return this.useTargetEl ? owner.getTargetEl() : owner.getEl();
    },

    // private
    onBeforeLoad : function() {
        var me = this,
            owner = me.getOwner(),
            origin;

        if (!me.disabled) {
            me.loading = true;
            // If the owning Component has not been layed out, defer so that the ZIndexManager
            // gets to read its layed out size when sizing the modal mask
            if (owner.componentLayoutCounter) {
                me.maybeShow();
            } else {
                // The code below is a 'run-once' interceptor.
                origin = owner.afterComponentLayout;
                owner.afterComponentLayout = function() {
                    owner.afterComponentLayout = origin;
                    origin.apply(owner, arguments);
                    me.maybeShow();
                };
            }
        }
    },

    maybeShow: function(){
        var me = this,
            owner = me.getOwner();

        if (!owner.isVisible(true)) {
            me.showNext = true;
        }
        else if (me.loading && owner.rendered) {
            me.show();
        }
    },

    getMaskEl: function(){
        var me = this;
        return me.maskEl || (me.maskEl = me.el.insertSibling({
            cls: me.maskCls,
            style: {
                zIndex: me.el.getStyle('zIndex') - 2
            }
        }, 'before'));
    },

    onShow: function() {
        var me = this,
            msgEl = me.msgEl;

        me.callParent(arguments);
        me.loading = true;

        if (me.useMsg) {
            msgEl.show().update(me.msg);
        } else {
            msgEl.parent().hide();
        }
    },

    hide: function(){
        // Element support to be deprecated
        if (this.isElement) {
            this.ownerCt.unmask();
            this.fireEvent('hide', this);
            return;
        }
        delete this.showNext;
        return this.callParent(arguments);
    },

    onHide: function(){
        this.callParent();
        this.getMaskEl().hide();
    },

    show: function(){
        // Element support to be deprecated
        if (this.isElement) {
            this.ownerCt.mask(this.useMsg ? this.msg : '', this.msgCls);
            this.fireEvent('show', this);
            return;
        }
        return this.callParent(arguments);
    },

    afterShow: function() {
        this.callParent(arguments);
        this.sizeMask();
    },

    setZIndex: function(index) {
        var me = this,
            owner = me.activeOwner;
            
        if (owner) {
            // it seems silly to add 1 to have it subtracted in the call below,
            // but this allows the x-mask el to have the correct z-index (same as the component)
            // so instead of directly changing the zIndexStack just get the z-index of the owner comp
            index = parseInt(owner.el.getStyle('zIndex'), 10) + 1;
        }

        me.getMaskEl().setStyle('zIndex', index - 1);
        return me.mixins.floating.setZIndex.apply(me, arguments);
    },

    // private
    onLoad : function() {
        this.loading = false;
        this.hide();
    },

    onDestroy: function(){
        var me = this;

        if (me.isElement) {
            me.ownerCt.unmask();
        }

        Ext.destroy(me.maskEl);
        me.callParent();
    }
});
