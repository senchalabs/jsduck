var crypto = require('crypto');

/**
 * @class ApiAdapter
 * Provides methods to convert between old JSON API and how things are
 * named in our MySQL database.
 */
module.exports = {
    /**
     * Turns comment row into JSON response.
     */
    commentToJson: function(comment) {
        return {
            author: comment.username,
            contentHtml: comment.content_html,
            createdAt: String(comment.created_at),
            score: comment.vote,
            moderator: comment.moderator,
            emailHash: crypto.createHash('md5').update(comment.email).digest("hex")
        };
    },

    /**
     * Turns target array in JSON into {type,cls,member} object.
     */
    targetFromJson: function(target) {
        return {
            type: target[0],
            cls: target[1],
            member: target[2] || ""
        };
    }
};