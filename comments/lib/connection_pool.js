var mysql = require('mysql');

/**
 * @singleton
 * A pool of database connections.
 */
var ConnectionPool = {
    connections: {},

    /**
     * Returns a connection with a given name, or creates it if it
     * doesn't exist yet.
     *
     * @param {String} name An arbitrary name for the connection.
     * @param {Object} cfg A config for mysql.createConnection:
     * @param {String} cfg.user
     * @param {String} cfg.password
     * @param {String} cfg.database
     * @param {String} cfg.host
     */
    get: function(name, cfg) {
        if (!this.connections[name]) {
            this.connections[name] = mysql.createConnection(cfg);
        }

        return this.connections[name];
    }
};

module.exports = ConnectionPool;

