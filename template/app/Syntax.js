/**
 * Utility for performing syntax highlighting.
 */
Ext.define("Docs.Syntax", {
    singleton: true,

    /**
     * Marks all code blocks with "prettyprint" class and then calls
     * the prettify library function to highlight them.
     *
     * @param {HTMLElement/Ext.core.Element} root HTML element inside
     * which to perform the highlighting.
     */
    highlight: function(root) {
        Ext.Array.forEach(Ext.query("pre > code", root.dom || root), function(code) {
            code = Ext.get(code);
            var pre = code.parent();
            // Disable inline examples in IE (too slow)
            if (Ext.isIE && pre.hasCls("inline-example")) {
                pre.removeCls("inline-example");
            }
            // Don't prettify inline examples, these are highlighted anyway
            if (!pre.hasCls("inline-example")) {
                code.addCls("prettyprint");
            }
        });
        prettyPrint();
    }
});
