var regexpQuote = require("regexp-quote");

/**
 * @singleton
 * Detection of `@username` style replies inside comments.
 */
var ReplyDetector = {
    /**
     * Determines if the comment is intended as a reply to some of the
     * other users who have posted in this thread.
     *
     * @param {String} comment Plain comment text that was posted.
     * @param {Object[]} users Array of users who have posted to this
     * thread.  This should be a unique list without duplicates and
     * without the user who's the author of posted comment.
     * @return {Object[]} Array of users that were mentioned in the
     * comment, if any.
     */
    detect: function(comment, users) {
        // sort users with longer names to be at the beginning.
        // This way when comment mentions @john.doe
        // and we have users "john" and "john.doe",
        // then user "john.doe" will be matched first.
        users.sort(function(a, b) {
            return b.username.length - a.username.length;
        });

        // split comment into parts where each part begins with @-sign
        var parts = comment.split(/@/);
        // ignore the part before the first @-sign
        parts.shift();

        // check each remaining part against all the usernames
        var detectedUsers = [];
        parts.forEach(function(snippet) {
            var user = this.matchUser(snippet, users);
            if (user && detectedUsers.indexOf(user) === -1) {
                detectedUsers.push(user);
            }
        }.bind(this));

        return detectedUsers;
    },

    // Returns the first user in list who's name matches with the
    // beginning of the given text snippet.
    matchUser: function(snippet, users) {
        for (var i=0; i<users.length; i++) {
            var user = users[i];
            var re = new RegExp('^'+regexpQuote(user.username) + '\\b', "i");
            if (re.test(snippet)) {
                return user;
            }
        }
        return false;
    }
};

module.exports = ReplyDetector;
