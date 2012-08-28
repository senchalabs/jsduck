var Comments = require("./comments");
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: '',
    password: '',
    database: 'comments'
});

var comments = new Comments(connection, "touch-2");

comments.count({}, function(cnt) {
    console.log(cnt + " comments");
    process.exit();
});
