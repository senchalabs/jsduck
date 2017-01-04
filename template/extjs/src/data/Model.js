/**
 * @author Ed Spencer
 *
 * A Model represents some object that your application manages. For example, one might define a Model for Users,
 * Products, Cars, or any other real-world object that we want to model in the system. Models are registered via the
 * {@link Ext.ModelManager model manager}, and are used by {@link Ext.data.Store stores}, which are in turn used by many
 * of the data-bound components in Ext.
 *
 * Models are defined as a set of fields and any arbitrary methods and properties relevant to the model. For example:
 *
 *     Ext.define('User', {
 *         extend: 'Ext.data.Model',
 *         fields: [
 *             {name: 'name',  type: 'string'},
 *             {name: 'age',   type: 'int', convert: null},
 *             {name: 'phone', type: 'string'},
 *             {name: 'alive', type: 'boolean', defaultValue: true, convert: null}
 *         ],
 *
 *         changeName: function() {
 *             var oldName = this.get('name'),
 *                 newName = oldName + " The Barbarian";
 *
 *             this.set('name', newName);
 *         }
 *     });
 *
 * The fields array is turned into a {@link Ext.util.MixedCollection MixedCollection} automatically by the {@link
 * Ext.ModelManager ModelManager}, and all other functions and properties are copied to the new Model's prototype.
 * 
 * By default, the built in numeric and boolean field types have a (@link Ext.data.Field#convert} function which coerces string
 * values in raw data into the field's type. For better performance with {@link Ext.data.reader.Json Json} or {@link Ext.data.reader.Array Array}
 * readers *if you are in control of the data fed into this Model*, you can null out the default convert function which will cause
 * the raw property to be copied directly into the Field's value.
 *
 * Now we can create instances of our User model and call any model logic we defined:
 *
 *     var user = Ext.create('User', {
 *         name : 'Conan',
 *         age  : 24,
 *         phone: '555-555-5555'
 *     });
 *
 *     user.changeName();
 *     user.get('name'); //returns "Conan The Barbarian"
 *
 * # Validations
 *
 * Models have built-in support for validations, which are executed against the validator functions in {@link
 * Ext.data.validations} ({@link Ext.data.validations see all validation functions}). Validations are easy to add to
 * models:
 *
 *     Ext.define('User', {
 *         extend: 'Ext.data.Model',
 *         fields: [
 *             {name: 'name',     type: 'string'},
 *             {name: 'age',      type: 'int'},
 *             {name: 'phone',    type: 'string'},
 *             {name: 'gender',   type: 'string'},
 *             {name: 'username', type: 'string'},
 *             {name: 'alive',    type: 'boolean', defaultValue: true}
 *         ],
 *
 *         validations: [
 *             {type: 'presence',  field: 'age'},
 *             {type: 'length',    field: 'name',     min: 2},
 *             {type: 'inclusion', field: 'gender',   list: ['Male', 'Female']},
 *             {type: 'exclusion', field: 'username', list: ['Admin', 'Operator']},
 *             {type: 'format',    field: 'username', matcher: /([a-z]+)[0-9]{2,3}/}
 *         ]
 *     });
 *
 * The validations can be run by simply calling the {@link #validate} function, which returns a {@link Ext.data.Errors}
 * object:
 *
 *     var instance = Ext.create('User', {
 *         name: 'Ed',
 *         gender: 'Male',
 *         username: 'edspencer'
 *     });
 *
 *     var errors = instance.validate();
 *
 * # Associations
 *
 * Models can have associations with other Models via {@link Ext.data.association.HasOne},
 * {@link Ext.data.association.BelongsTo belongsTo} and {@link Ext.data.association.HasMany hasMany} associations.
 * For example, let's say we're writing a blog administration application which deals with Users, Posts and Comments.
 * We can express the relationships between these models like this:
 *
 *     Ext.define('Post', {
 *         extend: 'Ext.data.Model',
 *         fields: ['id', 'user_id'],
 *
 *         belongsTo: 'User',
 *         hasMany  : {model: 'Comment', name: 'comments'}
 *     });
 *
 *     Ext.define('Comment', {
 *         extend: 'Ext.data.Model',
 *         fields: ['id', 'user_id', 'post_id'],
 *
 *         belongsTo: 'Post'
 *     });
 *
 *     Ext.define('User', {
 *         extend: 'Ext.data.Model',
 *         fields: ['id'],
 *
 *         hasMany: [
 *             'Post',
 *             {model: 'Comment', name: 'comments'}
 *         ]
 *     });
 *
 * See the docs for {@link Ext.data.association.HasOne}, {@link Ext.data.association.BelongsTo} and
 * {@link Ext.data.association.HasMany} for details on the usage and configuration of associations.
 * Note that associations can also be specified like this:
 *
 *     Ext.define('User', {
 *         extend: 'Ext.data.Model',
 *         fields: ['id'],
 *
 *         associations: [
 *             {type: 'hasMany', model: 'Post',    name: 'posts'},
 *             {type: 'hasMany', model: 'Comment', name: 'comments'}
 *         ]
 *     });
 *
 * # Using a Proxy
 *
 * Models are great for representing types of data and relationships, but sooner or later we're going to want to load or
 * save that data somewhere. All loading and saving of data is handled via a {@link Ext.data.proxy.Proxy Proxy}, which
 * can be set directly on the Model:
 *
 *     Ext.define('User', {
 *         extend: 'Ext.data.Model',
 *         fields: ['id', 'name', 'email'],
 *
 *         proxy: {
 *             type: 'rest',
 *             url : '/users'
 *         }
 *     });
 *
 * Here we've set up a {@link Ext.data.proxy.Rest Rest Proxy}, which knows how to load and save data to and from a
 * RESTful backend. Let's see how this works:
 *
 *     var user = Ext.create('User', {name: 'Ed Spencer', email: 'ed@sencha.com'});
 *
 *     user.save(); //POST /users
 *
 * Calling {@link #save} on the new Model instance tells the configured RestProxy that we wish to persist this Model's
 * data onto our server. RestProxy figures out that this Model hasn't been saved before because it doesn't have an id,
 * and performs the appropriate action - in this case issuing a POST request to the url we configured (/users). We
 * configure any Proxy on any Model and always follow this API - see {@link Ext.data.proxy.Proxy} for a full list.
 *
 * Loading data via the Proxy is equally easy:
 *
 *     //get a reference to the User model class
 *     var User = Ext.ModelManager.getModel('User');
 *
 *     //Uses the configured RestProxy to make a GET request to /users/123
 *     User.load(123, {
 *         success: function(user) {
 *             console.log(user.getId()); //logs 123
 *         }
 *     });
 *
 * Models can also be updated and destroyed easily:
 *
 *     //the user Model we loaded in the last snippet:
 *     user.set('name', 'Edward Spencer');
 *
 *     //tells the Proxy to save the Model. In this case it will perform a PUT request to /users/123 as this Model already has an id
 *     user.save({
 *         success: function() {
 *             console.log('The User was updated');
 *         }
 *     });
 *
 *     //tells the Proxy to destroy the Model. Performs a DELETE request to /users/123
 *     user.destroy({
 *         success: function() {
 *             console.log('The User was destroyed!');
 *         }
 *     });
 *
 * # Usage in Stores
 *
 * It is very common to want to load a set of Model instances to be displayed and manipulated in the UI. We do this by
 * creating a {@link Ext.data.Store Store}:
 *
 *     var store = Ext.create('Ext.data.Store', {
 *         model: 'User'
 *     });
 *
 *     //uses the Proxy we set up on Model to load the Store data
 *     store.load();
 *
 * A Store is just a collection of Model instances - usually loaded from a server somewhere. Store can also maintain a
 * set of added, updated and removed Model instances to be synchronized with the server via the Proxy. See the {@link
 * Ext.data.Store Store docs} for more information on Stores.
 */
