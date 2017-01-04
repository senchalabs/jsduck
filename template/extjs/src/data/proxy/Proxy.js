/**
 * @author Ed Spencer
 *
 * Proxies are used by {@link Ext.data.Store Stores} to handle the loading and saving of {@link Ext.data.Model Model}
 * data. Usually developers will not need to create or interact with proxies directly.
 *
 * # Types of Proxy
 *
 * There are two main types of Proxy - {@link Ext.data.proxy.Client Client} and {@link Ext.data.proxy.Server Server}.
 * The Client proxies save their data locally and include the following subclasses:
 *
 * - {@link Ext.data.proxy.LocalStorage LocalStorageProxy} - saves its data to localStorage if the browser supports it
 * - {@link Ext.data.proxy.SessionStorage SessionStorageProxy} - saves its data to sessionStorage if the browsers supports it
 * - {@link Ext.data.proxy.Memory MemoryProxy} - holds data in memory only, any data is lost when the page is refreshed
 *
 * The Server proxies save their data by sending requests to some remote server. These proxies include:
 *
 * - {@link Ext.data.proxy.Ajax Ajax} - sends requests to a server on the same domain
 * - {@link Ext.data.proxy.JsonP JsonP} - uses JSON-P to send requests to a server on a different domain
 * - {@link Ext.data.proxy.Rest Rest} - uses RESTful HTTP methods (GET/PUT/POST/DELETE) to communicate with server
 * - {@link Ext.data.proxy.Direct Direct} - uses {@link Ext.direct.Manager} to send requests
 *
 * Proxies operate on the principle that all operations performed are either Create, Read, Update or Delete. These four
 * operations are mapped to the methods {@link #create}, {@link #read}, {@link #update} and {@link #destroy}
 * respectively. Each Proxy subclass implements these functions.
 *
 * The CRUD methods each expect an {@link Ext.data.Operation Operation} object as the sole argument. The Operation
 * encapsulates information about the action the Store wishes to perform, the {@link Ext.data.Model model} instances
 * that are to be modified, etc. See the {@link Ext.data.Operation Operation} documentation for more details. Each CRUD
 * method also accepts a callback function to be called asynchronously on completion.
 *
 * Proxies also support batching of Operations via a {@link Ext.data.Batch batch} object, invoked by the {@link #batch}
 * method.
 */
