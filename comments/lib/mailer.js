var nodemailer = require("nodemailer");
var config = require("../config");

/**
 * Takes care of notifying subscribers about a new comment.
 *
 * @constructor
 *
 * @param {Object} cfg Config object:
 * @param {TableFactory} cfg.db Access to database tables.
 * @param {Object} cfg.comment The new comment that was posted.
 * @param {String} cfg.threadUrl The URL from where the comment came from.
 */
function Mailer(cfg) {
    this.db = cfg.db;
    this.comment = cfg.comment;
    this.threadUrl = cfg.threadUrl;
}

Mailer.prototype = {
    /**
     * Sends e-mail updates about the comment to all subscribers who
     * have subscribed to that thread.
     */
    sendEmailUpdates: function() {
        this.db.subscriptions().findUsersByTarget(this.comment.target_id, function(err, users) {
            // don't send e-mail to the user who posted the comment
            var otherUsers = users.filter(function(u){
                return u.id !== this.comment.user_id;
            }, this);

            if (otherUsers.length === 0) {
                return;
            }

            var emails = otherUsers.map(this.createMessage, this);

            this.batchSend(emails);
        }.bind(this));
    },

    createMessage: function(user) {
        var title = this.createTitle();

        return {
            from: config.email.from,
            to: user.email,
            subject: "Comment on '" + title + "'",
            text: [
                "A comment by " + user.username + " on '" + title + "' was posted on the Sencha Documentation:\n",
                this.comment.content + "\n",
                "--",
                "Original thread: " + this.threadUrl
            ].join("\n")
        };
    },

    createTitle: function() {
        if (this.comment.type === "class") {
            return this.comment.cls + " " + this.comment.member;
        }
        else {
            return this.comment.type + " " + this.comment.cls;
        }
    },

    batchSend: function(emails) {
        this.transport = nodemailer.createTransport("SMTP", config.email.config);

        this.send(emails, function() {
            this.transport.close();
        }.bind(this));
    },

    // Here the actual sending happens
    send: function(emails, callback) {
        var mail = emails.shift();

        if (!mail) {
            callback();
            return;
        }

        this.transport.sendMail(mail, function(err) {
            if (err) {
                console.log("Failed sending e-mail to " + mail.to);
                console.log(err);
            }
            else {
                console.log("Sent e-mail to " + mail.to);
            }

            this.send(emails, callback);
        }.bind(this));
    }
};

module.exports = Mailer;
