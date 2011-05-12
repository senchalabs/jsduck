/**
 * Takes care of loading guides.
 */
Ext.define("Docs.Guides", {
    singleton: true,

    /**
     * Adds click listeners for all guide links.
     */
    init: function() {
        Ext.Array.forEach(Ext.query("#api-overview .guides a"), function(el) {
            Ext.get(el).addListener('click', function() {
                this.load(el.href);
            }, this, {preventDefault: true});
        }, this);
    },

    load: function(url) {
        Ext.Ajax.request({
            url: url,
            success: function(response) {
                var html = response.responseText;
                this.render(html);
            },
            scope: this
        });
    },

    render: function(html) {
        Ext.get("top-block").setStyle({display: 'none'});
        Ext.get("docContent").update('<div class="guide">'+html+'</div>');
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
