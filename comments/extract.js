/**
 * Extracts data from comments database
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


var UsersTable = (function() {
    function extract(data, next) {
        var usersMap = extractUniqueUsers(data.comments);
        var users = objectValues(usersMap);

        var usersWithoutId = users.filter(function(u){ return !u.external_id; });

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

            data.users = users;
            next();
        });
    }

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

    return {
        extract: extract
    };
})();

var TargetsTable = (function() {
    function extract(data, next) {
        data.targets = objectValues(extractUniqueTargets(data.comments));
        next();
    }

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

    return {
        extract: extract
    };
})();

// Calls an array of functions in sequence passing to each function
// the data argument and a function to call when it finishes.
function sequence(data, callbacks) {
    var cb = callbacks.shift();
    if (cb) {
        cb(data, function() {
            sequence(data, callbacks);
        });
    }
}

function objectValues(obj) {
    var values = [];
    for (var i in obj) {
        values.push(obj[i]);
    }
    return values;
}


Comment.find({}, function(err, comments) {
    if (err) throw err;

    var data = {comments: comments};

    sequence(data, [
        UsersTable.extract,
        TargetsTable.extract,
        function(data, next) {
            console.log(data.comments.length + " comments");
            console.log(data.users.length + " users");
            console.log(data.targets.length + " targets");
            process.exit();
        }
    ]);
});

