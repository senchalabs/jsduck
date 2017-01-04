/**
 * A specialized tooltip class for tooltips that can be specified in markup and automatically managed
 * by the global {@link Ext.tip.QuickTipManager} instance.  See the QuickTipManager documentation for
 * additional usage details and examples.
 */
Ext.define('Ext.tip.QuickTip', {
    extend: 'Ext.tip.ToolTip',
    alias: 'widget.quicktip',
    alternateClassName: 'Ext.QuickTip',

    /**
     * @cfg {String/HTMLElement/Ext.Element} target
     * The target HTMLElement, Ext.Element or id to associate with this Quicktip.
     * 
     * Defaults to the document.
     */

    /**
     * @cfg {Boolean} interceptTitles
     * True to automatically use the element's DOM title value if available.
     */
    interceptTitles : false,

    // Force creation of header Component
    title: '&#160;',

    // private
    tagConfig : {
        namespace : "data-",
        attribute : "qtip",
        width : "qwidth",
        target : "target",
        title : "qtitle",
        hide : "hide",
        cls : "qclass",
        align : "qalign",
        anchor : "anchor"
    },

    // private
    initComponent : function(){
        var me = this;

        me.target = me.target || Ext.getDoc();
        me.targets = me.targets || {};
        me.callParent();
    },

    /**
     * Configures a new quick tip instance and assigns it to a target element.
     *
     * For example usage, see the {@link Ext.tip.QuickTipManager} class header.
     *
     * @param {Object} config The config object with the following properties:
     * @param config.autoHide
     * @param config.cls
     * @param config.dismissDelay overrides the singleton value
     * @param config.target required
     * @param config.text required
     * @param config.title
     * @param config.width
     */
    register : function(config){
        var configs = Ext.isArray(config) ? config : arguments,
            i = 0,
            len = configs.length,
            target, j, targetLen;

        for (; i < len; i++) {
            config = configs[i];
            target = config.target;
            if (target) {
                if (Ext.isArray(target)) {
                    for (j = 0, targetLen = target.length; j < targetLen; j++) {
                        this.targets[Ext.id(target[j])] = config;
                    }
                } else{
                    this.targets[Ext.id(target)] = config;
                }
            }
        }
    },

    /**
     * Removes this quick tip from its element and destroys it.
     * @param {String/HTMLElement/Ext.Element} el The element from which the quick tip
     * is to be removed or ID of the element.
     */
    unregister : function(el){
        delete this.targets[Ext.id(el)];
    },

    /**
     * Hides a visible tip or cancels an impending show for a particular element.
     * @param {String/HTMLElement/Ext.Element} el The element that is the target of
     * the tip or ID of the element.
     */
    cancelShow: function(el){
        var me = this,
            activeTarget = me.activeTarget;

        el = Ext.get(el).dom;
        if (me.isVisible()) {
            if (activeTarget && activeTarget.el == el) {
                me.hide();
            }
        } else if (activeTarget && activeTarget.el == el) {
            me.clearTimer('show');
        }
    },

    /**
     * @private
     * Reads the tip text from the closest node to the event target which contains the
     * attribute we are configured to look for. Returns an object containing the text
     * from the attribute, and the target element from which the text was read.
     */
    getTipCfg: function(e) {
        var t = e.getTarget(),
            titleText = t.title,
            cfg;

        if (this.interceptTitles && titleText && Ext.isString(titleText)) {
            t.qtip = titleText;
            t.removeAttribute("title");
            e.preventDefault();
            return {
                text: titleText
            };
        }
        else {
            cfg = this.tagConfig;
            t = e.getTarget('[' + cfg.namespace + cfg.attribute + ']');
            if (t) {
                return {
                    target: t,
                    text: t.getAttribute(cfg.namespace + cfg.attribute)
                };
            }
        }
    },

    // private
    onTargetOver : function(e){
        var me = this,
            target = e.getTarget(me.delegate),
            hasShowDelay,
            delay,
            elTarget,
            cfg,
            ns,
            tipConfig,
            autoHide,
            targets, targetEl, value, key;

        if (me.disabled) {
            return;
        }

        // TODO - this causes "e" to be recycled in IE6/7 (EXTJSIV-1608) so ToolTip#setTarget
        // was changed to include freezeEvent. The issue seems to be a nested 'resize' event
        // that smashed Ext.EventObject.
        me.targetXY = e.getXY();

        // If the over target was filtered out by the delegate selector, or is not an HTMLElement, or is the <html> or the <body>, then return
        if(!target || target.nodeType !== 1 || target == document.documentElement || target == document.body){
            return;
        }

        if (me.activeTarget && ((target == me.activeTarget.el) || Ext.fly(me.activeTarget.el).contains(target))) {
            me.clearTimer('hide');
            me.show();
            return;
        }

        if (target) {
            targets = me.targets;

            for (key in targets) {
                if (targets.hasOwnProperty(key)) {
                    value = targets[key];

                    targetEl = Ext.fly(value.target);
                    if (targetEl && (targetEl.dom === target || targetEl.contains(target))) {
                        elTarget = targetEl.dom;
                        break;
                    }
                }
            }

            if (elTarget) {
                me.activeTarget = me.targets[elTarget.id];
                me.activeTarget.el = target;
                me.anchor = me.activeTarget.anchor;
                if (me.anchor) {
                    me.anchorTarget = target;
                }
                hasShowDelay = Ext.isDefined(me.activeTarget.showDelay);
                if (hasShowDelay) {
                    delay = me.showDelay;
                    me.showDelay = me.activeTarget.showDelay;
                }
                me.delayShow();
                if (hasShowDelay) {
                    me.showDelay = delay;
                }
                return;
            }
        }

        // Should be a fly.
        elTarget = Ext.fly(target, '_quicktip-target');
        cfg = me.tagConfig;
        ns = cfg.namespace;
        tipConfig = me.getTipCfg(e);

        if (tipConfig) {

            // getTipCfg may look up the parentNode axis for a tip text attribute and will return the new target node.
            // Change our target element to match that from which the tip text attribute was read.
            if (tipConfig.target) {
                target = tipConfig.target;
                elTarget = Ext.fly(target, '_quicktip-target');
            }
            autoHide = elTarget.getAttribute(ns + cfg.hide);

            me.activeTarget = {
                el: target,
                text: tipConfig.text,
                width: +elTarget.getAttribute(ns + cfg.width) || null,
                autoHide: autoHide != "user" && autoHide !== 'false',
                title: elTarget.getAttribute(ns + cfg.title),
                cls: elTarget.getAttribute(ns + cfg.cls),
                align: elTarget.getAttribute(ns + cfg.align)

            };
            me.anchor = elTarget.getAttribute(ns + cfg.anchor);
            if (me.anchor) {
                me.anchorTarget = target;
            }
            hasShowDelay = Ext.isDefined(me.activeTarget.showDelay);
            if (hasShowDelay) {
                delay = me.showDelay;
                me.showDelay = me.activeTarget.showDelay;
            }
            me.delayShow();
            if (hasShowDelay) {
                me.showDelay = delay;
            }
        }
    },

    // private
    onTargetOut : function(e){
        var me = this,
            active = me.activeTarget,
            hasHideDelay,
            delay;

        // If moving within the current target, and it does not have a new tip, ignore the mouseout
        // EventObject.within is the only correct way to determine this.
        if (active && e.within(me.activeTarget.el) && !me.getTipCfg(e)) {
            return;
        }

        me.clearTimer('show');
        delete me.activeTarget;
        if (me.autoHide !== false) {
            hasHideDelay = active && Ext.isDefined(active.hideDelay);
            if (hasHideDelay) {
                delay = me.hideDelay;
                me.hideDelay = active.hideDelay;
            }
            me.delayHide();
            if (hasHideDelay) {
                me.hideDelay = delay;
            }
        }
    },

    // inherit docs
    showAt : function(xy){
        var me = this,
            target = me.activeTarget,
            cls;

        if (target) {
            if (!me.rendered) {
                me.render(Ext.getBody());
                me.activeTarget = target;
            }
            me.suspendLayouts();
            if (target.title) {
                me.setTitle(target.title);
                me.header.show();
            } else {
                me.header.hide();
            }
            me.update(target.text);
            me.autoHide = target.autoHide;
            me.dismissDelay = target.dismissDelay || me.dismissDelay;
            if (target.mouseOffset) {
                xy[0] += target.mouseOffset[0];
                xy[1] += target.mouseOffset[1];
            }

            cls = me.lastCls;
            if (cls) {
                me.removeCls(cls);
                delete me.lastCls;
            }

            cls = target.cls;
            if (cls) {
                me.addCls(cls);
                me.lastCls = cls;
            }

            me.setWidth(target.width);

            if (me.anchor) {
                me.constrainPosition = false;
            } else if (target.align) { // TODO: this doesn't seem to work consistently
                xy = me.el.getAlignToXY(target.el, target.align);
                me.constrainPosition = false;
            }else{
                me.constrainPosition = true;
            }
            me.resumeLayouts(true);
        }
        me.callParent([xy]);
    },

    // inherit docs
    hide: function(){
        delete this.activeTarget;
        this.callParent();
    }
});