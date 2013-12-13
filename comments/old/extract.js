/**
 * Extracts data from comments database
 */

var config = require('../config');
require('./database');

var mysql = require('mysql');
var db = mysql.createConnection({
    host: config.forumDb.host,
    user: config.forumDb.user,
    password: config.forumDb.password,
    database: config.forumDb.database
});

// Default date for all items that are missing a date.
var DEFAULT_DATE = new Date("Jan 1, 2011");

var MongoComments = (function() {
    function extract(data, next) {
        Comment.find({}, function(err, mongo_comments) {
            if (err) throw err;

            data.mongo_comments = mongo_comments;
            next();
        });
    }

    return {
        extract: extract
    };
})();

var MongoSubscriptions = (function() {
    function extract(data, next) {
        Subscription.find({}, function(err, mongo_subscriptions) {
            if (err) throw err;

            data.mongo_subscriptions = mongo_subscriptions;
            next();
        });
    }

    return {
        extract: extract
    };
})();

var MongoMetas = (function() {
    function extract(data, next) {
        Meta.find({}, function(err, mongo_metas) {
            if (err) throw err;

            data.mongo_metas = mongo_metas;
            next();
        });
    }

    return {
        extract: extract
    };
})();


var UsersTable = (function() {
    function extract(data, next) {
        data.usersMap = extractUsersFromComments(data);
        data.users = objectValues(data.usersMap);

        // until now all users are with usernames, but some are missing external id.

        loadMissingExternalIds(data, function() {
            // all users have now buth username and external id.

            // build map by external id and extract additional users from subscriptions.
            // those will be added to usersMapByExternalId.
            // rebuild the users list from the external id map.
            data.usersMapByExternalId = buildExternalIdMap(data.users);
            extractUsersFromSubscriptions(data);
            data.users = objectValues(data.usersMapByExternalId);

            // now all users have external id but some will be missing username.
            // also the usersMap will be missing those without username.

            loadMissingUsernames(data, function() {
                // usersMap now has also the users that were previously missing the username.
                // re-extract list of users from it.
                // and re-build map by external id.
                data.users = objectValues(data.usersMap);
                data.usersMapByExternalId = buildExternalIdMap(data.users);

                addIds(data.users);
                next();
            });
        });
    }

    function extractUsersFromComments(data) {
        var usersMap = {};

        data.mongo_comments.forEach(function(c) {
            var record = {
                username: c.author,
                external_id: c.userId
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

            // For completeness I should also add users from updates,
            // but it turns out that everybody who has edited comments
            // has also posted them too.  So I skip this part.
        });

        return usersMap;
    }

    function extractUsersFromSubscriptions(data) {
        data.mongo_subscriptions.forEach(function(s) {
            // only add if no such user yet found
            if (!data.usersMapByExternalId[s.userId]) {
                data.usersMapByExternalId[s.userId] = {
                    external_id: s.userId
                };
            }
        });
    }

    function loadMissingExternalIds(data, next) {
        var usersWithoutId = data.users.filter(function(u){ return !u.external_id; });
        var usernames = usersWithoutId.map(function(u){ return u.username; });
        db.query("SELECT userid, username FROM user WHERE username IN (?)", [usernames], function(err, rows) {
            if (err) throw err;

            rows.forEach(function(r) {
                if (data.usersMap[r.username]) {
                    data.usersMap[r.username].external_id = r.userid;
                }
                else {
                    // Turns out that Sencha Forum DB contains users zoob
                    // and Zoob.  Only Zoob has commented in docs, but our
                    // SELECT query compares strings case-insensitively
                    // resulting in bot zoob and Zoob being selected.
                    // So simply ignore zoob and other users like him.
                }
            });

            next();
        });
    }

    function loadMissingUsernames(data, next) {
        var usersWithoutName = data.users.filter(function(u){ return !u.username; });
        var externalIds = usersWithoutName.map(function(u){ return u.external_id; });
        db.query("SELECT userid, username FROM user WHERE userid IN (?)", [externalIds], function(err, rows) {
            if (err) throw err;

            rows.forEach(function(r) {
                if (data.usersMap[r.username]) {
                    console.log(r.username + " already exists");
                }
                else {
                    data.usersMap[r.username] = {
                        username: r.username,
                        external_id: r.userid
                    };
                }
            });

            next();
        });
    }

    function buildExternalIdMap(users) {
        var map = {};
        users.forEach(function(u) {
            map[u.external_id] = u;
        });
        return map;
    }

    function buildKey(c) {
        return c.author;
    }

    // Loads additional data from Sencha Forum users table:
    //
    // - e-mail
    // - moderator status
    //
    function addExtraData(data, next) {
        var externalIds = data.users.map(function(u){ return u.external_id; });
        db.query("SELECT userid, email, membergroupids FROM user WHERE userid IN (?)", [externalIds], function(err, rows) {
            if (err) throw err;

            rows.forEach(function(r) {
                if (data.usersMapByExternalId[r.userid]) {
                    data.usersMapByExternalId[r.userid].email = r.email;
                    data.usersMapByExternalId[r.userid].moderator = isModerator(r);
                }
                else {
                    console.log("external_id not found: "+r.userid);
                }
            });

            next();
        });
    }

    function isModerator(user) {
        var COMMUNITY_SUPPORT_TEAM = 2;
        var DEV_TEAM = 19;

        if (typeof user.membergroupids === "string") {
            var ids = user.membergroupids.split(',').map(parseInt);
        }
        else {
            var ids = [];
        }

        return ids.indexOf(COMMUNITY_SUPPORT_TEAM) != -1 || ids.indexOf(DEV_TEAM) != -1;
    }

    return {
        extract: extract,
        addExtraData: addExtraData,
        buildKey: buildKey
    };
})();

var TargetsTable = (function() {
    function extract(data, next) {
        data.targetsMap = extractUniqueTargets(data);
        data.targets = objectValues(data.targetsMap);
        addIds(data.targets);
        next();
    }

    function extractUniqueTargets(data) {
        var map = {};

        data.mongo_comments.forEach(function(c) {
            map[buildKey(c)] = buildTarget(c);
        });

        data.mongo_subscriptions.forEach(function(s) {
            map[buildKey(s)] = buildTarget(s);
        });

        return map;
    }

    function buildTarget(c) {
        return {
            domain: c.sdk + "-" + c.version,
            type: c.target[0],
            cls: c.target[1] || '',
            member: c.target[2] || ''
        };
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
                deleted: !!c.deleted
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
                    created_at: DEFAULT_DATE
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

var UpdatesTable = (function() {
    function extract(data, next) {
        var updates = [];

        data.mongo_comments.forEach(function(c) {
            c.updates.forEach(function(u) {
                updates.push({
                    user_id: data.usersMap[u.author].id,
                    comment_id: data.commentsMap[CommentsTable.buildKey(c)].id,
                    action: u.action || 'update',
                    created_at: fixDate(u.updatedAt)
                });
            });
        });

        addIds(updates);

        data.updates = updates;

        next();
    }

    function fixDate(date) {
        return (typeof date === "string") ? new Date(date) : date;
    }

    return {
        extract: extract
    };
})();

var SubscriptionsTable = (function() {
    function extract(data, next) {
        var subscriptions = [];

        // to check for duplicate subscriptions
        var uniqueMap = {};

        data.mongo_subscriptions.forEach(function(s) {
            // There's one particular user who's ID doesn't exist in Sencha Forum DB.
            // Though... I was able to find a user with the same e-mail address,
            // but I think it's safer to just delete subscriptions of that user.
            if (s.userId !== 462980) {
                var r = {
                    user_id: data.usersMapByExternalId[s.userId].id,
                    target_id: data.targetsMap[TargetsTable.buildKey(s)].id,
                    created_at: DEFAULT_DATE
                };
                // ignore duplicate subscriptions
                if (!uniqueMap[r.user_id+"-"+r.target_id]) {
                    subscriptions.push(r);
                }
                uniqueMap[r.user_id+"-"+r.target_id] = true;
            }
        });

        addIds(subscriptions);
        data.subscriptions = subscriptions;
        next();
    }

    return {
        extract: extract
    };
})();

var ReadingsTable = (function() {
    function extract(data, next) {
        var readings = [];

        data.mongo_metas.forEach(function(m) {
            readings.push({
                user_id: data.usersMapByExternalId[m.userId].id,
                comment_id: data.commentsMap[m.commentId].id,
                created_at: DEFAULT_DATE
            });
        });

        addIds(readings);
        data.readings = readings;
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

function asyncPrint(msg) {
    return function(data, next) {
        console.log(msg);
        next();
    };
}

function printInserts(table) {
    return function(data, next) {
        console.log("START TRANSACTION;");
        data[table].map(fixBooleans).forEach(function(row) {
            console.log(db.format("INSERT INTO "+table+" SET ?;", row));
        });
        console.log("COMMIT;");
        next();
    };
}

// turn true and false into 0 and 1 for MySQL insertion
function fixBooleans(row) {
    for (var i in row) {
        if (row[i] === true || row[i] === false) {
            row[i] = row[i] ? 1 : 0;
        }
    }
    return row;
}


sequence({}, [
    asyncPrint("get mongo comments..."),
    MongoComments.extract,
    asyncPrint("get mongo subscriptions..."),
    MongoSubscriptions.extract,
    asyncPrint("get mongo metas..."),
    MongoMetas.extract,

    asyncPrint("build users table..."),
    UsersTable.extract,
    UsersTable.addExtraData,
    asyncPrint("build targets table..."),
    TargetsTable.extract,
    asyncPrint("build comments table..."),
    CommentsTable.extract,
    asyncPrint("build votes table..."),
    VotesTable.extract,
    asyncPrint("build updates table..."),
    UpdatesTable.extract,
    asyncPrint("build subscriptions table..."),
    SubscriptionsTable.extract,
    asyncPrint("build readings table..."),
    ReadingsTable.extract,

    function(data, next) {
        console.log(data.users.length + " users");
        console.log(data.targets.length + " targets");
        console.log(data.comments.length + " comments");
        console.log(data.votes.length + " votes");
        console.log(data.updates.length + " updates");
        console.log(data.subscriptions.length + " subscriptions");
        console.log(data.readings.length + " readings");
        next();
    },

    printInserts("users"),
    printInserts("targets"),
    printInserts("comments"),
    printInserts("votes"),
    printInserts("updates"),
    printInserts("subscriptions"),
    printInserts("readings"),

    function(data, next) {
        process.exit();
    }
]);
