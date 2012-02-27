/**
 * Defines comment schema and connects to database
 */
Comment = mongoose.model('Comment', new mongoose.Schema({
    sdk:         String,
    version:     String,

    action:      String,
    author:      String,
    content:     String,
    contentHtml: String,
    createdAt:   Date,
    downVotes:   Array,
    emailHash:   String,
    rating:      Number,
    target:      Array,
    upVotes:     Array,
    deleted:     Boolean,
    updates:     Array
}));

mongoose.connect(config.mongoDb);
