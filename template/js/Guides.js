/**
 * Takes care of loading guides.
 */
Ext.define("Docs.Guides", {
    singleton: true,

    /**
     * Loads guide from given URL.
     *
     * @param {String} name  name of the guide
     * @param {Boolean} noHistory  true to not add browser history entry
     */
    load: function(name, noHistory) {
        noHistory || Docs.History.push("/guide/" + name);

        Ext.Ajax.request({
            url: Docs.App.getBaseUrl() + "/guides/" + name + "/index.html",
            success: function(response) {
                var html = response.responseText;
                this.render(html);
            },
            scope: this
        });
    },

    render: function(html) {
        Ext.get("api-guide").update(html);
        this.syntaxHighlight();
    },

    // Marks all code blocks with "prettyprint" class and then calls
    // the prettify library function to highlight them.
    syntaxHighlight: function() {
        Ext.Array.forEach(Ext.query("pre > code"), function(el) {
            Ext.get(el).addCls("prettyprint");
        });
        prettyPrint();
    }
});
