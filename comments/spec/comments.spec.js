describe("Comments", function() {
    var mysql = require("mysql");
    var Comments = require("../lib/comments");
    var DbFacade = require('../lib/db_facade');
    var config = require('../config');
    var connection;
    var comments;

    beforeEach(function() {
        connection = mysql.createConnection(config.testDb);

        comments = new Comments(new DbFacade(connection), "ext-js-4");
    });

    afterEach(function() {
        connection.end();
    });

    it("#getById returns comment with given ID", function(done) {
        comments.getById(7, function(err, com) {
            expect(com.id).toEqual(7);
            done();
        });
    });

    it("#getById returns undefined when no comment with such ID", function(done) {
        comments.getById(123456, function(err, com) {
            expect(com).toEqual(undefined);
            done();
        });
    });

    it("#getById returns undefined when ID exists in other domain.", function(done) {
        comments.getById(30, function(err, com) {
            expect(com).toEqual(undefined);
            done();
        });
    });

    it("#getById returns undefined when comment with ID is deleted", function(done) {
        comments.getById(6, function(err, com) {
            expect(com).toEqual(undefined);
            done();
        });
    });

    describe("after calling showDeleted(true)", function() {
        beforeEach(function() {
            comments.showDeleted(true);
        });
        it("#getById also finds the deleted comment", function(done) {
            comments.getById(6, function(err, com) {
                expect(com.id).toEqual(6);
                done();
            });
        });
    });

    describe("after calling showVoteDirBy(author)", function() {
        beforeEach(function() {
            comments.showVoteDirBy(2);
        });
        it("includes the upvote by that author", function(done) {
            comments.getById(1, function(err, com) {
                expect(com.vote_dir).toEqual(1);
                done();
            });
        });
        it("includes the downvote by that author", function(done) {
            comments.getById(15, function(err, com) {
                expect(com.vote_dir).toEqual(-1);
                done();
            });
        });
        it("includes no vote if user hasn't voted on a comment", function(done) {
            comments.getById(7, function(err, com) {
                expect(com.vote_dir).toEqual(null);
                done();
            });
        });
    });

    describe("after calling showReadBy(user)", function() {
        beforeEach(function() {
            comments.showReadBy(1);
        });
        it("#getById includes read:true when user has read the comment", function(done) {
            comments.getById(1, function(err, com) {
                if (err) throw err;
                expect(com.read).toEqual(true);
                done();
            });
        });
        it("#getById includes read:false when user hasn't read the comment", function(done) {
            comments.getById(7, function(err, com) {
                expect(com.read).toEqual(false);
                done();
            });
        });
    });

    it("#find returns all undeleted comments for a target", function(done) {
        comments.find({type: "class", cls: "Ext", member: ""}, function(err, rows) {
            expect(rows.length).toEqual(5);
            done();
        });
    });

    it("#find returns empty array when target not found", function(done) {
        comments.find({type: "class", cls: "Foo", member: "bar"}, function(err, rows) {
            expect(rows.length).toEqual(0);
            done();
        });
    });

    it("#find returns empty array when target not in current domain", function(done) {
        comments.find({type: "guide", cls: "forms", member: ""}, function(err, rows) {
            expect(rows.length).toEqual(0);
            done();
        });
    });

    it("#findRecent returns n recent comments", function(done) {
        comments.findRecent({limit: 10, offset: 0}, function(err, rows) {
            expect(rows.length).toEqual(10);
            done();
        });
    });

    it("#findRecent without offset option defaults to offset:0", function(done) {
        comments.findRecent({limit: 10}, function(err, rows) {
            expect(rows.length).toEqual(10);
            done();
        });
    });

    it("#findRecent without limit option defaults to limit:100 or max nr of comments", function(done) {
        comments.findRecent({}, function(err, rows) {
            expect(rows.length).toEqual(24);
            done();
        });
    });

    it("#findRecent with orderBy:vote sorts to highest voted comment to top", function(done) {
        comments.findRecent({orderBy: "vote"}, function(err, rows) {
            expect(rows[0].vote).toEqual(4);
            done();
        });
    });

    it("#findRecent with hideUser:1 excludes user with ID 1 from results", function(done) {
        comments.findRecent({hideUser: 1}, function(err, rows) {
            expect(rows.every(function(r){return r.user_id !== 1;})).toEqual(true);
            done();
        });
    });

    it("#findRecent with hideRead:true excludes comments that have been read by current user", function(done) {
        comments.showReadBy(1);
        comments.findRecent({hideRead: true}, function(err, rows) {
            expect(rows.every(function(r){return r.read === false;})).toEqual(true);
            done();
        });
    });

    it("#findRecent with username:renku includes only comments by that user", function(done) {
        comments.findRecent({username: "renku"}, function(err, rows) {
            expect(rows.every(function(r){return r.username === "renku";})).toEqual(true);
            done();
        });
    });

    it("#findRecent with targetId:1 includes only comments for that target", function(done) {
        comments.findRecent({targetId: 1}, function(err, rows) {
            expect(rows.every(function(r){return r.target_id === 1;})).toEqual(true);
            done();
        });
    });

    it("#findRecent with tagname:feature includes only comments with that tag", function(done) {
        comments.findRecent({tagname: 'feature'}, function(err, rows) {
            expect(rows.length).toEqual(2);
            expect(rows.every(function(r){return /\bfeature\b/.test(r.tags);})).toEqual(true);
            done();
        });
    });

    it("#count gets total number of comments in current domain", function(done) {
        comments.count({}, function(err, cnt) {
            expect(cnt).toEqual(24);
            done();
        });
    });

    describe("when initializing Comments to other domain", function() {
        beforeEach(function() {
            comments = new Comments(new DbFacade(connection), "touch-2");
        });

        it("#count gets total number of comments in the other domain", function(done) {
            comments.count({}, function(err, cnt) {
                expect(cnt).toEqual(4);
                done();
            });
        });
    });

    it("#count with hideUser:1 excludes comments by that user from the count", function(done) {
        comments.count({hideUser: 1}, function(err, cnt) {
            expect(cnt).toEqual(19);
            done();
        });
    });

    it("#count with hideRead:false counts all comments", function(done) {
        comments.showReadBy(1);
        comments.count({hideRead: false}, function(err, cnt) {
            expect(cnt).toEqual(24);
            done();
        });
    });

    it("#count with hideRead:true excludes comments that have been read by current user", function(done) {
        comments.showReadBy(1);
        comments.count({hideRead: true}, function(err, cnt) {
            expect(cnt).toEqual(19);
            done();
        });
    });

    it("#count with username:renku includes only comments of that user", function(done) {
        comments.count({username: "renku"}, function(err, cnt) {
            expect(cnt).toEqual(5);
            done();
        });
    });

    it("#count with targetId:1 includes only comments of that target", function(done) {
        comments.count({targetId: 1}, function(err, cnt) {
            expect(cnt).toEqual(5);
            done();
        });
    });

    it("#countPerTarget gets number of comments for each target", function(done) {
        comments.countsPerTarget(function(err, counts) {
            var line = counts.filter(function(row) { return row._id === "class__Ext__"; })[0];
            expect(line.value).toEqual(5);
            done();
        });
    });

    it("#getTopUsers gives all users who have posted to this domain", function(done) {
        comments.getTopUsers("votes", function(err, users) {
            expect(users.length).toEqual(5);
            done();
        });
    });

    it("#getTopUsers('votes') gives users sorted by votes", function(done) {
        comments.getTopUsers("votes", function(err, users) {
            expect(users[0].score).toBeGreaterThan(users[1].score);
            done();
        });
    });

    it("#getTopUsers('comments') gives users sorted by comment counts", function(done) {
        comments.getTopUsers("comments", function(err, users) {
            expect(users[0].score).toBeGreaterThan(users[1].score);
            done();
        });
    });

    it("#getTopTargets gives all targets that have received posts in this domain", function(done) {
        comments.getTopTargets(function(err, targets) {
            expect(targets.length).toEqual(11);
            done();
        });
    });

    it("#getTopTargets sorts targets by number of comments", function(done) {
        comments.getTopTargets(function(err, targets) {
            expect(targets[0].score).toBeGreaterThan(targets[1].score);
            done();
        });
    });

    it("#add adds a new comment and returns its ID which we can then use to retrieve the comment", function(done) {
        var com = {
            user_id: 1,
            content: "Blah.",
            target: {
                type: "class",
                cls: "Ext",
                member: "method-getBody"
            }
        };
        comments.add(com, function(err, id) {
            comments.getById(id, function(err, newCom) {
                expect(newCom.id).toEqual(id);
                done();
            });
        });
    });

    it("#add adds a new target when it doesn't yet exist", function(done) {
        var com = {
            user_id: 1,
            content: "Blah.",
            target: {
                type: "class",
                cls: "Blah",
                member: "method-foo"
            }
        };
        comments.add(com, function(err, id) {
            comments.getById(id, function(err, newCom) {
                expect(newCom.cls).toEqual("Blah");
                done();
            });
        });
    });

    it("#add auto-generates content_html field", function(done) {
        var com = {
            user_id: 1,
            content: "Blah.",
            target: {
                type: "class",
                cls: "Ext",
                member: "method-getBody"
            }
        };
        comments.add(com, function(err, id) {
            comments.getById(id, function(err, newCom) {
                expect(newCom.content_html.trim()).toEqual("<p>Blah.</p>");
                done();
            });
        });
    });


    it("#update modifies content of existing comment", function(done) {
        var com = {
            id: 10,
            user_id: 1,

            content: "New content.",
            content_html: "<p>New content.</p>"
        };
        comments.update(com, function(err) {
            comments.getById(com.id, function(err, newCom) {
                expect(newCom.content).toEqual("New content.");
                done();
            });
        });
    });

    it("#update doesn't change the user_id of the comment it modified", function(done) {
        var com = {
            id: 10,
            user_id: 1,

            content: "New content.",
            content_html: "<p>New content.</p>"
        };
        comments.update(com, function(err) {
            comments.getById(com.id, function(err, newCom) {
                expect(newCom.user_id).toEqual(4);
                done();
            });
        });
    });

    it("#setDeleted(true) marks comment as deleted, so it can't be accessed any more", function(done) {
        comments.setDeleted({deleted: true, id: 10, user_id: 1}, function(err) {
            comments.getById(10, function(err, newCom) {
                expect(newCom).toEqual(null);
                done();
            });
        });
    });

    it("#setDeleted(false) undoes the delete, so comment can be accessed again", function(done) {
        comments.setDeleted({deleted: false, id: 10, user_id: 1}, function(err) {
            comments.getById(10, function(err, newCom) {
                expect(newCom).not.toEqual(null);
                done();
            });
        });
    });

    it("#vote(value:1) votes a comment up", function(done) {
        comments.vote({value: 1, comment_id: 7, user_id: 3}, function(err, voteDir, total) {
            expect(voteDir).toEqual(1);
            expect(total).toEqual(3);
            done();
        });
    });

    it("#vote(value:-1) votes a comment down", function(done) {
        comments.vote({value: -1, comment_id: 15, user_id: 3}, function(err, voteDir, total) {
            expect(voteDir).toEqual(-1);
            expect(total).toEqual(-2);
            done();
        });
    });

    it("#vote(value:-1) on already upvoted comment eliminates the vote", function(done) {
        comments.vote({value: -1, comment_id: 19, user_id: 1}, function(err, voteDir, total) {
            expect(voteDir).toEqual(0);
            expect(total).toEqual(0);
            done();
        });
    });

    it("#vote(value:1) on already downvoted comment eliminates the vote", function(done) {
        comments.vote({value: 1, comment_id: 6, user_id: 3}, function(err, voteDir, total) {
            expect(voteDir).toEqual(0);
            expect(total).toEqual(-2);
            done();
        });
    });

    it("#markRead marks comment as read", function(done) {
        comments.markRead({comment_id: 7, user_id: 1}, function(err) {
            if (err) throw err;
            comments.showReadBy(1);
            comments.getById(7, function(err, com) {
                expect(com.read).toEqual(true);
                done();
            });
        });
    });

    it("#markRead on already read comment keeps the comment as read", function(done) {
        comments.markRead({comment_id: 7, user_id: 1}, function(err) {
            if (err) throw err;
            comments.showReadBy(1);
            comments.getById(7, function(err, com) {
                expect(com.read).toEqual(true);
                done();
            });
        });
    });
});
