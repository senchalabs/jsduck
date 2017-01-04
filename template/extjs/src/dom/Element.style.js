//@tag dom,core
//@require Ext.dom.Element-scroll
//@define Ext.dom.Element-style
//@define Ext.dom.Element

/**
 * @class Ext.dom.Element
 */
(function() {

var Element = Ext.dom.Element,
    view = document.defaultView,
    adjustDirect2DTableRe = /table-row|table-.*-group/,
    INTERNAL = '_internal',
    HIDDEN = 'hidden',
    HEIGHT = 'height',
    WIDTH = 'width',
    ISCLIPPED = 'isClipped',
    OVERFLOW = 'overflow',
    OVERFLOWX = 'overflow-x',
    OVERFLOWY = 'overflow-y',
    ORIGINALCLIP = 'originalClip',
    DOCORBODYRE = /#document|body/i,
    // This reduces the lookup of 'me.styleHooks' by one hop in the prototype chain. It is
    // the same object.
    styleHooks,
    edges, k, edge, borderWidth;

if (!view || !view.getComputedStyle) {
    Element.prototype.getStyle = function (property, inline) {
        var me = this,
            dom = me.dom,
            multiple = typeof property != 'string',
            hooks = me.styleHooks,
            prop = property,
            props = prop,
            len = 1,
            isInline = inline,
            camel, domStyle, values, hook, out, style, i;

        if (multiple) {
            values = {};
            prop = props[0];
            i = 0;
            if (!(len = props.length)) {
                return values;
            }
        }

        if (!dom || dom.documentElement) {
            return values || '';
        }

        domStyle = dom.style;

        if (inline) {
            style = domStyle;
        } else {
            style = dom.currentStyle;

            // fallback to inline style if rendering context not available
            if (!style) {
                isInline = true;
                style = domStyle;
            }
        }

        do {
            hook = hooks[prop];

            if (!hook) {
                hooks[prop] = hook = { name: Element.normalize(prop) };
            }

            if (hook.get) {
                out = hook.get(dom, me, isInline, style);
            } else {
                camel = hook.name;

                // In some cases, IE6 will throw Invalid Argument exceptions for properties
                // like fontSize (/examples/tabs/tabs.html in 4.0 used to exhibit this but
                // no longer does due to font style changes). There is a real cost to a try
                // block, so we avoid it where possible...
                if (hook.canThrow) {
                    try {
                        out = style[camel];
                    } catch (e) {
                        out = '';
                    }
                } else {
                    // EXTJSIV-5657 - In IE9 quirks mode there is a chance that VML root element 
                    // has neither `currentStyle` nor `style`. Return '' this case.
                    out = style ? style[camel] : '';
                }
            }

            if (!multiple) {
                return out;
            }

            values[prop] = out;
            prop = props[++i];
        } while (i < len);

        return values;
    };
}

Element.override({
    getHeight: function(contentHeight, preciseHeight) {
        var me = this,
            dom = me.dom,
            hidden = me.isStyle('display', 'none'),
            height,
            floating;

        if (hidden) {
            return 0;
        }

        height = Math.max(dom.offsetHeight, dom.clientHeight) || 0;

        // IE9 Direct2D dimension rounding bug
        if (Ext.supports.Direct2DBug) {
            floating = me.adjustDirect2DDimension(HEIGHT);
            if (preciseHeight) {
                height += floating;
            }
            else if (floating > 0 && floating < 0.5) {
                height++;
            }
        }

        if (contentHeight) {
            height -= me.getBorderWidth("tb") + me.getPadding("tb");
        }

        return (height < 0) ? 0 : height;
    },

    getWidth: function(contentWidth, preciseWidth) {
        var me = this,
            dom = me.dom,
            hidden = me.isStyle('display', 'none'),
            rect, width, floating;

        if (hidden) {
            return 0;
        }

        // Gecko will in some cases report an offsetWidth that is actually less than the width of the
        // text contents, because it measures fonts with sub-pixel precision but rounds the calculated
        // value down. Using getBoundingClientRect instead of offsetWidth allows us to get the precise
        // subpixel measurements so we can force them to always be rounded up. See
        // https://bugzilla.mozilla.org/show_bug.cgi?id=458617
        // Rounding up ensures that the width includes the full width of the text contents.
        if (Ext.supports.BoundingClientRect) {
            rect = dom.getBoundingClientRect();
            width = rect.right - rect.left;
            width = preciseWidth ? width : Math.ceil(width);
        } else {
            width = dom.offsetWidth;
        }

        width = Math.max(width, dom.clientWidth) || 0;

        // IE9 Direct2D dimension rounding bug
        if (Ext.supports.Direct2DBug) {
            // get the fractional portion of the sub-pixel precision width of the element's text contents
            floating = me.adjustDirect2DDimension(WIDTH);
            if (preciseWidth) {
                width += floating;
            }
            // IE9 also measures fonts with sub-pixel precision, but unlike Gecko, instead of rounding the offsetWidth down,
            // it rounds to the nearest integer. This means that in order to ensure that the width includes the full
            // width of the text contents we need to increment the width by 1 only if the fractional portion is less than 0.5
            else if (floating > 0 && floating < 0.5) {
                width++;
            }
        }

        if (contentWidth) {
            width -= me.getBorderWidth("lr") + me.getPadding("lr");
        }

        return (width < 0) ? 0 : width;
    },

    setWidth: function(width, animate) {
        var me = this;
        width = me.adjustWidth(width);
        if (!animate || !me.anim) {
            me.dom.style.width = me.addUnits(width);
        }
        else {
            if (!Ext.isObject(animate)) {
                animate = {};
            }
            me.animate(Ext.applyIf({
                to: {
                    width: width
                }
            }, animate));
        }
        return me;
    },

    setHeight : function(height, animate) {
        var me = this;

        height = me.adjustHeight(height);
        if (!animate || !me.anim) {
            me.dom.style.height = me.addUnits(height);
        }
        else {
            if (!Ext.isObject(animate)) {
                animate = {};
            }
            me.animate(Ext.applyIf({
                to: {
                    height: height
                }
            }, animate));
        }

        return me;
    },

    applyStyles: function(style) {
        Ext.DomHelper.applyStyles(this.dom, style);
        return this;
    },

    setSize: function(width, height, animate) {
        var me = this;

        if (Ext.isObject(width)) { // in case of object from getSize()
            animate = height;
            height = width.height;
            width = width.width;
        }

        width = me.adjustWidth(width);
        height = me.adjustHeight(height);

        if (!animate || !me.anim) {
            me.dom.style.width = me.addUnits(width);
            me.dom.style.height = me.addUnits(height);
        }
        else {
            if (animate === true) {
                animate = {};
            }
            me.animate(Ext.applyIf({
                to: {
                    width: width,
                    height: height
                }
            }, animate));
        }

        return me;
    },

    getViewSize : function() {
        var me = this,
            dom = me.dom,
            isDoc = DOCORBODYRE.test(dom.nodeName),
            ret;

        // If the body, use static methods
        if (isDoc) {
            ret = {
                width : Element.getViewWidth(),
                height : Element.getViewHeight()
            };
        } else {
            ret = {
                width : dom.clientWidth,
                height : dom.clientHeight
            };
        }

        return ret;
    },

    getSize: function(contentSize) {
        return {width: this.getWidth(contentSize), height: this.getHeight(contentSize)};
    },

    // TODO: Look at this

    // private  ==> used by Fx
    adjustWidth : function(width) {
        var me = this,
            isNum = (typeof width == 'number');

        if (isNum && me.autoBoxAdjust && !me.isBorderBox()) {
            width -= (me.getBorderWidth("lr") + me.getPadding("lr"));
        }
        return (isNum && width < 0) ? 0 : width;
    },

    // private   ==> used by Fx
    adjustHeight : function(height) {
        var me = this,
            isNum = (typeof height == "number");

        if (isNum && me.autoBoxAdjust && !me.isBorderBox()) {
            height -= (me.getBorderWidth("tb") + me.getPadding("tb"));
        }
        return (isNum && height < 0) ? 0 : height;
    },

    /**
     * Return the CSS color for the specified CSS attribute. rgb, 3 digit (like `#fff`) and valid values
     * are convert to standard 6 digit hex color.
     * @param {String} attr The css attribute
     * @param {String} defaultValue The default value to use when a valid color isn't found
     * @param {String} [prefix] defaults to #. Use an empty string when working with
     * color anims.
     */
    getColor : function(attr, defaultValue, prefix) {
        var v = this.getStyle(attr),
            color = prefix || prefix === '' ? prefix : '#',
            h, len, i=0;

        if (!v || (/transparent|inherit/.test(v))) {
            return defaultValue;
        }
        if (/^r/.test(v)) {
             v = v.slice(4, v.length - 1).split(',');
             len = v.length;
             for (; i<len; i++) {
                h = parseInt(v[i], 10);
                color += (h < 16 ? '0' : '') + h.toString(16);
            }
        } else {
            v = v.replace('#', '');
            color += v.length == 3 ? v.replace(/^(\w)(\w)(\w)$/, '$1$1$2$2$3$3') : v;
        }
        return(color.length > 5 ? color.toLowerCase() : defaultValue);
    },

    /**
     * Set the opacity of the element
     * @param {Number} opacity The new opacity. 0 = transparent, .5 = 50% visibile, 1 = fully visible, etc
     * @param {Boolean/Object} [animate] a standard Element animation config object or `true` for
     * the default animation (`{duration: 350, easing: 'easeIn'}`)
     * @return {Ext.dom.Element} this
     */
    setOpacity: function(opacity, animate) {
        var me = this;

        if (!me.dom) {
            return me;
        }

        if (!animate || !me.anim) {
            me.setStyle('opacity', opacity);
        }
        else {
            if (typeof animate != 'object') {
                animate = {
                    duration: 350,
                    easing: 'ease-in'
                };
            }

            me.animate(Ext.applyIf({
                to: {
                    opacity: opacity
                }
            }, animate));
        }
        return me;
    },

    /**
     * Clears any opacity settings from this element. Required in some cases for IE.
     * @return {Ext.dom.Element} this
     */
    clearOpacity : function() {
        return this.setOpacity('');
    },

    /**
     * @private
     * Returns 1 if the browser returns the subpixel dimension rounded to the lowest pixel.
     * @return {Number} 0 or 1
     */
    adjustDirect2DDimension: function(dimension) {
        var me = this,
            dom = me.dom,
            display = me.getStyle('display'),
            inlineDisplay = dom.style.display,
            inlinePosition = dom.style.position,
            originIndex = dimension === WIDTH ? 0 : 1,
            currentStyle = dom.currentStyle,
            floating;

        if (display === 'inline') {
            dom.style.display = 'inline-block';
        }

        dom.style.position = display.match(adjustDirect2DTableRe) ? 'absolute' : 'static';

        // floating will contain digits that appears after the decimal point
        // if height or width are set to auto we fallback to msTransformOrigin calculation
        
        // Use currentStyle here instead of getStyle. In some difficult to reproduce 
        // instances it resets the scrollWidth of the element
        floating = (parseFloat(currentStyle[dimension]) || parseFloat(currentStyle.msTransformOrigin.split(' ')[originIndex]) * 2) % 1;

        dom.style.position = inlinePosition;

        if (display === 'inline') {
            dom.style.display = inlineDisplay;
        }

        return floating;
    },

    /**
     * Store the current overflow setting and clip overflow on the element - use {@link #unclip} to remove
     * @return {Ext.dom.Element} this
     */
    clip : function() {
        var me = this,
            data = (me.$cache || me.getCache()).data,
            style;

        if (!data[ISCLIPPED]) {
            data[ISCLIPPED] = true;
            style = me.getStyle([OVERFLOW, OVERFLOWX, OVERFLOWY]);
            data[ORIGINALCLIP] = {
                o: style[OVERFLOW],
                x: style[OVERFLOWX],
                y: style[OVERFLOWY]
            };
            me.setStyle(OVERFLOW, HIDDEN);
            me.setStyle(OVERFLOWX, HIDDEN);
            me.setStyle(OVERFLOWY, HIDDEN);
        }
        return me;
    },

    /**
     * Return clipping (overflow) to original clipping before {@link #clip} was called
     * @return {Ext.dom.Element} this
     */
    unclip : function() {
        var me = this,
            data = (me.$cache || me.getCache()).data,
            clip;

        if (data[ISCLIPPED]) {
            data[ISCLIPPED] = false;
            clip = data[ORIGINALCLIP];
            if (clip.o) {
                me.setStyle(OVERFLOW, clip.o);
            }
            if (clip.x) {
                me.setStyle(OVERFLOWX, clip.x);
            }
            if (clip.y) {
                me.setStyle(OVERFLOWY, clip.y);
            }
        }
        return me;
    },

    /**
     * Wraps the specified element with a special 9 element markup/CSS block that renders by default as
     * a gray container with a gradient background, rounded corners and a 4-way shadow.
     *
     * This special markup is used throughout Ext when box wrapping elements ({@link Ext.button.Button},
     * {@link Ext.panel.Panel} when {@link Ext.panel.Panel#frame frame=true}, {@link Ext.window.Window}).
     * The markup is of this form:
     *
     *     Ext.dom.Element.boxMarkup =
     *     '<div class="{0}-tl"><div class="{0}-tr"><div class="{0}-tc"></div></div></div>
     *     <div class="{0}-ml"><div class="{0}-mr"><div class="{0}-mc"></div></div></div>
     *     <div class="{0}-bl"><div class="{0}-br"><div class="{0}-bc"></div></div></div>';
     *
     * Example usage:
     *
     *     // Basic box wrap
     *     Ext.get("foo").boxWrap();
     *
     *     // You can also add a custom class and use CSS inheritance rules to customize the box look.
     *     // 'x-box-blue' is a built-in alternative -- look at the related CSS definitions as an example
     *     // for how to create a custom box wrap style.
     *     Ext.get("foo").boxWrap().addCls("x-box-blue");
     *
     * @param {String} [class='x-box'] A base CSS class to apply to the containing wrapper element.
     * Note that there are a number of CSS rules that are dependent on this name to make the overall effect work,
     * so if you supply an alternate base class, make sure you also supply all of the necessary rules.
     * @return {Ext.dom.Element} The outermost wrapping element of the created box structure.
     */
    boxWrap : function(cls) {
        cls = cls || Ext.baseCSSPrefix + 'box';
        var el = Ext.get(this.insertHtml("beforeBegin", "<div class='" + cls + "'>" + Ext.String.format(Element.boxMarkup, cls) + "</div>"));
        Ext.DomQuery.selectNode('.' + cls + '-mc', el.dom).appendChild(this.dom);
        return el;
    },

    /**
     * Returns either the offsetHeight or the height of this element based on CSS height adjusted by padding or borders
     * when needed to simulate offsetHeight when offsets aren't available. This may not work on display:none elements
     * if a height has not been set using CSS.
     * @return {Number}
     */
    getComputedHeight : function() {
        var me = this,
            h = Math.max(me.dom.offsetHeight, me.dom.clientHeight);
        if (!h) {
            h = parseFloat(me.getStyle(HEIGHT)) || 0;
            if (!me.isBorderBox()) {
                h += me.getFrameWidth('tb');
            }
        }
        return h;
    },

    /**
     * Returns either the offsetWidth or the width of this element based on CSS width adjusted by padding or borders
     * when needed to simulate offsetWidth when offsets aren't available. This may not work on display:none elements
     * if a width has not been set using CSS.
     * @return {Number}
     */
    getComputedWidth : function() {
        var me = this,
            w = Math.max(me.dom.offsetWidth, me.dom.clientWidth);

        if (!w) {
            w = parseFloat(me.getStyle(WIDTH)) || 0;
            if (!me.isBorderBox()) {
                w += me.getFrameWidth('lr');
            }
        }
        return w;
    },

    /**
     * Returns the sum width of the padding and borders for the passed "sides". See getBorderWidth()
     * for more information about the sides.
     * @param {String} sides
     * @return {Number}
     */
    getFrameWidth : function(sides, onlyContentBox) {
        return (onlyContentBox && this.isBorderBox()) ? 0 : (this.getPadding(sides) + this.getBorderWidth(sides));
    },

    /**
     * Sets up event handlers to add and remove a css class when the mouse is over this element
     * @param {String} className The class to add
     * @param {Function} [testFn] A test function to execute before adding the class. The passed parameter
     * will be the Element instance. If this functions returns false, the class will not be added.
     * @param {Object} [scope] The scope to execute the testFn in.
     * @return {Ext.dom.Element} this
     */
    addClsOnOver : function(className, testFn, scope) {
        var me = this,
            dom = me.dom,
            hasTest = Ext.isFunction(testFn);
            
        me.hover(
            function() {
                if (hasTest && testFn.call(scope || me, me) === false) {
                    return;
                }
                Ext.fly(dom, INTERNAL).addCls(className);
            },
            function() {
                Ext.fly(dom, INTERNAL).removeCls(className);
            }
        );
        return me;
    },

    /**
     * Sets up event handlers to add and remove a css class when this element has the focus
     * @param {String} className The class to add
     * @param {Function} [testFn] A test function to execute before adding the class. The passed parameter
     * will be the Element instance. If this functions returns false, the class will not be added.
     * @param {Object} [scope] The scope to execute the testFn in.
     * @return {Ext.dom.Element} this
     */
    addClsOnFocus : function(className, testFn, scope) {
        var me = this,
            dom = me.dom,
            hasTest = Ext.isFunction(testFn);
            
        me.on("focus", function() {
            if (hasTest && testFn.call(scope || me, me) === false) {
                return false;
            }
            Ext.fly(dom, INTERNAL).addCls(className);
        });
        me.on("blur", function() {
            Ext.fly(dom, INTERNAL).removeCls(className);
        });
        return me;
    },

    /**
     * Sets up event handlers to add and remove a css class when the mouse is down and then up on this element (a click effect)
     * @param {String} className The class to add
     * @param {Function} [testFn] A test function to execute before adding the class. The passed parameter
     * will be the Element instance. If this functions returns false, the class will not be added.
     * @param {Object} [scope] The scope to execute the testFn in.
     * @return {Ext.dom.Element} this
     */
    addClsOnClick : function(className, testFn, scope) {
        var me = this,
            dom = me.dom,
            hasTest = Ext.isFunction(testFn);
            
        me.on("mousedown", function() {
            if (hasTest && testFn.call(scope || me, me) === false) {
                return false;
            }
            Ext.fly(dom, INTERNAL).addCls(className);
            var d = Ext.getDoc(),
                fn = function() {
                    Ext.fly(dom, INTERNAL).removeCls(className);
                    d.removeListener("mouseup", fn);
                };
            d.on("mouseup", fn);
        });
        return me;
    },

    /**
     * Returns the dimensions of the element available to lay content out in.
     *
     * getStyleSize utilizes prefers style sizing if present, otherwise it chooses the larger of offsetHeight/clientHeight and
     * offsetWidth/clientWidth. To obtain the size excluding scrollbars, use getViewSize.
     *
     * Sizing of the document body is handled at the adapter level which handles special cases for IE and strict modes, etc.
     *
     * @return {Object} Object describing width and height.
     * @return {Number} return.width
     * @return {Number} return.height
     */
    getStyleSize : function() {
        var me = this,
            d = this.dom,
            isDoc = DOCORBODYRE.test(d.nodeName),
            s ,
            w, h;

        // If the body, use static methods
        if (isDoc) {
            return {
                width : Element.getViewWidth(),
                height : Element.getViewHeight()
            };
        }

        s = me.getStyle([HEIGHT, WIDTH], true);  //seek inline
        // Use Styles if they are set
        if (s.width && s.width != 'auto') {
            w = parseFloat(s.width);
            if (me.isBorderBox()) {
                w -= me.getFrameWidth('lr');
            }
        }
        // Use Styles if they are set
        if (s.height && s.height != 'auto') {
            h = parseFloat(s.height);
            if (me.isBorderBox()) {
                h -= me.getFrameWidth('tb');
            }
        }
        // Use getWidth/getHeight if style not set.
        return {width: w || me.getWidth(true), height: h || me.getHeight(true)};
    },

    /**
     * Enable text selection for this element (normalized across browsers)
     * @return {Ext.Element} this
     */
    selectable : function() {
        var me = this;
        me.dom.unselectable = "off";
        // Prevent it from bubles up and enables it to be selectable
        me.on('selectstart', function (e) {
            e.stopPropagation();
            return true;
        });
        me.applyStyles("-moz-user-select: text; -khtml-user-select: text;");
        me.removeCls(Ext.baseCSSPrefix + 'unselectable');
        return me;
    },

    /**
     * Disables text selection for this element (normalized across browsers)
     * @return {Ext.dom.Element} this
     */
    unselectable : function() {
        var me = this;
        me.dom.unselectable = "on";

        me.swallowEvent("selectstart", true);
        me.applyStyles("-moz-user-select:-moz-none;-khtml-user-select:none;");
        me.addCls(Ext.baseCSSPrefix + 'unselectable');

        return me;
    }
});

Element.prototype.styleHooks = styleHooks = Ext.dom.AbstractElement.prototype.styleHooks;

if (Ext.isIE6 || Ext.isIE7) {
    styleHooks.fontSize = styleHooks['font-size'] = {
        name: 'fontSize',
        canThrow: true
    };
    
    styleHooks.fontStyle = styleHooks['font-style'] = {
        name: 'fontStyle',
        canThrow: true
    };
    
    styleHooks.fontFamily = styleHooks['font-family'] = {
        name: 'fontFamily',
        canThrow: true
    };
}

// override getStyle for border-*-width
if (Ext.isIEQuirks || Ext.isIE && Ext.ieVersion <= 8) {
    function getBorderWidth (dom, el, inline, style) {
        if (style[this.styleName] == 'none') {
            return '0px';
        }
        return style[this.name];
    }

    edges = ['Top','Right','Bottom','Left'];
    k = edges.length;

    while (k--) {
        edge = edges[k];
        borderWidth = 'border' + edge + 'Width';

        styleHooks['border-'+edge.toLowerCase()+'-width'] = styleHooks[borderWidth] = {
            name: borderWidth,
            styleName: 'border' + edge + 'Style',
            get: getBorderWidth
        };
    }
}

}());

