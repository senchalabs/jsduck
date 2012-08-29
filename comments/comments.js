var Targets = require("./targets");

module.exports = (function(){
    /**
     * Represents a Comments table.
     *
     * @constructor
     * Initializes Comments with a database connection and a target domain.
     *
     * @param {DbFacade} db Instance of DbFacade.
     *
     * @param {String} domain The comments domain within which to work.
     * For example by passing "touch-2" the #find method will only find
     * comments within touch-2 domain.
     */
    function Comments(db, domain) {
        this.db = db;
        this.domain = domain;
        this.targets = new Targets(db, domain);
    }

    Comments.prototype = {
        /**
         * Finds a single comment by ID in the current domain.
         * Does not fine deleted comments.
         *
         * @param {Number} id The ID of the comment to find.
         * @param {Function} callback Called with the result.
         * @param {Object} callback.comment The comment found or undefined.
         */
        getById: function(id, callback) {
            var sql = [
                'SELECT *',
                'FROM full_visible_comments',
                'WHERE domain = ? AND id = ?'
            ];

            this.db.queryOne(sql, [this.domain, id], callback);
        },

        /**
         * Finds list of all comments for a particular target.
         * Excludes deleted comments.
         *
         * @param {Object} target The target:
         * @param {String} target.type One of: class, guide, video.
         * @param {String} target.cls The name of the class, guide or video.
         * @param {String} target.member The name of class member or empty string.
         *
         * @param {Function} callback Called with the result.
         * @param {Object[]} callback.comments An array of comment rows.
         */
        find: function(target, callback) {
            var sql = [
                'SELECT *',
                'FROM full_visible_comments',
                'WHERE domain = ? AND type = ? AND cls = ? AND member = ?',
                'ORDER BY created_at'
            ];

            this.db.query(sql, [this.domain, target.type, target.cls, target.member], callback);
        },

        /**
         * Returns all comments sorted in reverse chronological order.
         * Excludes deleted comments.
         *
         * @param {Object} opts Options for the query:
         * @param {Number} [opts.limit=100] Number of rows to return.
         * @param {Number} [opts.offset=0] The starting index.
         *
         * @param {Function} callback Called with the result.
         * @param {Object[]} callback.comments An array of comment rows.
         */
        findRecent: function(opts, callback) {
            var sql = [
                'SELECT *',
                'FROM full_visible_comments',
                'WHERE domain = ?',
                'ORDER BY created_at DESC',
                'LIMIT ? OFFSET ?'
            ];

            this.db.query(sql, [this.domain, opts.limit||100, opts.offset||0], callback);
        },

        /**
         * Counts number of comments in the current domain.
         * Excludes deleted comments.
         *
         * @param {Object} opts Reserved for future.
         *
         * @param {Function} callback Called with the result.
         * @param {Number} callback.count The number of comments found.
         */
        count: function(opts, callback) {
            var sql = [
                'SELECT COUNT(*) as count',
                'FROM full_visible_comments',
                'WHERE domain = ?'
            ];

            this.db.queryOne(sql, [this.domain], function(row) {
                callback(+row.count);
            });
        },

        /**
         * Returns number of comments for each target in the current
         * domain.  Excludes deleted comments.
         *
         * @param {Function} callback Called with the result.
         * @param {Object} callback.counts Map of targets to counts:
         *
         *     {
         *         "class__Ext__": 3,
         *         "class__Ext__method-define": 1,
         *         "class__Ext.Panel__cfg-title": 8
         *     }
         */
        countsPerTarget: function(callback) {
            var sql = [
                'SELECT',
                '    type,',
                '    cls,',
                '    member,',
                '    count(*) AS count',
                'FROM full_visible_comments',
                'WHERE domain = ?',
                'GROUP BY target_id'
            ];

            this.db.query(sql, [this.domain], function(rows) {
                var map = {};
                rows.forEach(function(r) {
                    var id = [r.type, r.cls, r.member].join("__");
                    map[id] = +r.count;
                });
                callback(map);
            });
        },

        /**
         * Adds new comment for a target.
         * If the target doesn't yet exist, creates it first.
         *
         * @param {Object} comment A comment object with fields:
         * @param {Number} comment.user_id ID of logged-in user.
         * @param {String} comment.content The text of comment.
         * @param {String} comment.content_html Formatted text of comment.
         * @param {String} comment.type   Type name of target.
         * @param {String} comment.cls    Class name of target.
         * @param {String} comment.member Member name of target.
         * @param {Function} callback
         * @param {Function} callback.id The ID of newly inserted comment.
         */
        add: function(comment, callback) {
            this.targets.ensure(comment, function(target_id) {
                this.db.insert('comments', {
                    target_id: target_id,
                    user_id: comment.user_id,
                    content: comment.content,
                    content_html: comment.content_html,
                    created_at: new Date()
                }, callback);
            }.bind(this));
        },

        /**
         * Updates existing comment.
         *
         * @param {Object} comment A comment object with fields:
         * @param {Number} comment.id ID of the comment to update.
         * @param {Number} comment.user_id ID of the user doing the update.
         * @param {String} comment.content New text for the comment.
         * @param {String} comment.content_html New formatted text for the comment.
         * @param {Function} callback Called when done.
         */
        update: function(comment, callback) {
            var data = {
                id: comment.id,
                content: comment.content,
                content_html: comment.content_html
            };
            this.db.update("comments", data, function() {
                this.db.insert("updates", {
                    comment_id: comment.id,
                    user_id: comment.user_id,
                    action: 'update',
                    created_at: new Date()
                }, callback);
            }.bind(this));
        }
    };

    return Comments;
})();
