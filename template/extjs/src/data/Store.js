/**
 * The Store class encapsulates a client side cache of {@link Ext.data.Model Model} objects. Stores load data via a
 * {@link Ext.data.proxy.Proxy Proxy}, and also provide functions for {@link #sort sorting}, {@link #filter filtering}
 * and querying the {@link Ext.data.Model model} instances contained within it.
 *
 * Creating a Store is easy - we just tell it the Model and the Proxy to use to load and save its data:
 *
 *      // Set up a {@link Ext.data.Model model} to use in our Store
 *      Ext.define('User', {
 *          extend: 'Ext.data.Model',
 *          fields: [
 *              {name: 'firstName', type: 'string'},
 *              {name: 'lastName',  type: 'string'},
 *              {name: 'age',       type: 'int'},
 *              {name: 'eyeColor',  type: 'string'}
 *          ]
 *      });
 *
 *      var myStore = Ext.create('Ext.data.Store', {
 *          model: 'User',
 *          proxy: {
 *              type: 'ajax',
 *              url: '/users.json',
 *              reader: {
 *                  type: 'json',
 *                  root: 'users'
 *              }
 *          },
 *          autoLoad: true
 *      });
 *
 * In the example above we configured an AJAX proxy to load data from the url '/users.json'. We told our Proxy to use a
 * {@link Ext.data.reader.Json JsonReader} to parse the response from the server into Model object - {@link
 * Ext.data.reader.Json see the docs on JsonReader} for details.
 *
 * ## Inline data
 *
 * Stores can also load data inline. Internally, Store converts each of the objects we pass in as {@link #cfg-data} into
 * Model instances:
 *
 *      Ext.create('Ext.data.Store', {
 *          model: 'User',
 *          data : [
 *              {firstName: 'Ed',    lastName: 'Spencer'},
 *              {firstName: 'Tommy', lastName: 'Maintz'},
 *              {firstName: 'Aaron', lastName: 'Conran'},
 *              {firstName: 'Jamie', lastName: 'Avins'}
 *          ]
 *      });
 *
 * Loading inline data using the method above is great if the data is in the correct format already (e.g. it doesn't
 * need to be processed by a {@link Ext.data.reader.Reader reader}). If your inline data requires processing to decode
 * the data structure, use a {@link Ext.data.proxy.Memory MemoryProxy} instead (see the {@link Ext.data.proxy.Memory
 * MemoryProxy} docs for an example).
 *
 * Additional data can also be loaded locally using {@link #method-add}.
 * 
 * ## Dynamic Loading
 *
 * Stores can be dynamically updated by calling the {@link #method-load} method:
 *
 *     store.load({
 *         params: {
 *             group: 3,
 *             type: 'user'
 *         },
 *         callback: function(records, operation, success) {
 *             // do something after the load finishes
 *         },
 *         scope: this
 *     });
 *
 * Here a bunch of arbitrary parameters is passed along with the load request and a callback function is set
 * up to do something after the loading is over.
 *
 * ## Loading Nested Data
 *
 * Applications often need to load sets of associated data - for example a CRM system might load a User and her Orders.
 * Instead of issuing an AJAX request for the User and a series of additional AJAX requests for each Order, we can load
 * a nested dataset and allow the Reader to automatically populate the associated models. Below is a brief example, see
 * the {@link Ext.data.reader.Reader} intro docs for a full explanation:
 *
 *      var store = Ext.create('Ext.data.Store', {
 *          autoLoad: true,
 *          model: "User",
 *          proxy: {
 *              type: 'ajax',
 *              url: 'users.json',
 *              reader: {
 *                  type: 'json',
 *                  root: 'users'
 *              }
 *          }
 *      });
 *
 * Which would consume a response like this:
 *
 *      {
 *          "users": [{
 *              "id": 1,
 *              "name": "Ed",
 *              "orders": [{
 *                  "id": 10,
 *                  "total": 10.76,
 *                  "status": "invoiced"
 *             },{
 *                  "id": 11,
 *                  "total": 13.45,
 *                  "status": "shipped"
 *             }]
 *          }]
 *      }
 *
 * See the {@link Ext.data.reader.Reader} intro docs for a full explanation.
 *
 * ## Filtering and Sorting
 *
 * Stores can be sorted and filtered - in both cases either remotely or locally. The {@link #sorters} and
 * {@link #cfg-filters} are held inside {@link Ext.util.MixedCollection MixedCollection} instances to make them easy to manage.
 * Usually it is sufficient to either just specify sorters and filters in the Store configuration or call {@link #sort}
 * or {@link #filter}:
 *
 *      var store = Ext.create('Ext.data.Store', {
 *          model: 'User',
 *          sorters: [{
 *              property: 'age',
 *              direction: 'DESC'
 *          }, {
 *              property: 'firstName',
 *              direction: 'ASC'
 *          }],
 *
 *          filters: [{
 *              property: 'firstName',
 *              value: /Ed/
 *          }]
 *      });
 *
 * The new Store will keep the configured sorters and filters in the MixedCollection instances mentioned above. By
 * default, sorting and filtering are both performed locally by the Store - see {@link #remoteSort} and
 * {@link #remoteFilter} to allow the server to perform these operations instead.
 *
 * Filtering and sorting after the Store has been instantiated is also easy. Calling {@link #filter} adds another filter
 * to the Store and automatically filters the dataset (calling {@link #filter} with no arguments simply re-applies all
 * existing filters). Note that by default {@link #sortOnFilter} is set to true, which means that your sorters are
 * automatically reapplied if using local sorting.
 *
 *      store.filter('eyeColor', 'Brown');
 *
 * Change the sorting at any time by calling {@link #sort}:
 *
 *      store.sort('height', 'ASC');
 *
 * Note that all existing sorters will be removed in favor of the new sorter data (if {@link #sort} is called with no
 * arguments, the existing sorters are just reapplied instead of being removed). To keep existing sorters and add new
 * ones, just add them to the MixedCollection:
 *
 *      store.sorters.add(new Ext.util.Sorter({
 *          property : 'shoeSize',
 *          direction: 'ASC'
 *      }));
 *
 *      store.sort();
 *
 * ## Registering with StoreManager
 *
 * Any Store that is instantiated with a {@link #storeId} will automatically be registed with the {@link
 * Ext.data.StoreManager StoreManager}. This makes it easy to reuse the same store in multiple views:
 *
 *      //this store can be used several times
 *      Ext.create('Ext.data.Store', {
 *          model: 'User',
 *          storeId: 'usersStore'
 *      });
 *
 *      new Ext.List({
 *          store: 'usersStore',
 *          //other config goes here
 *      });
 *
 *      new Ext.view.View({
 *          store: 'usersStore',
 *          //other config goes here
 *      });
 *
 * ## Further Reading
 *
 * Stores are backed up by an ecosystem of classes that enables their operation. To gain a full understanding of these
 * pieces and how they fit together, see:
 *
 *   - {@link Ext.data.proxy.Proxy Proxy} - overview of what Proxies are and how they are used
 *   - {@link Ext.data.Model Model} - the core class in the data package
 *   - {@link Ext.data.reader.Reader Reader} - used by any subclass of {@link Ext.data.proxy.Server ServerProxy} to read a response
 *
 * @author Ed Spencer
 */
