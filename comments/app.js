var config = require('./config');
var express = require('express');
var MySQLStore = require('connect-mysql-session')(express);
var services = require('./services');
var ApiAdapter = require('./api_adapter');

var app = express();

app.configure(function() {
    // Headers for Cross Origin Resource Sharing (CORS)
    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
        next();
    });

    app.use(express.cookieParser(config.sessionSecret));

    // Hack to set session cookie if session ID is set as a URL param.
    // This is because not all browsers support sending cookies via CORS
    app.use(function(req, res, next) {
        if (req.query.sid && req.query.sid != 'null') {
            var sid = req.query.sid.replace(/ /g, '+');
            req.sessionID = sid;
            req.signedCookies = req.signedCookies || {};
            req.signedCookies['sencha_docs'] = sid;
        }
        next();
    });

    // Use MongoDB for session storage
    app.use(express.session({
        secret: config.sessionSecret,
        key: 'sencha_docs',
        store: new MySQLStore(
            config.mysql.database,
            config.mysql.user,
            config.mysql.password,
            {logging: false}
        )
    }));

    app.use(function(req, res, next) {
        // IE doesn't get content-type, so default to form encoded.
        if (!req.headers['content-type']) {
            req.headers['content-type'] = 'application/x-www-form-urlencoded';
        }
        next();
    });

    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.enable('jsonp callback');

    app.use(express.logger('dev'));
});

// Authentication

app.get('/auth/session', function(req, res) {
    if (req.session && req.session.user) {
        res.json({
            userName: req.session.user.username,
            mod: req.session.user.moderator
        });
    }
    else {
        res.json(false);
    }
});

app.post('/auth/login', services.users, function(req, res) {
    req.users.login(req.body.username, req.body.password, function(err, user) {
        if (err) {
            res.json({ success: false, reason: err });
            return;
        }

        req.session = req.session || {};
        req.session.user = user;

        res.json({
            userName: user.username,
            mod: user.moderator,
            sessionID: req.sessionID,
            success: true
        });
    });
});

app.post('/auth/logout', function(req, res) {
    req.session.user = null;
    res.json({ success: true });
});


// Requests for Comments

// Returns number of comments for each class/member,
app.get('/auth/:sdk/:version/comments_meta', services.comments, function(req, res) {
    req.comments.countsPerTarget(function(err, counts) {
        res.send({
            comments: counts,
            subscriptions: []
        });
    });
});

// Returns a list of comments for a particular target (eg class, guide, video)
app.get('/auth/:sdk/:version/comments', services.comments, function(req, res) {
    if (!req.query.startkey) {
        res.json({error: 'Invalid request'});
        return;
    }

    var target = ApiAdapter.targetFromJson(JSON.parse(req.query.startkey));
    req.comments.find(target, function(err, comments) {
        res.json(comments.map(ApiAdapter.commentToJson));
    });
});

// Adds new comment
app.post('/auth/:sdk/:version/comments', services.requireLogin, services.comments, function(req, res) {
    var comment = {
        user_id: req.session.user.id,
        target: ApiAdapter.targetFromJson(JSON.parse(req.body.target)),
        content: req.body.comment
    };

    req.comments.add(comment, function(err, comment_id) {
        res.json({
            id: comment_id,
            success: true
        });
    });
});

// Returns plain markdown content of individual comment (used when editing a comment)
app.get('/auth/:sdk/:version/comments/:commentId', services.comments, function(req, res) {
    req.comments.getById(req.params.commentId, function(err, comment) {
        res.json({ success: true, content: comment.content });
    });
});

// Updates an existing comment (for voting or updating contents)
app.post('/auth/:sdk/:version/comments/:commentId', services.requireLogin, services.comments, services.users, function(req, res) {
    req.comments.getById(req.params.commentId, function(err, comment) {
        if (req.body.vote) {
            if (req.session.user.id === comment.user_id) {
                res.json({success: false, reason: 'You cannot vote on your own content'});
                return;
            }

            var vote = {
                user_id: req.session.user.id,
                comment_id: comment.id,
                value: req.body.vote === "up" ? 1 : -1
            };

            req.comments.vote(vote, function(err, voteDir, total) {
                res.json({
                    success: true,
                    direction: voteDir === 1 ? "up" : (voteDir === -1 ? "down" : null),
                    total: total
                });
            });
        }
        else {
            if (!req.users.canModify(req.session.user, comment)) {
                res.json({ success: false, reason: 'Forbidden' }, 403);
                return;
            }

            var update = {
                id: comment.id,
                user_id: req.session.user.id,
                content: req.body.content
            };

            req.comments.update(update, function(err) {
                req.comments.getById(comment.id, function(err, comment) {
                    res.json({ success: true, content: comment.content_html });
                });
            });
        }
    });
});

// Deletes a comment
app.post('/auth/:sdk/:version/comments/:commentId/delete', services.requireLogin, services.comments, services.users, function(req, res) {
    req.comments.getById(req.params.commentId, function(err, comment) {
        if (!req.users.canModify(req.session.user, comment)) {
            res.json({ success: false, reason: 'Forbidden' }, 403);
            return;
        }

        var action = {
            id: req.params.commentId,
            user_id: req.session.user.id,
            deleted: true
        };
        req.comments.setDeleted(action, function(err) {
            res.send({ success: true });
        });
    });
});

// Restores a deleted comment
app.post('/auth/:sdk/:version/comments/:commentId/undo_delete', services.requireLogin, services.comments, services.users, function(req, res) {
    req.comments.showDeleted(true);
    req.comments.getById(req.params.commentId, function(err, comment) {
        if (!req.users.canModify(req.session.user, comment)) {
            res.json({ success: false, reason: 'Forbidden' }, 403);
            return;
        }

        var action = {
            id: req.params.commentId,
            user_id: req.session.user.id,
            deleted: false
        };
        req.comments.setDeleted(action, function(err) {
            res.send({ success: true, comment: ApiAdapter.commentToJson(comment) });
        });
    });
});

// Returns all subscriptions for logged in user
// For now does nothing.
app.get('/auth/:sdk/:version/subscriptions', function(req, res) {
    res.json({ subscriptions: [] });
});

app.listen(config.port);
console.log("Server started at port "+config.port+"...");
