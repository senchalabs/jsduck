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

// Authentication is disabled for now.
app.get('/auth/session', function(req, res) {
    res.json(false);
});

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

app.listen(config.port);
console.log("Server started at port "+config.port+"...");
