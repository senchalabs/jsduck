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
        Ext.Array.forEach(Ext.query("pre", root.dom || root), function(pre) {
            pre = Ext.get(pre);

            if (pre.child("code")) {
                // Don't prettify inline examples that have preview enabled.
                if (!(pre.hasCls("inline-example") && pre.hasCls("preview"))) {
                    pre.addCls("prettyprint");
                }
            }
            else if (!pre.parent(".CodeMirror") && !pre.hasCls("hierarchy")) {
                // For normal pre-s add "notpretty" class so they can be
                // distinguished in CSS from any other <pre> element
                // that might appear on page.
                pre.addCls("notpretty");
            }
        });
        prettyPrint();
    }
});
