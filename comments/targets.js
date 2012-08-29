/**
 * Represents a Targets table.
 *
 * @constructor
 * Initializes Targets with a database connection and a target domain.
 *
 * @param {DbFacade} db Instance of DbFacade.
 * @param {String} domain The comments domain within which to work.
 */
function Targets(db, domain) {
    this.db = db;
    this.domain = domain;
}

Targets.prototype = {
    /**
     * Ensures that a target exists, then calls the callback with
     * target ID.
     * @param {Object} target A target object:
     * @param {String} target.type
     * @param {String} target.cls
     * @param {String} target.member
     * @param {Function} callback
     * @param {Error} callback.err
     * @param {Number} callback.id The ID of the target
     */
    ensure: function(target, callback) {
        // first try to insert. If that fails, the target already
        // exists and we can instead look it up. If insert succeeds,
        // great also.
        this.add(target, function(err, target_id) {
            if (err) {
                this.get(target, function(err, t) {
                    callback(err, t.id);
                });
            }
            else {
                callback(err, target_id);
            }
        }.bind(this));
    },

    get: function(target, callback) {
        var sql = [
            'SELECT * FROM targets',
            'WHERE domain = ? AND type = ? AND cls = ? AND member = ?'
        ];
        var params = [this.domain, target.type, target.cls, target.member];
        this.db.queryOne(sql, params, callback);
    },

    add: function(target, callback) {
        this.db.insert("targets", {
            domain: this.domain,
            type: target.type,
            cls: target.cls,
            member: target.member
        }, callback);
    }
};

module.exports = Targets;
