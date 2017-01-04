/**
 * @author Ed Spencer
 *
 * The JSON Reader is used by a Proxy to read a server response that is sent back in JSON format. This usually
 * happens as a result of loading a Store - for example we might create something like this:
 *
 *     Ext.define('User', {
 *         extend: 'Ext.data.Model',
 *         fields: ['id', 'name', 'email']
 *     });
 *
 *     var store = Ext.create('Ext.data.Store', {
 *         model: 'User',
 *         proxy: {
 *             type: 'ajax',
 *             url : 'users.json',
 *             reader: {
 *                 type: 'json'
 *             }
 *         }
 *     });
 *
 * The example above creates a 'User' model. Models are explained in the {@link Ext.data.Model Model} docs if you're
 * not already familiar with them.
 *
 * We created the simplest type of JSON Reader possible by simply telling our {@link Ext.data.Store Store}'s
 * {@link Ext.data.proxy.Proxy Proxy} that we want a JSON Reader. The Store automatically passes the configured model to the
 * Store, so it is as if we passed this instead:
 *
 *     reader: {
 *         type : 'json',
 *         model: 'User'
 *     }
 *
 * The reader we set up is ready to read data from our server - at the moment it will accept a response like this:
 *
 *     [
 *         {
 *             "id": 1,
 *             "name": "Ed Spencer",
 *             "email": "ed@sencha.com"
 *         },
 *         {
 *             "id": 2,
 *             "name": "Abe Elias",
 *             "email": "abe@sencha.com"
 *         }
 *     ]
 *
 * ## Reading other JSON formats
 *
 * If you already have your JSON format defined and it doesn't look quite like what we have above, you can usually
 * pass JsonReader a couple of configuration options to make it parse your format. For example, we can use the
 * {@link #cfg-root} configuration to parse data that comes back like this:
 *
 *     {
 *         "users": [
 *            {
 *                "id": 1,
 *                "name": "Ed Spencer",
 *                "email": "ed@sencha.com"
 *            },
 *            {
 *                "id": 2,
 *                "name": "Abe Elias",
 *                "email": "abe@sencha.com"
 *            }
 *         ]
 *     }
 *
 * To parse this we just pass in a {@link #root} configuration that matches the 'users' above:
 *
 *     reader: {
 *         type: 'json',
 *         root: 'users'
 *     }
 *
 * Sometimes the JSON structure is even more complicated. Document databases like CouchDB often provide metadata
 * around each record inside a nested structure like this:
 *
 *     {
 *         "total": 122,
 *         "offset": 0,
 *         "users": [
 *             {
 *                 "id": "ed-spencer-1",
 *                 "value": 1,
 *                 "user": {
 *                     "id": 1,
 *                     "name": "Ed Spencer",
 *                     "email": "ed@sencha.com"
 *                 }
 *             }
 *         ]
 *     }
 *
 * In the case above the record data is nested an additional level inside the "users" array as each "user" item has
 * additional metadata surrounding it ('id' and 'value' in this case). To parse data out of each "user" item in the
 * JSON above we need to specify the {@link #record} configuration like this:
 *
 *     reader: {
 *         type  : 'json',
 *         root  : 'users',
 *         record: 'user'
 *     }
 *
 * ## Response MetaData
 *
 * The server can return metadata in its response, in addition to the record data, that describe attributes
 * of the data set itself or are used to reconfigure the Reader. To pass metadata in the response you simply
 * add a `metaData` attribute to the root of the response data. The metaData attribute can contain anything,
 * but supports a specific set of properties that are handled by the Reader if they are present:
 * 
 * - {@link #root}: the property name of the root response node containing the record data
 * - {@link #idProperty}: property name for the primary key field of the data
 * - {@link #totalProperty}: property name for the total number of records in the data
 * - {@link #successProperty}: property name for the success status of the response
 * - {@link #messageProperty}: property name for an optional response message
 * - {@link Ext.data.Model#cfg-fields fields}: Config used to reconfigure the Model's fields before converting the
 * response data into records
 * 
 * An initial Reader configuration containing all of these properties might look like this ("fields" would be
 * included in the Model definition, not shown):
 *
 *     reader: {
 *         type : 'json',
 *         root : 'root',
 *         idProperty     : 'id',
 *         totalProperty  : 'total',
 *         successProperty: 'success',
 *         messageProperty: 'message'
 *     }
 *
 * If you were to pass a response object containing attributes different from those initially defined above, you could
 * use the `metaData` attribute to reconifgure the Reader on the fly. For example:
 *
 *     {
 *         "count": 1,
 *         "ok": true,
 *         "msg": "Users found",
 *         "users": [{
 *             "userId": 123,
 *             "name": "Ed Spencer",
 *             "email": "ed@sencha.com"
 *         }],
 *         "metaData": {
 *             "root": "users",
 *             "idProperty": 'userId',
 *             "totalProperty": 'count',
 *             "successProperty": 'ok',
 *             "messageProperty": 'msg'
 *         }
 *     }
 *
 * You can also place any other arbitrary data you need into the `metaData` attribute which will be ignored by the Reader,
 * but will be accessible via the Reader's {@link #metaData} property (which is also passed to listeners via the Proxy's
 * {@link Ext.data.proxy.Proxy#metachange metachange} event (also relayed by the {@link Ext.data.AbstractStore#metachange
 * store}). Application code can then process the passed metadata in any way it chooses.
 * 
 * A simple example for how this can be used would be customizing the fields for a Model that is bound to a grid. By passing
 * the `fields` property the Model will be automatically updated by the Reader internally, but that change will not be
 * reflected automatically in the grid unless you also update the column configuration. You could do this manually, or you
 * could simply pass a standard grid {@link Ext.panel.Table#columns column} config object as part of the `metaData` attribute
 * and then pass that along to the grid. Here's a very simple example for how that could be accomplished:
 *
 *     // response format:
 *     {
 *         ...
 *         "metaData": {
 *             "fields": [
 *                 { "name": "userId", "type": "int" },
 *                 { "name": "name", "type": "string" },
 *                 { "name": "birthday", "type": "date", "dateFormat": "Y-j-m" },
 *             ],
 *             "columns": [
 *                 { "text": "User ID", "dataIndex": "userId", "width": 40 },
 *                 { "text": "User Name", "dataIndex": "name", "flex": 1 },
 *                 { "text": "Birthday", "dataIndex": "birthday", "flex": 1, "format": 'Y-j-m', "xtype": "datecolumn" }
 *             ]
 *         }
 *     }
 *
 * The Reader will automatically read the meta fields config and rebuild the Model based on the new fields, but to handle
 * the new column configuration you would need to handle the metadata within the application code. This is done simply enough
 * by handling the metachange event on either the store or the proxy, e.g.:
 *
 *     var store = Ext.create('Ext.data.Store', {
 *         ...
 *         listeners: {
 *             'metachange': function(store, meta) {
 *                 myGrid.reconfigure(store, meta.columns);
 *             }
 *         }
 *     });
 *
 */
