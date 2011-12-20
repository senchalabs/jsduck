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
    }
});