Ext.define('Ext.data.Model', {
    alternateClassName: 'Ext.data.Record',

    mixins: {
        observable: 'Ext.util.Observable'
    },
    
    requires: [
        'Ext.ModelManager',
        'Ext.data.IdGenerator',
        'Ext.data.Field',
        'Ext.data.Errors',
        'Ext.data.Operation',
        'Ext.data.validations',
        'Ext.util.MixedCollection'
    ],

    compareConvertFields: function(f1, f2) {
        var f1SpecialConvert = f1.convert && f1.type && f1.convert !== f1.type.convert,
            f2SpecialConvert = f2.convert && f2.type && f2.convert !== f2.type.convert;

        if (f1SpecialConvert && !f2SpecialConvert) {
            return 1;
        }

        if (!f1SpecialConvert && f2SpecialConvert) {
            return -1;
        }
        return 0;
    },

    itemNameFn: function(item) {
        return item.name;
    },

    onClassExtended: function(cls, data, hooks) {
        var onBeforeClassCreated = hooks.onBeforeCreated;

        hooks.onBeforeCreated = function(cls, data) {
            var me = this,
                name = Ext.getClassName(cls),
                prototype = cls.prototype,
                superCls = cls.prototype.superclass,

                validations = data.validations || [],
                fields = data.fields || [],
                field,
                associationsConfigs = data.associations || [],
                addAssociations = function(items, type) {
                    var i = 0,
                        len,
                        item;

                    if (items) {
                        items = Ext.Array.from(items);

                        for (len = items.length; i < len; ++i) {
                            item = items[i];

                            if (!Ext.isObject(item)) {
                                item = {model: item};
                            }

                            item.type = type;
                            associationsConfigs.push(item);
                        }
                    }
                },
                idgen = data.idgen,

                fieldsMixedCollection = new Ext.util.MixedCollection(false, prototype.itemNameFn),

                associationsMixedCollection = new Ext.util.MixedCollection(false, prototype.itemNameFn),

                superValidations = superCls.validations,
                superFields = superCls.fields,
                superAssociations = superCls.associations,

                associationConfig, i, ln,
                dependencies = [],
                idProperty = data.idProperty || cls.prototype.idProperty,

                // Process each Field upon add into the collection
                onFieldAddReplace = function(arg0, arg1, arg2) {
                    var newField,
                        pos;

                    if (fieldsMixedCollection.events.add.firing) {
                        // Add event signature is (position, value, key);
                        pos = arg0;
                        newField  = arg1;
                    } else {
                        // Replace event signature is (key, oldValue, newValue);
                        newField = arg2;
                        pos = arg1.originalIndex;
                    }

                    // Set the originalIndex for ArrayReader to get the default mapping from in case
                    // compareConvertFields changes the order due to some fields having custom convert functions.
                    newField.originalIndex = pos;

                    // The field(s) which encapsulates the idProperty must never have a default value set
                    // if no value arrives from the server side. So override any possible prototype-provided
                    // defaultValue with undefined which will inhibit generation of defaulting code in Reader.buildRecordDataExtractor
                    if (newField.mapping === idProperty || (newField.mapping == null && newField.name === idProperty)) {
                        newField.defaultValue = undefined;
                    }
                },

                // Use the proxy from the class definition object if present, otherwise fall back to the inherited one, or the default    
                clsProxy = data.proxy || cls.prototype.proxy || cls.prototype.defaultProxyType,

                // Sort upon add function to be used in case of dynamically added Fields
                fieldConvertSortFn = function() {
                    fieldsMixedCollection.sortBy(prototype.compareConvertFields);
                };

            // Save modelName on class and its prototype
            cls.modelName = name;
            prototype.modelName = name;

            // Merge the validations of the superclass and the new subclass
            if (superValidations) {
                validations = superValidations.concat(validations);
            }

            data.validations = validations;

            // Merge the fields of the superclass and the new subclass
            if (superFields) {
                fields = superFields.items.concat(fields);
            }

            fieldsMixedCollection.on({
                add:     onFieldAddReplace,
                replace: onFieldAddReplace
            });  

            for (i = 0, ln = fields.length; i < ln; ++i) {
                field = fields[i];
                fieldsMixedCollection.add(field.isField ? field : new Ext.data.Field(field));
            }
            if (!fieldsMixedCollection.get(idProperty)) {
                fieldsMixedCollection.add(new Ext.data.Field(idProperty));
            }

            // Ensure the Fields are on correct order: Fields with custom convert function last
            fieldConvertSortFn();
            fieldsMixedCollection.on({
                add:     fieldConvertSortFn,
                replace: fieldConvertSortFn
            });

            data.fields = fieldsMixedCollection;

            if (idgen) {
                data.idgen = Ext.data.IdGenerator.get(idgen);
            }

            //associations can be specified in the more convenient format (e.g. not inside an 'associations' array).
            //we support that here
            addAssociations(data.belongsTo, 'belongsTo');
            delete data.belongsTo;
            addAssociations(data.hasMany, 'hasMany');
            delete data.hasMany;
            addAssociations(data.hasOne, 'hasOne');
            delete data.hasOne;

            if (superAssociations) {
                associationsConfigs = superAssociations.items.concat(associationsConfigs);
            }

            for (i = 0, ln = associationsConfigs.length; i < ln; ++i) {
                dependencies.push('association.' + associationsConfigs[i].type.toLowerCase());
            }

            // If we have not been supplied with a Proxy *instance*, then add the proxy type to our dependency list
            if (clsProxy && !clsProxy.isProxy) {
                //<debug>
                if (typeof clsProxy !== 'string' && !clsProxy.type) {
                    Ext.log.warn(name + ': proxy type is ' + clsProxy.type);
                }
                //</debug>

                dependencies.push('proxy.' + (typeof clsProxy === 'string' ? clsProxy : clsProxy.type));
            }

            Ext.require(dependencies, function() {
                Ext.ModelManager.registerType(name, cls);

                for (i = 0, ln = associationsConfigs.length; i < ln; ++i) {
                    associationConfig = associationsConfigs[i];
                    if (associationConfig.isAssociation) {
                        associationConfig = Ext.applyIf({
                            ownerModel: name,
                            associatedModel: associationConfig.model
                        }, associationConfig.initialConfig);
                    } else {
                        Ext.apply(associationConfig, {
                            ownerModel: name,
                            associatedModel: associationConfig.model
                        });
                    }

                    if (Ext.ModelManager.getModel(associationConfig.model) === undefined) {
                        Ext.ModelManager.registerDeferredAssociation(associationConfig);
                    } else {
                        associationsMixedCollection.add(Ext.data.association.Association.create(associationConfig));
                    }
                }

                data.associations = associationsMixedCollection;

                // onBeforeCreated may get called *asynchronously* if any of those required classes caused
                // an asynchronous script load. This would mean that the class definition object
                // has not been applied to the prototype when the Model definition has returned.
                // The Reader constructor does not attempt to buildExtractors if the fields MixedCollection
                // has not yet been set. The cls.setProxy call triggers a build of extractor methods.
                onBeforeClassCreated.call(me, cls, data, hooks);

                cls.setProxy(clsProxy);

                // Fire the onModelDefined template method on ModelManager
                Ext.ModelManager.onModelDefined(cls);
            });
        };
    },

    inheritableStatics: {
        /**
         * Sets the Proxy to use for this model. Accepts any options that can be accepted by
         * {@link Ext#createByAlias Ext.createByAlias}.
         * @param {String/Object/Ext.data.proxy.Proxy} proxy The proxy
         * @return {Ext.data.proxy.Proxy}
         * @static
         * @inheritable
         */
        setProxy: function(proxy) {
            //make sure we have an Ext.data.proxy.Proxy object
            if (!proxy.isProxy) {
                if (typeof proxy == "string") {
                    proxy = {
                        type: proxy
                    };
                }
                proxy = Ext.createByAlias("proxy." + proxy.type, proxy);
            }
            proxy.setModel(this);
            this.proxy = this.prototype.proxy = proxy;

            return proxy;
        },

        /**
         * Returns the configured Proxy for this Model
         * @return {Ext.data.proxy.Proxy} The proxy
         * @static
         * @inheritable
         */
        getProxy: function() {
            return this.proxy;
        },

        /**
         * Apply a new set of field and/or property definitions to the existing model. This will replace any existing
         * fields, including fields inherited from superclasses. Mainly for reconfiguring the
         * model based on changes in meta data (called from Reader's onMetaChange method).
         * @static
         * @inheritable
         */
        setFields: function(fields, idProperty, clientIdProperty) {
            var me = this,
                proto = me.prototype,
                prototypeFields = proto.fields,
                len = fields ? fields.length : 0,
                i = 0;


            if (idProperty) {
                proto.idProperty = idProperty;
            }
            if (clientIdProperty) {
                proto.clientIdProperty = clientIdProperty;
            }

            if (prototypeFields) {
                prototypeFields.clear();
            }
            else {
                prototypeFields = me.prototype.fields = new Ext.util.MixedCollection(false, function(field) {
                    return field.name;
                });
            }

            for (; i < len; i++) {
                prototypeFields.add(new Ext.data.Field(fields[i]));
            }
            if (!prototypeFields.get(proto.idProperty)) {
                prototypeFields.add(new Ext.data.Field(proto.idProperty));
            }

            me.fields = prototypeFields;

            return prototypeFields;
        },

        /**
         * Returns an Array of {@link Ext.data.Field Field} definitions which define this Model's structure
         *
         * Fields are sorted upon Model class definition. Fields with custom {@link Ext.data.Field#convert convert} functions
         * are moved to *after* fields with no convert functions. This is so that convert functions which rely on existing
         * field values will be able to read those field values.
         *
         * @return {Ext.data.Field[]} The defined Fields for this Model.
         *
         */
        getFields: function() {
            return this.prototype.fields.items;
        },

        /**
         * Asynchronously loads a model instance by id. Sample usage:
         *
         *     Ext.define('MyApp.User', {
         *         extend: 'Ext.data.Model',
         *         fields: [
         *             {name: 'id', type: 'int'},
         *             {name: 'name', type: 'string'}
         *         ]
         *     });
         *
         *     MyApp.User.load(10, {
         *         scope: this,
         *         failure: function(record, operation) {
         *             //do something if the load failed
         *         },
         *         success: function(record, operation) {
         *             //do something if the load succeeded
         *         },
         *         callback: function(record, operation) {
         *             //do something whether the load succeeded or failed
         *         }
         *     });
         *
         * @param {Number/String} id The id of the model to load
         * @param {Object} config (optional) config object containing success, failure and callback functions, plus
         * optional scope
         * @static
         * @inheritable
         */
        load: function(id, config) {
            config = Ext.apply({}, config);
            config = Ext.applyIf(config, {
                action: 'read',
                id    : id
            });

            var operation  = new Ext.data.Operation(config),
                scope      = config.scope || this,
                record     = null,
                callback;

            callback = function(operation) {
                if (operation.wasSuccessful()) {
                    record = operation.getRecords()[0];
                    Ext.callback(config.success, scope, [record, operation]);
                } else {
                    Ext.callback(config.failure, scope, [record, operation]);
                }
                Ext.callback(config.callback, scope, [record, operation]);
            };

            this.proxy.read(operation, callback, this);
        }
    },

    statics: {
        /**
         * @property
         * @static
         * @private
         */
        PREFIX : 'ext-record',
        /**
         * @property
         * @static
         * @private
         */
        AUTO_ID: 1,
        /**
         * @property
         * @static
         * The update operation of type 'edit'. Used by {@link Ext.data.Store#update Store.update} event.
         */
        EDIT   : 'edit',
        /**
         * @property
         * @static
         * The update operation of type 'reject'. Used by {@link Ext.data.Store#update Store.update} event.
         */
        REJECT : 'reject',
        /**
         * @property
         * @static
         * The update operation of type 'commit'. Used by {@link Ext.data.Store#update Store.update} event.
         */
        COMMIT : 'commit',

        /**
         * Generates a sequential id. This method is typically called when a record is {@link Ext#create
         * create}d and {@link #constructor no id has been specified}. The id will automatically be assigned to the
         * record. The returned id takes the form: {PREFIX}-{AUTO_ID}.
         *
         * - **PREFIX** : String - Ext.data.Model.PREFIX (defaults to 'ext-record')
         * - **AUTO_ID** : String - Ext.data.Model.AUTO_ID (defaults to 1 initially)
         *
         * @param {Ext.data.Model} rec The record being created. The record does not exist, it's a {@link #phantom}.
         * @return {String} auto-generated string id, `"ext-record-i++"`;
         * @static
         */
        id: function(rec) {
            var id = [this.PREFIX, '-', this.AUTO_ID++].join('');
            rec.phantom = true;
            rec.internalId = id;
            return id;
        }
    },

    /**
     * @cfg {String/Object} idgen
     * The id generator to use for this model. The default id generator does not generate
     * values for the {@link #idProperty}.
     *
     * This can be overridden at the model level to provide a custom generator for a model.
     * The simplest form of this would be:
     *
     *      Ext.define('MyApp.data.MyModel', {
     *          extend: 'Ext.data.Model',
     *          requires: ['Ext.data.SequentialIdGenerator'],
     *          idgen: 'sequential',
     *          ...
     *      });
     *
     * The above would generate {@link Ext.data.SequentialIdGenerator sequential} id's such
     * as 1, 2, 3 etc..
     *
     * Another useful id generator is {@link Ext.data.UuidGenerator}:
     *
     *      Ext.define('MyApp.data.MyModel', {
     *          extend: 'Ext.data.Model',
     *          requires: ['Ext.data.UuidGenerator'],
     *          idgen: 'uuid',
     *          ...
     *      });
     *
     * An id generation can also be further configured:
     *
     *      Ext.define('MyApp.data.MyModel', {
     *          extend: 'Ext.data.Model',
     *          idgen: {
     *              type: 'sequential',
     *              seed: 1000,
     *              prefix: 'ID_'
     *          }
     *      });
     *
     * The above would generate id's such as ID_1000, ID_1001, ID_1002 etc..
     *
     * If multiple models share an id space, a single generator can be shared:
     *
     *      Ext.define('MyApp.data.MyModelX', {
     *          extend: 'Ext.data.Model',
     *          idgen: {
     *              type: 'sequential',
     *              id: 'xy'
     *          }
     *      });
     *
     *      Ext.define('MyApp.data.MyModelY', {
     *          extend: 'Ext.data.Model',
     *          idgen: {
     *              type: 'sequential',
     *              id: 'xy'
     *          }
     *      });
     *
     * For more complex, shared id generators, a custom generator is the best approach.
     * See {@link Ext.data.IdGenerator} for details on creating custom id generators.
     *
     * @markdown
     */
    idgen: {
        isGenerator: true,
        type: 'default',

        generate: function () {
            return null;
        },
        getRecId: function (rec) {
            return rec.modelName + '-' + rec.internalId;
        }
    },

    /**
     * @property {Boolean} editing
     * Internal flag used to track whether or not the model instance is currently being edited.
     * @readonly
     */
    editing : false,

    /**
     * @property {Boolean} dirty
     * True if this Record has been modified.
     * @readonly
     */
    dirty : false,

    /**
     * @cfg {String} persistenceProperty
     * The name of the property on this Persistable object that its data is saved to. Defaults to 'data'
     * (i.e: all persistable data resides in `this.data`.)
     */
    persistenceProperty: 'data',

    evented: false,

    /**
     * @property {Boolean} isModel
     * `true` in this class to identify an object as an instantiated Model, or subclass thereof.
     */
    isModel: true,

    /**
     * @property {Boolean} phantom
     * True when the record does not yet exist in a server-side database (see {@link #setDirty}).
     * Any record which has a real database pk set as its id property is NOT a phantom -- it's real.
     */
    phantom : false,

    /**
     * @cfg {String} idProperty
     * The name of the field treated as this Model's unique id. Defaults to 'id'.
     */
    idProperty: 'id',

    /**
     * @cfg {String} [clientIdProperty]
     * The name of a property that is used for submitting this Model's unique client-side identifier
     * to the server when multiple phantom records are saved as part of the same {@link Ext.data.Operation Operation}.
     * In such a case, the server response should include the client id for each record
     * so that the server response data can be used to update the client-side records if necessary.
     * This property cannot have the same name as any of this Model's fields.
     */
    clientIdProperty: null,

    /**
     * @cfg {String} defaultProxyType
     * The string type of the default Model Proxy. Defaults to 'ajax'.
     */
    defaultProxyType: 'ajax',

    // Fields config and property
    /**
     * @cfg {Object[]/String[]} fields
     * The fields for this model. This is an Array of **{@link Ext.data.Field Field}** definition objects. A Field
     * definition may simply be the *name* of the Field, but a Field encapsulates {@link Ext.data.Field#type data type},
     * {@link Ext.data.Field#convert custom conversion} of raw data, and a {@link Ext.data.Field#mapping mapping}
     * property to specify by name of index, how to extract a field's value from a raw data object, so it is best practice
     * to specify a full set of {@link Ext.data.Field Field} config objects.
     */
    /**
     * @property {Ext.util.MixedCollection} fields
     * A {@link Ext.util.MixedCollection Collection} of the fields defined for this Model (including fields defined in superclasses)
     *
     * This is a collection of {@link Ext.data.Field} instances, each of which encapsulates information that the field was configured with.
     * By default, you can specify a field as simply a String, representing the *name* of the field, but a Field encapsulates
     * {@link Ext.data.Field#type data type}, {@link Ext.data.Field#convert custom conversion} of raw data, and a {@link Ext.data.Field#mapping mapping}
     * property to specify by name of index, how to extract a field's value from a raw data object.
     */

    /**
     * @cfg {Object[]} validations
     * An array of {@link Ext.data.validations validations} for this model.
     */

    // Associations configs and properties
    /**
     * @cfg {Object[]} associations
     * An array of {@link Ext.data.Association associations} for this model.
     */
    /**
     * @cfg {String/Object/String[]/Object[]} hasMany
     * One or more {@link Ext.data.HasManyAssociation HasMany associations} for this model.
     */
    /**
     * @cfg {String/Object/String[]/Object[]} belongsTo
     * One or more {@link Ext.data.BelongsToAssociation BelongsTo associations} for this model.
     */
    /**
     * @cfg {String/Object/Ext.data.proxy.Proxy} proxy
     * The {@link Ext.data.proxy.Proxy proxy} to use for this model.
     */

    /**
     * @event idchanged
     * Fired when this model's id changes
     * @param {Ext.data.Model} this
     * @param {Number/String} oldId The old id
     * @param {Number/String} newId The new id
     */

    /**
     * Creates new Model instance.
     * @param {Object} data An object containing keys corresponding to this model's fields, and their associated values
     */
    constructor: function(data, id, raw, convertedData) {
        // id, raw and convertedData not documented intentionally, meant to be used internally.
        // TODO: find where "raw" is used and remove it. The first parameter, "data" is raw, unconverted data. "raw" is redundant.
        // The "convertedData" parameter is a converted object hash with all properties corresponding to defined Fields
        // and all values of the defined type. It is used directly as this record's data property.
        data = data || {};

        var me = this,
            fields,
            length,
            field,
            name,
            value,
            newId,
            persistenceProperty,
            i;


        /**
         * @property {Number/String} internalId
         * An internal unique ID for each Model instance, used to identify Models that don't have an ID yet
         * @private
         */
        me.internalId = (id || id === 0) ? id : Ext.data.Model.id(me);

        /**
         * @property {Object} raw The raw data used to create this model if created via a reader.
         */
        me.raw = raw || data; // If created using data in constructor, use data

        if (!me.data) {
            me.data = {};
        }

        /**
         * @property {Object} modified Key: value pairs of all fields whose values have changed
         */
        me.modified = {};

        // Deal with spelling error in previous releases
        if (me.persistanceProperty) {
            //<debug>
            Ext.log.warn('Ext.data.Model: persistanceProperty has been deprecated. Use persistenceProperty instead.');
            //</debug>
            me.persistenceProperty = me.persistanceProperty;
        }

        me[me.persistenceProperty] = convertedData || {};

        me.mixins.observable.constructor.call(me);

        if (!convertedData) {
            //add default field values if present
            fields = me.fields.items;
            length = fields.length;
            i = 0;
            persistenceProperty = me[me.persistenceProperty];

            if (Ext.isArray(data)) {
                for (; i < length; i++) {
                    field = fields[i];
                    name  = field.name;

                    // Use the original ordinal position at which the Model inserted the field into its collection.
                    // Fields are sorted to place fields with a *convert* function last.
                    value = data[field.originalIndex];

                    if (value === undefined) {
                        value = field.defaultValue;
                    }
                    // Have to map array data so the values get assigned to the named fields
                    // rather than getting set as the field names with undefined values.
                    if (field.convert) {
                        value = field.convert(value, me);
                    }
                    // On instance construction, do not create data properties based on undefined input properties
                    if (value !== undefined) {
                        persistenceProperty[name] = value;
                    }
                }

            } else {
               for (; i < length; i++) {
                    field = fields[i];
                    name  = field.name;
                    value = data[name];
                    if (value === undefined) {
                        value = field.defaultValue;
                    }
                    if (field.convert) {
                        value = field.convert(value, me);
                    }
                    // On instance construction, do not create data properties based on undefined input properties
                    if (value !== undefined) {
                        persistenceProperty[name] = value;
                    }
               }
            }
        }

        /**
         * @property {Ext.data.Store[]} stores
         * The {@link Ext.data.Store Stores} to which this instance is bound.
         */
        me.stores = [];

        if (me.getId()) {
            me.phantom = false;
        } else if (me.phantom) {
            newId = me.idgen.generate();
            if (newId !== null) {
                me.setId(newId);
            }
        }

        // clear any dirty/modified since we're initializing
        me.dirty = false;
        me.modified = {};

        if (typeof me.init == 'function') {
            me.init();
        }

        me.id = me.idgen.getRecId(me);
    },

    /**
     * Returns the value of the given field
     * @param {String} fieldName The field to fetch the value for
     * @return {Object} The value
     */
    get: function(field) {
        return this[this.persistenceProperty][field];
    },

    // This object is used whenever the set() method is called and given a string as the
    // first argument. This approach saves memory (and GC costs) since we could be called
    // a lot.
    _singleProp: {},

    /**
     * Sets the given field to the given value, marks the instance as dirty
     * @param {String/Object} fieldName The field to set, or an object containing key/value pairs
     * @param {Object} newValue The value to set
     * @return {String[]} The array of modified field names or null if nothing was modified.
     */
    set: function (fieldName, newValue) {
        var me = this,
            data = me[me.persistenceProperty],
            fields = me.fields,
            modified = me.modified,
            single = (typeof fieldName == 'string'),
            currentValue, field, idChanged, key, modifiedFieldNames, name, oldId,
            newId, value, values;

        if (single) {
            values = me._singleProp;
            values[fieldName] = newValue;
        } else {
            values = fieldName;
        }

        for (name in values) {
            if (values.hasOwnProperty(name)) {
                value = values[name];

                if (fields && (field = fields.get(name)) && field.convert) {
                    value = field.convert(value, me);
                }

                currentValue = data[name];
                if (me.isEqual(currentValue, value)) {
                    continue; // new value is the same, so no change...
                }

                data[name] = value;
                (modifiedFieldNames || (modifiedFieldNames = [])).push(name);

                if (field && field.persist) {
                    if (modified.hasOwnProperty(name)) {
                        if (me.isEqual(modified[name], value)) {
                            // The original value in me.modified equals the new value, so
                            // the field is no longer modified:
                            delete modified[name];

                            // We might have removed the last modified field, so check to
                            // see if there are any modified fields remaining and correct
                            // me.dirty:
                            me.dirty = false;
                            for (key in modified) {
                                if (modified.hasOwnProperty(key)){
                                    me.dirty = true;
                                    break;
                                }
                            }
                        }
                    } else {
                        me.dirty = true;
                        modified[name] = currentValue;
                    }
                }

                if (name == me.idProperty) {
                    idChanged = true;
                    oldId = currentValue;
                    newId = value;
                }
            }
        }

        if (single) {
            // cleanup our reused object for next time... important to do this before
            // we fire any events or call anyone else (like afterEdit)!
            delete values[fieldName];
        }

        if (idChanged) {
            me.fireEvent('idchanged', me, oldId, newId);
        }

        if (!me.editing && modifiedFieldNames) {
            me.afterEdit(modifiedFieldNames);
        }

        return modifiedFieldNames || null;
    },

    /**
     * @private
     * Copies data from the passed record into this record. If the passed record is undefined, does nothing.
     *
     * If this is a phantom record (represented only in the client, with no corresponding database entry), and
     * the source record is not a phantom, then this record acquires the id of the source record.
     *
     * @param {Ext.data.Model} sourceRecord The record to copy data from.
     */
    copyFrom: function(sourceRecord) {
        if (sourceRecord) {

            var me = this,
                fields = me.fields.items,
                fieldCount = fields.length,
                field, i = 0,
                myData = me[me.persistenceProperty],
                sourceData = sourceRecord[sourceRecord.persistenceProperty],
                value;

            for (; i < fieldCount; i++) {
                field = fields[i];

                // Do not use setters.
                // Copy returned values in directly from the data object.
                // Converters have already been called because new Records
                // have been created to copy from.
                // This is a direct record-to-record value copy operation.
                value = sourceData[field.name];
                if (value !== undefined) {
                    myData[field.name] = value;
                }
            }

            // If this is a phantom record being updated from a concrete record, copy the ID in.
            if (me.phantom && !sourceRecord.phantom) {
                me.setId(sourceRecord.getId());
            }
        }
    },

    /**
     * Checks if two values are equal, taking into account certain
     * special factors, for example dates.
     * @private
     * @param {Object} a The first value
     * @param {Object} b The second value
     * @return {Boolean} True if the values are equal
     */
    isEqual: function(a, b){
        if (Ext.isDate(a) && Ext.isDate(b)) {
            return Ext.Date.isEqual(a, b);
        }
        return a === b;
    },

    /**
     * Begins an edit. While in edit mode, no events (e.g.. the `update` event) are relayed to the containing store.
     * When an edit has begun, it must be followed by either {@link #endEdit} or {@link #cancelEdit}.
     */
    beginEdit : function(){
        var me = this;
        if (!me.editing) {
            me.editing = true;
            me.dirtySave = me.dirty;
            me.dataSave = Ext.apply({}, me[me.persistenceProperty]);
            me.modifiedSave = Ext.apply({}, me.modified);
        }
    },

    /**
     * Cancels all changes made in the current edit operation.
     */
    cancelEdit : function(){
        var me = this;
        if (me.editing) {
            me.editing = false;
            // reset the modified state, nothing changed since the edit began
            me.modified = me.modifiedSave;
            me[me.persistenceProperty] = me.dataSave;
            me.dirty = me.dirtySave;
            delete me.modifiedSave;
            delete me.dataSave;
            delete me.dirtySave;
        }
    },

    /**
     * Ends an edit. If any data was modified, the containing store is notified (ie, the store's `update` event will
     * fire).
     * @param {Boolean} silent True to not notify the store of the change
     * @param {String[]} modifiedFieldNames Array of field names changed during edit.
     */
    endEdit : function(silent, modifiedFieldNames){
        var me = this,
            changed;
        if (me.editing) {
            me.editing = false;
            if(!modifiedFieldNames) {
                modifiedFieldNames = me.getModifiedFieldNames();
            }
            changed = me.dirty || modifiedFieldNames.length > 0;
            delete me.modifiedSave;
            delete me.dataSave;
            delete me.dirtySave;
            if (changed && silent !== true) {
                me.afterEdit(modifiedFieldNames);
            }
        }
    },

    /**
     * Gets the names of all the fields that were modified during an edit
     * @private
     * @return {String[]} An array of modified field names
     */
    getModifiedFieldNames: function(){
        var me = this,
            saved = me.dataSave,
            data = me[me.persistenceProperty],
            modified = [],
            key;

        for (key in data) {
            if (data.hasOwnProperty(key)) {
                if (!me.isEqual(data[key], saved[key])) {
                    modified.push(key);
                }
            }
        }
        return modified; 
    },

    /**
     * Gets a hash of only the fields that have been modified since this Model was created or commited.
     * @return {Object}
     */
    getChanges : function(){
        var modified = this.modified,
            changes  = {},
            field;

        for (field in modified) {
            if (modified.hasOwnProperty(field)){
                changes[field] = this.get(field);
            }
        }

        return changes;
    },

    /**
     * Returns true if the passed field name has been `{@link #modified}` since the load or last commit.
     * @param {String} fieldName {@link Ext.data.Field#name}
     * @return {Boolean}
     */
    isModified : function(fieldName) {
        return this.modified.hasOwnProperty(fieldName);
    },

    /**
     * Marks this **Record** as `{@link #dirty}`. This method is used interally when adding `{@link #phantom}` records
     * to a {@link Ext.data.proxy.Server#writer writer enabled store}.
     *
     * Marking a record `{@link #dirty}` causes the phantom to be returned by {@link Ext.data.Store#getUpdatedRecords}
     * where it will have a create action composed for it during {@link Ext.data.Model#save model save} operations.
     */
    setDirty : function() {
        var me     = this,
            fields = me.fields.items,
            fLen   = fields.length,
            field, name, f;

        me.dirty = true;

        for (f = 0; f < fLen; f++) {
            field = fields[f];

            if (field.persist) {
                name  = field.name;
                me.modified[name] = me.get(name);
            }
        }
    },

    //<debug>
    markDirty : function() {
        Ext.log.warn('Ext.data.Model: markDirty has been deprecated. Use setDirty instead.');

        return this.setDirty.apply(this, arguments);
    },
    //</debug>

    /**
     * Usually called by the {@link Ext.data.Store} to which this model instance has been {@link #join joined}. Rejects
     * all changes made to the model instance since either creation, or the last commit operation. Modified fields are
     * reverted to their original values.
     *
     * Developers should subscribe to the {@link Ext.data.Store#event-update} event to have their code notified of reject
     * operations.
     *
     * @param {Boolean} silent (optional) True to skip notification of the owning store of the change.
     * Defaults to false.
     */
    reject : function(silent) {
        var me = this,
            modified = me.modified,
            field;

        for (field in modified) {
            if (modified.hasOwnProperty(field)) {
                if (typeof modified[field] != "function") {
                    me[me.persistenceProperty][field] = modified[field];
                }
            }
        }

        me.dirty = false;
        me.editing = false;
        me.modified = {};

        if (silent !== true) {
            me.afterReject();
        }
    },

    /**
     * Usually called by the {@link Ext.data.Store} which owns the model instance. Commits all changes made to the
     * instance since either creation or the last commit operation.
     *
     * Developers should subscribe to the {@link Ext.data.Store#event-update} event to have their code notified of commit
     * operations.
     *
     * @param {Boolean} silent (optional) True to skip notification of the owning store of the change.
     * Defaults to false.
     */
    commit : function(silent) {
        var me = this;

        me.phantom = me.dirty = me.editing = false;
        me.modified = {};

        if (silent !== true) {
            me.afterCommit();
        }
    },

    /**
     * Creates a copy (clone) of this Model instance.
     *
     * @param {String} [id] A new id, defaults to the id of the instance being copied.
     * See `{@link Ext.data.Model#id id}`. To generate a phantom instance with a new id use:
     *
     *     var rec = record.copy(); // clone the record
     *     Ext.data.Model.id(rec); // automatically generate a unique sequential id
     *
     * @return {Ext.data.Model}
     */
    copy : function(newId) {
        var me = this;

        // Use raw data as the data param.
        // Pass a copy iof our converted data in to be used as the new record's convertedData
        return new me.self(me.raw, newId, null, Ext.apply({}, me[me.persistenceProperty]));
    },

    /**
     * Sets the Proxy to use for this model. Accepts any options that can be accepted by
     * {@link Ext#createByAlias Ext.createByAlias}.
     *
     * @param {String/Object/Ext.data.proxy.Proxy} proxy The proxy
     * @return {Ext.data.proxy.Proxy}
     */
    setProxy: function(proxy) {
        //make sure we have an Ext.data.proxy.Proxy object
        if (!proxy.isProxy) {
            if (typeof proxy === "string") {
                proxy = {
                    type: proxy
                };
            }
            proxy = Ext.createByAlias("proxy." + proxy.type, proxy);
        }
        proxy.setModel(this.self);
        this.proxy = proxy;

        return proxy;
    },

    /**
     * Returns the configured Proxy for this Model.
     * @return {Ext.data.proxy.Proxy} The proxy
     */
    getProxy: function() {
        return this.proxy;
    },

    /**
     * Validates the current data against all of its configured {@link #validations}.
     * @return {Ext.data.Errors} The errors object
     */
    validate: function() {
        var errors      = new Ext.data.Errors(),
            validations = this.validations,
            validators  = Ext.data.validations,
            length, validation, field, valid, type, i;

        if (validations) {
            length = validations.length;

            for (i = 0; i < length; i++) {
                validation = validations[i];
                field = validation.field || validation.name;
                type  = validation.type;
                valid = validators[type](validation, this.get(field));

                if (!valid) {
                    errors.add({
                        field  : field,
                        message: validation.message || validators[type + 'Message']
                    });
                }
            }
        }

        return errors;
    },

    /**
     * Checks if the model is valid. See {@link #validate}.
     * @return {Boolean} True if the model is valid.
     */
    isValid: function(){
        return this.validate().isValid();
    },

    /**
     * Saves the model instance using the configured proxy.
     * @param {Object} options Options to pass to the proxy. Config object for {@link Ext.data.Operation}.
     * @return {Ext.data.Model} The Model instance
     */
    save: function(options) {
        options = Ext.apply({}, options);

        var me     = this,
            action = me.phantom ? 'create' : 'update',
            scope  = options.scope || me,
            stores = me.stores,
            i = 0,
            storeCount,
            store,
            args,
            operation,
            callback;

        Ext.apply(options, {
            records: [me],
            action : action
        });

        operation = new Ext.data.Operation(options);

        callback = function(operation) {
            args = [me, operation];
            if (operation.wasSuccessful()) {
                for(storeCount = stores.length; i < storeCount; i++) {
                    store = stores[i];
                    store.fireEvent('write', store, operation);
                    store.fireEvent('datachanged', store);
                    // Not firing refresh here, since it's a single record
                }
                Ext.callback(options.success, scope, args);
            } else {
                Ext.callback(options.failure, scope, args);
            }

            Ext.callback(options.callback, scope, args);
        };

        me.getProxy()[action](operation, callback, me);

        return me;
    },

    /**
     * Destroys the model using the configured proxy.
     * @param {Object} options Options to pass to the proxy. Config object for {@link Ext.data.Operation}.
     * @return {Ext.data.Model} The Model instance
     */
    destroy: function(options){
        options = Ext.apply({}, options);

        var me     = this,
            scope  = options.scope || me,
            stores = me.stores,
            i = 0,
            storeCount,
            store,
            args,
            operation,
            callback;

        Ext.apply(options, {
            records: [me],
            action : 'destroy'
        });

        operation = new Ext.data.Operation(options);
        callback = function(operation) {
            args = [me, operation];
            if (operation.wasSuccessful()) {
                for(storeCount = stores.length; i < storeCount; i++) {
                    store = stores[i];
                    store.fireEvent('write', store, operation);
                    store.fireEvent('datachanged', store);
                    // Not firing refresh here, since it's a single record
                }
                me.clearListeners();
                Ext.callback(options.success, scope, args);
            } else {
                Ext.callback(options.failure, scope, args);
            }
            Ext.callback(options.callback, scope, args);
        };

        me.getProxy().destroy(operation, callback, me);
        return me;
    },

    /**
     * Returns the unique ID allocated to this model instance as defined by {@link #idProperty}.
     * @return {Number/String} The id
     */
    getId: function() {
        return this.get(this.idProperty);
    },

    /**
     * @private
     */
    getObservableId: function() {
        return this.id;
    },

    /**
     * Sets the model instance's id field to the given id.
     * @param {Number/String} id The new id
     */
    setId: function(id) {
        this.set(this.idProperty, id);
        this.phantom  = !(id || id === 0);
    },

    /**
     * Tells this model instance that it has been added to a store.
     * @param {Ext.data.Store} store The store to which this model has been added.
     */
    join : function(store) {
        Ext.Array.include(this.stores, store);

        /**
         * @property {Ext.data.Store} store
         * The {@link Ext.data.Store Store} to which this instance belongs. NOTE: If this
         * instance is bound to multiple stores, this property will reference only the
         * first. To examine all the stores, use the {@link #stores} property instead.
         */
        this.store = this.stores[0]; // compat w/all releases ever
    },

    /**
     * Tells this model instance that it has been removed from the store.
     * @param {Ext.data.Store} store The store from which this model has been removed.
     */
    unjoin: function(store) {
        Ext.Array.remove(this.stores, store);
        this.store = this.stores[0] || null; // compat w/all releases ever
    },

    /**
     * @private
     * If this Model instance has been {@link #join joined} to a {@link Ext.data.Store store}, the store's
     * afterEdit method is called
     * @param {String[]} modifiedFieldNames Array of field names changed during edit.
     */
    afterEdit : function(modifiedFieldNames) {
        this.callStore('afterEdit', modifiedFieldNames);
    },

    /**
     * @private
     * If this Model instance has been {@link #join joined} to a {@link Ext.data.Store store}, the store's
     * afterReject method is called
     */
    afterReject : function() {
        this.callStore("afterReject");
    },

    /**
     * @private
     * If this Model instance has been {@link #join joined} to a {@link Ext.data.Store store}, the store's
     * afterCommit method is called
     */
    afterCommit: function() {
        this.callStore('afterCommit');
    },

    /**
     * @private
     * Helper function used by afterEdit, afterReject and afterCommit. Calls the given method on the
     * {@link Ext.data.Store store} that this instance has {@link #join joined}, if any. The store function
     * will always be called with the model instance as its single argument. If this model is joined to 
     * a Ext.data.NodeStore, then this method calls the given method on the NodeStore and the associated Ext.data.TreeStore
     * @param {String} fn The function to call on the store
     */
    callStore: function(fn) {
        var args = Ext.Array.clone(arguments),
            stores = this.stores,
            i = 0,
            len = stores.length,
            store, treeStore;

        args[0] = this;
        for (; i < len; ++i) {
            store = stores[i];
            if (store && typeof store[fn] == "function") {
                store[fn].apply(store, args);
            }
            // if the record is bound to a NodeStore call the TreeStore's method as well
            treeStore = store.treeStore;
            if (treeStore && typeof treeStore[fn] == "function") {
                treeStore[fn].apply(treeStore, args);
            }
        }
    },

    /**
     * Gets all values for each field in this model and returns an object
     * containing the current data.
     * @param {Boolean} includeAssociated True to also include associated data. Defaults to false.
     * @return {Object} An object hash containing all the values in this model
     */
    getData: function(includeAssociated){
        var me     = this,
            fields = me.fields.items,
            fLen   = fields.length,
            data   = {},
            name, f;

        for (f = 0; f < fLen; f++) {
            name = fields[f].name;
            data[name] = me.get(name);
        }

        if (includeAssociated === true) {
            Ext.apply(data, me.getAssociatedData());
        }
        return data;
    },

    /**
     * Gets all of the data from this Models *loaded* associations. It does this recursively - for example if we have a
     * User which hasMany Orders, and each Order hasMany OrderItems, it will return an object like this:
     *
     *     {
     *         orders: [
     *             {
     *                 id: 123,
     *                 status: 'shipped',
     *                 orderItems: [
     *                     ...
     *                 ]
     *             }
     *         ]
     *     }
     *
     * @return {Object} The nested data set for the Model's loaded associations
     */
    getAssociatedData: function(){
        return this.prepareAssociatedData({}, 1);
    },

    /**
     * @private
     * This complex-looking method takes a given Model instance and returns an object containing all data from
     * all of that Model's *loaded* associations. See {@link #getAssociatedData}
     * @param {Object} seenKeys A hash of all the associations we've already seen
     * @param {Number} depth The current depth
     * @return {Object} The nested data set for the Model's loaded associations
     */
    prepareAssociatedData: function(seenKeys, depth) {
        /*
         * In this method we use a breadth first strategy instead of depth
         * first. The reason for doing so is that it prevents messy & difficult
         * issues when figuring out which associations we've already processed
         * & at what depths.
         */
        var me               = this,
            associations     = me.associations.items,
            associationCount = associations.length,
            associationData  = {},
            // We keep 3 lists at the same index instead of using an array of objects.
            // The reasoning behind this is that this method gets called a lot
            // So we want to minimize the amount of objects we create for GC.
            toRead           = [],
            toReadKey        = [],
            toReadIndex      = [],
            associatedStore, associatedRecords, associatedRecord, o, index, result, seenDepth,
            associationId, associatedRecordCount, association, i, j, type, name;

        for (i = 0; i < associationCount; i++) {
            association = associations[i];
            associationId = association.associationId;
            
            seenDepth = seenKeys[associationId];
            if (seenDepth && seenDepth !== depth) {
                continue;
            }
            seenKeys[associationId] = depth;

            type = association.type;
            name = association.name;
            if (type == 'hasMany') {
                //this is the hasMany store filled with the associated data
                associatedStore = me[association.storeName];

                //we will use this to contain each associated record's data
                associationData[name] = [];

                //if it's loaded, put it into the association data
                if (associatedStore && associatedStore.getCount() > 0) {
                    associatedRecords = associatedStore.data.items;
                    associatedRecordCount = associatedRecords.length;

                    //now we're finally iterating over the records in the association. Get
                    // all the records so we can process them
                    for (j = 0; j < associatedRecordCount; j++) {
                        associatedRecord = associatedRecords[j];
                        associationData[name][j] = associatedRecord.getData();
                        toRead.push(associatedRecord);
                        toReadKey.push(name);
                        toReadIndex.push(j);
                    }
                }
            } else if (type == 'belongsTo' || type == 'hasOne') {
                associatedRecord = me[association.instanceName];
                // If we have a record, put it onto our list
                if (associatedRecord !== undefined) {
                    associationData[name] = associatedRecord.getData();
                    toRead.push(associatedRecord);
                    toReadKey.push(name);
                    toReadIndex.push(-1);
                }
            }
        }
        
        for (i = 0, associatedRecordCount = toRead.length; i < associatedRecordCount; ++i) {
            associatedRecord = toRead[i];
            o = associationData[toReadKey[i]];
            index = toReadIndex[i];
            result = associatedRecord.prepareAssociatedData(seenKeys, depth + 1);
            if (index === -1) {
                Ext.apply(o, result);
            } else {
                Ext.apply(o[index], result);
            }
        }

        return associationData;
    }
});