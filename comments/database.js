
/**
 * Defines comment schema and connects to database
 */

var mongoose = require('mongoose'),
    config = require('./config');

CommentSchema = new mongoose.Schema({
    sdk:         String,
    version:     String,

    author:      String,
    userId:      Number,
    content:     String,
    contentHtml: String,
    createdAt:   Date,
    downVotes:   Array,
    emailHash:   String,
    rating:      Number,
    target:      Array,
    upVotes:     Array,
    deleted:     Boolean,
    updates:     Array,
    mod:         Boolean,
    title:       String,
    url:         String
});

// Helper method for adding new comments.
// When moderator posts comment, mark it automatically as read.
CommentSchema.methods.saveNew = function(user, next) {
    var comment = this;
    if (user.moderator) {
        comment.save(function(err) {
            var meta = new Meta({
                userId: user.userid,
                commentId: comment._id,
                metaType: 'read'
            });
            meta.save(next);
        });
    }
    else {
        comment.save(next);
    }
};

Comment = mongoose.model('Comment', CommentSchema);

Subscription = mongoose.model('Subscription', new mongoose.Schema({
    sdk:         String,
    version:     String,

    createdAt:   Date,
    userId:      Number,
    email:       String,
    target:      Array
}));

Meta = mongoose.model('Meta', new mongoose.Schema({
    sdk:         String,
    version:     String,

    createdAt:   Date,
    userId:      Number,
    commentId:   String,
    metaType:    String
}));

mongoose.connect(config.mongoDb, function(err, ok) {
    console.log("Connected to DB")
});