Ext.onReady(function () {
    var opacityRe = /alpha\(opacity=(.*)\)/i,
        trimRe = /^\s+|\s+$/g,
        hooks = Ext.dom.Element.prototype.styleHooks;

    // Ext.supports flags are not populated until onReady...
    hooks.opacity = {
        name: 'opacity',
        afterSet: function(dom, value, el) {
            if (el.isLayer) {
                el.onOpacitySet(value);
            }
        }
    };
    if (!Ext.supports.Opacity && Ext.isIE) {
        Ext.apply(hooks.opacity, {
            get: function (dom) {
                var filter = dom.style.filter,
                    match, opacity;
                if (filter.match) {
                    match = filter.match(opacityRe);
                    if (match) {
                        opacity = parseFloat(match[1]);
                        if (!isNaN(opacity)) {
                            return opacity ? opacity / 100 : 0;
                        }
                    }
                }
                return 1;
            },
            set: function (dom, value) {
                var style = dom.style,
                    val = style.filter.replace(opacityRe, '').replace(trimRe, '');

                style.zoom = 1; // ensure dom.hasLayout

                // value can be a number or '' or null... so treat falsey as no opacity
                if (typeof(value) == 'number' && value >= 0 && value < 1) {
                    value *= 100;
                    style.filter = val + (val.length ? ' ' : '') + 'alpha(opacity='+value+')';
                } else {
                    style.filter = val;
                }
            }  
        });
    }
    // else there is no work around for the lack of opacity support. Should not be a
    // problem given that this has been supported for a long time now...
});
