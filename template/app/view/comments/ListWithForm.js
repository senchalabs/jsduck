/**
 * Container for listing of all the comments.
 * Sorted by date or votes.
 */
Ext.define('Docs.view.comments.ListWithForm', {
    extend: 'Ext.container.Container',
    alias: "widget.commentsListWithForm",
    requires: [
        'Docs.view.comments.List',
        'Docs.view.comments.Form',
        'Docs.Comments',
        'Docs.Auth'
    ],

    /**
     * @cfg {String[]} target
     * The target of the comments (used for posting new comment).
     */

    initComponent: function() {
        this.items = [
            this.list = new Docs.view.comments.List({
            }),
            this.form = new Docs.view.comments.Form({
                user: Docs.Auth.getUser(),
                listeners: {
                    submit: this.postComment,
                    scope: this
                }
            })
        ];

        this.callParent(arguments);
    },

    postComment: function(content) {
        Docs.Comments.request("ajax", {
            url: '/comments',
            method: 'POST',
            params: {
                target: Ext.JSON.encode(this.target),
                comment: content,
                url: this.buildUrl(this.target)
            },
            callback: function(options, success, response) {
                var data = Ext.JSON.decode(response.responseText);
                if (success && data.success && data.id) {
                    this.form.setValue('');
                    this.list.load([data.comment], true);
                }
                else {
                    Ext.Msg.alert('Error', data.reason || "There was an error submitting your request");
                }
            },
            scope: this
        });
    },

    buildUrl: function(target) {
        if (target[0] == 'video') {
            var hash = '#!/video/' + target[1];
        }
        else if (target[0] == 'guide') {
            var hash = '#!/guide/' + target[1];
        }
        else if (target[2] != '') {
            var hash = '#!/api/' + target[1] + '-' + target[2];
        }

        return "http://" + window.location.host + window.location.pathname + hash;
    },

    /**
     * Loads array of comments into the view.
     * @param {Object[]} comments
     * @param {Boolean} append True to append the comments to existing ones.
     */
    load: function(comments, append) {
        this.down("commentsList").load(comments, append);
    }

});
