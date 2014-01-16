/**
 * The template for rendering comments.
 */
Ext.define('Docs.view.comments.Template', {
    extend: 'Ext.XTemplate',
    requires: [
        'Docs.Auth',
        'Docs.Comments'
    ],

    statics: {
        /**
         * A factory method to get an instance of the template.  For
         * every different config object, returns a cached instance of
         * the template, avoiding creating a new each time.
         *
         * @param {Object} cfg An additional configuration to
         * apply to the template object.
         * @return {Docs.view.comments.Template}
         */
        create: function(cfg) {
            var key = "tpl-" + Ext.JSON.encode(cfg);
            if (!this[key]) {
                this[key] = new this();
                Ext.apply(this[key], cfg);
            }
            return this[key];
        }
    },

    /**
     * @cfg {Boolean} showTarget
     * True to show a link to the target in each comment.
     */

    /**
     * @cfg {Boolean} enableDragDrop
     * True to allow drag-drop reorganization of comments.
     */

    constructor: function() {
        this.callParent([
            '<div>',
                '<tpl for=".">',
                '<div class="comment" id="{id}">',
                    '<tpl if="deleted">',
                        '<div class="deleted-comment">Comment was deleted. <a href="#" class="undoDeleteComment">Undo</a>.</div>',
                    '<tpl else>',
                        '<div class="com-meta">',
                            '{[this.avatar(values.emailHash)]}',
                            '<div class="author<tpl if="moderator"> moderator" title="Sencha Engineer</tpl>">',
                                '{author}',
                                '<tpl if="this.isTargetVisible()">',
                                    '<span class="target"> on {[this.target(values.target)]}</span>',
                                '</tpl>',
                            '</div>',

                            '<div class="top-right">',
                                '<tpl for="tags">',
                                    '<span href="#" class="command tag">',
                                        '<b>{.}</b>',
                                        '<tpl if="this.isMod()"><a href="#" class="remove-tag" title="Delete tag">&ndash;</a></tpl>',
                                    '</span>',
                                '</tpl>',
                                '<tpl if="this.isMod()">',
                                    '<a href="#" class="command add-tag" title="Add new tag">+</a>',
                                '</tpl>',
                                '<tpl if="this.isMod()">',
                                    '<a href="#" class="command readComment <tpl if="read">read</tpl>">Read</a>',
                                '</tpl>',
                                '<tpl if="this.isMod() || this.isAuthor(values.author)">',
                                    '<a href="#" class="command editComment">Edit</a>',
                                    '<a href="#" class="command deleteComment">Delete</a>',
                                '</tpl>',
                                '<span class="time" title="{[this.date(values.createdAt)]}">{[this.dateStr(values.createdAt)]}</span>',
                            '</div>',

                            '<div class="vote">',
                                '<a href="#" class="voteCommentUp{[values.upVote ? " selected" : ""]}" ',
                                            'title="Vote Up">&nbsp;</a>',
                                '<span class="score">{score}</span>',
                                '<a href="#" class="voteCommentDown{[values.downVote ? " selected" : ""]}" ',
                                            'title="Vote Down">&nbsp;</a>',
                            '</div>',
                        '</div>',
                        '<div class="content">{contentHtml}</div>',
                    '</tpl>',
                '</div>',
                '</tpl>',
            '</div>',
            // to use all methods of this class inside the template
            this
        ]);
    },

    avatar: function(emailHash) {
        // turns avatars into drag-handles for moderators.
        return Docs.Comments.avatar(emailHash, this.isMod() && this.enableDragDrop ? "drag-handle" : "");
    },

    isTargetVisible: function() {
        return this.showTarget;
    },

    dateStr: function(date) {
        try {
            var now = Math.ceil(Number(new Date()) / 1000);
            var comment = Math.ceil(Number(new Date(date)) / 1000);
            var diff = now - comment;

            if (diff < 60) {
                return 'just now';
            }
            else if (diff < 60*60) {
                var str = String(Math.round(diff / (60)));
                return str + (str == "1" ? ' minute' : ' minutes') + ' ago';
            }
            else if (diff < 60*60*24) {
                var str = String(Math.round(diff / (60*60)));
                return str + (str == "1" ? ' hour' : ' hours') + ' ago';
            }
            else if (diff < 60*60*24*31) {
                var str = String(Math.round(diff / (60 * 60 * 24)));
                return str + (str == "1" ? ' day' : ' days') + ' ago';
            }
            else {
                return Ext.Date.format(new Date(date), 'jS M \'y');
            }
        } catch(e) {
            return '';
        }
    },

    date: function(date) {
        try {
            return Ext.Date.format(new Date(date), 'jS F Y g:ia');
        } catch(e) {
            return '';
        }
    },

    isMod: function() {
        return Docs.Auth.isModerator();
    },

    isAuthor: function(author) {
        return Docs.Auth.getUser().userName == author;
    },

    target: function(target) {
        var url = target[1],
        title = target[1],
        urlPrefix = '#!/api/';

        if (target[0] == 'video') {
            title = 'Video ' + title;
            urlPrefix = '#!/video/';
        }
        else if (target[0] == 'guide') {
            title = 'Guide ' + title;
            urlPrefix = '#!/guide/';
        }
        else if (target[2] != '') {
            url += '-' + target[2];
            if (target[0] == "class") {
                title += '#' + target[2].replace(/^.*-/, "");
            }
            else {
                title += ' ' + target[2];
            }
        }

        return '<a href="' + urlPrefix + url + '">' + title + '</a>';
    }

});
