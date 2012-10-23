// Generates tags "Fixed internally" and "Fixed in 4.1"
// based on the contents of comments.

var mysql = require("mysql");
var DbFacade = require('./lib/db_facade');
var Comments = require('./lib/comments');
var config = require('./config.js');

var db = new DbFacade(mysql.createConnection(config.mysql));

function loopInSequence(arr, callback, eventually) {
    var i = -1;
    function next() {
        i++;
        if (i < arr.length) {
            callback(arr[i], next);
        }
        else {
            eventually();
        }
    }
    next();
}

function addTags(domain, tagname, callback) {
    console.log("Adding '"+tagname+"' tags for "+domain);
    var comments = new Comments(db, domain);
    db.query("SELECT id FROM full_comments WHERE content LIKE '%"+tagname+"%' AND domain = ?", [domain], function(err, rows) {
        if (err) {
            throw err;
        }

        var i = 0;
        loopInSequence(rows, function(row, next) {
            console.log(++i);
            comments.addTag({
                user_id: 3,
                comment_id: row.id,
                tagname: tagname
            }, next);
        }, callback);
    });
}

loopInSequence(["Fixed internally", "Fixed in 4.1"], function(tagname, next) {
    addTags("ext-js-4", tagname, next);
}, process.exit.bind(process));