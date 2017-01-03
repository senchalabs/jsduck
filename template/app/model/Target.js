/**
 * A target model.
 */
Ext.define('Docs.model.Target', {
    extend: 'Ext.data.Model',
    requires: ['Docs.CommentsProxy'],
    fields: [
        "id",
        "type",
        "cls",
        "member",
        "score",
        {name: "text", convert: function(v, rec) {
            var data = rec.data;
            if (data.type === "class") {
                return data.cls + (data.member ? "#"+data.member.replace(/^.*-/, "") : "");
            }
            else {
                return data.type + " " + data.cls;
            }
        }}
    ],

    proxy: {
        type: "comments",
        url: "/targets",
        reader: {
            type: "json",
            root: "data"
        }
    }
});