Ext.define('Ext.data.Store', {
    extend: 'Ext.data.AbstractStore',

    alias: 'store.store',

    // Required classes must be loaded before the definition callback runs
    // The class definition callback creates a dummy Store which requires that
    // all the classes below have been loaded.
    requires: [
        'Ext.data.StoreManager',
        'Ext.data.Model',
        'Ext.data.proxy.Ajax',
        'Ext.data.proxy.Memory',
        'Ext.data.reader.Json',
        'Ext.data.writer.Json',
        'Ext.util.LruCache'
    ],

    uses: [
        'Ext.ModelManager',
        'Ext.util.Grouper'
    ],

    remoteSort: false,
    remoteFilter: false,

    /**
     * @cfg {Boolean} remoteGroup
     * True if the grouping should apply on the server side, false if it is local only.  If the
     * grouping is local, it can be applied immediately to the data.  If it is remote, then it will simply act as a
     * helper, automatically sending the grouping information to the server.
     */
    remoteGroup : false,

    /**
     * @cfg {String/Ext.data.proxy.Proxy/Object} proxy
     * The Proxy to use for this Store. This can be either a string, a config object or a Proxy instance -
     * see {@link #setProxy} for details.
     */

    /**
     * @cfg {Object[]/Ext.data.Model[]} data
     * Array of Model instances or data objects to load locally. See "Inline data" above for details.
     */

    /**
     * @cfg {String} groupField
     * The field by which to group data in the store. Internally, grouping is very similar to sorting - the
     * groupField and {@link #groupDir} are injected as the first sorter (see {@link #sort}). Stores support a single
     * level of grouping, and groups can be fetched via the {@link #getGroups} method.
     */
    groupField: undefined,

    /**
     * @cfg {String} groupDir
     * The direction in which sorting should be applied when grouping. Supported values are "ASC" and "DESC".
     */
    groupDir: "ASC",

    /**
     * @cfg {Number} trailingBufferZone
     * When {@link #buffered}, the number of extra records to keep cached on the trailing side of scrolling buffer
     * as scrolling proceeds. A larger number means fewer replenishments from the server.
     */
    trailingBufferZone: 25,

    /**
     * @cfg {Number} leadingBufferZone
     * When {@link #buffered}, the number of extra rows to keep cached on the leading side of scrolling buffer
     * as scrolling proceeds. A larger number means fewer replenishments from the server.
     */
    leadingBufferZone: 200,

    /**
     * @cfg {Number} pageSize
     * The number of records considered to form a 'page'. This is used to power the built-in
     * paging using the nextPage and previousPage functions when the grid is paged using a
     * {@link Ext.toolbar.Paging PagingScroller} Defaults to 25.
     *
     * If this Store is {@link #buffered}, pages are loaded into a page cache before the Store's
     * data is updated from the cache. The pageSize is the number of rows loaded into the cache in one request.
     * This will not affect the rendering of a buffered grid, but a larger page size will mean fewer loads.
     *
     * In a buffered grid, scrolling is monitored, and the page cache is kept primed with data ahead of the
     * direction of scroll to provide rapid access to data when scrolling causes it to be required. Several pages
     * in advance may be requested depending on various parameters.
     *
     * It is recommended to tune the {@link #pageSize}, {@link #trailingBufferZone} and
     * {@link #leadingBufferZone} configurations based upon the conditions pertaining in your deployed application.
     *
     * The provided SDK example `examples/grid/infinite-scroll-grid-tuner.html` can be used to experiment with
     * different settings including simulating Ajax latency.
     */
    pageSize: undefined,

    /**
     * @property {Number} currentPage
     * The page that the Store has most recently loaded (see {@link #loadPage})
     */
    currentPage: 1,

    /**
     * @cfg {Boolean} clearOnPageLoad
     * True to empty the store when loading another page via {@link #loadPage},
     * {@link #nextPage} or {@link #previousPage}. Setting to false keeps existing records, allowing
     * large data sets to be loaded one page at a time but rendered all together.
     */
    clearOnPageLoad: true,

    /**
     * @property {Boolean} loading
     * True if the Store is currently loading via its Proxy
     * @private
     */
    loading: false,

    /**
     * @cfg {Boolean} sortOnFilter
     * For local filtering only, causes {@link #sort} to be called whenever {@link #filter} is called,
     * causing the sorters to be reapplied after filtering. Defaults to true
     */
    sortOnFilter: true,

    /**
     * @cfg {Boolean} buffered
     * Allows the Store to prefetch and cache in a **page cache**, pages of Records, and to then satisfy
     * loading requirements from this page cache.
     *
     * To use buffered Stores, initiate the process by loading the first page. The number of rows rendered are
     * determined automatically, and the range of pages needed to keep the cache primed for scrolling is
     * requested and cached.
     * Example:
     *
     *    // Load page 1
     *    myStore.loadPage(1);
     *
     * A {@link Ext.grid.PagingScroller PagingScroller} is instantiated which will monitor the scrolling in the grid, and
     * refresh the view's rows from the page cache as needed. It will also pull new data into the page
     * cache when scrolling of the view draws upon data near either end of the prefetched data.
     *
     * The margins which trigger view refreshing from the prefetched data are {@link Ext.grid.PagingScroller#numFromEdge},
     * {@link Ext.grid.PagingScroller#leadingBufferZone} and {@link Ext.grid.PagingScroller#trailingBufferZone}.
     *
     * The margins which trigger loading more data into the page cache are, {@link #leadingBufferZone} and
     * {@link #trailingBufferZone}.
     *
     * By defult, only 5 pages of data are cached in the page cache, with pages "scrolling" out of the buffer
     * as the view moves down through the dataset.
     * Setting this value to zero means that no pages are *ever* scrolled out of the page cache, and
     * that eventually the whole dataset may become present in the page cache. This is sometimes desirable
     * as long as datasets do not reach astronomical proportions.
     *
     * Selection state may be maintained across page boundaries by configuring the SelectionModel not to discard
     * records from its collection when those Records cycle out of the Store's primary collection. This is done
     * by configuring the SelectionModel like this:
     *
     *    selModel: {
     *        pruneRemoved: false
     *    }
     *
     */
    buffered: false,

    /**
     * @cfg {Number} purgePageCount
     * *Valid only when used with a {@link Ext.data.Store#buffered buffered} Store.*
     *
     * The number of pages *additional to the required buffered range* to keep in the prefetch cache before purging least recently used records.
     *
     * For example, if the height of the view area and the configured {@link #trailingBufferZone} and {@link #leadingBufferZone} require that there
     * are three pages in the cache, then a `purgePageCount` of 5 ensures that up to 8 pages can be in the page cache any any one time.
     *
     * A value of 0 indicates to never purge the prefetched data.
     */
    purgePageCount: 5,

    /**
     * @cfg {Boolean} [clearRemovedOnLoad=true]
     * True to clear anything in the {@link #removed} record collection when the store loads.
     */
    clearRemovedOnLoad: true,

    defaultPageSize: 25,

    // Private. Used as parameter to loadRecords
    addRecordsOptions: {
        addRecords: true
    },

    statics: {
        recordIdFn: function(record) {
            return record.internalId;
        },
        recordIndexFn: function(record) {
            return record.index;
        }
    },

    onClassExtended: function(cls, data, hooks) {
        var model = data.model,
            onBeforeClassCreated;

        if (typeof model == 'string') {
            onBeforeClassCreated = hooks.onBeforeCreated;

            hooks.onBeforeCreated = function() {
                var me = this,
                    args = arguments;

                Ext.require(model, function() {
                    onBeforeClassCreated.apply(me, args);
                });
            };
        }
    },

    /**
     * Creates the store.
     * @param {Object} [config] Config object
     */
    constructor: function(config) {
        // Clone the config so we don't modify the original config object
        config = Ext.Object.merge({}, config);

        var me = this,
            groupers = config.groupers || me.groupers,
            groupField = config.groupField || me.groupField,
            proxy,
            data;

        /**
         * @event beforeprefetch
         * Fires before a prefetch occurs. Return false to cancel.
         * @param {Ext.data.Store} this
         * @param {Ext.data.Operation} operation The associated operation
         */
        /**
         * @event groupchange
         * Fired whenever the grouping in the grid changes
         * @param {Ext.data.Store} store The store
         * @param {Ext.util.Grouper[]} groupers The array of grouper objects
         */
        /**
         * @event prefetch
         * Fires whenever records have been prefetched
         * @param {Ext.data.Store} this
         * @param {Ext.data.Model[]} records An array of records.
         * @param {Boolean} successful True if the operation was successful.
         * @param {Ext.data.Operation} operation The associated operation
         */
        data = config.data || me.data;

        /**
         * @property {Ext.util.MixedCollection} data
         * The MixedCollection that holds this store's local cache of records.
         */
        me.data = new Ext.util.MixedCollection(false, Ext.data.Store.recordIdFn);

        if (data) {
            me.inlineData = data;
            delete config.data;
        }

        if (!groupers && groupField) {
            groupers = [{
                property : groupField,
                direction: config.groupDir || me.groupDir
            }];
        }
        delete config.groupers;

        /**
         * @property {Ext.util.MixedCollection} groupers
         * The collection of {@link Ext.util.Grouper Groupers} currently applied to this Store.
         */
        me.groupers = new Ext.util.MixedCollection();
        me.groupers.addAll(me.decodeGroupers(groupers));

        this.callParent([config]);
        // don't use *config* anymore from here on... use *me* instead...

        if (me.buffered) {

            /**
             * @property {Ext.data.Store.PageMap} pageMap
             * Internal PageMap instance.
             * @private
             */
            me.pageMap = new me.PageMap({
                pageSize: me.pageSize,
                maxSize: me.purgePageCount,
                listeners: {
                    // Whenever PageMap gets cleared, it means we re no longer interested in 
                    // any outstanding page prefetches, so cancel tham all
                    clear: me.cancelAllPrefetches,
                    scope: me
                }
            });
            me.pageRequests = {};

            me.sortOnLoad = false;
            me.filterOnLoad = false;
        }

        // Only sort by group fields if we are doing local grouping
        if (me.remoteGroup) {
            me.remoteSort = true;
        }
        if (me.groupers.items.length && !me.remoteGroup) {
            me.sort(me.groupers.items, 'prepend', false);
        }

        proxy = me.proxy;
        data = me.inlineData;

        // Page size for non-buffered Store defaults to 25
        // For a buffered Store, the default page size is taken from the initial call to prefetch.
        if (!me.buffered && !me.pageSize) {
            me.pageSize = me.defaultPageSize;
        }

        if (data) {
            if (proxy instanceof Ext.data.proxy.Memory) {
                proxy.data = data;
                me.read();
            } else {
                me.add.apply(me, [data]);
            }

            me.sort();
            delete me.inlineData;
        } else if (me.autoLoad) {
            Ext.defer(me.load, 10, me, [ typeof me.autoLoad === 'object' ? me.autoLoad : undefined ]);
            // Remove the defer call, we may need reinstate this at some point, but currently it's not obvious why it's here.
            // this.load(typeof this.autoLoad == 'object' ? this.autoLoad : undefined);
        }
    },

     // private override
     // After destroying the Store, clear the page prefetch cache
    destroyStore: function() {
        this.callParent(arguments);

        // Release cached pages.
        // Will also cancel outstanding prefetch requests, and cause a generation change
        // so that incoming prefetch data will be ignored.
        if (this.pageMap) {
            this.pageMap.clear();
        }
    },

    onBeforeSort: function() {
        var groupers = this.groupers;
        if (groupers.getCount() > 0) {
            this.sort(groupers.items, 'prepend', false);
        }
    },

    /**
     * @private
     * Normalizes an array of grouper objects, ensuring that they are all Ext.util.Grouper instances
     * @param {Object[]} groupers The groupers array
     * @return {Ext.util.Grouper[]} Array of Ext.util.Grouper objects
     */
    decodeGroupers: function(groupers) {
        if (!Ext.isArray(groupers)) {
            if (groupers === undefined) {
                groupers = [];
            } else {
                groupers = [groupers];
            }
        }

        var length = groupers.length,
            Grouper = Ext.util.Grouper,
            config, i, result = [];

        for (i = 0; i < length; i++) {
            config = groupers[i];

            if (!(config instanceof Grouper)) {
                if (Ext.isString(config)) {
                    config = {
                        property: config
                    };
                }

                config = Ext.apply({
                    root     : 'data',
                    direction: "ASC"
                }, config);

                //support for 3.x style sorters where a function can be defined as 'fn'
                if (config.fn) {
                    config.sorterFn = config.fn;
                }

                //support a function to be passed as a sorter definition
                if (typeof config == 'function') {
                    config = {
                        sorterFn: config
                    };
                }

                // return resulting Groupers in a separate array so as not to mutate passed in data objects.
                result.push(new Grouper(config));
            } else {
                result.push(config);
            }
        }
        return result;
    },

    /**
     * Groups data inside the store.
     * @param {String/Object[]} groupers Either a string name of one of the fields in this Store's
     * configured {@link Ext.data.Model Model}, or an Array of grouper configurations.
     * @param {String} [direction="ASC"] The overall direction to group the data by.
     */
    group: function(groupers, direction) {
        var me = this,
            hasNew = false,
            grouper,
            newGroupers;

        if (Ext.isArray(groupers)) {
            newGroupers = groupers;
        } else if (Ext.isObject(groupers)) {
            newGroupers = [groupers];
        } else if (Ext.isString(groupers)) {
            grouper = me.groupers.get(groupers);

            if (!grouper) {
                grouper = {
                    property : groupers,
                    direction: direction
                };
                newGroupers = [grouper];
            } else if (direction === undefined) {
                grouper.toggle();
            } else {
                grouper.setDirection(direction);
            }
        }

        if (newGroupers && newGroupers.length) {
            hasNew = true;
            newGroupers = me.decodeGroupers(newGroupers);
            me.groupers.clear();
            me.groupers.addAll(newGroupers);
        }

        if (me.remoteGroup) {
            if (me.buffered) {
                me.pageMap.clear();
                me.loadPage(1, { groupChange: true });
            } else {
                me.load({
                    scope: me,
                    callback: me.fireGroupChange
                });
            }
        } else {
            // need to explicitly force a sort if we have groupers
            me.sort(null, null, null, hasNew);
            me.fireGroupChange();
        }
    },

    /**
     * Clear any groupers in the store
     */
    clearGrouping: function() {
        var me       = this,
            groupers = me.groupers.items,
            gLen     = groupers.length,
            grouper, g;

        for (g = 0; g < gLen; g++) {
            grouper = groupers[g];

            me.sorters.remove(grouper);
        }
        me.groupers.clear();
        if (me.remoteGroup) {
            if (me.buffered) {
                me.pageMap.clear();
                me.loadPage(1, { groupChange: true });
            } else {
                me.load({
                    scope: me,
                    callback: me.fireGroupChange
                });
            }
        } else {
            me.sort();
            me.fireGroupChange();
        }
    },

    /**
     * Checks if the store is currently grouped
     * @return {Boolean} True if the store is grouped.
     */
    isGrouped: function() {
        return this.groupers.getCount() > 0;
    },

    /**
     * Fires the groupchange event. Abstracted out so we can use it
     * as a callback
     * @private
     */
    fireGroupChange: function() {
        this.fireEvent('groupchange', this, this.groupers);
    },

    /**
     * Returns an array containing the result of applying grouping to the records in this store.
     * See {@link #groupField}, {@link #groupDir} and {@link #getGroupString}. Example for a store
     * containing records with a color field:
     *
     *     var myStore = Ext.create('Ext.data.Store', {
     *         groupField: 'color',
     *         groupDir  : 'DESC'
     *     });
     *
     *     myStore.getGroups(); // returns:
     *     [
     *         {
     *             name: 'yellow',
     *             children: [
     *                 // all records where the color field is 'yellow'
     *             ]
     *         },
     *         {
     *             name: 'red',
     *             children: [
     *                 // all records where the color field is 'red'
     *             ]
     *         }
     *     ]
     *
     * Group contents are effected by filtering.
     *
     * @param {String} [groupName] Pass in an optional groupName argument to access a specific
     * group as defined by {@link #getGroupString}.
     * @return {Object/Object[]} The grouped data
     */
    getGroups: function(requestGroupString) {
        var records = this.data.items,
            length = records.length,
            groups = [],
            pointers = {},
            record,
            groupStr,
            group,
            i;

        for (i = 0; i < length; i++) {
            record = records[i];
            groupStr = this.getGroupString(record);
            group = pointers[groupStr];

            if (group === undefined) {
                group = {
                    name: groupStr,
                    children: []
                };

                groups.push(group);
                pointers[groupStr] = group;
            }

            group.children.push(record);
        }

        return requestGroupString ? pointers[requestGroupString] : groups;
    },

    /**
     * @private
     * For a given set of records and a Grouper, returns an array of arrays - each of which is the set of records
     * matching a certain group.
     */
    getGroupsForGrouper: function(records, grouper) {
        var length = records.length,
            groups = [],
            oldValue,
            newValue,
            record,
            group,
            i;

        for (i = 0; i < length; i++) {
            record = records[i];
            newValue = grouper.getGroupString(record);

            if (newValue !== oldValue) {
                group = {
                    name: newValue,
                    grouper: grouper,
                    records: []
                };
                groups.push(group);
            }

            group.records.push(record);

            oldValue = newValue;
        }

        return groups;
    },

    /**
     * @private
     * This is used recursively to gather the records into the configured Groupers. The data MUST have been sorted for
     * this to work properly (see {@link #getGroupData} and {@link #getGroupsForGrouper}) Most of the work is done by
     * {@link #getGroupsForGrouper} - this function largely just handles the recursion.
     *
     * @param {Ext.data.Model[]} records The set or subset of records to group
     * @param {Number} grouperIndex The grouper index to retrieve
     * @return {Object[]} The grouped records
     */
    getGroupsForGrouperIndex: function(records, grouperIndex) {
        var me = this,
            groupers = me.groupers,
            grouper = groupers.getAt(grouperIndex),
            groups = me.getGroupsForGrouper(records, grouper),
            length = groups.length,
            i;

        if (grouperIndex + 1 < groupers.length) {
            for (i = 0; i < length; i++) {
                groups[i].children = me.getGroupsForGrouperIndex(groups[i].records, grouperIndex + 1);
            }
        }

        for (i = 0; i < length; i++) {
            groups[i].depth = grouperIndex;
        }

        return groups;
    },

    /**
     * @private
     * Returns records grouped by the configured {@link #groupers grouper} configuration. Sample return value (in
     * this case grouping by genre and then author in a fictional books dataset):
     *
     *     [
     *         {
     *             name: 'Fantasy',
     *             depth: 0,
     *             records: [
     *                 //book1, book2, book3, book4
     *             ],
     *             children: [
     *                 {
     *                     name: 'Rowling',
     *                     depth: 1,
     *                     records: [
     *                         //book1, book2
     *                     ]
     *                 },
     *                 {
     *                     name: 'Tolkein',
     *                     depth: 1,
     *                     records: [
     *                         //book3, book4
     *                     ]
     *                 }
     *             ]
     *         }
     *     ]
     *
     * @param {Boolean} [sort=true] True to call {@link #sort} before finding groups. Sorting is required to make grouping
     * function correctly so this should only be set to false if the Store is known to already be sorted correctly.
     * @return {Object[]} The group data
     */
    getGroupData: function(sort) {
        var me = this;
        if (sort !== false) {
            me.sort();
        }

        return me.getGroupsForGrouperIndex(me.data.items, 0);
    },

    /**
     * Returns the string to group on for a given model instance. The default implementation of this method returns
     * the model's {@link #groupField}, but this can be overridden to group by an arbitrary string. For example, to
     * group by the first letter of a model's 'name' field, use the following code:
     *
     *     Ext.create('Ext.data.Store', {
     *         groupDir: 'ASC',
     *         getGroupString: function(instance) {
     *             return instance.get('name')[0];
     *         }
     *     });
     *
     * @param {Ext.data.Model} instance The model instance
     * @return {String} The string to compare when forming groups
     */
    getGroupString: function(instance) {
        var group = this.groupers.first();
        if (group) {
            return instance.get(group.property);
        }
        return '';
    },

    /**
     * Inserts Model instances into the Store at the given index and fires the {@link #event-add} event.
     * See also {@link #method-add}.
     *
     * @param {Number} index The start index at which to insert the passed Records.
     * @param {Ext.data.Model[]} records An Array of Ext.data.Model objects to add to the store.
     */
    insert: function(index, records) {
        var me = this,
            sync = false,
            i,
            record,
            len;

        records = [].concat(records);
        for (i = 0,len = records.length; i < len; i++) {
            record = me.createModel(records[i]);
            record.set(me.modelDefaults);
            // reassign the model in the array in case it wasn't created yet
            records[i] = record;

            me.data.insert(index + i, record);
            record.join(me);

            sync = sync || record.phantom === true;
        }

        if (me.snapshot) {
            me.snapshot.addAll(records);
        }

        if (me.requireSort) {
            // suspend events so the usual data changed events don't get fired.
            me.suspendEvents();
            me.sort();
            me.resumeEvents();
        }

        me.fireEvent('add', me, records, index);
        me.fireEvent('datachanged', me);
        if (me.autoSync && sync && !me.autoSyncSuspended) {
            me.sync();
        }
    },

    /**
     * Adds Model instance to the Store. This method accepts either:
     *
     * - An array of Model instances or Model configuration objects.
     * - Any number of Model instance or Model configuration object arguments.
     *
     * The new Model instances will be added at the end of the existing collection.
     *
     * Sample usage:
     *
     *     myStore.add({some: 'data'}, {some: 'other data'});
     *
     * Note that if this Store is sorted, the new Model instances will be inserted
     * at the correct point in the Store to maintain the sort order.
     *
     * @param {Ext.data.Model[]/Ext.data.Model...} model An array of Model instances
     * or Model configuration objects, or variable number of Model instance or config arguments.
     * @return {Ext.data.Model[]} The model instances that were added
     */
    add: function(records) {
        //accept both a single-argument array of records, or any number of record arguments
        if (!Ext.isArray(records)) {
            records = Array.prototype.slice.apply(arguments);
        } else {
            // Create an array copy
            records = records.slice(0);
        }

        var me = this,
            i = 0,
            length = records.length,
            record,
            isSorted = !me.remoteSort && me.sorters && me.sorters.items.length;

        // If this Store is sorted, and they only passed one Record (99% or use cases)
        // then it's much more efficient to add it sorted than to append and then sort.
        if (isSorted && length === 1) {
            return [ me.addSorted(me.createModel(records[0])) ];
        }

        for (; i < length; i++) {
            record = me.createModel(records[i]);
            // reassign the model in the array in case it wasn't created yet
            records[i] = record;
        }

        // If this sort is sorted, set the flag used by the insert method to sort
        // before firing events.
        if (isSorted) {
            me.requireSort = true;
        }

        me.insert(me.data.length, records);
        delete me.requireSort;

        return records;
    },

    /**
     * (Local sort only) Inserts the passed Record into the Store at the index where it
     * should go based on the current sort information.
     *
     * @param {Ext.data.Record} record
     */
    addSorted: function(record) {
        var me = this,
            index = me.data.findInsertionIndex(record, me.generateComparator());

        me.insert(index, record);
        return record;
    },

    /**
     * Converts a literal to a model, if it's not a model already
     * @private
     * @param {Ext.data.Model/Object} record The record to create
     * @return {Ext.data.Model}
     */
    createModel: function(record) {
        if (!record.isModel) {
            record = Ext.ModelManager.create(record, this.model);
        }

        return record;
    },

    /**
     * Calls the specified function for each {@link Ext.data.Model record} in the store.
     *
     * When store is filtered, only loops over the filtered records.
     *
     * @param {Function} fn The function to call. The {@link Ext.data.Model Record} is passed as the first parameter.
     * Returning `false` aborts and exits the iteration.
     * @param {Object} [scope] The scope (this reference) in which the function is executed.
     * Defaults to the current {@link Ext.data.Model record} in the iteration.
     */
    each: function(fn, scope) {
        var data = this.data.items,
            dLen = data.length,
            record, d;

        for (d = 0; d < dLen; d++) {
            record = data[d];
            if (fn.call(scope || record, record, d, dLen) === false) {
                break;
            }
        }
    },

    /**
     * Removes the given record from the Store, firing the 'remove' event for each instance that is removed,
     * plus a single 'datachanged' event after removal.
     *
     * @param {Ext.data.Model/Ext.data.Model[]} records Model instance or array of instances to remove.
     */
    remove: function(records, /* private */ isMove) {
        if (!Ext.isArray(records)) {
            records = [records];
        }

        /*
         * Pass the isMove parameter if we know we're going to be re-inserting this record
         */
        isMove = isMove === true;
        var me = this,
            sync = false,
            i = 0,
            length = records.length,
            isNotPhantom,
            index,
            record;

        for (; i < length; i++) {
            record = records[i];
            index = me.data.indexOf(record);

            if (me.snapshot) {
                me.snapshot.remove(record);
            }

            if (index > -1) {
                isNotPhantom = record.phantom !== true;

                // don't push phantom records onto removed
                if (!isMove && isNotPhantom) {

                    // Store the index the record was removed from so that rejectChanges can re-insert at the correct place.
                    // The record's index property won't do, as that is the index in the overall dataset when Store is buffered.
                    record.removedFrom = index;
                    me.removed.push(record);
                }

                record.unjoin(me);
                me.data.remove(record);
                sync = sync || isNotPhantom;

                me.fireEvent('remove', me, record, index);
            }
        }

        me.fireEvent('datachanged', me);
        if (!isMove && me.autoSync && sync && !me.autoSyncSuspended) {
            me.sync();
        }
    },

    /**
     * Removes the model instance at the given index
     * @param {Number} index The record index
     */
    removeAt: function(index) {
        var record = this.getAt(index);

        if (record) {
            this.remove(record);
        }
    },

    /**
     * Loads data into the Store via the configured {@link #proxy}. This uses the Proxy to make an
     * asynchronous call to whatever storage backend the Proxy uses, automatically adding the retrieved
     * instances into the Store and calling an optional callback if required. Example usage:
     *
     *     store.load({
     *         scope: this,
     *         callback: function(records, operation, success) {
     *             // the {@link Ext.data.Operation operation} object
     *             // contains all of the details of the load operation
     *             console.log(records);
     *         }
     *     });
     *
     * If the callback scope does not need to be set, a function can simply be passed:
     *
     *     store.load(function(records, operation, success) {
     *         console.log('loaded records');
     *     });
     *
     * @param {Object/Function} [options] config object, passed into the Ext.data.Operation object before loading.
     * Additionally `addRecords: true` can be specified to add these records to the existing records, default is
     * to remove the Store's existing records first.
     */
    load: function(options) {
        var me = this;

        options = options || {};

        if (typeof options == 'function') {
            options = {
                callback: options
            };
        }

        options.groupers = options.groupers ||  me.groupers.items;
        options.page = options.page || me.currentPage;
        options.start = (options.start !== undefined) ? options.start : (options.page - 1) * me.pageSize;
        options.limit = options.limit || me.pageSize;
        options.addRecords = options.addRecords || false;

        if (me.buffered) {
            return me.loadToPrefetch(options);
        }
        return me.callParent([options]);
    },

    reload: function(options) {
        var me = this,
            startIdx,
            endIdx,
            startPage,
            endPage,
            i,
            waitForReload,
            bufferZone,
            records;

        if (!options) {
            options = {};
        }

        // If buffered, we have to clear the page cache and then
        // cache the page range surrounding store's loaded range.
        if (me.buffered) {

            // So that prefetchPage does not consider the store to be fully loaded if the local count is equal to the total count
            delete me.totalCount;

            waitForReload = function() {
                if (me.rangeCached(startIdx, endIdx)) {
                    me.loading = false;
                    me.pageMap.un('pageAdded', waitForReload);
                    records = me.pageMap.getRange(startIdx, endIdx);
                    me.loadRecords(records, {
                        start: startIdx
                    });
                    me.fireEvent('load', me, records, true);
                }
            };
            bufferZone = Math.ceil((me.leadingBufferZone + me.trailingBufferZone) / 2);

            // Get our record index range in the dataset
            startIdx = options.start || me.getAt(0).index;
            endIdx = startIdx + (options.count || me.getCount()) - 1;

            // Calculate a page range which encompasses the Store's loaded range plus both buffer zones
            startPage = me.getPageFromRecordIndex(Math.max(startIdx - bufferZone, 0));
            endPage = me.getPageFromRecordIndex(endIdx + bufferZone);

            // Clear cache (with initial flag so that any listening PagingScroller does not reset to page 1).
            me.pageMap.clear(true);

            if (me.fireEvent('beforeload', me, options) !== false) {
                me.loading = true;

                // Recache the page range which encapsulates our visible records
                for (i = startPage; i <= endPage; i++) {
                    me.prefetchPage(i, options);
                }

                // Wait for the requested range to become available in the page map
                // Load the range as soon as the whole range is available
                me.pageMap.on('pageAdded', waitForReload);
            }
        } else {
            return me.callParent(arguments);
        }
    },

    /**
     * @private
     * Called internally when a Proxy has completed a load request
     */
    onProxyLoad: function(operation) {
        var me = this,
            resultSet = operation.getResultSet(),
            records = operation.getRecords(),
            successful = operation.wasSuccessful();

        if (resultSet) {
            me.totalCount = resultSet.total;
        }

        if (successful) {
            me.loadRecords(records, operation);
        }

        me.loading = false;
        if (me.hasListeners.load) {
            me.fireEvent('load', me, records, successful);
        }

        //TODO: deprecate this event, it should always have been 'load' instead. 'load' is now documented, 'read' is not.
        //People are definitely using this so can't deprecate safely until 2.x
        if (me.hasListeners.read) {
            me.fireEvent('read', me, records, successful);
        }

        //this is a callback that would have been passed to the 'read' function and is optional
        Ext.callback(operation.callback, operation.scope || me, [records, operation, successful]);
    },

    //inherit docs
    getNewRecords: function() {
        return this.data.filterBy(this.filterNew).items;
    },

    //inherit docs
    getUpdatedRecords: function() {
        return this.data.filterBy(this.filterUpdated).items;
    },

    /**
     * Filters the loaded set of records by a given set of filters.
     *
     * By default, the passed filter(s) are *added* to the collection of filters being used to filter this Store.
     *
     * To remove existing filters before applying a new set of filters use
     *
     *     // Clear the filter collection without updating the UI
     *     store.clearFilter(true);
     *
     * see {@link #clearFilter}.
     *
     * Alternatively, if filters are configured with an `id`, then existing filters store may be *replaced* by new
     * filters having the same `id`.
     *
     * Filtering by single field:
     *
     *     store.filter("email", /\.com$/);
     *
     * Using multiple filters:
     *
     *     store.filter([
     *         {property: "email", value: /\.com$/},
     *         {filterFn: function(item) { return item.get("age") > 10; }}
     *     ]);
     *
     * Using Ext.util.Filter instances instead of config objects
     * (note that we need to specify the {@link Ext.util.Filter#root root} config option in this case):
     *
     *     store.filter([
     *         Ext.create('Ext.util.Filter', {property: "email", value: /\.com$/, root: 'data'}),
     *         Ext.create('Ext.util.Filter', {filterFn: function(item) { return item.get("age") > 10; }, root: 'data'})
     *     ]);
     *
     * When store is filtered, most of the methods for accessing store data will be working only
     * within the set of filtered records. Two notable exceptions are {@link #queryBy} and
     * {@link #getById}.
     *
     * @param {Object[]/Ext.util.Filter[]/String} filters The set of filters to apply to the data.
     * These are stored internally on the store, but the filtering itself is done on the Store's
     * {@link Ext.util.MixedCollection MixedCollection}. See MixedCollection's
     * {@link Ext.util.MixedCollection#filter filter} method for filter syntax.
     * Alternatively, pass in a property string
     * @param {String} [value] value to filter by (only if using a property string as the first argument)
     */
    filter: function(filters, value) {
        if (Ext.isString(filters)) {
            filters = {
                property: filters,
                value: value
            };
        }

        var me = this,
            decoded = me.decodeFilters(filters),
            i = 0,
            doLocalSort = me.sorters.length && me.sortOnFilter && !me.remoteSort,
            length = decoded.length;

        for (; i < length; i++) {
            me.filters.replace(decoded[i]);
        }

        if (me.remoteFilter) {
            // So that prefetchPage does not consider the store to be fully loaded if the local count is equal to the total count
            delete me.totalCount;
            
            // For a buffered Store, we have to clear the prefetch cache because the dataset will change upon filtering.
            // Then we must prefetch the new page 1, and when that arrives, reload the visible part of the Store
            // via the guaranteedrange event
            if (me.buffered) {
                me.pageMap.clear();
                me.loadPage(1);
            } else {
                // Reset to the first page, the filter is likely to produce a smaller data set
                me.currentPage = 1;
                //the load function will pick up the new filters and request the filtered data from the proxy
                me.load();
            }
        } else {
            /**
             * @property {Ext.util.MixedCollection} snapshot
             * A pristine (unfiltered) collection of the records in this store. This is used to reinstate
             * records when a filter is removed or changed
             */
            if (me.filters.getCount()) {
                me.snapshot = me.snapshot || me.data.clone();
                me.data = me.data.filter(me.filters.items);

                if (doLocalSort) {
                    me.sort();
                } else {
                    // fire datachanged event if it hasn't already been fired by doSort
                    me.fireEvent('datachanged', me);
                    me.fireEvent('refresh', me);
                }
            }
        }
    },

    /**
     * Reverts to a view of the Record cache with no filtering applied.
     * @param {Boolean} suppressEvent If `true` the filter is cleared silently.
     *
     * For a locally filtered Store, this means that the filter collection is cleared without firing the
     * {@link #datachanged} event.
     *
     * For a remotely filtered Store, this means that the filter collection is cleared, but the store
     * is not reloaded from the server.
     */
    clearFilter: function(suppressEvent) {
        var me = this;

        me.filters.clear();

        if (me.remoteFilter) {

            // In a buffered Store, the meaing of suppressEvent is to simply clear the filters collection
            if (suppressEvent) {
                return;
            }

            // So that prefetchPage does not consider the store to be fully loaded if the local count is equal to the total count
            delete me.totalCount;

            // For a buffered Store, we have to clear the prefetch cache because the dataset will change upon filtering.
            // Then we must prefetch the new page 1, and when that arrives, reload the visible part of the Store
            // via the guaranteedrange event
            if (me.buffered) {
                me.pageMap.clear();
                me.loadPage(1);
            } else {
                // Reset to the first page, clearing a filter will destroy the context of the current dataset
                me.currentPage = 1;
                me.load();
            }
        } else if (me.isFiltered()) {
            me.data = me.snapshot.clone();
            delete me.snapshot;

            if (suppressEvent !== true) {
                me.fireEvent('datachanged', me);
                me.fireEvent('refresh', me);
            }
        }
    },

    /**
     * Returns true if this store is currently filtered
     * @return {Boolean}
     */
    isFiltered: function() {
        var snapshot = this.snapshot;
        return !! snapshot && snapshot !== this.data;
    },

    /**
     * Filters by a function. The specified function will be called for each
     * Record in this Store. If the function returns `true` the Record is included,
     * otherwise it is filtered out.
     *
     * When store is filtered, most of the methods for accessing store data will be working only
     * within the set of filtered records. Two notable exceptions are {@link #queryBy} and
     * {@link #getById}.
     *
     * @param {Function} fn The function to be called. It will be passed the following parameters:
     *  @param {Ext.data.Model} fn.record The record to test for filtering. Access field values
     *  using {@link Ext.data.Model#get}.
     *  @param {Object} fn.id The ID of the Record passed.
     * @param {Object} [scope] The scope (this reference) in which the function is executed.
     * Defaults to this Store.
     */
    filterBy: function(fn, scope) {
        var me = this;

        me.snapshot = me.snapshot || me.data.clone();
        me.data = me.queryBy(fn, scope || me);
        me.fireEvent('datachanged', me);
        me.fireEvent('refresh', me);
    },

    /**
     * Query all the cached records in this Store using a filtering function. The specified function
     * will be called with each record in this Store. If the function returns `true` the record is
     * included in the results.
     *
     * This method is not effected by filtering, it will always look from all records inside the store
     * no matter if filter is applied or not.
     *
     * @param {Function} fn The function to be called. It will be passed the following parameters:
     *  @param {Ext.data.Model} fn.record The record to test for filtering. Access field values
     *  using {@link Ext.data.Model#get}.
     *  @param {Object} fn.id The ID of the Record passed.
     * @param {Object} [scope] The scope (this reference) in which the function is executed
     * Defaults to this Store.
     * @return {Ext.util.MixedCollection} Returns an Ext.util.MixedCollection of the matched records
     */
    queryBy: function(fn, scope) {
        var me = this,
            data = me.snapshot || me.data;
        return data.filterBy(fn, scope || me);
    },

    /**
     * Query all the cached records in this Store by name/value pair.
     * The parameters will be used to generated a filter function that is given
     * to the queryBy method.
     *
     * This method compliments queryBy by generating the query function automatically.
     *
     * @param {String} property The property to create the filter function for
     * @param {String/RegExp} value The string/regex to compare the property value to
     * @param {Boolean} [anyMatch=false] True if we don't care if the filter value is not the full value.
     * @param {Boolean} [caseSensitive=false] True to create a case-sensitive regex.
     * @param {Boolean} [exactMatch=false] True to force exact match (^ and $ characters added to the regex).
     * Ignored if anyMatch is true.
     * @return {Ext.util.MixedCollection} Returns an Ext.util.MixedCollection of the matched records
     */
    query: function(property, value, anyMatch, caseSensitive, exactMatch) {
        var me = this,
            queryFn = me.createFilterFn(property, value, anyMatch, caseSensitive, exactMatch),
            results = me.queryBy(queryFn);

        //create an empty mixed collection for use if queryBy returns null
        if(!results) {
            results = new Ext.util.MixedCollection();
        }

        return results;
    },

    /**
     * Loads an array of data straight into the Store.
     *
     * Using this method is great if the data is in the correct format already (e.g. it doesn't need to be
     * processed by a reader). If your data requires processing to decode the data structure, use a
     * {@link Ext.data.proxy.Memory MemoryProxy} instead.
     *
     * @param {Ext.data.Model[]/Object[]} data Array of data to load. Any non-model instances will be cast
     * into model instances first.
     * @param {Boolean} [append=false] True to add the records to the existing records in the store, false
     * to remove the old ones first.
     */
    loadData: function(data, append) {
        var me = this,
            model = me.model,
            length = data.length,
            newData = [],
            i,
            record;

        //make sure each data element is an Ext.data.Model instance
        for (i = 0; i < length; i++) {
            record = data[i];

            if (!(record.isModel)) {
                record = Ext.ModelManager.create(record, model);
            }
            newData.push(record);
        }

        me.loadRecords(newData, append ? me.addRecordsOptions : undefined);
    },

    /**
     * Loads data via the bound Proxy's reader
     *
     * Use this method if you are attempting to load data and want to utilize the configured data reader.
     *
     * @param {Object[]} data The full JSON object you'd like to load into the Data store.
     * @param {Boolean} [append=false] True to add the records to the existing records in the store, false
     * to remove the old ones first.
     */
    loadRawData : function(data, append) {
         var me      = this,
             result  = me.proxy.reader.read(data),
             records = result.records;

         if (result.success) {
             me.totalCount = result.total;
             me.loadRecords(records, append ? me.addRecordsOptions : undefined);
             me.fireEvent('load', me, records, true);
         }
     },

    /**
     * Loads an array of {@link Ext.data.Model model} instances into the store, fires the datachanged event. This should only usually
     * be called internally when loading from the {@link Ext.data.proxy.Proxy Proxy}, when adding records manually use {@link #method-add} instead
     * @param {Ext.data.Model[]} records The array of records to load
     * @param {Object} options
     * @param {Boolean} [options.addRecords=false] Pass `true` to add these records to the existing records, `false` to remove the Store's existing records first.
     * @param {Number}  [options.start] Only used by buffered Stores. The index *within the overall dataset* of the first record in the array.
     */
    loadRecords: function(records, options) {
        var me     = this,
            i      = 0,
            length = records.length,
            start,
            addRecords,
            snapshot = me.snapshot;

        if (options) {
            start = options.start;
            addRecords = options.addRecords;
        }

        if (!addRecords) {
            delete me.snapshot;
            me.clearData(true);
        } else if (snapshot) {
            snapshot.addAll(records);
        }

        me.data.addAll(records);

        if (start !== undefined) {
            for (; i < length; i++) {
                records[i].index = start + i;
                records[i].join(me);
            }
        } else {
            for (; i < length; i++) {
                records[i].join(me);
            }
        }

        /*
         * this rather inelegant suspension and resumption of events is required because both the filter and sort functions
         * fire an additional datachanged event, which is not wanted. Ideally we would do this a different way. The first
         * datachanged event is fired by the call to this.add, above.
         */
        me.suspendEvents();

        if (me.filterOnLoad && !me.remoteFilter) {
            me.filter();
        }

        if (me.sortOnLoad && !me.remoteSort) {
            me.sort(undefined, undefined, undefined, true);
        }

        me.resumeEvents();
        me.fireEvent('datachanged', me);
        me.fireEvent('refresh', me);
    },

    // PAGING METHODS
    /**
     * Loads a given 'page' of data by setting the start and limit values appropriately. Internally this just causes a normal
     * load operation, passing in calculated 'start' and 'limit' params
     * @param {Number} page The number of the page to load
     * @param {Object} options See options for {@link #method-load}
     */
    loadPage: function(page, options) {
        var me = this;

        me.currentPage = page;

        // Copy options into a new object so as not to mutate passed in objects
        options = Ext.apply({
            page: page,
            start: (page - 1) * me.pageSize,
            limit: me.pageSize,
            addRecords: !me.clearOnPageLoad
        }, options);

        if (me.buffered) {
            return me.loadToPrefetch(options);
        }
        me.read(options);
    },

    /**
     * Loads the next 'page' in the current data set
     * @param {Object} options See options for {@link #method-load}
     */
    nextPage: function(options) {
        this.loadPage(this.currentPage + 1, options);
    },

    /**
     * Loads the previous 'page' in the current data set
     * @param {Object} options See options for {@link #method-load}
     */
    previousPage: function(options) {
        this.loadPage(this.currentPage - 1, options);
    },

    // private
    clearData: function(isLoad) {
        var me = this,
            records = me.data.items,
            i = records.length;

        while (i--) {
            records[i].unjoin(me);
        }
        me.data.clear();
        if (isLoad !== true || me.clearRemovedOnLoad) {
            me.removed.length = 0;
        }
    },

    loadToPrefetch: function(options) {
        var me = this,
            i,
            records,

            // Get the requested record index range in the dataset
            startIdx = options.start,
            endIdx = options.start + options.limit - 1,

            // The end index to load into the store's live record collection
            loadEndIdx = options.start + (me.viewSize || options.limit) - 1,

            // Calculate a page range which encompasses the requested range plus both buffer zones
            startPage = me.getPageFromRecordIndex(Math.max(startIdx - me.trailingBufferZone, 0)),
            endPage = me.getPageFromRecordIndex(endIdx + me.leadingBufferZone),

            // Wait for the viewable range to be available
            waitForRequestedRange = function() {
                if (me.rangeCached(startIdx, loadEndIdx)) {
                    me.loading = false;
                    records = me.pageMap.getRange(startIdx, loadEndIdx);
                    me.pageMap.un('pageAdded', waitForRequestedRange);

                    // If there is a listener for guranteedrange (PagingScroller uses this), then go through that event
                    if (me.hasListeners.guaranteedrange) {
                        me.guaranteeRange(startIdx, loadEndIdx, options.callback, options.scope);
                    }
                    // Otherwise load the records directly
                    else {
                        me.loadRecords(records, {
                            start: startIdx
                        });
                    }
                    me.fireEvent('load', me, records, true);
                    if (options.groupChange) {
                        me.fireGroupChange();
                    }
                }
            };

        if (me.fireEvent('beforeload', me, options) !== false) {

            // So that prefetchPage does not consider the store to be fully loaded if the local count is equal to the total count
            delete me.totalCount;

            me.loading = true;

            // Wait for the requested range to become available in the page map
            me.pageMap.on('pageAdded', waitForRequestedRange);
            
            // Load the first page in the range, which will give us the initial total count.
            // Once it is loaded, go ahead and prefetch any subsequent pages, if necessary.
            // The prefetchPage has a check to prevent us loading more than the totalCount,
            // so we don't want to blindly load up <n> pages where it isn't required. 
            me.on('prefetch', function(){
                for (i = startPage + 1; i <= endPage; ++i) {
                    me.prefetchPage(i, options);
                }
            }, null, {single: true});
            
            me.prefetchPage(startPage, options);
        }
    },

    // Buffering
    /**
     * Prefetches data into the store using its configured {@link #proxy}.
     * @param {Object} options (Optional) config object, passed into the Ext.data.Operation object before loading.
     * See {@link #method-load}
     */
    prefetch: function(options) {
        var me = this,
            pageSize = me.pageSize,
            proxy,
            operation;

        // Check pageSize has not been tampered with. That would break page caching
        if (pageSize) {
            if (me.lastPageSize && pageSize != me.lastPageSize) {
                Ext.error.raise("pageSize cannot be dynamically altered");
            }
            if (!me.pageMap.pageSize) {
                me.pageMap.pageSize = pageSize;
            }
        }

        // Allow first prefetch call to imply the required page size.
        else {
            me.pageSize = me.pageMap.pageSize = pageSize = options.limit;
        }

        // So that we can check for tampering next time through
        me.lastPageSize = pageSize;

        // Always get whole pages.
        if (!options.page) {
            options.page = me.getPageFromRecordIndex(options.start);
            options.start = (options.page - 1) * pageSize;
            options.limit = Math.ceil(options.limit / pageSize) * pageSize;
        }

        // Currently not requesting this page, then request it...
        if (!me.pageRequests[options.page]) {

            // Copy options into a new object so as not to mutate passed in objects
            options = Ext.apply({
                action : 'read',
                filters: me.filters.items,
                sorters: me.sorters.items,
                groupers: me.groupers.items,

                // Generation # of the page map to which the requested records belong.
                // If page map is cleared while this request is in flight, the generation will increment and the payload will be rejected
                generation: me.pageMap.generation
            }, options);

            operation = new Ext.data.Operation(options);

            if (me.fireEvent('beforeprefetch', me, operation) !== false) {
                me.loading = true;
                proxy = me.proxy;
                me.pageRequests[options.page] = proxy.read(operation, me.onProxyPrefetch, me);
                if (proxy.isSynchronous) {
                    delete me.pageRequests[options.page];
                }
            }
        }

        return me;
    },

    /**
     * @private
     * Cancels all pending prefetch requests.
     *
     * This is called when the page map is cleared.
     *
     * Any requests which still make it through will be for the previous page map generation
     * (generation is incremented upon clear), and so will be rejected upon arrival.
     */
    cancelAllPrefetches: function() {
        var me = this,
            reqs = me.pageRequests,
            req,
            page;

        // If any requests return, we no longer respond to them.
        if (me.pageMap.events.pageadded) {
            me.pageMap.events.pageadded.clearListeners();
        }

        // Cancel all outstanding requests
        for (page in reqs) {
            if (reqs.hasOwnProperty(page)) {
                req = reqs[page];
                delete reqs[page];
                delete req.callback;
            }
        }
    },

    /**
     * Prefetches a page of data.
     * @param {Number} page The page to prefetch
     * @param {Object} options (Optional) config object, passed into the Ext.data.Operation object before loading.
     * See {@link #method-load}
     */
    prefetchPage: function(page, options) {
        var me = this,
            pageSize = me.pageSize || me.defaultPageSize,
            start = (page - 1) * me.pageSize,
            total = me.totalCount;

        // No more data to prefetch.
        if (total !== undefined && me.getCount() === total) {
            return;
        }

        // Copy options into a new object so as not to mutate passed in objects
        me.prefetch(Ext.applyIf({
            page     : page,
            start    : start,
            limit    : pageSize
        }, options));
    },

    /**
     * Called after the configured proxy completes a prefetch operation.
     * @private
     * @param {Ext.data.Operation} operation The operation that completed
     */
    onProxyPrefetch: function(operation) {
        var me = this,
            resultSet = operation.getResultSet(),
            records = operation.getRecords(),
            successful = operation.wasSuccessful(),
            page = operation.page;

        // Only cache the data if the operation was invoked for the current generation of the page map.
        // If the generation has changed since the request was fired off, it will have been cancelled.
        if (operation.generation === me.pageMap.generation) {

            if (resultSet) {
                me.totalCount = resultSet.total;
                me.fireEvent('totalcountchange', me.totalCount);
            }

            // Remove the loaded page from the outstanding pages hash
            if (page !== undefined) {
                delete me.pageRequests[page];
            }

            // Add the page into the page map.
            // pageAdded event may trigger the onGuaranteedRange
            if (successful) {
                me.cachePage(records, operation.page);
            }

            me.loading = false;
            me.fireEvent('prefetch', me, records, successful, operation);

            //this is a callback that would have been passed to the 'read' function and is optional
            Ext.callback(operation.callback, operation.scope || me, [records, operation, successful]);
        }
    },

    /**
     * Caches the records in the prefetch and stripes them with their server-side
     * index.
     * @private
     * @param {Ext.data.Model[]} records The records to cache
     * @param {Ext.data.Operation} The associated operation
     */
    cachePage: function(records, page) {
        var me = this;

        if (!Ext.isDefined(me.totalCount)) {
            me.totalCount = records.length;
            me.fireEvent('totalcountchange', me.totalCount);
        }

        // Add the fetched page into the pageCache
        me.pageMap.addPage(page, records);
    },

    /**
     * Determines if the passed range is available in the page cache.
     * @private
     * @param {Number} start The start index
     * @param {Number} end The end index in the range
     */
    rangeCached: function(start, end) {
        return this.pageMap && this.pageMap.hasRange(start, end);
    },

    /**
     * Determines if the passed page is available in the page cache.
     * @private
     * @param {Number} page The page to find in the page cache.
     */
    pageCached: function(page) {
        return this.pageMap && this.pageMap.hasPage(page);
    },

    /**
     * Determines if the passed range is available in the page cache.
     * @private
     * @deprecated 4.1.0 use {@link #rangeCached} instead
     * @param {Number} start The start index
     * @param {Number} end The end index in the range
     */
    rangeSatisfied: function(start, end) {
        return this.rangeCached(start, end);
    },

    /**
     * Determines the page from a record index
     * @param {Number} index The record index
     * @return {Number} The page the record belongs to
     */
    getPageFromRecordIndex: function(index) {
        return Math.floor(index / this.pageSize) + 1;
    },

    /**
     * Handles a guaranteed range being loaded
     * @private
     */
    onGuaranteedRange: function(options) {
        var me = this,
            totalCount = me.getTotalCount(),
            start = options.prefetchStart,
            end = ((totalCount - 1) < options.prefetchEnd) ? totalCount - 1 : options.prefetchEnd,
            range;

        end = Math.max(0, end);

        //<debug>
        if (start > end) {
            Ext.log({
                level: 'warn',
                msg: 'Start (' + start + ') was greater than end (' + end +
                    ') for the range of records requested (' + start + '-' +
                    options.prefetchEnd + ')' + (this.storeId ? ' from store "' + this.storeId + '"' : '')
            });
        }
        //</debug>

        range = me.pageMap.getRange(start, end);
        me.fireEvent('guaranteedrange', range, start, end);
        if (options.cb) {
            options.cb.call(options.scope || me, range, start, end);
        }
    },

    /**
     * Ensures that the specified range of rows is present in the cache.
     *
     * Converts the row range to a page range and then only load pages which are not already
     * present in the page cache.
     */
    prefetchRange: function(start, end) {
        var me = this,
            startPage, endPage, page;
        if (!me.rangeCached(start, end)) {
            startPage = me.getPageFromRecordIndex(start);
            endPage = me.getPageFromRecordIndex(end);

            // Ensure that the page cache's max size is correct.
            // Our purgePageCount is the number of additional pages *outside of the required range* which
            // may be kept in the cache. A purgePageCount of zero means unlimited.
            me.pageMap.maxSize = me.purgePageCount ? (endPage - startPage + 1) + me.purgePageCount : 0;

            // We have the range, but ensure that we have a "buffer" of pages around it.
            for (page = startPage; page <= endPage; page++) {
                if (!me.pageCached(page)) {
                    me.prefetchPage(page);
                }
            }
        }
    },

    /**
     * Guarantee a specific range, this will load the store with a range (that
     * must be the pageSize or smaller) and take care of any loading that may
     * be necessary.
     */
    guaranteeRange: function(start, end, cb, scope) {
        // Sanity check end point to be within dataset range
        end = (end > this.totalCount) ? this.totalCount - 1 : end;

        var me = this,
            lastRequestStart = me.lastRequestStart,
            options = {
                prefetchStart: start,
                prefetchEnd: end,
                cb: cb,
                scope: scope
            },
            pageAddHandler;

        me.lastRequestStart = start;

        // If data request can be satisfied from the page cache
        if (me.rangeCached(start, end)) {

            // Attempt to keep the page cache primed with pages which encompass the live data range
            if (start < lastRequestStart) {
                start = Math.max(start - me.leadingBufferZone, 0);
                end   = Math.min(end   + me.trailingBufferZone, me.totalCount - 1);
            } else {
                start = Math.max(Math.min(start - me.trailingBufferZone, me.totalCount - me.pageSize), 0);
                end   = Math.min(end + me.leadingBufferZone, me.totalCount - 1);
            }

            // If the prefetch window calculated round the requested range is not already satisfied in the page cache,
            // then arrange to prefetch it.
            if (!me.rangeCached(start, end)) {
                // We have the range, but ensure that we have a "buffer" of pages around it.
                me.prefetchRange(start, end);
            }
            me.onGuaranteedRange(options);
        }
        // At least some of the requested range needs loading from server
        else {
            // Private event used by the LoadMask class to perform masking when the range required for rendering is not found in the cache
            me.fireEvent('cachemiss', me, start, end);

            // Calculate a prefetch range which is centered on the requested data
            start = Math.min(Math.max(Math.floor(start - ((me.leadingBufferZone + me.trailingBufferZone) / 2)), 0), me.totalCount - me.pageSize);
            end =   Math.min(Math.max(Math.ceil (end   + ((me.leadingBufferZone + me.trailingBufferZone) / 2)), 0), me.totalCount - 1);

            // Add a pageAdded listener, and as soon as the requested range is loaded, fire the guaranteedrange event
            pageAddHandler = function(page, records) {
                if (me.rangeCached(options.prefetchStart, options.prefetchEnd)) {
                    // Private event used by the LoadMask class to unmask when the range required for rendering has been loaded into the cache
                    me.fireEvent('cachefilled', me, start, end);
                    me.pageMap.un('pageAdded', pageAddHandler);
                    me.onGuaranteedRange(options);
                }
            };
            me.pageMap.on('pageAdded', pageAddHandler);

            // Prioritize the request for the *exact range that the UI is asking for*.
            // When a page request is in flight, it will not be requested again by checking the me.pageRequests hash,
            // so the request after this will only request the *remaining* unrequested pages .
            me.prefetchRange(options.prefetchStart, options.prefetchEnd);

            // Load the pages that need loading.
            me.prefetchRange(start, end);
        }
    },

    // because prefetchData is stored by index
    // this invalidates all of the prefetchedData
    sort: function() {
        var me = this,
            prefetchData = me.pageMap;

        if (me.buffered) {
            if (me.remoteSort) {
                prefetchData.clear();
                me.callParent(arguments);
            } else {
                me.callParent(arguments);
            }
        } else {
            me.callParent(arguments);
        }
    },

    // overriden to provide striping of the indexes as sorting occurs.
    // this cannot be done inside of sort because datachanged has already
    // fired and will trigger a repaint of the bound view.
    doSort: function(sorterFn) {
        var me = this,
            range,
            ln,
            i;
        if (me.remoteSort) {

            // For a buffered Store, we have to clear the prefetch cache since it is keyed by the index within the dataset.
            // Then we must prefetch the new page 1, and when that arrives, reload the visible part of the Store
            // via the guaranteedrange event
            if (me.buffered) {
                me.pageMap.clear();
                me.loadPage(1);
            } else {
                //the load function will pick up the new sorters and request the sorted data from the proxy
                me.load();
            }
        } else {
            me.data.sortBy(sorterFn);
            if (!me.buffered) {
                range = me.getRange();
                ln = range.length;
                for (i = 0; i < ln; i++) {
                    range[i].index = i;
                }
            }
            me.fireEvent('datachanged', me);
            me.fireEvent('refresh', me);
        }
    },

    /**
     * Finds the index of the first matching Record in this store by a specific field value.
     *
     * When store is filtered, finds records only within filter.
     *
     * @param {String} fieldName The name of the Record field to test.
     * @param {String/RegExp} value Either a string that the field value
     * should begin with, or a RegExp to test against the field.
     * @param {Number} [startIndex=0] The index to start searching at
     * @param {Boolean} [anyMatch=false] True to match any part of the string, not just the beginning
     * @param {Boolean} [caseSensitive=false] True for case sensitive comparison
     * @param {Boolean} [exactMatch=false] True to force exact match (^ and $ characters added to the regex).
     * @return {Number} The matched index or -1
     */
    find: function(property, value, start, anyMatch, caseSensitive, exactMatch) {
        var fn = this.createFilterFn(property, value, anyMatch, caseSensitive, exactMatch);
        return fn ? this.data.findIndexBy(fn, null, start) : -1;
    },

    /**
     * Finds the first matching Record in this store by a specific field value.
     *
     * When store is filtered, finds records only within filter.
     *
     * @param {String} fieldName The name of the Record field to test.
     * @param {String/RegExp} value Either a string that the field value
     * should begin with, or a RegExp to test against the field.
     * @param {Number} [startIndex=0] The index to start searching at
     * @param {Boolean} [anyMatch=false] True to match any part of the string, not just the beginning
     * @param {Boolean} [caseSensitive=false] True for case sensitive comparison
     * @param {Boolean} [exactMatch=false] True to force exact match (^ and $ characters added to the regex).
     * @return {Ext.data.Model} The matched record or null
     */
    findRecord: function() {
        var me = this,
            index = me.find.apply(me, arguments);
        return index !== -1 ? me.getAt(index) : null;
    },

    /**
     * @private
     * Returns a filter function used to test a the given property's value. Defers most of the work to
     * Ext.util.MixedCollection's createValueMatcher function.
     *
     * @param {String} property The property to create the filter function for
     * @param {String/RegExp} value The string/regex to compare the property value to
     * @param {Boolean} [anyMatch=false] True if we don't care if the filter value is not the full value.
     * @param {Boolean} [caseSensitive=false] True to create a case-sensitive regex.
     * @param {Boolean} [exactMatch=false] True to force exact match (^ and $ characters added to the regex).
     * Ignored if anyMatch is true.
     */
    createFilterFn: function(property, value, anyMatch, caseSensitive, exactMatch) {
        if (Ext.isEmpty(value)) {
            return false;
        }
        value = this.data.createValueMatcher(value, anyMatch, caseSensitive, exactMatch);
        return function(r) {
            return value.test(r.data[property]);
        };
    },

    /**
     * Finds the index of the first matching Record in this store by a specific field value.
     *
     * When store is filtered, finds records only within filter.
     *
     * @param {String} fieldName The name of the Record field to test.
     * @param {Object} value The value to match the field against.
     * @param {Number} [startIndex=0] The index to start searching at
     * @return {Number} The matched index or -1
     */
    findExact: function(property, value, start) {
        return this.data.findIndexBy(function(rec) {
            return rec.isEqual(rec.get(property), value);
        },
        this, start);
    },

    /**
     * Find the index of the first matching Record in this Store by a function.
     * If the function returns `true` it is considered a match.
     *
     * When store is filtered, finds records only within filter.
     *
     * @param {Function} fn The function to be called. It will be passed the following parameters:
     *  @param {Ext.data.Model} fn.record The record to test for filtering. Access field values
     *  using {@link Ext.data.Model#get}.
     *  @param {Object} fn.id The ID of the Record passed.
     * @param {Object} [scope] The scope (this reference) in which the function is executed.
     * Defaults to this Store.
     * @param {Number} [startIndex=0] The index to start searching at
     * @return {Number} The matched index or -1
     */
    findBy: function(fn, scope, start) {
        return this.data.findIndexBy(fn, scope, start);
    },

    /**
     * Collects unique values for a particular dataIndex from this store.
     *
     * @param {String} dataIndex The property to collect
     * @param {Boolean} [allowNull] Pass true to allow null, undefined or empty string values
     * @param {Boolean} [bypassFilter] Pass true to collect from all records, even ones which are filtered.
     * @return {Object[]} An array of the unique values
     */
    collect: function(dataIndex, allowNull, bypassFilter) {
        var me = this,
            data = (bypassFilter === true && me.snapshot) ? me.snapshot : me.data;

        return data.collect(dataIndex, 'data', allowNull);
    },

    /**
     * Gets the number of records in store.
     *
     * If using paging, this may not be the total size of the dataset. If the data object
     * used by the Reader contains the dataset size, then the {@link #getTotalCount} function returns
     * the dataset size.  **Note**: see the Important note in {@link #method-load}.
     *
     * When store is filtered, it's the number of records matching the filter.
     *
     * @return {Number} The number of Records in the Store.
     */
    getCount: function() {
        return this.data.length || 0;
    },

    /**
     * Returns the total number of {@link Ext.data.Model Model} instances that the {@link Ext.data.proxy.Proxy Proxy}
     * indicates exist. This will usually differ from {@link #getCount} when using paging - getCount returns the
     * number of records loaded into the Store at the moment, getTotalCount returns the number of records that
     * could be loaded into the Store if the Store contained all data
     * @return {Number} The total number of Model instances available via the Proxy. 0 returned if
     * no value has been set via the reader.
     */
    getTotalCount: function() {
        return this.totalCount || 0;
    },

    /**
     * Get the Record at the specified index.
     *
     * The index is effected by filtering.
     *
     * @param {Number} index The index of the Record to find.
     * @return {Ext.data.Model} The Record at the passed index. Returns undefined if not found.
     */
    getAt: function(index) {
        return this.data.getAt(index);
    },

    /**
     * Returns a range of Records between specified indices.
     *
     * This method is effected by filtering.
     *
     * @param {Number} [startIndex=0] The starting index
     * @param {Number} [endIndex] The ending index. Defaults to the last Record in the Store.
     * @return {Ext.data.Model[]} An array of Records
     */
    getRange: function(start, end) {
        return this.data.getRange(start, end);
    },

    /**
     * Get the Record with the specified id.
     *
     * This method is not effected by filtering, lookup will be performed from all records
     * inside the store, filtered or not.
     *
     * @param {Mixed} id The id of the Record to find.
     * @return {Ext.data.Model} The Record with the passed id. Returns null if not found.
     */
    getById: function(id) {
        return (this.snapshot || this.data).findBy(function(record) {
            return record.getId() === id;
        });
    },

    /**
     * Get the index of the record within the store.
     *
     * When store is filtered, records outside of filter will not be found.
     *
     * @param {Ext.data.Model} record The Ext.data.Model object to find.
     * @return {Number} The index of the passed Record. Returns -1 if not found.
     */
    indexOf: function(record) {
        return this.data.indexOf(record);
    },


    /**
     * Get the index within the entire dataset. From 0 to the totalCount.
     *
     * Like #indexOf, this method is effected by filtering.
     *
     * @param {Ext.data.Model} record The Ext.data.Model object to find.
     * @return {Number} The index of the passed Record. Returns -1 if not found.
     */
    indexOfTotal: function(record) {
        var index = record.index;
        if (index || index === 0) {
            return index;
        }
        return this.indexOf(record);
    },

    /**
     * Get the index within the store of the Record with the passed id.
     *
     * Like #indexOf, this method is effected by filtering.
     *
     * @param {String} id The id of the Record to find.
     * @return {Number} The index of the Record. Returns -1 if not found.
     */
    indexOfId: function(id) {
        return this.indexOf(this.getById(id));
    },

    /**
     * Removes all items from the store.
     * @param {Boolean} silent Prevent the `clear` event from being fired.
     */
    removeAll: function(silent) {
        var me = this;

        me.clearData();
        if (me.snapshot) {
            me.snapshot.clear();
        }

        // Special handling to synch the PageMap only for removeAll
        // TODO: handle other store/data modifications WRT buffered Stores.
        if (me.pageMap) {
            me.pageMap.clear();
        }
        if (silent !== true) {
            me.fireEvent('clear', me);
        }
    },

    /*
     * Aggregation methods
     */

    /**
     * Convenience function for getting the first model instance in the store.
     *
     * When store is filtered, will return first item within the filter.
     *
     * @param {Boolean} [grouped] True to perform the operation for each group
     * in the store. The value returned will be an object literal with the key being the group
     * name and the first record being the value. The grouped parameter is only honored if
     * the store has a groupField.
     * @return {Ext.data.Model/undefined} The first model instance in the store, or undefined
     */
    first: function(grouped) {
        var me = this;

        if (grouped && me.isGrouped()) {
            return me.aggregate(function(records) {
                return records.length ? records[0] : undefined;
            }, me, true);
        } else {
            return me.data.first();
        }
    },

    /**
     * Convenience function for getting the last model instance in the store.
     *
     * When store is filtered, will return last item within the filter.
     *
     * @param {Boolean} [grouped] True to perform the operation for each group
     * in the store. The value returned will be an object literal with the key being the group
     * name and the last record being the value. The grouped parameter is only honored if
     * the store has a groupField.
     * @return {Ext.data.Model/undefined} The last model instance in the store, or undefined
     */
    last: function(grouped) {
        var me = this;

        if (grouped && me.isGrouped()) {
            return me.aggregate(function(records) {
                var len = records.length;
                return len ? records[len - 1] : undefined;
            }, me, true);
        } else {
            return me.data.last();
        }
    },

    /**
     * Sums the value of `property` for each {@link Ext.data.Model record} between `start`
     * and `end` and returns the result.
     *
     * When store is filtered, only sums items within the filter.
     *
     * @param {String} field A field in each record
     * @param {Boolean} [grouped] True to perform the operation for each group
     * in the store. The value returned will be an object literal with the key being the group
     * name and the sum for that group being the value. The grouped parameter is only honored if
     * the store has a groupField.
     * @return {Number} The sum
     */
    sum: function(field, grouped) {
        var me = this;

        if (grouped && me.isGrouped()) {
            return me.aggregate(me.getSum, me, true, [field]);
        } else {
            return me.getSum(me.data.items, field);
        }
    },

    // @private, see sum
    getSum: function(records, field) {
        var total = 0,
            i = 0,
            len = records.length;

        for (; i < len; ++i) {
            total += records[i].get(field);
        }

        return total;
    },

    /**
     * Gets the count of items in the store.
     *
     * When store is filtered, only items within the filter are counted.
     *
     * @param {Boolean} [grouped] True to perform the operation for each group
     * in the store. The value returned will be an object literal with the key being the group
     * name and the count for each group being the value. The grouped parameter is only honored if
     * the store has a groupField.
     * @return {Number} the count
     */
    count: function(grouped) {
        var me = this;

        if (grouped && me.isGrouped()) {
            return me.aggregate(function(records) {
                return records.length;
            }, me, true);
        } else {
            return me.getCount();
        }
    },

    /**
     * Gets the minimum value in the store.
     *
     * When store is filtered, only items within the filter are aggregated.
     *
     * @param {String} field The field in each record
     * @param {Boolean} [grouped] True to perform the operation for each group
     * in the store. The value returned will be an object literal with the key being the group
     * name and the minimum in the group being the value. The grouped parameter is only honored if
     * the store has a groupField.
     * @return {Object} The minimum value, if no items exist, undefined.
     */
    min: function(field, grouped) {
        var me = this;

        if (grouped && me.isGrouped()) {
            return me.aggregate(me.getMin, me, true, [field]);
        } else {
            return me.getMin(me.data.items, field);
        }
    },

    // @private, see min
    getMin: function(records, field) {
        var i = 1,
            len = records.length,
            value, min;

        if (len > 0) {
            min = records[0].get(field);
        }

        for (; i < len; ++i) {
            value = records[i].get(field);
            if (value < min) {
                min = value;
            }
        }
        return min;
    },

    /**
     * Gets the maximum value in the store.
     *
     * When store is filtered, only items within the filter are aggregated.
     *
     * @param {String} field The field in each record
     * @param {Boolean} [grouped] True to perform the operation for each group
     * in the store. The value returned will be an object literal with the key being the group
     * name and the maximum in the group being the value. The grouped parameter is only honored if
     * the store has a groupField.
     * @return {Object} The maximum value, if no items exist, undefined.
     */
    max: function(field, grouped) {
        var me = this;

        if (grouped && me.isGrouped()) {
            return me.aggregate(me.getMax, me, true, [field]);
        } else {
            return me.getMax(me.data.items, field);
        }
    },

    // @private, see max
    getMax: function(records, field) {
        var i = 1,
            len = records.length,
            value,
            max;

        if (len > 0) {
            max = records[0].get(field);
        }

        for (; i < len; ++i) {
            value = records[i].get(field);
            if (value > max) {
                max = value;
            }
        }
        return max;
    },

    /**
     * Gets the average value in the store.
     *
     * When store is filtered, only items within the filter are aggregated.
     *
     * @param {String} field The field in each record
     * @param {Boolean} [grouped] True to perform the operation for each group
     * in the store. The value returned will be an object literal with the key being the group
     * name and the group average being the value. The grouped parameter is only honored if
     * the store has a groupField.
     * @return {Object} The average value, if no items exist, 0.
     */
    average: function(field, grouped) {
        var me = this;
        if (grouped && me.isGrouped()) {
            return me.aggregate(me.getAverage, me, true, [field]);
        } else {
            return me.getAverage(me.data.items, field);
        }
    },

    // @private, see average
    getAverage: function(records, field) {
        var i = 0,
            len = records.length,
            sum = 0;

        if (records.length > 0) {
            for (; i < len; ++i) {
                sum += records[i].get(field);
            }
            return sum / len;
        }
        return 0;
    },

    /**
     * Runs the aggregate function for all the records in the store.
     *
     * When store is filtered, only items within the filter are aggregated.
     *
     * @param {Function} fn The function to execute. The function is called with a single parameter,
     * an array of records for that group.
     * @param {Object} [scope] The scope to execute the function in. Defaults to the store.
     * @param {Boolean} [grouped] True to perform the operation for each group
     * in the store. The value returned will be an object literal with the key being the group
     * name and the group average being the value. The grouped parameter is only honored if
     * the store has a groupField.
     * @param {Array} [args] Any arguments to append to the function call
     * @return {Object} An object literal with the group names and their appropriate values.
     */
    aggregate: function(fn, scope, grouped, args) {
        args = args || [];
        if (grouped && this.isGrouped()) {
            var groups = this.getGroups(),
                i = 0,
                len = groups.length,
                out = {},
                group;

            for (; i < len; ++i) {
                group = groups[i];
                out[group.name] = fn.apply(scope || this, [group.children].concat(args));
            }
            return out;
        } else {
            return fn.apply(scope || this, [this.data.items].concat(args));
        }
    },

    /**
     * Commits all Records with {@link #getModifiedRecords outstanding changes}. To handle updates for changes,
     * subscribe to the Store's {@link #event-update update event}, and perform updating when the third parameter is
     * Ext.data.Record.COMMIT.
     */
    commitChanges : function(){
        var me = this,
            recs = me.getModifiedRecords(),
            len = recs.length,
            i = 0;

        for (; i < len; i++){
            recs[i].commit();
        }

        // Since removals are cached in a simple array we can simply reset it here.
        // Adds and updates are managed in the data MixedCollection and should already be current.
        me.removed.length = 0;
    },

    filterNewOnly: function(item){
        return item.phantom === true;
    },

    // Ideally in the future this will use getModifiedRecords, where there will be a param
    // to getNewRecords & getUpdatedRecords to indicate whether to get only the valid
    // records or grab all of them
    getRejectRecords: function() {
        // Return phantom records + updated records
        return Ext.Array.push(this.data.filterBy(this.filterNewOnly).items, this.getUpdatedRecords());
    },

    /**
     * {@link Ext.data.Model#reject Rejects} outstanding changes on all {@link #getModifiedRecords modified records}
     * and re-insert any records that were removed locally. Any phantom records will be removed.
     */
    rejectChanges : function() {
        var me = this,
            recs = me.getRejectRecords(),
            len = recs.length,
            i = 0,
            rec;

        for (; i < len; i++) {
            rec = recs[i];
            rec.reject();
            if (rec.phantom) {
                me.remove(rec);
            }
        }

        // Restore removed records back to their original positions
        recs = me.removed;
        len = recs.length;
        for (i = 0; i < len; i++) {
            rec = recs[i];
            me.insert(rec.removedFrom || 0, rec);
            rec.reject();
        }

        // Since removals are cached in a simple array we can simply reset it here.
        // Adds and updates are managed in the data MixedCollection and should already be current.
        me.removed.length = 0;
    }
}, function() {
    // A dummy empty store with a fieldless Model defined in it.
    // Just for binding to Views which are instantiated with no Store defined.
    // They will be able to run and render fine, and be bound to a generated Store later.
    Ext.regStore('ext-empty-store', {fields: [], proxy: 'memory'});

    /**
     * @class Ext.data.Store.PageMap
     * @extends Ext.util.LruCache
     * Private class for use by only Store when configured `buffered: true`.
     * @private
     */
    this.prototype.PageMap = new Ext.Class({
        extend: 'Ext.util.LruCache',

        // Maintain a generation counter, so that the Store can reject incoming pages destined for the previous generation
        clear: function(initial) {
            this.generation = (this.generation ||0) + 1;
            this.callParent(arguments);
        },

        getPageFromRecordIndex: this.prototype.getPageFromRecordIndex,

        addPage: function(page, records) {
            this.add(page, records);
            this.fireEvent('pageAdded', page, records);
        },

        getPage: function(page) {
            return this.get(page);
        },

        hasRange: function(start, end) {
            var page = this.getPageFromRecordIndex(start),
                endPage = this.getPageFromRecordIndex(end);

            for (; page <= endPage; page++) {
                if (!this.hasPage(page)) {
                    return false;
                }
            }
            return true;
        },

        hasPage: function(page) {
            // We must use this.get to trigger an access so that the page which is checked for presence is not eligible for pruning
            return !!this.get(page);
        },

        getRange: function(start, end) {
            if (!this.hasRange(start, end)) {
                Ext.Error.raise('PageMap asked for range which it does not have');
            }
            var me = this,
                startPage = me.getPageFromRecordIndex(start),
                endPage = me.getPageFromRecordIndex(end),
                dataStart = (startPage - 1) * me.pageSize,
                dataEnd = (endPage * me.pageSize) - 1,
                page = startPage,
                result = [],
                sliceBegin, sliceEnd, doSlice,
                i = 0, len;

            for (; page <= endPage; page++) {

                // First and last pages will need slicing to cut into the actual wanted records
                if (page == startPage) {
                    sliceBegin = start - dataStart;
                    doSlice = true;
                } else {
                    sliceBegin = 0;
                    doSlice = false;
                }
                if (page == endPage) {
                    sliceEnd = me.pageSize - (dataEnd - end);
                    doSlice = true;
                }

                // First and last pages will need slicing
                if (doSlice) {
                    Ext.Array.push(result, Ext.Array.slice(me.getPage(page), sliceBegin, sliceEnd));
                } else {
                    Ext.Array.push(result, me.getPage(page));
                }
            }

            // Inject the dataset ordinal position into the record as the index
            for (len = result.length; i < len; i++) {
                result[i].index = start++;
            }
            return result;
        }
    });
});
