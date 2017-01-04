//@tag dom,core
//@require Ext.dom.Element-position
//@define Ext.dom.Element-scroll
//@define Ext.dom.Element

/**
 * @class Ext.dom.Element
 */
Ext.dom.Element.override({
    /**
     * Returns true if this element is scrollable.
     * @return {Boolean}
     */
    isScrollable: function() {
        var dom = this.dom;
        return dom.scrollHeight > dom.clientHeight || dom.scrollWidth > dom.clientWidth;
    },

    /**
     * Returns the current scroll position of the element.
     * @return {Object} An object containing the scroll position in the format
     * `{left: (scrollLeft), top: (scrollTop)}`
     */
    getScroll: function() {
        var d = this.dom,
            doc = document,
            body = doc.body,
            docElement = doc.documentElement,
            l,
            t,
            ret;

        if (d == doc || d == body) {
            if (Ext.isIE && Ext.isStrict) {
                l = docElement.scrollLeft;
                t = docElement.scrollTop;
            } else {
                l = window.pageXOffset;
                t = window.pageYOffset;
            }
            ret = {
                left: l || (body ? body.scrollLeft : 0),
                top : t || (body ? body.scrollTop : 0)
            };
        } else {
            ret = {
                left: d.scrollLeft,
                top : d.scrollTop
            };
        }

        return ret;
    },

    /**
     * Scrolls this element by the passed delta values, optionally animating.
     * 
     * All of the following are equivalent:
     *
     *      el.scrollBy(10, 10, true);
     *      el.scrollBy([10, 10], true);
     *      el.scrollBy({ x: 10, y: 10 }, true);
     * 
     * @param {Number/Number[]/Object} deltaX Either the x delta, an Array specifying x and y deltas or
     * an object with "x" and "y" properties.
     * @param {Number/Boolean/Object} deltaY Either the y delta, or an animate flag or config object.
     * @param {Boolean/Object} animate Animate flag/config object if the delta values were passed separately.
     * @return {Ext.Element} this
     */
    scrollBy: function(deltaX, deltaY, animate) {
        var me = this,
            dom = me.dom;

        // Extract args if deltas were passed as an Array.
        if (deltaX.length) {
            animate = deltaY;
            deltaY = deltaX[1];
            deltaX = deltaX[0];
        } else if (typeof deltaX != 'number') { // or an object
            animate = deltaY;
            deltaY = deltaX.y;
            deltaX = deltaX.x;
        }

        if (deltaX) {
            me.scrollTo('left', Math.max(Math.min(dom.scrollLeft + deltaX, dom.scrollWidth - dom.clientWidth), 0), animate);
        }
        if (deltaY) {
            me.scrollTo('top', Math.max(Math.min(dom.scrollTop + deltaY, dom.scrollHeight - dom.clientHeight), 0), animate);
        }

        return me;
    },

    /**
     * Scrolls this element the specified scroll point. It does NOT do bounds checking so
     * if you scroll to a weird value it will try to do it. For auto bounds checking, use #scroll.
     * @param {String} side Either "left" for scrollLeft values or "top" for scrollTop values.
     * @param {Number} value The new scroll value
     * @param {Boolean/Object} [animate] true for the default animation or a standard Element
     * animation config object
     * @return {Ext.Element} this
     */
    scrollTo: function(side, value, animate) {
        //check if we're scrolling top or left
        var top = /top/i.test(side),
            me = this,
            dom = me.dom,
            animCfg,
            prop;

        if (!animate || !me.anim) {
            // just setting the value, so grab the direction
            prop = 'scroll' + (top ? 'Top' : 'Left');
            dom[prop] = value;
            // corrects IE, other browsers will ignore
            dom[prop] = value;
        }
        else {
            animCfg = {
                to: {}
            };
            animCfg.to['scroll' + (top ? 'Top' : 'Left')] = value;
            if (Ext.isObject(animate)) {
                Ext.applyIf(animCfg, animate);
            }
            me.animate(animCfg);
        }
        return me;
    },

    /**
     * Scrolls this element into view within the passed container.
     * @param {String/HTMLElement/Ext.Element} [container=document.body] The container element
     * to scroll.  Should be a string (id), dom node, or Ext.Element.
     * @param {Boolean} [hscroll=true] False to disable horizontal scroll.
     * @param {Boolean/Object} [animate] true for the default animation or a standard Element
     * animation config object
     * @return {Ext.dom.Element} this
     */
    scrollIntoView: function(container, hscroll, animate) {
        container = Ext.getDom(container) || Ext.getBody().dom;
        var el = this.dom,
            offsets = this.getOffsetsTo(container),
        // el's box
            left = offsets[0] + container.scrollLeft,
            top = offsets[1] + container.scrollTop,
            bottom = top + el.offsetHeight,
            right = left + el.offsetWidth,
        // ct's box
            ctClientHeight = container.clientHeight,
            ctScrollTop = parseInt(container.scrollTop, 10),
            ctScrollLeft = parseInt(container.scrollLeft, 10),
            ctBottom = ctScrollTop + ctClientHeight,
            ctRight = ctScrollLeft + container.clientWidth,
            newPos;

        if (el.offsetHeight > ctClientHeight || top < ctScrollTop) {
            newPos = top;
        } else if (bottom > ctBottom) {
            newPos = bottom - ctClientHeight;
        }
        if (newPos != null) {
            Ext.get(container).scrollTo('top', newPos, animate);
        }

        if (hscroll !== false) {
            newPos = null;
            if (el.offsetWidth > container.clientWidth || left < ctScrollLeft) {
                newPos = left;
            } else if (right > ctRight) {
                newPos = right - container.clientWidth;
            }
            if (newPos != null) {
                Ext.get(container).scrollTo('left', newPos, animate);
            }
        }
        return this;
    },

    // @private
    scrollChildIntoView: function(child, hscroll) {
        Ext.fly(child, '_scrollChildIntoView').scrollIntoView(this, hscroll);
    },

    /**
     * Scrolls this element the specified direction. Does bounds checking to make sure the scroll is
     * within this element's scrollable range.
     * @param {String} direction Possible values are:
     *
     * - `"l"` (or `"left"`)
     * - `"r"` (or `"right"`)
     * - `"t"` (or `"top"`, or `"up"`)
     * - `"b"` (or `"bottom"`, or `"down"`)
     *
     * @param {Number} distance How far to scroll the element in pixels
     * @param {Boolean/Object} [animate] true for the default animation or a standard Element
     * animation config object
     * @return {Boolean} Returns true if a scroll was triggered or false if the element
     * was scrolled as far as it could go.
     */
    scroll: function(direction, distance, animate) {
        if (!this.isScrollable()) {
            return false;
        }
        var el = this.dom,
            l = el.scrollLeft, t = el.scrollTop,
            w = el.scrollWidth, h = el.scrollHeight,
            cw = el.clientWidth, ch = el.clientHeight,
            scrolled = false, v,
            hash = {
                l: Math.min(l + distance, w - cw),
                r: v = Math.max(l - distance, 0),
                t: Math.max(t - distance, 0),
                b: Math.min(t + distance, h - ch)
            };

        hash.d = hash.b;
        hash.u = hash.t;

        direction = direction.substr(0, 1);
        if ((v = hash[direction]) > -1) {
            scrolled = true;
            this.scrollTo(direction == 'l' || direction == 'r' ? 'left' : 'top', v, this.anim(animate));
        }
        return scrolled;
    }
});
