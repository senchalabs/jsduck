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
            // Don't prettify inline examples that have preview enabled.
            if (!(pre.hasCls("inline-example") && pre.hasCls("preview"))) {
                code.addCls("prettyprint");
            }
        });
        prettyPrint();
    }
});