Ext.define('Ext.data.proxy.Proxy', {
    alias: 'proxy.proxy',
    alternateClassName: ['Ext.data.DataProxy', 'Ext.data.Proxy'],

    uses: [
        'Ext.data.Batch',
        'Ext.data.Operation',
        'Ext.data.Model'
    ],

    mixins: {
        observable: 'Ext.util.Observable'
    },

    /**
     * @cfg {String} batchOrder
     * Comma-separated ordering 'create', 'update' and 'destroy' actions when batching. Override this to set a different
     * order for the batched CRUD actions to be executed in. Defaults to 'create,update,destroy'.
     */
    batchOrder: 'create,update,destroy',

    /**
     * @cfg {Boolean} batchActions
     * True to batch actions of a particular type when synchronizing the store. Defaults to true.
     */
    batchActions: true,

    /**
     * @cfg {String} defaultReaderType
     * The default registered reader type. Defaults to 'json'.
     * @private
     */
    defaultReaderType: 'json',

    /**
     * @cfg {String} defaultWriterType
     * The default registered writer type. Defaults to 'json'.
     * @private
     */
    defaultWriterType: 'json',

    /**
     * @cfg {String/Ext.data.Model} model
     * The name of the Model to tie to this Proxy. Can be either the string name of the Model, or a reference to the
     * Model constructor. Required.
     */

    /**
     * @cfg {Object/String/Ext.data.reader.Reader} reader
     * The Ext.data.reader.Reader to use to decode the server's response or data read from client. This can either be a
     * Reader instance, a config object or just a valid Reader type name (e.g. 'json', 'xml').
     */

    /**
     * @cfg {Object/String/Ext.data.writer.Writer} writer
     * The Ext.data.writer.Writer to use to encode any request sent to the server or saved to client. This can either be
     * a Writer instance, a config object or just a valid Writer type name (e.g. 'json', 'xml').
     */

    /**
     * @property {Boolean} isProxy
     * `true` in this class to identify an object as an instantiated Proxy, or subclass thereof.
     */
    isProxy: true,

    /**
     * Creates the Proxy
     * @param {Object} config (optional) Config object.
     */
    constructor: function(config) {
        config = config || {};

        if (config.model === undefined) {
            delete config.model;
        }

        this.mixins.observable.constructor.call(this, config);

        if (this.model !== undefined && !(this.model instanceof Ext.data.Model)) {
            this.setModel(this.model);
        }

        /**
         * @event metachange
         * Fires when this proxy's reader provides new metadata. Metadata usually consists
         * of new field definitions, but can include any configuration data required by an
         * application, and can be processed as needed in the event handler.
         * This event is currently only fired for JsonReaders. Note that this event is also
         * propagated by {@link Ext.data.Store}, which is typically where it would be handled.
         * @param {Ext.data.proxy.Proxy} this
         * @param {Object} meta The JSON metadata
         */
    },

    /**
     * Sets the model associated with this proxy. This will only usually be called by a Store
     *
     * @param {String/Ext.data.Model} model The new model. Can be either the model name string,
     * or a reference to the model's constructor
     * @param {Boolean} setOnStore Sets the new model on the associated Store, if one is present
     */
    setModel: function(model, setOnStore) {
        this.model = Ext.ModelManager.getModel(model);

        var reader = this.reader,
            writer = this.writer;

        this.setReader(reader);
        this.setWriter(writer);

        if (setOnStore && this.store) {
            this.store.setModel(this.model);
        }
    },

    /**
     * Returns the model attached to this Proxy
     * @return {Ext.data.Model} The model
     */
    getModel: function() {
        return this.model;
    },

    /**
     * Sets the Proxy's Reader by string, config object or Reader instance
     *
     * @param {String/Object/Ext.data.reader.Reader} reader The new Reader, which can be either a type string,
     * a configuration object or an Ext.data.reader.Reader instance
     * @return {Ext.data.reader.Reader} The attached Reader object
     */
    setReader: function(reader) {
        var me = this,
            needsCopy = true;

        if (reader === undefined || typeof reader == 'string') {
            reader = {
                type: reader
            };
            needsCopy = false;
        }

        if (reader.isReader) {
            reader.setModel(me.model);
        } else {
            if (needsCopy) {
                reader = Ext.apply({}, reader);
            }
            Ext.applyIf(reader, {
                proxy: me,
                model: me.model,
                type : me.defaultReaderType
            });

            reader = Ext.createByAlias('reader.' + reader.type, reader);
        }

        if (reader.onMetaChange) {
            reader.onMetaChange = Ext.Function.createSequence(reader.onMetaChange, this.onMetaChange, this);
        }

        me.reader = reader;
        return me.reader;
    },

    /**
     * Returns the reader currently attached to this proxy instance
     * @return {Ext.data.reader.Reader} The Reader instance
     */
    getReader: function() {
        return this.reader;
    },

    /**
     * @private
     * Called each time the reader's onMetaChange is called so that the proxy can fire the metachange event
     */
    onMetaChange: function(meta) {
        this.fireEvent('metachange', this, meta);
    },

    /**
     * Sets the Proxy's Writer by string, config object or Writer instance
     *
     * @param {String/Object/Ext.data.writer.Writer} writer The new Writer, which can be either a type string,
     * a configuration object or an Ext.data.writer.Writer instance
     * @return {Ext.data.writer.Writer} The attached Writer object
     */
    setWriter: function(writer) {
        var me = this,
            needsCopy = true;
            
        if (writer === undefined || typeof writer == 'string') {
            writer = {
                type: writer
            };
            needsCopy = false;
        }

        if (!writer.isWriter) {
            if (needsCopy) {
                writer = Ext.apply({}, writer);
            }
            Ext.applyIf(writer, {
                model: me.model,
                type : me.defaultWriterType
            });

            writer = Ext.createByAlias('writer.' + writer.type, writer);
        }

        me.writer = writer;

        return me.writer;
    },

    /**
     * Returns the writer currently attached to this proxy instance
     * @return {Ext.data.writer.Writer} The Writer instance
     */
    getWriter: function() {
        return this.writer;
    },

    /**
     * Performs the given create operation.
     * @param {Ext.data.Operation} operation The Operation to perform
     * @param {Function} callback Callback function to be called when the Operation has completed (whether
     * successful or not)
     * @param {Object} scope Scope to execute the callback function in
     * @method
     */
    create: Ext.emptyFn,

    /**
     * Performs the given read operation.
     * @param {Ext.data.Operation} operation The Operation to perform
     * @param {Function} callback Callback function to be called when the Operation has completed (whether
     * successful or not)
     * @param {Object} scope Scope to execute the callback function in
     * @method
     */
    read: Ext.emptyFn,

    /**
     * Performs the given update operation.
     * @param {Ext.data.Operation} operation The Operation to perform
     * @param {Function} callback Callback function to be called when the Operation has completed (whether
     * successful or not)
     * @param {Object} scope Scope to execute the callback function in
     * @method
     */
    update: Ext.emptyFn,

    /**
     * Performs the given destroy operation.
     * @param {Ext.data.Operation} operation The Operation to perform
     * @param {Function} callback Callback function to be called when the Operation has completed (whether
     * successful or not)
     * @param {Object} scope Scope to execute the callback function in
     * @method
     */
    destroy: Ext.emptyFn,

    /**
     * Performs a batch of {@link Ext.data.Operation Operations}, in the order specified by {@link #batchOrder}. Used
     * internally by {@link Ext.data.Store}'s {@link Ext.data.Store#sync sync} method. Example usage:
     *
     *     myProxy.batch({
     *         create : [myModel1, myModel2],
     *         update : [myModel3],
     *         destroy: [myModel4, myModel5]
     *     });
     *
     * Where the myModel* above are {@link Ext.data.Model Model} instances - in this case 1 and 2 are new instances and
     * have not been saved before, 3 has been saved previously but needs to be updated, and 4 and 5 have already been
     * saved but should now be destroyed.
     * 
     * Note that the previous version of this method took 2 arguments (operations and listeners). While this is still
     * supported for now, the current signature is now a single `options` argument that can contain both operations and
     * listeners, in addition to other options. The multi-argument signature will likely be deprecated in a future release.
     *
     * @param {Object} options Object containing one or more properties supported by the batch method:
     * 
     * @param {Object} options.operations Object containing the Model instances to act upon, keyed by action name
     * 
     * @param {Object} [options.listeners] Event listeners object passed straight through to the Batch -
     * see {@link Ext.data.Batch} for details
     * 
     * @param {Ext.data.Batch/Object} [options.batch] A {@link Ext.data.Batch} object (or batch config to apply 
     * to the created batch). If unspecified a default batch will be auto-created.
     * 
     * @param {Function} [options.callback] The function to be called upon completion of processing the batch.
     * The callback is called regardless of success or failure and is passed the following parameters:
     * @param {Ext.data.Batch} options.callback.batch The {@link Ext.data.Batch batch} that was processed,
     * containing all operations in their current state after processing
     * @param {Object} options.callback.options The options argument that was originally passed into batch
     * 
     * @param {Function} [options.success] The function to be called upon successful completion of the batch. The 
     * success function is called only if no exceptions were reported in any operations. If one or more exceptions
     * occurred then the `failure` function will be called instead. The success function is called 
     * with the following parameters:
     * @param {Ext.data.Batch} options.success.batch The {@link Ext.data.Batch batch} that was processed,
     * containing all operations in their current state after processing
     * @param {Object} options.success.options The options argument that was originally passed into batch
     * 
     * @param {Function} [options.failure] The function to be called upon unsuccessful completion of the batch. The 
     * failure function is called when one or more operations returns an exception during processing (even if some
     * operations were also successful). In this case you can check the batch's {@link Ext.data.Batch#exceptions
     * exceptions} array to see exactly which operations had exceptions. The failure function is called with the 
     * following parameters:
     * @param {Ext.data.Batch} options.failure.batch The {@link Ext.data.Batch batch} that was processed,
     * containing all operations in their current state after processing
     * @param {Object} options.failure.options The options argument that was originally passed into batch
     * 
     * @param {Object} [options.scope] The scope in which to execute any callbacks (i.e. the `this` object inside
     * the callback, success and/or failure functions). Defaults to the proxy.
     *
     * @return {Ext.data.Batch} The newly created Batch
     */
    batch: function(options, /* deprecated */listeners) {
        var me = this,
            useBatch = me.batchActions,
            batch,
            records,
            actions, aLen, action, a, r, rLen, record;

        if (options.operations === undefined) {
            // the old-style (operations, listeners) signature was called
            // so convert to the single options argument syntax
            options = {
                operations: options,
                listeners: listeners
            };
        }

        if (options.batch) {
            if (Ext.isDefined(options.batch.runOperation)) {
                batch = Ext.applyIf(options.batch, {
                    proxy: me,
                    listeners: {}
                });
            }
        } else {
            options.batch = {
                proxy: me,
                listeners: options.listeners || {}
            };
        }

        if (!batch) {
            batch = new Ext.data.Batch(options.batch);
        }

        batch.on('complete', Ext.bind(me.onBatchComplete, me, [options], 0));

        actions = me.batchOrder.split(',');
        aLen    = actions.length;

        for (a = 0; a < aLen; a++) {
            action  = actions[a];
            records = options.operations[action];

            if (records) {
                if (useBatch) {
                    batch.add(new Ext.data.Operation({
                        action  : action,
                        records : records
                    }));
                } else {
                    rLen = records.length;

                    for (r = 0; r < rLen; r++) {
                        record = records[r];

                        batch.add(new Ext.data.Operation({
                            action  : action,
                            records : [record]
                        }));
                    }
                }
            }
        }

        batch.start();
        return batch;
    },

    /**
     * @private
     * The internal callback that the proxy uses to call any specified user callbacks after completion of a batch
     */
    onBatchComplete: function(batchOptions, batch) {
        var scope = batchOptions.scope || this;

        if (batch.hasException) {
            if (Ext.isFunction(batchOptions.failure)) {
                Ext.callback(batchOptions.failure, scope, [batch, batchOptions]);
            }
        } else if (Ext.isFunction(batchOptions.success)) {
            Ext.callback(batchOptions.success, scope, [batch, batchOptions]);
        }

        if (Ext.isFunction(batchOptions.callback)) {
            Ext.callback(batchOptions.callback, scope, [batch, batchOptions]);
        }
    }
}, function() {
    //backwards compatibility
    Ext.data.DataProxy = this;
});
