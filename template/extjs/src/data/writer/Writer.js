/**
 * @author Ed Spencer
 *
 * Base Writer class used by most subclasses of {@link Ext.data.proxy.Server}. This class is responsible for taking a
 * set of {@link Ext.data.Operation} objects and a {@link Ext.data.Request} object and modifying that request based on
 * the Operations.
 *
 * For example a Ext.data.writer.Json would format the Operations and their {@link Ext.data.Model} instances based on
 * the config options passed to the JsonWriter's constructor.
 *
 * Writers are not needed for any kind of local storage - whether via a {@link Ext.data.proxy.WebStorage Web Storage
 * proxy} (see {@link Ext.data.proxy.LocalStorage localStorage} and {@link Ext.data.proxy.SessionStorage
 * sessionStorage}) or just in memory via a {@link Ext.data.proxy.Memory MemoryProxy}.
 */
Ext.define('Ext.data.writer.Writer', {
    alias: 'writer.base',
    alternateClassName: ['Ext.data.DataWriter', 'Ext.data.Writer'],
    
    /**
     * @cfg {Boolean} writeAllFields
     * True to write all fields from the record to the server. If set to false it will only send the fields that were
     * modified. Note that any fields that have {@link Ext.data.Field#persist} set to false will still be ignored.
     */
    writeAllFields: true,
    
    /**
     * @cfg {String} nameProperty
     * This property is used to read the key for each value that will be sent to the server. For example:
     *
     *     Ext.define('Person', {
     *         extend: 'Ext.data.Model',
     *         fields: [{
     *             name: 'first',
     *             mapping: 'firstName'
     *         }, {
     *             name: 'last',
     *             mapping: 'lastName'
     *         }, {
     *             name: 'age'
     *         }]
     *     });
     *     new Ext.data.writer.Writer({
     *         writeAllFields: true,
     *         nameProperty: 'mapping'
     *     });
     *
     *     // This will be sent to the server
     *     {
     *         firstName: 'first name value',
     *         lastName: 'last name value',
     *         age: 1
     *     }
     *
     * If the value is not present, the field name will always be used.
     */
    nameProperty: 'name',

    /*
     * @property {Boolean} isWriter
     * `true` in this class to identify an object as an instantiated Writer, or subclass thereof.
     */
    isWriter: true,

    /**
     * Creates new Writer.
     * @param {Object} [config] Config object.
     */
    constructor: function(config) {
        Ext.apply(this, config);
    },

    /**
     * Prepares a Proxy's Ext.data.Request object
     * @param {Ext.data.Request} request The request object
     * @return {Ext.data.Request} The modified request object
     */
    write: function(request) {
        var operation = request.operation,
            records   = operation.records || [],
            len       = records.length,
            i         = 0,
            data      = [];

        for (; i < len; i++) {
            data.push(this.getRecordData(records[i], operation));
        }
        return this.writeRecords(request, data);
    },

    /**
     * Formats the data for each record before sending it to the server. This
     * method should be overridden to format the data in a way that differs from the default.
     * @param {Ext.data.Model} record The record that we are writing to the server.
     * @param {Ext.data.Operation} [operation] An operation object.
     * @return {Object} An object literal of name/value keys to be written to the server.
     * By default this method returns the data property on the record.
     */
    getRecordData: function(record, operation) {
        var isPhantom = record.phantom === true,
            writeAll = this.writeAllFields || isPhantom,
            nameProperty = this.nameProperty,
            fields = record.fields,
            fieldItems = fields.items,
            data = {},
            clientIdProperty = record.clientIdProperty,
            changes,
            name,
            field,
            key,
            value,
            f, fLen;

        if (writeAll) {
            fLen = fieldItems.length;

            for (f = 0; f < fLen; f++) {
                field = fieldItems[f];
                if (field.persist) {
                    name = field[nameProperty] || field.name;
                    value = record.get(field.name);
                    if (field.serialize) {
                        data[name] = field.serialize(value, record);
                    } else if (field.type === Ext.data.Types.DATE && field.dateFormat) {
                        data[name] = Ext.Date.format(value, field.dateFormat);
                    } else {
                        data[name] = value;
                    }
                }
            }
        } else {
            // Only write the changes
            changes = record.getChanges();
            for (key in changes) {
                if (changes.hasOwnProperty(key)) {
                    field = fields.get(key);
                    if (field.persist) {
                        name = field[nameProperty] || field.name;
                        value = record.get(field.name);
                        if (field.serialize) {
                            data[name] = field.serialize(value, record);
                        } else if (field.type === Ext.data.Types.DATE && field.dateFormat) {
                            data[name] = Ext.Date.format(value, field.dateFormat);
                        } else {
                            data[name] = value;
                        }
                    }
                }
            }
        }
        if (isPhantom) {
            if (clientIdProperty && operation && operation.records.length > 1) {
                // include clientId for phantom records, if multiple records are being written to the server in one operation.
                // The server can then return the clientId with each record so the operation can match the server records with the client records
                data[clientIdProperty] = record.internalId;
            }
        } else {
            // always include the id for non phantoms
            data[record.idProperty] = record.getId();
        }

        return data;
    }
});
