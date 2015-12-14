/**
 * Renders the list of signature labels for a class or member.
 */
Ext.define('Docs.view.Signature', {
    singleton: true,

    /**
     * Returns an HTML rendering of the signature
     * @param {Object} meta class or member data object.
     * @param {String} [format="short"] Supply "long" do display full
     * labels instead of abberviated ones.
     * @return {String} HTML spans.
     */
    render: function(meta, format) {
        format = format || "short";
        var spans = Ext.Array.map(Docs.data.signatures, function(s) {
            return meta[s.tagname] ? '<span class="'+s.tagname+'">'+(s[format])+'</span>' : '';
        }).join(' ');
        return '<span class="signature">' + spans + '</span>';
    }
});
