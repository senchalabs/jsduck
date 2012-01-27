/**
 * Global access to data about all classes.
 *
 * Provides access to Docs.data.search.
 */
Ext.define("Docs.ClassRegistry", {
    singleton: true,

    /**
     * Given class name or alternate class name, returns the true
     * class name. When the name is neither, returns it back again.
     * @param {String} name
     * @return {String}
     */
    canonicalName: function(name) {
        if (!this.altNames) {
            this.altNames = {};
            Ext.each(Docs.data.search, function(r) {
                if (r.type === "class" && !/:/.test(r.cls)) {
                    this.altNames[r.cls] = r.id;
                }
            }, this);
        }
        return this.altNames[name] || name;
    },

    /**
     * Searches class and member names including given search string.
     *
     * @param {String} text  The query string to search for
     * @return {Object[]} array of the matching items from Docs.search.data
     * ordered by best matches first.
     */
    search: function(text) {
        // Each record has its relative sorting order: 0..3
        // which is doubled by it being public/private
        var results = [
            //   public    |    private
            [], [], [], [],  [], [], [], [], // First we sort full matches: 0..7
            [], [], [], [],  [], [], [], [], // Then matches in beginning: 8..15
            [], [], [], [],  [], [], [], []  // Finally matches in middle: 16..23
        ];
        var searchFull = /[.:]/.test(text);
        var safeText = Ext.escapeRe(text);
        var reFull = new RegExp("^" + safeText + "$", "i");
        var reBeg = new RegExp("^" + safeText, "i");
        var reMid = new RegExp(safeText, "i");

        Ext.Array.forEach(Docs.data.search, function(r) {
            // when search text has "." or ":" in it, search from the full name
            // (e.g. "Ext.Component.focus" or "xtype: grid")
            // Otherwise search from just the member name (e.g. "focus" or "Component")
            var name = searchFull ? r.cls + (r.type === "class" ? "" : "." + r.member) : r.member;
            // Shift private items to the end of each match category
            var priv = r["private"] ? 4 : 0;

            if (reFull.test(name)) {
                results[r.sort + priv].push(r);
            }
            else if (reBeg.test(name)) {
                results[r.sort + priv + 8].push(r);
            }
            else if (reMid.test(name)) {
                results[r.sort + priv + 16].push(r);
            }
        }, this);

        return Ext.Array.flatten(results);
    }
});
