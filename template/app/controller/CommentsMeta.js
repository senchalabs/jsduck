/**
 * Handles Comment meta data - the number of comments on a class and its members.
 * Also deals with keeping meta content up to date when comments are added or removed.
 */
Ext.define('Docs.controller.CommentsMeta', {
    extend: 'Ext.app.Controller',

    // baseUrl: 'http://projects.sencha.com/auth',
    baseUrl: 'http://192.168.1.237/sencha/jsduck_out/auth',

    refs: [
        {
            ref: 'toolbar',
            selector: 'classoverview toolbar'
        },
        {
            ref: 'authentication',
            selector: 'authentication'
        },
        {
            ref: 'overview',
            selector: 'classoverview'
        }
    ],

    init: function() {

        Docs.commentMeta = {
            idMap: {}
        };

        this.addEvents(
            /**
             * @event afterLoad  Fired after a meta data is loaded
             */
            'afterLoad'
        );

        this.getController('Comments').on({
            add: function(id) {
                this.updateMeta(Docs.commentMeta.idMap[id], 1);
                var clsId = Docs.commentMeta.idMap[id];
                Docs.view.Comments.updateClassCommentMeta(clsId[1]);
            },
            remove: function(id) {
                this.updateMeta(Docs.commentMeta.idMap[id], -1);
                var clsId = Docs.commentMeta.idMap[id];
                Docs.view.Comments.updateClassCommentMeta(clsId[1]);
            },
            scope: this
        });

        this.getController('Classes').on({
            showIndex: function() {
                Docs.view.Comments.updateClassIndex();
            },
            showClass: function(cls, opts) {
                if (opts.reRendered) {
                    this.createCommentIdMap(this.getController('Classes').currentCls);
                    Docs.view.Comments.updateClassCommentMeta(cls);
                }
            },
            scope: this
        });

        this.control({
            'hovermenu': {
                refresh : function(cmp) {
                    Docs.view.Comments.renderHoverMenuMeta(cmp.el, {refresh: true});
                }
            }
        });

        this.fetchCommentMeta();
    },

    fetchCommentMeta: function() {

        Ext.data.JsonP.request({
            url: this.baseUrl + '/comments/_design/Comments/_view/by_target',
            method: 'GET',
            params: {
                reduce: true,
                group_level: 3
            },
            success: function(response) {

                Ext.Array.each(response.rows, function(r) {
                    this.updateMeta(r.key, r.value.num);
                }, this);

                this.fireEvent('afterLoad');
                Docs.view.Comments.updateClassIndex();
            },
            scope: this
        });
    },

    updateVoteMeta: function() {

        var id = Docs.App.getController('Classes').currentCls.name,
            startkey = Ext.JSON.encode(['class',id]),
            endkey = Ext.JSON.encode(['class',id,{}]),
            currentUser = this.getController('Auth').currentUser;

        if (!id) return;

        Ext.data.JsonP.request({
            url: this.baseUrl + '/comments/_design/Comments/_list/with_vote/by_target',
            method: 'GET',
            params: {
                reduce: false,
                startkey: startkey,
                endkey: endkey,
                user: currentUser && currentUser.userName,
                votes: true
            },
            success: function(response) {
                console.log(response.rows)
            },
            scope: this
        });
    },

    /**
     * Update comment count info
     * @param key Path to class / property
     * @param delta Difference to comment number
     */
    updateMeta: function(key, delta) {
        Docs.commentMeta[key[0]] = Docs.commentMeta[key[0]] || {};
        Docs.commentMeta[key[0]][key[1]] = Docs.commentMeta[key[0]][key[1]] || { total: 0 };
        Docs.commentMeta[key[0]][key[1]][key[2]] = Docs.commentMeta[key[0]][key[1]][key[2]] || 0;

        Docs.commentMeta[key[0]][key[1]][key[2]] += delta;
        Docs.commentMeta[key[0]][key[1]]['total'] += delta;
    },

    /**
     * Creates a mapping between comment element IDs and CouchDB view keys
     */
    createCommentIdMap: function(cls) {

        var key, commentId, member
        Docs.commentMeta.idMap[('comments-class-' + cls.name).replace(/\./g, '-')] = ['class', cls.name, ''];

        if (cls.members) {
            for(member in cls.members) {
                Ext.Array.each(cls.members[member], function(memberItem) {
                    origKey = ['class', cls.name, memberItem.id];
                    key = ['class', memberItem.owner, memberItem.id];
                    commentId = 'comments-' + origKey.join('-').replace(/\./g, '-');
                    Docs.commentMeta.idMap[commentId] = key;
                }, this);
            }
        }
    }

});