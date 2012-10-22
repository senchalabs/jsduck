/**
 * Implements adding and removing of tags from comments and hides the
 * logic of managing the tags and comment_tags tables.
 *
 * @constructor
 * Initializes Tags with a database connection and a target domain.
 *
 * @param {DbFacade} db Instance of DbFacade.
 * @param {String} domain The comments domain within which to work.
 */
function Tags(db, domain) {
    this.db = db;
    this.domain = domain;
}

Tags.prototype = {
    /**
     * Adds tag to the comment.
     *
     * @param {Object} tag
     * @param {Number} tag.user_id The user who's tagging.
     * @param {Number} tag.comment_id The comment that's tagged.
     * @param {Number} tag.tagname The text for the tag.
     * @param {Function} callback
     * @param {Error} callback.err
     */
    add: function(tag, callback) {
        this.ensure(tag.tagname, function(err, tag_id) {
            if (err) {
                callback(err);
                return;
            }

            // replace `tagname` with `tag_id` in tag object
            delete tag.tagname;
            tag.tag_id = tag_id;

            this.db.insert("comment_tags", tag, callback);
        }.bind(this));
    },

    /**
     * Removes tag from comment.
     *
     * @param {Object} tag
     * @param {Number} tag.comment_id The comment with the tag.
     * @param {Number} tag.tagname The text of the tag.
     * @param {Function} callback
     * @param {Error} callback.err
     */
    remove: function(tag, callback) {
        this.getId(tag.tagname, function(err, tag_id) {
            if (err) {
                callback(err);
                return;
            }

            var sql = "DELETE FROM comment_tags WHERE comment_id = ? AND tag_id = ?";
            this.db.query(sql, [tag.comment_id, tag_id], callback);
        }.bind(this));
    },

    // Returns ID of the given tagname,
    // creating a new entry to tags table when needed.
    ensure: function(tagname, callback) {
        this.db.insert("tags", {domain: this.domain, tagname: tagname}, function(err, tag_id) {
            if (err && err.code === "ER_DUP_ENTRY") {
                // tag already exists, retrieve it
                this.getId(tagname, callback);
            }
            else if (err) {
                callback(err);
            }
            else {
                callback(null, tag_id);
            }
        }.bind(this));
    },

    // Simple lookup of tag ID by name
    getId: function(tagname, callback) {
        var sql = "SELECT * FROM tags WHERE tagname = ? AND domain = ?";
        this.db.queryOne(sql, [tagname, this.domain], function(err, existingTag) {
            if (err) {
                callback(err);
            }
            else if (!existingTag) {
                callback("Tag '"+tagname+"' not found.");
            }
            else {
                callback(null, existingTag.id);
            }
        });
    }
};

module.exports = Tags;
