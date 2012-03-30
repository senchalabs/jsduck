
/**
 * Defines comment schema and connects to database
 */

var mongoose = require('mongoose'),
    config = require('./config');

Comment = mongoose.model('Comment', new mongoose.Schema({
    sdk:         String,
    version:     String,

    action:      String,
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
}));

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
