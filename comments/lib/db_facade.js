/**
 * A facade in front of node-mysql providing several methods in
 * addition to simple #query method that node-mysql provides.
 *
 * @constructor
 * Initializes the database facade with a connection object.
 *
 * @param {mysql.Connection} connection
 */
function DbFacade(connection) {
    this.connection = connection;
}

DbFacade.prototype = {
    /**
     * Performs a simple query to database.
     *
     * @param {String/String[]} sql A single SQL string or array
     * of strings which will be joined together, separated by
     * whitespace.
     * @param {Mixed[]} params Parameters for the query
     * @param {Function} callback Called after query finishes:.
     * @param {Error} callback.err The error object on failure or null on success.
     * @param {Object[]/Object} callback.result The result of callback.
     * In case of SELECT it's an array of rows,
     * In case of INSERT it's object with insertId property.
     */
    query: function(sql, params, callback) {
        sql = (typeof sql === "string") ? sql : sql.join("\n");
        this.connection.query(sql, params, callback);
    },

    /**
     * Exactly like #query, except that the result is just one row.
     */
    queryOne: function(sql, params, callback) {
        this.query(sql, params, function(err, rows) {
            callback(err, rows && rows[0]);
        });
    },

    /**
     * Inserts new row into table.
     *
     * @param {String} table Name of the table.
     * @param {Object} fields The row to insert.
     * @param {Function} callback Called when query finishes.
     * @param {Error} callback.err The error object.
     * @param {Number} callback.insertId ID of the inserted row.
     */
    insert: function(table, fields, callback) {
        this.query("INSERT INTO "+table+" SET ?", [fields], function(err, result) {
            callback(err, result && result.insertId);
        });
    },

    /**
     * Updates a row in table.
     *
     * @param {String} table Name of the table.
     * @param {Object} fields The row to update. This must contain
     * an `id` field that's used to decide which row to update.
     * @param {Function} callback Called when query finishes.
     * @param {Error} callback.err The error object.
     */
    update: function(table, fields, callback) {
        var id = fields.id;
        var fieldsWithoutId = this.removeField(fields, "id");
        this.query(["UPDATE "+table+" SET ? WHERE id = ?"], [fieldsWithoutId, id], callback);
    },

    /**
     * Replaces ? placeholders in SQL string.
     *
     * @param {String} sql
     * @param {Array} params
     * @return {String}
     */
    format: function(sql, params) {
        return this.connection.format(sql, params);
    },

    removeField: function(obj, fieldName) {
        var newObj = {};
        for (var i in obj) {
            if (i !== fieldName) {
                newObj[i] = obj[i];
            }
        }
        return newObj;
    }
};

module.exports = DbFacade;
