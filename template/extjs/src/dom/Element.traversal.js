//@tag dom,core
//@require Ext.dom.Element-style
//@define Ext.dom.Element-traversal
//@define Ext.dom.Element

/**
 * @class Ext.dom.Element
 */
Ext.dom.Element.override({
    select: function(selector) {
        return Ext.dom.Element.select(selector, false,  this.dom);
    }
});
