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
        // Each record has 1 of 5 possible sorting orders,
        // which is *3 by it being public/private/removed,
        // and *3 by full/beginning/middle matches.
        var results = new Array(5 * 3 * 3);
        for (var i=0; i<results.length; i++) {
            results[i] = [];
        }

        var searchFull = /[.:]/.test(text);
        var safeText = Ext.escapeRe(text);
        var reFull = new RegExp("^" + safeText + "$", "i");
        var reBeg = new RegExp("^" + safeText, "i");
        var reMid = new RegExp(safeText, "i");

        var searchData = Docs.data.search;
        for (var i=0, len=searchData.length; i<len; i++) {
            var r = searchData[i];

            // when search text has "." or ":" in it, search from the full name
            // (e.g. "Ext.Component.focus" or "xtype: grid")
            // Otherwise search from just the short name (e.g. "focus" or "Component")
            var name = searchFull ? r.fullName : r.name;
            // Shift private items further back
            // Shift removed items to the very end of each match category
            var shift = r["private"] ? 4 : (r["removed"] ? 8 : 0);

            if (reFull.test(name)) {
                results[r.sort + shift].push(this.highlightMatch(r, reFull));
            }
            else if (reBeg.test(name)) {
                results[r.sort + shift + 12].push(this.highlightMatch(r, reBeg));
            }
            else if (reMid.test(name)) {
                results[r.sort + shift + 24].push(this.highlightMatch(r, reMid));
            }
        }

        return Ext.Array.flatten(results);
    },

    highlightMatch: function(r, regex) {
        r = Ext.apply({}, r);
        r.name = r.name.replace(regex, '<strong>$&</strong>');
        r.fullName = r.fullName.replace(regex, '<strong>$&</strong>');
        return r;
    }
});
