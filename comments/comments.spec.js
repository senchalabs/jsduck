describe("Comments", function() {
    var Comments = require("./comments");
    var mysql = require('mysql');
    var connection;
    var comments;

    beforeEach(function() {
        connection = mysql.createConnection({
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
        comments.getById(7, function(com) {
            expect(com.id).toEqual(7);
            done();
        });
    });

    it("#getById returns undefined when no comment with such ID", function(done) {
        comments.getById(123456, function(com) {
            expect(com).toEqual(undefined);
            done();
        });
    });

    it("#getById returns undefined when ID exists in other domain.", function(done) {
        comments.getById(30, function(com) {
            expect(com).toEqual(undefined);
            done();
        });
    });

    it("#getById returns undefined when comment with ID is deleted", function(done) {
        comments.getById(6, function(com) {
            expect(com).toEqual(undefined);
            done();
        });
    });

    it("#find returns all undeleted comments for a target", function(done) {
        comments.find({type: "class", cls: "Ext", member: ""}, function(rows) {
            expect(rows.length).toEqual(5);
            done();
        });
    });

    it("#findRecent returns n recent comments", function(done) {
        comments.findRecent({limit: 10, offset: 0}, function(rows) {
            expect(rows.length).toEqual(10);
            done();
        });
    });

    it("#findRecent without offset option defaults to offset:0", function(done) {
        comments.findRecent({limit: 10}, function(rows) {
            expect(rows.length).toEqual(10);
            done();
        });
    });

    it("#findRecent without limit option defaults to limit:100 or max nr of comments", function(done) {
        comments.findRecent({}, function(rows) {
            expect(rows.length).toEqual(24);
            done();
        });
    });

    it("#count gets total number of comments", function(done) {
        comments.count({}, function(cnt) {
            expect(cnt).toEqual(24);
            done();
        });
    });

    it("#countPerTarget gets number of comments for each target", function(done) {
        comments.countsPerTarget(function(counts) {
            expect(counts["class__Ext__"]).toEqual(5);
            done();
        });
    });

});
