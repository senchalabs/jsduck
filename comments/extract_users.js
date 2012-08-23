/**
 * Extracts users data from comments database
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

    var usersMap = extractUniqueUsers(comments);
    var users = objectValues(usersMap);

    console.log(users.length + " users found.");

    var usersWithoutId = users.filter(function(u){ return !u.external_id; });
    console.log(usersWithoutId.length + " without external_id.");

    var usernames = usersWithoutId.map(function(u){ return u.username; });
    db.query("SELECT userid, username FROM user WHERE username IN (?)", [usernames], function(err, rows) {
        if (err) throw err;

        rows.forEach(function(r) {
            if (usersMap[r.username]) {
                usersMap[r.username].external_id = r.userid;
            }
            else {
                // Turns out that Sencha Forum DB contains users zoob
                // and Zoob.  Only Zoob has commented in docs, but our
                // SELECT query compares strings case-insensitively
                // resulting in bot zoob and Zoob being selected.
                // So simply ignore zoob and other users like him.
            }
        });

        var usersWithoutId = users.filter(function(u){ return !u.external_id; });
        console.log(usersWithoutId.length + " without external_id in the end.");

        process.exit();
    });
});

function extractUniqueUsers(comments) {
    var usersMap = {};

    comments.forEach(function(c) {
        var record = {
            username: c.author,
            email_hash: c.emailHash,
            external_id: c.userId,
            moderator: c.moderator
        };
        // always overwrite with latest user data
        usersMap[c.author] = record;
    });

    return usersMap;
}

function objectValues(obj) {
    var values = [];
    for (var i in obj) {
        values.push(obj[i]);
    }
    return values;
}
