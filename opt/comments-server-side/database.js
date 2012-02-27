/**
 * Defines comment schema and connects to database
 */
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

mongoose.connect(config.mongoDb);
