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
            database: 'comments'
        });

        comments = new Comments(connection, "ext-js-4");
    });

    afterEach(function() {
        connection.end();
    });

    it("#find returns comments for a target", function(done) {
        comments.find({type: "class", cls: "Ext", member: "method-define"}, function(rows) {
            expect(rows.length).toEqual(4);
            done();
        });
    });

    it("#findRecent returns n recent comments", function(done) {
        comments.findRecent({limit: 10, offset: 0}, function(rows) {
            expect(rows.length).toEqual(10);
            done();
        });
    });

    it("#findRecent without offset option default to offset:0", function(done) {
        comments.findRecent({limit: 10}, function(rows) {
            expect(rows.length).toEqual(10);
            done();
        });
    });

    it("#findRecent without limit option default to limit:100", function(done) {
        comments.findRecent({}, function(rows) {
            expect(rows.length).toEqual(100);
            done();
        });
    });

    it("#count gets total number of comments", function(done) {
        comments.count({}, function(cnt) {
            expect(cnt).toEqual(1705);
            done();
        });
    });

    it("#countPerTarget gets number of comments for each target", function(done) {
        comments.countsPerTarget(function(counts) {
            expect(counts["class__Ext.grid.column.Column__cfg-renderer"]).toEqual(20);
            done();
        });
    });

});
