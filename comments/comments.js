
module.exports = (function(){
    /**
     * Represents a Comments table.
     *
     * @constructor
     * Initializes Comments with a database connection and a target domain.
     *
     * @param {mysql.Connection} db MySQL connection object.
     *
     * @param {String} domain The comments domain within which to work.
     * For example by passing "touch-2" the #find method will only find
     * comments within touch-2 domain.
     */
    function Comments(db, domain) {
        this.db = db;
        this.domain = domain;
    }

    Comments.prototype = {
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

            this.query(sql, [this.domain, target.type, target.cls, target.member], callback);
        },

        /**
         * Returns all comments sorted in reverse chronological order.
         * Excludes deleted comments.
         *
         * @param {Object} opts Options for the query:
         * @param {Number} opts.limit Number of rows to return.
         * @param {Number} opts.offset The starting index.
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

            this.query(sql, [this.domain, opts.limit, opts.offset], callback);
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

            this.query(sql, [this.domain], function(rows) {
                callback(rows[0].count);
            });
        },

        query: function(sqlLines, params, callback) {
            this.db.query(sqlLines.join("\n"), params, function(err, rows) {
                if (err) throw err;

                callback(rows);
            });
        }
    };

    return Comments;
})();
