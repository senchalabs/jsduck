describe("Tags", function() {
    var mysql = require("mysql");
    var Tags = require("../lib/tags");
    var Comments = require("../lib/comments");
    var DbFacade = require('../lib/db_facade');
    var config = require('../config');
    var connection;
    var comments;

    beforeEach(function() {
        connection = mysql.createConnection(config.testDb);

        // Test Tags class through the Comments class,
        // which just forwards two methods of the Tags class.
        comments = new Comments(new DbFacade(connection), "ext-js-4");
    });

    afterEach(function() {
        connection.end();
    });

    it("#getAllTags returns all tags in current domain", function(done) {
        comments.getAllTags(function(err, tags) {
            expect(tags).toEqual([{tagname: "bug"}, {tagname: "feature"}]);
            done();
        });
    });

    it("#getAllTags returns empty array when no tags in current domain", function(done) {
        comments = new Comments(new DbFacade(connection), "blabla");

        comments.getAllTags(function(err, tags) {
            expect(tags).toEqual([]);
            done();
        });
    });

    it("each comment has concatenated list of tags", function(done) {
        comments.getById(1, function(err, com) {
            expect(com.tags).toEqual("bug\tfeature");
            done();
        });
    });

    it("#addTag adds existing tag to a comment", function(done) {
        comments.addTag({tagname: 'feature', comment_id: 3, user_id: 1}, function(err, com) {
            comments.getById(3, function(err, com) {
                expect(com.tags).toEqual("feature");
                done();
            });
        });
    });

    it("#addTag adds new non-existing tag to a comment", function(done) {
        comments.addTag({tagname: 'blah', comment_id: 4, user_id: 1}, function(err, com) {
            comments.getById(4, function(err, com) {
                expect(com.tags).toEqual("blah");
                done();
            });
        });
    });

    it("#removeTag removes tag from comment", function(done) {
        comments.removeTag({tagname: 'feature', comment_id: 2}, function(err, com) {
            comments.getById(2, function(err, com) {
                expect(com.tags).toEqual("");
                done();
            });
        });
    });

    it("#removeTag does nothing when removing non-existing tag", function(done) {
        comments.removeTag({tagname: 'blablabla', comment_id: 5}, function(err, com) {
            comments.getById(5, function(err, com) {
                expect(com.tags).toEqual("");
                done();
            });
        });
    });
});
