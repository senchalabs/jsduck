/**
 * Extracts content from elements on page.
 */
Ext.define('Docs.ContentGrabber', {
    singleton: true,

    /**
     * Gets HTML inside the element. Then removes the element.
     * @param {String} id The ID of the element.
     * @return {String} HTML
     */
    get: function(id) {
        var html;
        var el = Ext.get(id);
        if (el) {
            html = el.dom.innerHTML;
            el.remove();
        }
        return html;
    }
});
