var config = require("./config.js");
var exec = require('child_process').exec;

// Load database connection config
var db = config.testDb.database;
var user = config.testDb.user ? " -u "+config.testDb.user : "";
var pass = config.testDb.password ? " -p"+config.testDb.password : "";
var cmd = "mysql " + db + user + pass;

// Initialize database with test data
exec(cmd+" < sql/schema.sql", function(err){
    if (err) console.log(err);
    exec(cmd+" < sql/test_data.sql", function(err){
        if (err) console.log(err);
    });
});
