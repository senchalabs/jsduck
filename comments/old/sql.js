/**
 * Helper to perform SQL queries in sencha forum db
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

db.query(process.argv[2], function(err, rows) {
    if (err) throw err;

    rows.forEach(function(r) {
        console.log(r);
    });

    process.exit();
});
