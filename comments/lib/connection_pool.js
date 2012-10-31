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
            this.initConnection(name, cfg);
        }

        return this.connections[name];
    },

    initConnection: function(name, cfg) {
        this.connections[name] = mysql.createConnection(cfg);
        this.connections[name].on("error", function(err) {
            if (err.fatal && err.code === 'PROTOCOL_CONNECTION_LOST') {
                console.error("MySQL Connection lost, reconnecting: "+err.stack);
                this.initConnection(name, cfg);
            }
        }.bind(this));
    }
};

module.exports = ConnectionPool;
