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
        var usersMap = extractUniqueUsers(data.mongo_comments);
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

            data.usersMap = usersMap;
            data.users = users;
            addIds(data.users);
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
            usersMap[buildKey(c)] = record;

            // Also add voters.
            // But in this case don't overwrite user data if already
            // present as votes only contain username.
            c.upVotes.concat(c.downVotes).forEach(function(username) {
                if (!usersMap[username]) {
                    usersMap[username] = {
                        username: username
                    };
                }
            });
        });

        return usersMap;
    }

    function buildKey(c) {
        return c.author;
    }

    return {
        extract: extract,
        buildKey: buildKey
    };
})();

var TargetsTable = (function() {
    function extract(data, next) {
        data.targetsMap = extractUniqueTargets(data.mongo_comments);
        data.targets = objectValues(data.targetsMap);
        addIds(data.targets);
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
            map[buildKey(c)] = target;
        });

        return map;
    }

    function buildKey(c) {
        return [c.sdk+"-"+c.version, c.target[0], c.target[1], c.target[2]].join(":");
    }

    return {
        extract: extract,
        buildKey: buildKey
    };
})();

var CommentsTable = (function() {
    function extract(data, next) {
        data.commentsMap = buildCommentsMap(data);
        data.comments = objectValues(data.commentsMap);
        addIds(data.comments);
        next();
    }

    function buildCommentsMap(data) {
        var map = {};
        data.mongo_comments.forEach(function(c) {
            map[buildKey(c)] = {
                user_id: data.usersMap[UsersTable.buildKey(c)].id,
                target_id: data.targetsMap[TargetsTable.buildKey(c)].id,
                content: c.content,
                content_html: c.contentHtml,
                created_at: c.createdAt,
                deleted: c.deleted
            };
        });
        return map;
    }

    function buildKey(c) {
        return c._id;
    }

    return {
        extract: extract,
        buildKey: buildKey
    };
})();

var VotesTable = (function() {
    function extract(data, next) {
        var votes = [];

        function addVotes(c, usernames, value) {
            usernames.forEach(function(username) {
                votes.push({
                    user_id: data.usersMap[username].id,
                    comment_id: data.commentsMap[CommentsTable.buildKey(c)].id,
                    value: value,
                    created_at: null
                });
            });
        }

        data.mongo_comments.forEach(function(c) {
            addVotes(c, c.upVotes, +1);
            addVotes(c, c.downVotes, -1);
        });

        addIds(votes);

        data.votes = votes;

        next();
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

// Adds id: properties with values 1, 2, 3, ... to every object.
function addIds(objects) {
    var id = 1;
    objects.forEach(function(obj) {
        obj.id = id;
        id++;
    });
}


Comment.find({}, function(err, mongo_comments) {
    if (err) throw err;

    var data = {mongo_comments: mongo_comments};

    sequence(data, [
        UsersTable.extract,
        TargetsTable.extract,
        CommentsTable.extract,
        VotesTable.extract,
        function(data, next) {
            console.log(data.users.length + " users");
            console.log(data.targets.length + " targets");
            console.log(data.comments.length + " comments");
            console.log(data.votes.length + " votes");
            process.exit();
        }
    ]);
});

