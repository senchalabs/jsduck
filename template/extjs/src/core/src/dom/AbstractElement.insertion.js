//@tag dom,core
//@require Ext.dom.AbstractElement-alignment
//@define Ext.dom.AbstractElement-insertion
//@define Ext.dom.AbstractElement

/**
 * @class Ext.dom.AbstractElement
 */
Ext.dom.AbstractElement.addMethods({
    /**
     * Appends the passed element(s) to this element
     * @param {String/HTMLElement/Ext.dom.AbstractElement} el
     * The id of the node, a DOM Node or an existing Element.
     * @return {Ext.dom.AbstractElement} This element
     */
    appendChild: function(el) {
        return Ext.get(el).appendTo(this);
    },

    /**
     * Appends this element to the passed element
     * @param {String/HTMLElement/Ext.dom.AbstractElement} el The new parent element.
     * The id of the node, a DOM Node or an existing Element.
     * @return {Ext.dom.AbstractElement} This element
     */
    appendTo: function(el) {
        Ext.getDom(el).appendChild(this.dom);
        return this;
    },

    /**
     * Inserts this element before the passed element in the DOM
     * @param {String/HTMLElement/Ext.dom.AbstractElement} el The element before which this element will be inserted.
     * The id of the node, a DOM Node or an existing Element.
     * @return {Ext.dom.AbstractElement} This element
     */
    insertBefore: function(el) {
        el = Ext.getDom(el);
        el.parentNode.insertBefore(this.dom, el);
        return this;
    },

    /**
     * Inserts this element after the passed element in the DOM
     * @param {String/HTMLElement/Ext.dom.AbstractElement} el The element to insert after.
     * The id of the node, a DOM Node or an existing Element.
     * @return {Ext.dom.AbstractElement} This element
     */
    insertAfter: function(el) {
        el = Ext.getDom(el);
        el.parentNode.insertBefore(this.dom, el.nextSibling);
        return this;
    },

    /**
     * Inserts (or creates) an element (or DomHelper config) as the first child of this element
     * @param {String/HTMLElement/Ext.dom.AbstractElement/Object} el The id or element to insert or a DomHelper config
     * to create and insert
     * @return {Ext.dom.AbstractElement} The new child
     */
    insertFirst: function(el, returnDom) {
        el = el || {};
        if (el.nodeType || el.dom || typeof el == 'string') { // element
            el = Ext.getDom(el);
            this.dom.insertBefore(el, this.dom.firstChild);
            return !returnDom ? Ext.get(el) : el;
        }
        else { // dh config
            return this.createChild(el, this.dom.firstChild, returnDom);
        }
    },

    /**
     * Inserts (or creates) the passed element (or DomHelper config) as a sibling of this element
     * @param {String/HTMLElement/Ext.dom.AbstractElement/Object/Array} el The id, element to insert or a DomHelper config
     * to create and insert *or* an array of any of those.
     * @param {String} [where='before'] 'before' or 'after'
     * @param {Boolean} [returnDom=false] True to return the .;ll;l,raw DOM element instead of Ext.dom.AbstractElement
     * @return {Ext.dom.AbstractElement} The inserted Element. If an array is passed, the last inserted element is returned.
     */
    insertSibling: function(el, where, returnDom){
        var me      = this,
            isAfter = (where || 'before').toLowerCase() == 'after',
            rt, insertEl, eLen, e;

        if (Ext.isArray(el)) {
            insertEl = me;
            eLen = el.length;
            
            for (e = 0; e < eLen; e++) {
                rt = Ext.fly(insertEl, '_internal').insertSibling(el[e], where, returnDom);

                if (isAfter) {
                    insertEl = rt;
                }
            }

            return rt;
        }

        el = el || {};

        if(el.nodeType || el.dom){
            rt = me.dom.parentNode.insertBefore(Ext.getDom(el), isAfter ? me.dom.nextSibling : me.dom);
            if (!returnDom) {
                rt = Ext.get(rt);
            }
        }else{
            if (isAfter && !me.dom.nextSibling) {
                rt = Ext.core.DomHelper.append(me.dom.parentNode, el, !returnDom);
            } else {
                rt = Ext.core.DomHelper[isAfter ? 'insertAfter' : 'insertBefore'](me.dom, el, !returnDom);
            }
        }
        return rt;
    },

    /**
     * Replaces the passed element with this element
     * @param {String/HTMLElement/Ext.dom.AbstractElement} el The element to replace.
     * The id of the node, a DOM Node or an existing Element.
     * @return {Ext.dom.AbstractElement} This element
     */
    replace: function(el) {
        el = Ext.get(el);
        this.insertBefore(el);
        el.remove();
        return this;
    },

    /**
     * Replaces this element with the passed element
     * @param {String/HTMLElement/Ext.dom.AbstractElement/Object} el The new element (id of the node, a DOM Node
     * or an existing Element) or a DomHelper config of an element to create
     * @return {Ext.dom.AbstractElement} This element
     */
    replaceWith: function(el){
        var me = this;

        if(el.nodeType || el.dom || typeof el == 'string'){
            el = Ext.get(el);
            me.dom.parentNode.insertBefore(el, me.dom);
        }else{
            el = Ext.core.DomHelper.insertBefore(me.dom, el);
        }

        delete Ext.cache[me.id];
        Ext.removeNode(me.dom);
        me.id = Ext.id(me.dom = el);
        Ext.dom.AbstractElement.addToCache(me.isFlyweight ? new Ext.dom.AbstractElement(me.dom) : me);
        return me;
    },

    /**
     * Creates the passed DomHelper config and appends it to this element or optionally inserts it before the passed child element.
     * @param {Object} config DomHelper element config object.  If no tag is specified (e.g., {tag:'input'}) then a div will be
     * automatically generated with the specified attributes.
     * @param {HTMLElement} [insertBefore] a child element of this element
     * @param {Boolean} [returnDom=false] true to return the dom node instead of creating an Element
     * @return {Ext.dom.AbstractElement} The new child element
     */
    createChild: function(config, insertBefore, returnDom) {
        config = config || {tag:'div'};
        if (insertBefore) {
            return Ext.core.DomHelper.insertBefore(insertBefore, config, returnDom !== true);
        }
        else {
            return Ext.core.DomHelper[!this.dom.firstChild ? 'insertFirst' : 'append'](this.dom, config,  returnDom !== true);
        }
    },

    /**
     * Creates and wraps this element with another element
     * @param {Object} [config] DomHelper element config object for the wrapper element or null for an empty div
     * @param {Boolean} [returnDom=false] True to return the raw DOM element instead of Ext.dom.AbstractElement
     * @param {String} [selector] A {@link Ext.dom.Query DomQuery} selector to select a descendant node within the created element to use as the wrapping element.
     * @return {HTMLElement/Ext.dom.AbstractElement} The newly created wrapper element
     */
    wrap: function(config, returnDom, selector) {
        var newEl = Ext.core.DomHelper.insertBefore(this.dom, config || {tag: "div"}, true),
            target = newEl;
        
        if (selector) {
            target = Ext.DomQuery.selectNode(selector, newEl.dom);
        }

        target.appendChild(this.dom);
        return returnDom ? newEl.dom : newEl;
    },

    /**
     * Inserts an html fragment into this element
     * @param {String} where Where to insert the html in relation to this element - beforeBegin, afterBegin, beforeEnd, afterEnd.
     * See {@link Ext.dom.Helper#insertHtml} for details.
     * @param {String} html The HTML fragment
     * @param {Boolean} [returnEl=false] True to return an Ext.dom.AbstractElement
     * @return {HTMLElement/Ext.dom.AbstractElement} The inserted node (or nearest related if more than 1 inserted)
     */
    insertHtml: function(where, html, returnEl) {
        var el = Ext.core.DomHelper.insertHtml(where, this.dom, html);
        return returnEl ? Ext.get(el) : el;
    }
});
