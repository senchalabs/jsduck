/**
 * Extracts targets data from comments database
 */

var config = require('./config');
require('./database');

var mysql = require('mysql');
var db = mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.dbName
});


Comment.find({}, function(err, comments) {
    if (err) throw err;
    console.log(comments.length + " comments found.");

    var targetsMap = extractUniqueTargets(comments);
    var targets = objectValues(targetsMap);

    console.log(targets.length + " targets found.");

    process.exit();
});

function extractUniqueTargets(comments) {
    var map = {};

    comments.forEach(function(c) {
        var target = {
            domain: c.sdk + "-" + c.version,
            type: c.target[0],
            cls: c.target[1],
            member: c.target[2]
        };
        var id = [target.domain, target.type, target.cls, target.member].join(":");
        map[id] = target;
    });

    return map;
}

function objectValues(obj) {
    var values = [];
    for (var i in obj) {
        values.push(obj[i]);
    }
    return values;
}
