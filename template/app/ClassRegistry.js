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
     * Given a full package or class name extracts the "class"-part of the name.
     * @param {String} name
     * @return {String}
     */
    shortName: function(name) {
        return name.split(/\./).pop();
    },

    /**
     * Given a package or class name finds the name of its parent package.
     * @param {String} name
     * @return {String}
     */
    packageName: function(name) {
        return name.slice(0, -this.shortName(name).length - 1) || "";
    },

    /**
     * Searches class and member names including given search string.
     *
     * Sorting the results works by dividing the results into sections
     * by match amount, visibility and type.  This means we create a
     * 60-element array and place matches at the following positions:
     *
     *      i  match  visibility type
     *
     *      0  full   public    alias
     *      1  full   public    class
     *      2  full   public    alt-class
     *      3  full   public    member
     *      4  full   public    guide
     *
     *      5  full   deprec.   alias
     *      6  full   deprec.   class
     *      7  full   deprec.   alt-class
     *      8  full   deprec.   member
     *      9  full   deprec.   guide
     *
     *     10  full   private   alias
     *     11  full   private   class
     *     12  full   private   alt-class
     *     13  full   private   member
     *     14  full   private   guide
     *
     *     15  full   removed   alias
     *     16  full   removed   class
     *     17  full   removed   alt-class
     *     18  full   removed   member
     *     19  full   removed   guide
     *
     *     20  begin  public    alias
     *         ...
     *     39  begin  removed   guide
     *
     *     40  middle public    alias
     *         ...
     *     59  middle removed   guide
     *
     * @param {String} text  The query string to search for
     * @param {Object[]} [guides] Results of guides search, to be
     * combined with the results of API search.
     * @return {Object[]} array of the matching items from Docs.search.data
     * ordered by best matches first.
     */
    search: function(text, guides) {
        // Each record has 1 of 5 possible sorting orders,
        var nSort = 5;
        // which is *4 by it being public/deprecated/private/removed,
        var nVisib = 4;
        // and *3 by full/beginning/middle matches.
        var nMatch = 3;

        var results = new Array(nSort * nVisib * nMatch);
        for (var i=0; i<results.length; i++) {
            results[i] = [];
        }

        // Adjusting at largest steps by full/begin/middle match
        var adjFul = nSort * nVisib * 0;
        var adjBeg = nSort * nVisib * 1;
        var adjMid = nSort * nVisib * 2;

        // Adjusting at medium steps by visibility
        var adjPub = nSort * 0;
        var adjDep = nSort * 1;
        var adjPri = nSort * 2;
        var adjRem = nSort * 3;

        // When guides given, populate the result fields with them
        if (guides) {
            var guidePos = 4;
            for (var i=0; i<guides.length; i++) {
                var g = guides[i];
                if (g.score > 5) {
                    results[guidePos + adjPub + adjFul].push(g);
                }
                else if (g.score > 1) {
                    results[guidePos + adjPub + adjBeg].push(g);
                }
                else {
                    results[guidePos + adjPub + adjMid].push(g);
                }
            }
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

            // Order items by visibility: public, deprecated, private, removed
            var visibility = r.meta["removed"] ? adjRem : (r.meta["private"] ? adjPri : (r.meta["deprecated"] ? adjDep : adjPub));

            if (reFull.test(name)) {
                results[r.sort + visibility + adjFul].push(this.highlightMatch(r, reFull));
            }
            else if (reBeg.test(name)) {
                results[r.sort + visibility + adjBeg].push(this.highlightMatch(r, reBeg));
            }
            else if (reMid.test(name)) {
                results[r.sort + visibility + adjMid].push(this.highlightMatch(r, reMid));
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
