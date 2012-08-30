describe("Comments", function() {
    var Comments = require("./comments");
    var DbFacade = require('./db_facade');
    var connection;
    var comments;

    beforeEach(function() {
        connection = new DbFacade({
            host: 'localhost',
            user: '',
            password: '',
            database: 'comments_test'
        });

        comments = new Comments(connection, "ext-js-4");
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

    it("#count gets total number of comments in current domain", function(done) {
        comments.count({}, function(err, cnt) {
            expect(cnt).toEqual(24);
            done();
        });
    });

    describe("when initializing Comments to other domain", function() {
        beforeEach(function() {
            comments = new Comments(connection, "touch-2");
        });

        it("#count gets total number of comments in the other domain", function(done) {
            comments.count({}, function(err, cnt) {
                expect(cnt).toEqual(4);
                done();
            });
        });
    });

    it("#countPerTarget gets number of comments for each target", function(done) {
        comments.countsPerTarget(function(err, counts) {
            var line = counts.filter(function(row) { return row._id === "class__Ext__"; })[0];
            expect(line.value).toEqual(5);
            done();
        });
    });

    it("#add adds a new comment and returns its ID which we can then use to retrieve the comment", function(done) {
        var com = {
            user_id: 1,

            content: "Blah.",
            content_html: "<p>Blah.</p>",

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
            content_html: "<p>Blah.</p>",

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

});