Ext.define('Ext.data.reader.Json', {
    extend: 'Ext.data.reader.Reader',
    alternateClassName: 'Ext.data.JsonReader',
    alias : 'reader.json',

    root: '',

    /**
     * @cfg {String} record The optional location within the JSON response that the record data itself can be found at.
     * See the JsonReader intro docs for more details. This is not often needed.
     */

    /**
     * @cfg {Boolean} useSimpleAccessors True to ensure that field names/mappings are treated as literals when
     * reading values.
     *
     * For example, by default, using the mapping "foo.bar.baz" will try and read a property foo from the root, then a property bar
     * from foo, then a property baz from bar. Setting the simple accessors to true will read the property with the name
     * "foo.bar.baz" direct from the root object.
     */
    useSimpleAccessors: false,

    /**
     * Reads a JSON object and returns a ResultSet. Uses the internal getTotal and getSuccess extractors to
     * retrieve meta data from the response, and extractData to turn the JSON data into model instances.
     * @param {Object} data The raw JSON data
     * @return {Ext.data.ResultSet} A ResultSet containing model instances and meta data about the results
     */
    readRecords: function(data) {
        //this has to be before the call to super because we use the meta data in the superclass readRecords
        if (data.metaData) {
            this.onMetaChange(data.metaData);
        }

        /**
         * @property {Object} jsonData
         * A copy of this.rawData.
         * @deprecated Will be removed in Ext JS 5.0. This is just a copy of this.rawData - use that instead.
         */
        this.jsonData = data;
        return this.callParent([data]);
    },

    //inherit docs
    getResponseData: function(response) {
        var data, error;
 
        try {
            data = Ext.decode(response.responseText);
            return this.readRecords(data);
        } catch (ex) {
            error = new Ext.data.ResultSet({
                total  : 0,
                count  : 0,
                records: [],
                success: false,
                message: ex.message
            });

            this.fireEvent('exception', this, response, error);

            Ext.Logger.warn('Unable to parse the JSON returned by the server');

            return error;
        }
    },

    //inherit docs
    buildExtractors : function() {
        var me = this;

        me.callParent(arguments);

        if (me.root) {
            me.getRoot = me.createAccessor(me.root);
        } else {
            me.getRoot = function(root) {
                return root;
            };
        }
    },

    /**
     * @private
     * We're just preparing the data for the superclass by pulling out the record objects we want. If a {@link #record}
     * was specified we have to pull those out of the larger JSON object, which is most of what this function is doing
     * @param {Object} root The JSON root node
     * @return {Ext.data.Model[]} The records
     */
    extractData: function(root) {
        var recordName = this.record,
            data = [],
            length, i;

        if (recordName) {
            length = root.length;
            
            if (!length && Ext.isObject(root)) {
                length = 1;
                root = [root];
            }

            for (i = 0; i < length; i++) {
                data[i] = root[i][recordName];
            }
        } else {
            data = root;
        }
        return this.callParent([data]);
    },

    /**
     * @private
     * @method
     * Returns an accessor function for the given property string. Gives support for properties such as the following:
     *
     * - 'someProperty'
     * - 'some.property'
     * - 'some["property"]'
     * 
     * This is used by buildExtractors to create optimized extractor functions when casting raw data into model instances.
     */
    createAccessor: (function() {
        var re = /[\[\.]/;

        return function(expr) {
            if (Ext.isEmpty(expr)) {
                return Ext.emptyFn;
            }
            if (Ext.isFunction(expr)) {
                return expr;
            }
            if (this.useSimpleAccessors !== true) {
                var i = String(expr).search(re);
                if (i >= 0) {
                    return Ext.functionFactory('obj', 'return obj' + (i > 0 ? '.' : '') + expr);
                }
            }
            return function(obj) {
                return obj[expr];
            };
        };
    }()),

    /**
     * @private
     * @method
     * Returns an accessor expression for the passed Field. Gives support for properties such as the following:
     * 
     * - 'someProperty'
     * - 'some.property'
     * - 'some["property"]'
     * 
     * This is used by buildExtractors to create optimized on extractor function which converts raw data into model instances.
     */
    createFieldAccessExpression: (function() {
        var re = /[\[\.]/;

        return function(field, fieldVarName, dataName) {
            var me     = this,
                hasMap = (field.mapping !== null),
                map    = hasMap ? field.mapping : field.name,
                result,
                operatorSearch;

            if (typeof map === 'function') {
                result = fieldVarName + '.mapping(' + dataName + ', this)';
            } else if (this.useSimpleAccessors === true || ((operatorSearch = String(map).search(re)) < 0)) {
                if (!hasMap || isNaN(map)) {
                    // If we don't provide a mapping, we may have a field name that is numeric
                    map = '"' + map + '"';
                }
                result = dataName + "[" + map + "]";
            } else {
                result = dataName + (operatorSearch > 0 ? '.' : '') + map;
            }
            return result;
        };
    }())
});
