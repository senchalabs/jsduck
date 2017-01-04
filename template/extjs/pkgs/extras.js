/**
 * Modified version of [Douglas Crockford's JSON.js][dc] that doesn't
 * mess with the Object prototype.
 *
 * [dc]: http://www.json.org/js.html
 *
 * @singleton
 */
Ext.JSON = (new(function() {
    var me = this,
    encodingFunction,
    decodingFunction,
    useNative = null,
    useHasOwn = !! {}.hasOwnProperty,
    isNative = function() {
        if (useNative === null) {
            useNative = Ext.USE_NATIVE_JSON && window.JSON && JSON.toString() == '[object JSON]';
        }
        return useNative;
    },
    pad = function(n) {
        return n < 10 ? "0" + n : n;
    },
    doDecode = function(json) {
        return eval("(" + json + ')');
    },
    doEncode = function(o, newline) {
        // http://jsperf.com/is-undefined
        if (o === null || o === undefined) {
            return "null";
        } else if (Ext.isDate(o)) {
            return Ext.JSON.encodeDate(o);
        } else if (Ext.isString(o)) {
            return Ext.JSON.encodeString(o);
        } else if (typeof o == "number") {
            //don't use isNumber here, since finite checks happen inside isNumber
            return isFinite(o) ? String(o) : "null";
        } else if (Ext.isBoolean(o)) {
            return String(o);
        }
        // Allow custom zerialization by adding a toJSON method to any object type.
        // Date/String have a toJSON in some environments, so check these first.
        else if (o.toJSON) {
            return o.toJSON();
        } else if (Ext.isArray(o)) {
            return encodeArray(o, newline);
        } else if (Ext.isObject(o)) {
            return encodeObject(o, newline);
        } else if (typeof o === "function") {
            return "null";
        }
        return 'undefined';
    },
    m = {
        "\b": '\\b',
        "\t": '\\t',
        "\n": '\\n',
        "\f": '\\f',
        "\r": '\\r',
        '"': '\\"',
        "\\": '\\\\',
        '\x0b': '\\u000b' //ie doesn't handle \v
    },
    charToReplace = /[\\\"\x00-\x1f\x7f-\uffff]/g,
    encodeString = function(s) {
        return '"' + s.replace(charToReplace, function(a) {
            var c = m[a];
            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"';
    },

    //<debug>
    encodeArrayPretty = function(o, newline) {
        var len = o.length,
            cnewline = newline + '   ',
            sep = ',' + cnewline,
            a = ["[", cnewline], // Note newline in case there are no members
            i;

        for (i = 0; i < len; i += 1) {
            a.push(Ext.JSON.encodeValue(o[i], cnewline), sep);
        }

        // Overwrite trailing comma (or empty string)
        a[a.length - 1] = newline + ']';

        return a.join('');
    },

    encodeObjectPretty = function(o, newline) {
        var cnewline = newline + '   ',
            sep = ',' + cnewline,
            a = ["{", cnewline], // Note newline in case there are no members
            i;

        for (i in o) {
            if (!useHasOwn || o.hasOwnProperty(i)) {
                a.push(Ext.JSON.encodeValue(i) + ': ' + Ext.JSON.encodeValue(o[i], cnewline), sep);
            }
        }

        // Overwrite trailing comma (or empty string)
        a[a.length - 1] = newline + '}';

        return a.join('');
    },
    //</debug>

    encodeArray = function(o, newline) {
        //<debug>
        if (newline) {
            return encodeArrayPretty(o, newline);
        }
        //</debug>

        var a = ["[", ""], // Note empty string in case there are no serializable members.
            len = o.length,
            i;
        for (i = 0; i < len; i += 1) {
            a.push(Ext.JSON.encodeValue(o[i]), ',');
        }
        // Overwrite trailing comma (or empty string)
        a[a.length - 1] = ']';
        return a.join("");
    },

    encodeObject = function(o, newline) {
        //<debug>
        if (newline) {
            return encodeObjectPretty(o, newline);
        }
        //</debug>

        var a = ["{", ""], // Note empty string in case there are no serializable members.
            i;
        for (i in o) {
            if (!useHasOwn || o.hasOwnProperty(i)) {
                a.push(Ext.JSON.encodeValue(i), ":", Ext.JSON.encodeValue(o[i]), ',');
            }
        }
        // Overwrite trailing comma (or empty string)
        a[a.length - 1] = '}';
        return a.join("");
    };
    
    /**
     * Encodes a String. This returns the actual string which is inserted into the JSON string as the literal
     * expression. **The returned value includes enclosing double quotation marks.**
     *
     * To override this:
     *
     *     Ext.JSON.encodeString = function(s) {
     *         return 'Foo' + s;
     *     };
     *
     * @param {String} s The String to encode
     * @return {String} The string literal to use in a JSON string.
     * @method
     */
    me.encodeString = encodeString;

    /**
     * The function which {@link #encode} uses to encode all javascript values to their JSON representations
     * when {@link Ext#USE_NATIVE_JSON} is `false`.
     * 
     * This is made public so that it can be replaced with a custom implementation.
     *
     * @param {Object} o Any javascript value to be converted to its JSON representation
     * @return {String} The JSON representation of the passed value.
     * @method
     */
    me.encodeValue = doEncode;

    /**
     * Encodes a Date. This returns the actual string which is inserted into the JSON string as the literal
     * expression. **The returned value includes enclosing double quotation marks.**
     *
     * The default return format is `"yyyy-mm-ddThh:mm:ss"`.
     *
     * To override this:
     *
     *     Ext.JSON.encodeDate = function(d) {
     *         return Ext.Date.format(d, '"Y-m-d"');
     *     };
     *
     * @param {Date} d The Date to encode
     * @return {String} The string literal to use in a JSON string.
     */
    me.encodeDate = function(o) {
        return '"' + o.getFullYear() + "-"
        + pad(o.getMonth() + 1) + "-"
        + pad(o.getDate()) + "T"
        + pad(o.getHours()) + ":"
        + pad(o.getMinutes()) + ":"
        + pad(o.getSeconds()) + '"';
    };

    /**
     * Encodes an Object, Array or other value.
     * 
     * If the environment's native JSON encoding is not being used ({@link Ext#USE_NATIVE_JSON} is not set,
     * or the environment does not support it), then ExtJS's encoding will be used. This allows the developer
     * to add a `toJSON` method to their classes which need serializing to return a valid JSON representation
     * of the object.
     * 
     * @param {Object} o The variable to encode
     * @return {String} The JSON string
     */
    me.encode = function(o) {
        if (!encodingFunction) {
            // setup encoding function on first access
            encodingFunction = isNative() ? JSON.stringify : me.encodeValue;
        }
        return encodingFunction(o);
    };

    /**
     * Decodes (parses) a JSON string to an object. If the JSON is invalid, this function throws
     * a SyntaxError unless the safe option is set.
     *
     * @param {String} json The JSON string
     * @param {Boolean} [safe=false] True to return null, false to throw an exception if the JSON is invalid.
     * @return {Object} The resulting object
     */
    me.decode = function(json, safe) {
        if (!decodingFunction) {
            // setup decoding function on first access
            decodingFunction = isNative() ? JSON.parse : doDecode;
        }
        try {
            return decodingFunction(json);
        } catch (e) {
            if (safe === true) {
                return null;
            }
            Ext.Error.raise({
                sourceClass: "Ext.JSON",
                sourceMethod: "decode",
                msg: "You're trying to decode an invalid JSON String: " + json
            });
        }
    };
})());
/**
 * Shorthand for {@link Ext.JSON#encode}
 * @member Ext
 * @method encode
 * @inheritdoc Ext.JSON#encode
 */
Ext.encode = Ext.JSON.encode;
/**
 * Shorthand for {@link Ext.JSON#decode}
 * @member Ext
 * @method decode
 * @inheritdoc Ext.JSON#decode
 */
Ext.decode = Ext.JSON.decode;
/**
 * @class Ext
 *
 * The Ext namespace (global object) encapsulates all classes, singletons, and
 * utility methods provided by Sencha's libraries.
 *
 * Most user interface Components are at a lower level of nesting in the namespace,
 * but many common utility functions are provided as direct properties of the Ext namespace.
 *
 * Also many frequently used methods from other classes are provided as shortcuts
 * within the Ext namespace. For example {@link Ext#getCmp Ext.getCmp} aliases
 * {@link Ext.ComponentManager#get Ext.ComponentManager.get}.
 *
 * Many applications are initiated with {@link Ext#onReady Ext.onReady} which is
 * called once the DOM is ready. This ensures all scripts have been loaded,
 * preventing dependency issues. For example:
 *
 *     Ext.onReady(function(){
 *         new Ext.Component({
 *             renderTo: document.body,
 *             html: 'DOM ready!'
 *         });
 *     });
 *
 * For more information about how to use the Ext classes, see:
 *
 * - <a href="http://www.sencha.com/learn/">The Learning Center</a>
 * - <a href="http://www.sencha.com/learn/Ext_FAQ">The FAQ</a>
 * - <a href="http://www.sencha.com/forum/">The forums</a>
 *
 * @singleton
 */
Ext.apply(Ext, {
    userAgent: navigator.userAgent.toLowerCase(),
    cache: {},
    idSeed: 1000,
    windowId: 'ext-window',
    documentId: 'ext-document',

    /**
     * True when the document is fully initialized and ready for action
     */
    isReady: false,

    /**
     * True to automatically uncache orphaned Ext.Elements periodically
     */
    enableGarbageCollector: true,

    /**
     * True to automatically purge event listeners during garbageCollection.
     */
    enableListenerCollection: true,

    addCacheEntry: function(id, el, dom) {
        dom = dom || el.dom;

        //<debug>
        if (!dom) {
            // Without the DOM node we can't GC the entry
            Ext.Error.raise('Cannot add an entry to the element cache without the DOM node');
        }
        //</debug>

        var key = id || (el && el.id) || dom.id,
            entry = Ext.cache[key] || (Ext.cache[key] = {
                data: {},
                events: {},

                dom: dom,

                // Skip garbage collection for special elements (window, document, iframes)
                skipGarbageCollection: !!(dom.getElementById || dom.navigator)
            });

        if (el) {
            el.$cache = entry;
            // Inject the back link from the cache in case the cache entry
            // had already been created by Ext.fly. Ext.fly creates a cache entry with no el link.
            entry.el = el;
        }

        return entry;
    },
    
    updateCacheEntry: function(cacheItem, dom){
        cacheItem.dom = dom;
        if (cacheItem.el) {
            cacheItem.el.dom = dom;
        }
        return cacheItem;
    },

    /**
     * Generates unique ids. If the element already has an id, it is unchanged
     * @param {HTMLElement/Ext.Element} [el] The element to generate an id for
     * @param {String} prefix (optional) Id prefix (defaults "ext-gen")
     * @return {String} The generated Id.
     */
    id: function(el, prefix) {
        var me = this,
            sandboxPrefix = '';
        el = Ext.getDom(el, true) || {};
        if (el === document) {
            el.id = me.documentId;
        }
        else if (el === window) {
            el.id = me.windowId;
        }
        if (!el.id) {
            if (me.isSandboxed) {
                sandboxPrefix = Ext.sandboxName.toLowerCase() + '-';
            }
            el.id = sandboxPrefix + (prefix || "ext-gen") + (++Ext.idSeed);
        }
        return el.id;
    },

    escapeId: (function(){
        var validIdRe = /^[a-zA-Z_][a-zA-Z0-9_\-]*$/i,
            escapeRx = /([\W]{1})/g,
            leadingNumRx = /^(\d)/g,
            escapeFn = function(match, capture){
                return "\\" + capture;
            },
            numEscapeFn = function(match, capture){
                return '\\00' + capture.charCodeAt(0).toString(16) + ' ';
            };

        return function(id) {
            return validIdRe.test(id)
                ? id
                // replace the number portion last to keep the trailing ' '
                // from being escaped
                : id.replace(escapeRx, escapeFn)
                    .replace(leadingNumRx, numEscapeFn);
        };
    }()),

    /**
     * Returns the current document body as an {@link Ext.Element}.
     * @return Ext.Element The document body
     */
    getBody: (function() {
        var body;
        return function() {
            return body || (body = Ext.get(document.body));
        };
    }()),

    /**
     * Returns the current document head as an {@link Ext.Element}.
     * @return Ext.Element The document head
     * @method
     */
    getHead: (function() {
        var head;
        return function() {
            return head || (head = Ext.get(document.getElementsByTagName("head")[0]));
        };
    }()),

    /**
     * Returns the current HTML document object as an {@link Ext.Element}.
     * @return Ext.Element The document
     */
    getDoc: (function() {
        var doc;
        return function() {
            return doc || (doc = Ext.get(document));
        };
    }()),

    /**
     * This is shorthand reference to {@link Ext.ComponentManager#get}.
     * Looks up an existing {@link Ext.Component Component} by {@link Ext.Component#id id}
     *
     * @param {String} id The component {@link Ext.Component#id id}
     * @return Ext.Component The Component, `undefined` if not found, or `null` if a
     * Class was found.
    */
    getCmp: function(id) {
        return Ext.ComponentManager.get(id);
    },

    /**
     * Returns the current orientation of the mobile device
     * @return {String} Either 'portrait' or 'landscape'
     */
    getOrientation: function() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    },

    /**
     * Attempts to destroy any objects passed to it by removing all event listeners, removing them from the
     * DOM (if applicable) and calling their destroy functions (if available).  This method is primarily
     * intended for arguments of type {@link Ext.Element} and {@link Ext.Component}, but any subclass of
     * {@link Ext.util.Observable} can be passed in.  Any number of elements and/or components can be
     * passed into this function in a single call as separate arguments.
     *
     * @param {Ext.Element/Ext.Component/Ext.Element[]/Ext.Component[]...} args
     * An {@link Ext.Element}, {@link Ext.Component}, or an Array of either of these to destroy
     */
    destroy: function() {
        var ln = arguments.length,
        i, arg;

        for (i = 0; i < ln; i++) {
            arg = arguments[i];
            if (arg) {
                if (Ext.isArray(arg)) {
                    this.destroy.apply(this, arg);
                }
                else if (Ext.isFunction(arg.destroy)) {
                    arg.destroy();
                }
                else if (arg.dom) {
                    arg.remove();
                }
            }
        }
    },

    /**
     * Execute a callback function in a particular scope. If no function is passed the call is ignored.
     *
     * For example, these lines are equivalent:
     *
     *     Ext.callback(myFunc, this, [arg1, arg2]);
     *     Ext.isFunction(myFunc) && myFunc.apply(this, [arg1, arg2]);
     *
     * @param {Function} callback The callback to execute
     * @param {Object} [scope] The scope to execute in
     * @param {Array} [args] The arguments to pass to the function
     * @param {Number} [delay] Pass a number to delay the call by a number of milliseconds.
     */
    callback: function(callback, scope, args, delay){
        if(Ext.isFunction(callback)){
            args = args || [];
            scope = scope || window;
            if (delay) {
                Ext.defer(callback, delay, scope, args);
            } else {
                callback.apply(scope, args);
            }
        }
    },

    /**
     * Alias for {@link Ext.String#htmlEncode}.
     * @inheritdoc Ext.String#htmlEncode
     * @ignore
     */
    htmlEncode : function(value) {
        return Ext.String.htmlEncode(value);
    },

    /**
     * Alias for {@link Ext.String#htmlDecode}.
     * @inheritdoc Ext.String#htmlDecode
     * @ignore
     */
    htmlDecode : function(value) {
         return Ext.String.htmlDecode(value);
    },

    /**
     * Alias for {@link Ext.String#urlAppend}.
     * @inheritdoc Ext.String#urlAppend
     * @ignore
     */
    urlAppend : function(url, s) {
        return Ext.String.urlAppend(url, s);
    }
});


Ext.ns = Ext.namespace;

// for old browsers
window.undefined = window.undefined;

/**
 * @class Ext
 */
(function(){
/*
FF 3.6      - Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.2.17) Gecko/20110420 Firefox/3.6.17
FF 4.0.1    - Mozilla/5.0 (Windows NT 5.1; rv:2.0.1) Gecko/20100101 Firefox/4.0.1
FF 5.0      - Mozilla/5.0 (Windows NT 6.1; WOW64; rv:5.0) Gecko/20100101 Firefox/5.0

IE6         - Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1;)
IE7         - Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; SV1;)
IE8         - Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)
IE9         - Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E)

Chrome 11   - Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.60 Safari/534.24

Safari 5    - Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1

Opera 11.11 - Opera/9.80 (Windows NT 6.1; U; en) Presto/2.8.131 Version/11.11
*/
    var check = function(regex){
            return regex.test(Ext.userAgent);
        },
        isStrict = document.compatMode == "CSS1Compat",
        version = function (is, regex) {
            var m;
            return (is && (m = regex.exec(Ext.userAgent))) ? parseFloat(m[1]) : 0;
        },
        docMode = document.documentMode,
        isOpera = check(/opera/),
        isOpera10_5 = isOpera && check(/version\/10\.5/),
        isChrome = check(/\bchrome\b/),
        isWebKit = check(/webkit/),
        isSafari = !isChrome && check(/safari/),
        isSafari2 = isSafari && check(/applewebkit\/4/), // unique to Safari 2
        isSafari3 = isSafari && check(/version\/3/),
        isSafari4 = isSafari && check(/version\/4/),
        isSafari5_0 = isSafari && check(/version\/5\.0/),
        isSafari5 = isSafari && check(/version\/5/),
        isIE = !isOpera && check(/msie/),
        isIE7 = isIE && ((check(/msie 7/) && docMode != 8 && docMode != 9) || docMode == 7),
        isIE8 = isIE && ((check(/msie 8/) && docMode != 7 && docMode != 9) || docMode == 8),
        isIE9 = isIE && ((check(/msie 9/) && docMode != 7 && docMode != 8) || docMode == 9),
        isIE6 = isIE && check(/msie 6/),
        isGecko = !isWebKit && check(/gecko/),
        isGecko3 = isGecko && check(/rv:1\.9/),
        isGecko4 = isGecko && check(/rv:2\.0/),
        isGecko5 = isGecko && check(/rv:5\./),
        isGecko10 = isGecko && check(/rv:10\./),
        isFF3_0 = isGecko3 && check(/rv:1\.9\.0/),
        isFF3_5 = isGecko3 && check(/rv:1\.9\.1/),
        isFF3_6 = isGecko3 && check(/rv:1\.9\.2/),
        isWindows = check(/windows|win32/),
        isMac = check(/macintosh|mac os x/),
        isLinux = check(/linux/),
        scrollbarSize = null,
        chromeVersion = version(true, /\bchrome\/(\d+\.\d+)/),
        firefoxVersion = version(true, /\bfirefox\/(\d+\.\d+)/),
        ieVersion = version(isIE, /msie (\d+\.\d+)/),
        operaVersion = version(isOpera, /version\/(\d+\.\d+)/),
        safariVersion = version(isSafari, /version\/(\d+\.\d+)/),
        webKitVersion = version(isWebKit, /webkit\/(\d+\.\d+)/),
        isSecure = /^https/i.test(window.location.protocol),
        nullLog;

    // remove css image flicker
    try {
        document.execCommand("BackgroundImageCache", false, true);
    } catch(e) {}


    //<debug>
    var primitiveRe = /string|number|boolean/;
    function dumpObject (object) {
        var member, type, value, name,
            members = [];

        // Cannot use Ext.encode since it can recurse endlessly (if we're lucky)
        // ...and the data could be prettier!
        for (name in object) {
            if (object.hasOwnProperty(name)) {
                value = object[name];

                type = typeof value;
                if (type == "function") {
                    continue;
                }

                if (type == 'undefined') {
                    member = type;
                } else if (value === null || primitiveRe.test(type) || Ext.isDate(value)) {
                    member = Ext.encode(value);
                } else if (Ext.isArray(value)) {
                    member = '[ ]';
                } else if (Ext.isObject(value)) {
                    member = '{ }';
                } else {
                    member = type;
                }
                members.push(Ext.encode(name) + ': ' + member);
            }
        }

        if (members.length) {
            return ' \nData: {\n  ' + members.join(',\n  ') + '\n}';
        }
        return '';
    }

    function log (message) {
        var options, dump,
            con = Ext.global.console,
            level = 'log',
            indent = log.indent || 0,
            stack,
            out,
            max;

        log.indent = indent;

        if (typeof message != 'string') {
            options = message;
            message = options.msg || '';
            level = options.level || level;
            dump = options.dump;
            stack = options.stack;

            if (options.indent) {
                ++log.indent;
            } else if (options.outdent) {
                log.indent = indent = Math.max(indent - 1, 0);
            }

            if (dump && !(con && con.dir)) {
                message += dumpObject(dump);
                dump = null;
            }
        }

        if (arguments.length > 1) {
            message += Array.prototype.slice.call(arguments, 1).join('');
        }

        message = indent ? Ext.String.repeat(' ', log.indentSize * indent) + message : message;
        // w/o console, all messages are equal, so munge the level into the message:
        if (level != 'log') {
            message = '[' + level.charAt(0).toUpperCase() + '] ' + message;
        }

        // Not obvious, but 'console' comes and goes when Firebug is turned on/off, so
        // an early test may fail either direction if Firebug is toggled.
        //
        if (con) { // if (Firebug-like console)
            if (con[level]) {
                con[level](message);
            } else {
                con.log(message);
            }

            if (dump) {
                con.dir(dump);
            }

            if (stack && con.trace) {
                // Firebug's console.error() includes a trace already...
                if (!con.firebug || level != 'error') {
                    con.trace();
                }
            }
        } else {
            if (Ext.isOpera) {
                opera.postError(message);
            } else {
                out = log.out;
                max = log.max;

                if (out.length >= max) {
                    // this formula allows out.max to change (via debugger), where the
                    // more obvious "max/4" would not quite be the same
                    Ext.Array.erase(out, 0, out.length - 3 * Math.floor(max / 4)); // keep newest 75%
                }

                out.push(message);
            }
        }

        // Mostly informational, but the Ext.Error notifier uses them:
        ++log.count;
        ++log.counters[level];
    }

    function logx (level, args) {
        if (typeof args[0] == 'string') {
            args.unshift({});
        }
        args[0].level = level;
        log.apply(this, args);
    }

    log.error = function () {
        logx('error', Array.prototype.slice.call(arguments));
    };
    log.info = function () {
        logx('info', Array.prototype.slice.call(arguments));
    };
    log.warn = function () {
        logx('warn', Array.prototype.slice.call(arguments));
    };

    log.count = 0;
    log.counters = { error: 0, warn: 0, info: 0, log: 0 };
    log.indentSize = 2;
    log.out = [];
    log.max = 750;
    log.show = function () {
        window.open('','extlog').document.write([
            '<html><head><script type="text/javascript">',
                'var lastCount = 0;',
                'function update () {',
                    'var ext = window.opener.Ext,',
                        'extlog = ext && ext.log;',
                    'if (extlog && extlog.out && lastCount != extlog.count) {',
                        'lastCount = extlog.count;',
                        'var s = "<tt>" + extlog.out.join("~~~").replace(/[&]/g, "&amp;").replace(/[<]/g, "&lt;").replace(/[ ]/g, "&#160;").replace(/\\~\\~\\~/g, "<br/>") + "</tt>";',
                        'document.body.innerHTML = s;',
                    '}',
                    'setTimeout(update, 1000);',
                '}',
                'setTimeout(update, 1000);',
            '</script></head><body></body></html>'].join(''));
    };
    //</debug>

    nullLog = function () {};
    nullLog.info = nullLog.warn = nullLog.error = Ext.emptyFn;

    Ext.setVersion('extjs', '4.1.1');
    Ext.apply(Ext, {
        /**
         * @property {String} SSL_SECURE_URL
         * URL to a blank file used by Ext when in secure mode for iframe src and onReady src
         * to prevent the IE insecure content warning (`'about:blank'`, except for IE
         * in secure mode, which is `'javascript:""'`).
         */
        SSL_SECURE_URL : isSecure && isIE ? 'javascript:\'\'' : 'about:blank',

        /**
         * @property {Boolean} enableFx
         * True if the {@link Ext.fx.Anim} Class is available.
         */

        /**
         * @property {Boolean} scopeResetCSS
         * True to scope the reset CSS to be just applied to Ext components. Note that this
         * wraps root containers with an additional element. Also remember that when you turn
         * on this option, you have to use ext-all-scoped (unless you use the bootstrap.js to
         * load your javascript, in which case it will be handled for you).
         */
        scopeResetCSS : Ext.buildSettings.scopeResetCSS,
        
        /**
         * @property {String} resetCls
         * The css class used to wrap Ext components when the {@link #scopeResetCSS} option
         * is used.
         */
        resetCls: Ext.buildSettings.baseCSSPrefix + 'reset',

        /**
         * @property {Boolean} enableNestedListenerRemoval
         * **Experimental.** True to cascade listener removal to child elements when an element
         * is removed. Currently not optimized for performance.
         */
        enableNestedListenerRemoval : false,

        /**
         * @property {Boolean} USE_NATIVE_JSON
         * Indicates whether to use native browser parsing for JSON methods.
         * This option is ignored if the browser does not support native JSON methods.
         *
         * **Note:** Native JSON methods will not work with objects that have functions.
         * Also, property names must be quoted, otherwise the data will not parse.
         */
        USE_NATIVE_JSON : false,

        /**
         * Returns the dom node for the passed String (id), dom node, or Ext.Element.
         * Optional 'strict' flag is needed for IE since it can return 'name' and
         * 'id' elements by using getElementById.
         *
         * Here are some examples:
         *
         *     // gets dom node based on id
         *     var elDom = Ext.getDom('elId');
         *     // gets dom node based on the dom node
         *     var elDom1 = Ext.getDom(elDom);
         *
         *     // If we don&#39;t know if we are working with an
         *     // Ext.Element or a dom node use Ext.getDom
         *     function(el){
         *         var dom = Ext.getDom(el);
         *         // do something with the dom node
         *     }
         *
         * **Note:** the dom node to be found actually needs to exist (be rendered, etc)
         * when this method is called to be successful.
         *
         * @param {String/HTMLElement/Ext.Element} el
         * @return HTMLElement
         */
        getDom : function(el, strict) {
            if (!el || !document) {
                return null;
            }
            if (el.dom) {
                return el.dom;
            } else {
                if (typeof el == 'string') {
                    var e = Ext.getElementById(el);
                    // IE returns elements with the 'name' and 'id' attribute.
                    // we do a strict check to return the element with only the id attribute
                    if (e && isIE && strict) {
                        if (el == e.getAttribute('id')) {
                            return e;
                        } else {
                            return null;
                        }
                    }
                    return e;
                } else {
                    return el;
                }
            }
        },

        /**
         * Removes a DOM node from the document.
         *
         * Removes this element from the document, removes all DOM event listeners, and
         * deletes the cache reference. All DOM event listeners are removed from this element.
         * If {@link Ext#enableNestedListenerRemoval Ext.enableNestedListenerRemoval} is
         * `true`, then DOM event listeners are also removed from all child nodes.
         * The body node will be ignored if passed in.
         *
         * @param {HTMLElement} node The node to remove
         * @method
         */
        removeNode : isIE6 || isIE7 || isIE8
            ? (function() {
                var d;
                return function(n){
                    if(n && n.tagName.toUpperCase() != 'BODY'){
                        (Ext.enableNestedListenerRemoval) ? Ext.EventManager.purgeElement(n) : Ext.EventManager.removeAll(n);

                        var cache = Ext.cache,
                            id = n.id;

                        if (cache[id]) {
                            delete cache[id].dom;
                            delete cache[id];
                        }

                        if (isIE8 && n.parentNode) {
                            n.parentNode.removeChild(n);
                        }
                        d = d || document.createElement('div');
                        d.appendChild(n);
                        d.innerHTML = '';
                    }
                };
            }())
            : function(n) {
                if (n && n.parentNode && n.tagName.toUpperCase() != 'BODY') {
                    (Ext.enableNestedListenerRemoval) ? Ext.EventManager.purgeElement(n) : Ext.EventManager.removeAll(n);

                    var cache = Ext.cache,
                        id = n.id;

                    if (cache[id]) {
                        delete cache[id].dom;
                        delete cache[id];
                    }

                    n.parentNode.removeChild(n);
                }
            },

        isStrict: isStrict,

        isIEQuirks: isIE && !isStrict,

        /**
         * True if the detected browser is Opera.
         * @type Boolean
         */
        isOpera : isOpera,

        /**
         * True if the detected browser is Opera 10.5x.
         * @type Boolean
         */
        isOpera10_5 : isOpera10_5,

        /**
         * True if the detected browser uses WebKit.
         * @type Boolean
         */
        isWebKit : isWebKit,

        /**
         * True if the detected browser is Chrome.
         * @type Boolean
         */
        isChrome : isChrome,

        /**
         * True if the detected browser is Safari.
         * @type Boolean
         */
        isSafari : isSafari,

        /**
         * True if the detected browser is Safari 3.x.
         * @type Boolean
         */
        isSafari3 : isSafari3,

        /**
         * True if the detected browser is Safari 4.x.
         * @type Boolean
         */
        isSafari4 : isSafari4,

        /**
         * True if the detected browser is Safari 5.x.
         * @type Boolean
         */
        isSafari5 : isSafari5,

        /**
         * True if the detected browser is Safari 5.0.x.
         * @type Boolean
         */
        isSafari5_0 : isSafari5_0,


        /**
         * True if the detected browser is Safari 2.x.
         * @type Boolean
         */
        isSafari2 : isSafari2,

        /**
         * True if the detected browser is Internet Explorer.
         * @type Boolean
         */
        isIE : isIE,

        /**
         * True if the detected browser is Internet Explorer 6.x.
         * @type Boolean
         */
        isIE6 : isIE6,

        /**
         * True if the detected browser is Internet Explorer 7.x.
         * @type Boolean
         */
        isIE7 : isIE7,

        /**
         * True if the detected browser is Internet Explorer 8.x.
         * @type Boolean
         */
        isIE8 : isIE8,

        /**
         * True if the detected browser is Internet Explorer 9.x.
         * @type Boolean
         */
        isIE9 : isIE9,

        /**
         * True if the detected browser uses the Gecko layout engine (e.g. Mozilla, Firefox).
         * @type Boolean
         */
        isGecko : isGecko,

        /**
         * True if the detected browser uses a Gecko 1.9+ layout engine (e.g. Firefox 3.x).
         * @type Boolean
         */
        isGecko3 : isGecko3,

        /**
         * True if the detected browser uses a Gecko 2.0+ layout engine (e.g. Firefox 4.x).
         * @type Boolean
         */
        isGecko4 : isGecko4,

        /**
         * True if the detected browser uses a Gecko 5.0+ layout engine (e.g. Firefox 5.x).
         * @type Boolean
         */
        isGecko5 : isGecko5,

        /**
         * True if the detected browser uses a Gecko 5.0+ layout engine (e.g. Firefox 5.x).
         * @type Boolean
         */
        isGecko10 : isGecko10,

        /**
         * True if the detected browser uses FireFox 3.0
         * @type Boolean
         */
        isFF3_0 : isFF3_0,

        /**
         * True if the detected browser uses FireFox 3.5
         * @type Boolean
         */
        isFF3_5 : isFF3_5,

        /**
         * True if the detected browser uses FireFox 3.6
         * @type Boolean
         */
        isFF3_6 : isFF3_6,

        /**
         * True if the detected browser uses FireFox 4
         * @type Boolean
         */
        isFF4 : 4 <= firefoxVersion && firefoxVersion < 5,

        /**
         * True if the detected browser uses FireFox 5
         * @type Boolean
         */
        isFF5 : 5 <= firefoxVersion && firefoxVersion < 6,

        /**
         * True if the detected browser uses FireFox 10
         * @type Boolean
         */
        isFF10 : 10 <= firefoxVersion && firefoxVersion < 11,

        /**
         * True if the detected platform is Linux.
         * @type Boolean
         */
        isLinux : isLinux,

        /**
         * True if the detected platform is Windows.
         * @type Boolean
         */
        isWindows : isWindows,

        /**
         * True if the detected platform is Mac OS.
         * @type Boolean
         */
        isMac : isMac,

        /**
         * The current version of Chrome (0 if the browser is not Chrome).
         * @type Number
         */
        chromeVersion: chromeVersion,

        /**
         * The current version of Firefox (0 if the browser is not Firefox).
         * @type Number
         */
        firefoxVersion: firefoxVersion,

        /**
         * The current version of IE (0 if the browser is not IE). This does not account
         * for the documentMode of the current page, which is factored into {@link #isIE7},
         * {@link #isIE8} and {@link #isIE9}. Thus this is not always true:
         *
         *     Ext.isIE8 == (Ext.ieVersion == 8)
         *
         * @type Number
         */
        ieVersion: ieVersion,

        /**
         * The current version of Opera (0 if the browser is not Opera).
         * @type Number
         */
        operaVersion: operaVersion,

        /**
         * The current version of Safari (0 if the browser is not Safari).
         * @type Number
         */
        safariVersion: safariVersion,

        /**
         * The current version of WebKit (0 if the browser does not use WebKit).
         * @type Number
         */
        webKitVersion: webKitVersion,

        /**
         * True if the page is running over SSL
         * @type Boolean
         */
        isSecure: isSecure,
        
        /**
         * URL to a 1x1 transparent gif image used by Ext to create inline icons with
         * CSS background images. In older versions of IE, this defaults to
         * "http://sencha.com/s.gif" and you should change this to a URL on your server.
         * For other browsers it uses an inline data URL.
         * @type String
         */
        BLANK_IMAGE_URL : (isIE6 || isIE7) ? '/' + '/www.sencha.com/s.gif' : 'data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',

        /**
         * Utility method for returning a default value if the passed value is empty.
         *
         * The value is deemed to be empty if it is:
         *
         * - null
         * - undefined
         * - an empty array
         * - a zero length string (Unless the `allowBlank` parameter is `true`)
         *
         * @param {Object} value The value to test
         * @param {Object} defaultValue The value to return if the original value is empty
         * @param {Boolean} [allowBlank=false] true to allow zero length strings to qualify as non-empty.
         * @return {Object} value, if non-empty, else defaultValue
         * @deprecated 4.0.0 Use {@link Ext#valueFrom} instead
         */
        value : function(v, defaultValue, allowBlank){
            return Ext.isEmpty(v, allowBlank) ? defaultValue : v;
        },

        /**
         * Escapes the passed string for use in a regular expression.
         * @param {String} str
         * @return {String}
         * @deprecated 4.0.0 Use {@link Ext.String#escapeRegex} instead
         */
        escapeRe : function(s) {
            return s.replace(/([-.*+?\^${}()|\[\]\/\\])/g, "\\$1");
        },

        /**
         * Applies event listeners to elements by selectors when the document is ready.
         * The event name is specified with an `@` suffix.
         *
         *     Ext.addBehaviors({
         *         // add a listener for click on all anchors in element with id foo
         *         '#foo a@click' : function(e, t){
         *             // do something
         *         },
         *
         *         // add the same listener to multiple selectors (separated by comma BEFORE the @)
         *         '#foo a, #bar span.some-class@mouseover' : function(){
         *             // do something
         *         }
         *     });
         *
         * @param {Object} obj The list of behaviors to apply
         */
        addBehaviors : function(o){
            if(!Ext.isReady){
                Ext.onReady(function(){
                    Ext.addBehaviors(o);
                });
            } else {
                var cache = {}, // simple cache for applying multiple behaviors to same selector does query multiple times
                    parts,
                    b,
                    s;
                for (b in o) {
                    if ((parts = b.split('@'))[1]) { // for Object prototype breakers
                        s = parts[0];
                        if(!cache[s]){
                            cache[s] = Ext.select(s);
                        }
                        cache[s].on(parts[1], o[b]);
                    }
                }
                cache = null;
            }
        },

        /**
         * Returns the size of the browser scrollbars. This can differ depending on
         * operating system settings, such as the theme or font size.
         * @param {Boolean} [force] true to force a recalculation of the value.
         * @return {Object} An object containing scrollbar sizes.
         * @return.width {Number} The width of the vertical scrollbar.
         * @return.height {Number} The height of the horizontal scrollbar.
         */
        getScrollbarSize: function (force) {
            if (!Ext.isReady) {
                return {};
            }

            if (force || !scrollbarSize) {
                var db = document.body,
                    div = document.createElement('div');

                div.style.width = div.style.height = '100px';
                div.style.overflow = 'scroll';
                div.style.position = 'absolute';

                db.appendChild(div); // now we can measure the div...

                // at least in iE9 the div is not 100px - the scrollbar size is removed!
                scrollbarSize = {
                    width: div.offsetWidth - div.clientWidth,
                    height: div.offsetHeight - div.clientHeight
                };

                db.removeChild(div);
            }

            return scrollbarSize;
        },

        /**
         * Utility method for getting the width of the browser's vertical scrollbar. This
         * can differ depending on operating system settings, such as the theme or font size.
         *
         * This method is deprected in favor of {@link #getScrollbarSize}.
         *
         * @param {Boolean} [force] true to force a recalculation of the value.
         * @return {Number} The width of a vertical scrollbar.
         * @deprecated
         */
        getScrollBarWidth: function(force){
            var size = Ext.getScrollbarSize(force);
            return size.width + 2; // legacy fudge factor
        },

        /**
         * Copies a set of named properties fom the source object to the destination object.
         *
         * Example:
         *
         *     ImageComponent = Ext.extend(Ext.Component, {
         *         initComponent: function() {
         *             this.autoEl = { tag: 'img' };
         *             MyComponent.superclass.initComponent.apply(this, arguments);
         *             this.initialBox = Ext.copyTo({}, this.initialConfig, 'x,y,width,height');
         *         }
         *     });
         *
         * Important note: To borrow class prototype methods, use {@link Ext.Base#borrow} instead.
         *
         * @param {Object} dest The destination object.
         * @param {Object} source The source object.
         * @param {String/String[]} names Either an Array of property names, or a comma-delimited list
         * of property names to copy.
         * @param {Boolean} [usePrototypeKeys] Defaults to false. Pass true to copy keys off of the
         * prototype as well as the instance.
         * @return {Object} The modified object.
         */
        copyTo : function(dest, source, names, usePrototypeKeys){
            if(typeof names == 'string'){
                names = names.split(/[,;\s]/);
            }

            var n,
                nLen = names.length,
                name;

            for(n = 0; n < nLen; n++) {
                name = names[n];

                if(usePrototypeKeys || source.hasOwnProperty(name)){
                    dest[name] = source[name];
                }
            }

            return dest;
        },

        /**
         * Attempts to destroy and then remove a set of named properties of the passed object.
         * @param {Object} o The object (most likely a Component) who's properties you wish to destroy.
         * @param {String...} args One or more names of the properties to destroy and remove from the object.
         */
        destroyMembers : function(o){
            for (var i = 1, a = arguments, len = a.length; i < len; i++) {
                Ext.destroy(o[a[i]]);
                delete o[a[i]];
            }
        },

        /**
         * Logs a message. If a console is present it will be used. On Opera, the method
         * "opera.postError" is called. In other cases, the message is logged to an array
         * "Ext.log.out". An attached debugger can watch this array and view the log. The
         * log buffer is limited to a maximum of "Ext.log.max" entries (defaults to 250).
         * The `Ext.log.out` array can also be written to a popup window by entering the
         * following in the URL bar (a "bookmarklet"):
         *
         *     javascript:void(Ext.log.show());
         *
         * If additional parameters are passed, they are joined and appended to the message.
         * A technique for tracing entry and exit of a function is this:
         *
         *     function foo () {
         *         Ext.log({ indent: 1 }, '>> foo');
         *
         *         // log statements in here or methods called from here will be indented
         *         // by one step
         *
         *         Ext.log({ outdent: 1 }, '<< foo');
         *     }
         *
         * This method does nothing in a release build.
         *
         * @param {String/Object} [options] The message to log or an options object with any
         * of the following properties:
         *
         *  - `msg`: The message to log (required).
         *  - `level`: One of: "error", "warn", "info" or "log" (the default is "log").
         *  - `dump`: An object to dump to the log as part of the message.
         *  - `stack`: True to include a stack trace in the log.
         *  - `indent`: Cause subsequent log statements to be indented one step.
         *  - `outdent`: Cause this and following statements to be one step less indented.
         *
         * @param {String...} [message] The message to log (required unless specified in
         * options object).
         *
         * @method
         */
        log :
            //<debug>
            log ||
            //</debug>
            nullLog,

        /**
         * Partitions the set into two sets: a true set and a false set.
         *
         * Example 1:
         *
         *     Ext.partition([true, false, true, true, false]);
         *     // returns [[true, true, true], [false, false]]
         *
         * Example 2:
         *
         *     Ext.partition(
         *         Ext.query("p"),
         *         function(val){
         *             return val.className == "class1"
         *         }
         *     );
         *     // true are those paragraph elements with a className of "class1",
         *     // false set are those that do not have that className.
         *
         * @param {Array/NodeList} arr The array to partition
         * @param {Function} truth (optional) a function to determine truth.
         * If this is omitted the element itself must be able to be evaluated for its truthfulness.
         * @return {Array} [array of truish values, array of falsy values]
         * @deprecated 4.0.0 Will be removed in the next major version
         */
        partition : function(arr, truth){
            var ret = [[],[]],
                a, v,
                aLen = arr.length;

            for (a = 0; a < aLen; a++) {
                v = arr[a];
                ret[ (truth && truth(v, a, arr)) || (!truth && v) ? 0 : 1].push(v);
            }

            return ret;
        },

        /**
         * Invokes a method on each item in an Array.
         *
         * Example:
         *
         *     Ext.invoke(Ext.query("p"), "getAttribute", "id");
         *     // [el1.getAttribute("id"), el2.getAttribute("id"), ..., elN.getAttribute("id")]
         *
         * @param {Array/NodeList} arr The Array of items to invoke the method on.
         * @param {String} methodName The method name to invoke.
         * @param {Object...} args Arguments to send into the method invocation.
         * @return {Array} The results of invoking the method on each item in the array.
         * @deprecated 4.0.0 Will be removed in the next major version
         */
        invoke : function(arr, methodName){
            var ret  = [],
                args = Array.prototype.slice.call(arguments, 2),
                a, v,
                aLen = arr.length;

            for (a = 0; a < aLen; a++) {
                v = arr[a];

                if (v && typeof v[methodName] == 'function') {
                    ret.push(v[methodName].apply(v, args));
                } else {
                    ret.push(undefined);
                }
            }

            return ret;
        },

        /**
         * Zips N sets together.
         *
         * Example 1:
         *
         *     Ext.zip([1,2,3],[4,5,6]); // [[1,4],[2,5],[3,6]]
         *
         * Example 2:
         *
         *     Ext.zip(
         *         [ "+", "-", "+"],
         *         [  12,  10,  22],
         *         [  43,  15,  96],
         *         function(a, b, c){
         *             return "$" + a + "" + b + "." + c
         *         }
         *     ); // ["$+12.43", "$-10.15", "$+22.96"]
         *
         * @param {Array/NodeList...} arr This argument may be repeated. Array(s)
         * to contribute values.
         * @param {Function} zipper (optional) The last item in the argument list.
         * This will drive how the items are zipped together.
         * @return {Array} The zipped set.
         * @deprecated 4.0.0 Will be removed in the next major version
         */
        zip : function(){
            var parts = Ext.partition(arguments, function( val ){ return typeof val != 'function'; }),
                arrs = parts[0],
                fn = parts[1][0],
                len = Ext.max(Ext.pluck(arrs, "length")),
                ret = [],
                i,
                j,
                aLen;

            for (i = 0; i < len; i++) {
                ret[i] = [];
                if(fn){
                    ret[i] = fn.apply(fn, Ext.pluck(arrs, i));
                }else{
                    for (j = 0, aLen = arrs.length; j < aLen; j++){
                        ret[i].push( arrs[j][i] );
                    }
                }
            }
            return ret;
        },

        /**
         * Turns an array into a sentence, joined by a specified connector - e.g.:
         *
         *     Ext.toSentence(['Adama', 'Tigh', 'Roslin']); //'Adama, Tigh and Roslin'
         *     Ext.toSentence(['Adama', 'Tigh', 'Roslin'], 'or'); //'Adama, Tigh or Roslin'
         *
         * @param {String[]} items The array to create a sentence from
         * @param {String} connector The string to use to connect the last two words.
         * Usually 'and' or 'or' - defaults to 'and'.
         * @return {String} The sentence string
         * @deprecated 4.0.0 Will be removed in the next major version
         */
        toSentence: function(items, connector) {
            var length = items.length,
                head,
                tail;

            if (length <= 1) {
                return items[0];
            } else {
                head = items.slice(0, length - 1);
                tail = items[length - 1];

                return Ext.util.Format.format("{0} {1} {2}", head.join(", "), connector || 'and', tail);
            }
        },

        /**
         * @property {Boolean} useShims
         * By default, Ext intelligently decides whether floating elements should be shimmed.
         * If you are using flash, you may want to set this to true.
         */
        useShims: isIE6
    });
}());

/**
 * Loads Ext.app.Application class and starts it up with given configuration after the page is ready.
 *
 * See Ext.app.Application for details.
 *
 * @param {Object} config
 */
Ext.application = function(config) {
    Ext.require('Ext.app.Application');

    Ext.onReady(function() {
        new Ext.app.Application(config);
    });
};

/**
 * @class Ext.util.Format
 *  
 * This class is a centralized place for formatting functions. It includes
 * functions to format various different types of data, such as text, dates and numeric values.
 *  
 * ## Localization
 *
 * This class contains several options for localization. These can be set once the library has loaded,
 * all calls to the functions from that point will use the locale settings that were specified.
 *
 * Options include:
 *
 * - thousandSeparator
 * - decimalSeparator
 * - currenyPrecision
 * - currencySign
 * - currencyAtEnd
 *
 * This class also uses the default date format defined here: {@link Ext.Date#defaultFormat}.
 *
 * ## Using with renderers
 *
 * There are two helper functions that return a new function that can be used in conjunction with
 * grid renderers:
 *  
 *     columns: [{
 *         dataIndex: 'date',
 *         renderer: Ext.util.Format.dateRenderer('Y-m-d')
 *     }, {
 *         dataIndex: 'time',
 *         renderer: Ext.util.Format.numberRenderer('0.000')
 *     }]
 *  
 * Functions that only take a single argument can also be passed directly:
 *
 *     columns: [{
 *         dataIndex: 'cost',
 *         renderer: Ext.util.Format.usMoney
 *     }, {
 *         dataIndex: 'productCode',
 *         renderer: Ext.util.Format.uppercase
 *     }]
 *  
 * ## Using with XTemplates
 *
 * XTemplates can also directly use Ext.util.Format functions:
 *  
 *     new Ext.XTemplate([
 *         'Date: {startDate:date("Y-m-d")}',
 *         'Cost: {cost:usMoney}'
 *     ]);
 *
 * @singleton
 */
(function() {
    Ext.ns('Ext.util');

    Ext.util.Format = {};
    var UtilFormat     = Ext.util.Format,
        stripTagsRE    = /<\/?[^>]+>/gi,
        stripScriptsRe = /(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig,
        nl2brRe        = /\r?\n/g,

        // A RegExp to remove from a number format string, all characters except digits and '.'
        formatCleanRe  = /[^\d\.]/g,

        // A RegExp to remove from a number format string, all characters except digits and the local decimal separator.
        // Created on first use. The local decimal separator character must be initialized for this to be created.
        I18NFormatCleanRe;

    Ext.apply(UtilFormat, {
        //<locale>
        /**
         * @property {String} thousandSeparator
         * The character that the {@link #number} function uses as a thousand separator.
         *
         * This may be overridden in a locale file.
         */
        thousandSeparator: ',',
        //</locale>

        //<locale>
        /**
         * @property {String} decimalSeparator
         * The character that the {@link #number} function uses as a decimal point.
         *
         * This may be overridden in a locale file.
         */
        decimalSeparator: '.',
        //</locale>

        //<locale>
        /**
         * @property {Number} currencyPrecision
         * The number of decimal places that the {@link #currency} function displays.
         *
         * This may be overridden in a locale file.
         */
        currencyPrecision: 2,
        //</locale>

         //<locale>
        /**
         * @property {String} currencySign
         * The currency sign that the {@link #currency} function displays.
         *
         * This may be overridden in a locale file.
         */
        currencySign: '$',
        //</locale>

        //<locale>
        /**
         * @property {Boolean} currencyAtEnd
         * This may be set to <code>true</code> to make the {@link #currency} function
         * append the currency sign to the formatted value.
         *
         * This may be overridden in a locale file.
         */
        currencyAtEnd: false,
        //</locale>

        /**
         * Checks a reference and converts it to empty string if it is undefined.
         * @param {Object} value Reference to check
         * @return {Object} Empty string if converted, otherwise the original value
         */
        undef : function(value) {
            return value !== undefined ? value : "";
        },

        /**
         * Checks a reference and converts it to the default value if it's empty.
         * @param {Object} value Reference to check
         * @param {String} [defaultValue=""] The value to insert of it's undefined.
         * @return {String}
         */
        defaultValue : function(value, defaultValue) {
            return value !== undefined && value !== '' ? value : defaultValue;
        },

        /**
         * Returns a substring from within an original string.
         * @param {String} value The original text
         * @param {Number} start The start index of the substring
         * @param {Number} length The length of the substring
         * @return {String} The substring
         * @method
         */
        substr : 'ab'.substr(-1) != 'b'
        ? function (value, start, length) {
            var str = String(value);
            return (start < 0)
                ? str.substr(Math.max(str.length + start, 0), length)
                : str.substr(start, length);
        }
        : function(value, start, length) {
            return String(value).substr(start, length);
        },

        /**
         * Converts a string to all lower case letters.
         * @param {String} value The text to convert
         * @return {String} The converted text
         */
        lowercase : function(value) {
            return String(value).toLowerCase();
        },

        /**
         * Converts a string to all upper case letters.
         * @param {String} value The text to convert
         * @return {String} The converted text
         */
        uppercase : function(value) {
            return String(value).toUpperCase();
        },

        /**
         * Format a number as US currency.
         * @param {Number/String} value The numeric value to format
         * @return {String} The formatted currency string
         */
        usMoney : function(v) {
            return UtilFormat.currency(v, '$', 2);
        },

        /**
         * Format a number as a currency.
         * @param {Number/String} value The numeric value to format
         * @param {String} [sign] The currency sign to use (defaults to {@link #currencySign})
         * @param {Number} [decimals] The number of decimals to use for the currency
         * (defaults to {@link #currencyPrecision})
         * @param {Boolean} [end] True if the currency sign should be at the end of the string
         * (defaults to {@link #currencyAtEnd})
         * @return {String} The formatted currency string
         */
        currency: function(v, currencySign, decimals, end) {
            var negativeSign = '',
                format = ",0",
                i = 0;
            v = v - 0;
            if (v < 0) {
                v = -v;
                negativeSign = '-';
            }
            decimals = Ext.isDefined(decimals) ? decimals : UtilFormat.currencyPrecision;
            format += format + (decimals > 0 ? '.' : '');
            for (; i < decimals; i++) {
                format += '0';
            }
            v = UtilFormat.number(v, format);
            if ((end || UtilFormat.currencyAtEnd) === true) {
                return Ext.String.format("{0}{1}{2}", negativeSign, v, currencySign || UtilFormat.currencySign);
            } else {
                return Ext.String.format("{0}{1}{2}", negativeSign, currencySign || UtilFormat.currencySign, v);
            }
        },

        /**
         * Formats the passed date using the specified format pattern.
         * @param {String/Date} value The value to format. If a string is passed, it is converted to a Date
         * by the Javascript's built-in Date#parse method.
         * @param {String} [format] Any valid date format string. Defaults to {@link Ext.Date#defaultFormat}.
         * @return {String} The formatted date string.
         */
        date: function(v, format) {
            if (!v) {
                return "";
            }
            if (!Ext.isDate(v)) {
                v = new Date(Date.parse(v));
            }
            return Ext.Date.dateFormat(v, format || Ext.Date.defaultFormat);
        },

        /**
         * Returns a date rendering function that can be reused to apply a date format multiple times efficiently.
         * @param {String} format Any valid date format string. Defaults to {@link Ext.Date#defaultFormat}.
         * @return {Function} The date formatting function
         */
        dateRenderer : function(format) {
            return function(v) {
                return UtilFormat.date(v, format);
            };
        },

        /**
         * Strips all HTML tags.
         * @param {Object} value The text from which to strip tags
         * @return {String} The stripped text
         */
        stripTags : function(v) {
            return !v ? v : String(v).replace(stripTagsRE, "");
        },

        /**
         * Strips all script tags.
         * @param {Object} value The text from which to strip script tags
         * @return {String} The stripped text
         */
        stripScripts : function(v) {
            return !v ? v : String(v).replace(stripScriptsRe, "");
        },

        /**
         * Simple format for a file size (xxx bytes, xxx KB, xxx MB).
         * @param {Number/String} size The numeric value to format
         * @return {String} The formatted file size
         */
        fileSize : function(size) {
            if (size < 1024) {
                return size + " bytes";
            } else if (size < 1048576) {
                return (Math.round(((size*10) / 1024))/10) + " KB";
            } else {
                return (Math.round(((size*10) / 1048576))/10) + " MB";
            }
        },

        /**
         * It does simple math for use in a template, for example:
         *
         *     var tpl = new Ext.Template('{value} * 10 = {value:math("* 10")}');
         *
         * @return {Function} A function that operates on the passed value.
         * @method
         */
        math : (function(){
            var fns = {};

            return function(v, a){
                if (!fns[a]) {
                    fns[a] = Ext.functionFactory('v', 'return v ' + a + ';');
                }
                return fns[a](v);
            };
        }()),

        /**
         * Rounds the passed number to the required decimal precision.
         * @param {Number/String} value The numeric value to round.
         * @param {Number} precision The number of decimal places to which to round the first parameter's value.
         * @return {Number} The rounded value.
         */
        round : function(value, precision) {
            var result = Number(value);
            if (typeof precision == 'number') {
                precision = Math.pow(10, precision);
                result = Math.round(value * precision) / precision;
            }
            return result;
        },

        /**
         * Formats the passed number according to the passed format string.
         *
         * The number of digits after the decimal separator character specifies the number of
         * decimal places in the resulting string. The *local-specific* decimal character is
         * used in the result.
         *
         * The *presence* of a thousand separator character in the format string specifies that
         * the *locale-specific* thousand separator (if any) is inserted separating thousand groups.
         *
         * By default, "," is expected as the thousand separator, and "." is expected as the decimal separator.
         *
         * ## New to Ext JS 4
         *
         * Locale-specific characters are always used in the formatted output when inserting
         * thousand and decimal separators.
         *
         * The format string must specify separator characters according to US/UK conventions ("," as the
         * thousand separator, and "." as the decimal separator)
         *
         * To allow specification of format strings according to local conventions for separator characters, add
         * the string `/i` to the end of the format string.
         *
         * examples (123456.789):
         * 
         * - `0` - (123456) show only digits, no precision
         * - `0.00` - (123456.78) show only digits, 2 precision
         * - `0.0000` - (123456.7890) show only digits, 4 precision
         * - `0,000` - (123,456) show comma and digits, no precision
         * - `0,000.00` - (123,456.78) show comma and digits, 2 precision
         * - `0,0.00` - (123,456.78) shortcut method, show comma and digits, 2 precision
         *
         * To allow specification of the formatting string using UK/US grouping characters (,) and
         * decimal (.) for international numbers, add /i to the end. For example: 0.000,00/i
         *
         * @param {Number} v The number to format.
         * @param {String} format The way you would like to format this text.
         * @return {String} The formatted number.
         */
        number : function(v, formatString) {
            if (!formatString) {
                return v;
            }
            v = Ext.Number.from(v, NaN);
            if (isNaN(v)) {
                return '';
            }
            var comma = UtilFormat.thousandSeparator,
                dec   = UtilFormat.decimalSeparator,
                i18n  = false,
                neg   = v < 0,
                hasComma,
                psplit,
                fnum,
                cnum,
                parr,
                j,
                m,
                n,
                i;

            v = Math.abs(v);

            // The "/i" suffix allows caller to use a locale-specific formatting string.
            // Clean the format string by removing all but numerals and the decimal separator.
            // Then split the format string into pre and post decimal segments according to *what* the
            // decimal separator is. If they are specifying "/i", they are using the local convention in the format string.
            if (formatString.substr(formatString.length - 2) == '/i') {
                if (!I18NFormatCleanRe) {
                    I18NFormatCleanRe = new RegExp('[^\\d\\' + UtilFormat.decimalSeparator + ']','g');
                }
                formatString = formatString.substr(0, formatString.length - 2);
                i18n   = true;
                hasComma = formatString.indexOf(comma) != -1;
                psplit = formatString.replace(I18NFormatCleanRe, '').split(dec);
            } else {
                hasComma = formatString.indexOf(',') != -1;
                psplit = formatString.replace(formatCleanRe, '').split('.');
            }

            if (psplit.length > 2) {
                //<debug>
                Ext.Error.raise({
                    sourceClass: "Ext.util.Format",
                    sourceMethod: "number",
                    value: v,
                    formatString: formatString,
                    msg: "Invalid number format, should have no more than 1 decimal"
                });
                //</debug>
            } else if (psplit.length > 1) {
                v = Ext.Number.toFixed(v, psplit[1].length);
            } else {
                v = Ext.Number.toFixed(v, 0);
            }

            fnum = v.toString();

            psplit = fnum.split('.');

            if (hasComma) {
                cnum = psplit[0];
                parr = [];
                j = cnum.length;
                m = Math.floor(j / 3);
                n = cnum.length % 3 || 3;

                for (i = 0; i < j; i += n) {
                    if (i !== 0) {
                        n = 3;
                    }

                    parr[parr.length] = cnum.substr(i, n);
                    m -= 1;
                }
                fnum = parr.join(comma);
                if (psplit[1]) {
                    fnum += dec + psplit[1];
                }
            } else {
                if (psplit[1]) {
                    fnum = psplit[0] + dec + psplit[1];
                }
            }

            if (neg) {
                /*
                 * Edge case. If we have a very small negative number it will get rounded to 0,
                 * however the initial check at the top will still report as negative. Replace
                 * everything but 1-9 and check if the string is empty to determine a 0 value.
                 */
                neg = fnum.replace(/[^1-9]/g, '') !== '';
            }

            return (neg ? '-' : '') + formatString.replace(/[\d,?\.?]+/, fnum);
        },

        /**
         * Returns a number rendering function that can be reused to apply a number format multiple
         * times efficiently.
         *
         * @param {String} format Any valid number format string for {@link #number}
         * @return {Function} The number formatting function
         */
        numberRenderer : function(format) {
            return function(v) {
                return UtilFormat.number(v, format);
            };
        },

        /**
         * Selectively do a plural form of a word based on a numeric value. For example, in a template,
         * `{commentCount:plural("Comment")}`  would result in `"1 Comment"` if commentCount was 1 or
         * would be `"x Comments"` if the value is 0 or greater than 1.
         *
         * @param {Number} value The value to compare against
         * @param {String} singular The singular form of the word
         * @param {String} [plural] The plural form of the word (defaults to the singular with an "s")
         */
        plural : function(v, s, p) {
            return v +' ' + (v == 1 ? s : (p ? p : s+'s'));
        },

        /**
         * Converts newline characters to the HTML tag `<br/>`
         *
         * @param {String} The string value to format.
         * @return {String} The string with embedded `<br/>` tags in place of newlines.
         */
        nl2br : function(v) {
            return Ext.isEmpty(v) ? '' : v.replace(nl2brRe, '<br/>');
        },

        /**
         * Alias for {@link Ext.String#capitalize}.
         * @method
         * @inheritdoc Ext.String#capitalize
         */
        capitalize: Ext.String.capitalize,

        /**
         * Alias for {@link Ext.String#ellipsis}.
         * @method
         * @inheritdoc Ext.String#ellipsis
         */
        ellipsis: Ext.String.ellipsis,

        /**
         * Alias for {@link Ext.String#format}.
         * @method
         * @inheritdoc Ext.String#format
         */
        format: Ext.String.format,

        /**
         * Alias for {@link Ext.String#htmlDecode}.
         * @method
         * @inheritdoc Ext.String#htmlDecode
         */
        htmlDecode: Ext.String.htmlDecode,

        /**
         * Alias for {@link Ext.String#htmlEncode}.
         * @method
         * @inheritdoc Ext.String#htmlEncode
         */
        htmlEncode: Ext.String.htmlEncode,

        /**
         * Alias for {@link Ext.String#leftPad}.
         * @method
         * @inheritdoc Ext.String#leftPad
         */
        leftPad: Ext.String.leftPad,

        /**
         * Alias for {@link Ext.String#trim}.
         * @method
         * @inheritdoc Ext.String#trim
         */
        trim : Ext.String.trim,

        /**
         * Parses a number or string representing margin sizes into an object.
         * Supports CSS-style margin declarations (e.g. 10, "10", "10 10", "10 10 10" and
         * "10 10 10 10" are all valid options and would return the same result).
         *
         * @param {Number/String} v The encoded margins
         * @return {Object} An object with margin sizes for top, right, bottom and left
         */
        parseBox : function(box) {
          box = Ext.isEmpty(box) ? '' : box;
            if (Ext.isNumber(box)) {
                box = box.toString();
            }
            var parts  = box.split(' '),
                ln = parts.length;

            if (ln == 1) {
                parts[1] = parts[2] = parts[3] = parts[0];
            }
            else if (ln == 2) {
                parts[2] = parts[0];
                parts[3] = parts[1];
            }
            else if (ln == 3) {
                parts[3] = parts[1];
            }

            return {
                top   :parseInt(parts[0], 10) || 0,
                right :parseInt(parts[1], 10) || 0,
                bottom:parseInt(parts[2], 10) || 0,
                left  :parseInt(parts[3], 10) || 0
            };
        },

        /**
         * Escapes the passed string for use in a regular expression.
         * @param {String} str
         * @return {String}
         */
        escapeRegex : function(s) {
            return s.replace(/([\-.*+?\^${}()|\[\]\/\\])/g, "\\$1");
        }
    });
}());

/**
 * Provides the ability to execute one or more arbitrary tasks in a asynchronous manner.
 * Generally, you can use the singleton {@link Ext.TaskManager} instead, but if needed,
 * you can create separate instances of TaskRunner. Any number of separate tasks can be
 * started at any time and will run independently of each other.
 * 
 * Example usage:
 *
 *      // Start a simple clock task that updates a div once per second
 *      var updateClock = function () {
 *          Ext.fly('clock').update(new Date().format('g:i:s A'));
 *      }
 *
 *      var runner = new Ext.util.TaskRunner();
 *      var task = runner.start({
 *          run: updateClock,
 *          interval: 1000
 *      }
 *
 * The equivalent using TaskManager:
 *
 *      var task = Ext.TaskManager.start({
 *          run: updateClock,
 *          interval: 1000
 *      });
 *
 * To end a running task:
 * 
 *      Ext.TaskManager.stop(task);
 *
 * If a task needs to be started and stopped repeated over time, you can create a
 * {@link Ext.util.TaskRunner.Task Task} instance.
 *
 *      var task = runner.newTask({
 *          run: function () {
 *              // useful code
 *          },
 *          interval: 1000
 *      });
 *      
 *      task.start();
 *      
 *      // ...
 *      
 *      task.stop();
 *      
 *      // ...
 *      
 *      task.start();
 *
 * A re-usable, one-shot task can be managed similar to the above:
 *
 *      var task = runner.newTask({
 *          run: function () {
 *              // useful code to run once
 *          },
 *          repeat: 1
 *      });
 *      
 *      task.start();
 *      
 *      // ...
 *      
 *      task.start();
 *
 * See the {@link #start} method for details about how to configure a task object.
 *
 * Also see {@link Ext.util.DelayedTask}. 
 * 
 * @constructor
 * @param {Number/Object} [interval=10] The minimum precision in milliseconds supported by this
 * TaskRunner instance. Alternatively, a config object to apply to the new instance.
 */
Ext.define('Ext.util.TaskRunner', {
    /**
     * @cfg interval
     * The timer resolution.
     */
    interval: 10,

    /**
     * @property timerId
     * The id of the current timer.
     * @private
     */
    timerId: null,

    constructor: function (interval) {
        var me = this;

        if (typeof interval == 'number') {
            me.interval = interval;
        } else if (interval) {
            Ext.apply(me, interval);
        }

        me.tasks = [];
        me.timerFn = Ext.Function.bind(me.onTick, me);
    },

    /**
     * Creates a new {@link Ext.util.TaskRunner.Task Task} instance. These instances can
     * be easily started and stopped.
     * @param {Object} config The config object. For details on the supported properties,
     * see {@link #start}.
     */
    newTask: function (config) {
        var task = new Ext.util.TaskRunner.Task(config);
        task.manager = this;
        return task;
    },

    /**
     * Starts a new task.
     *
     * Before each invocation, Ext injects the property `taskRunCount` into the task object
     * so that calculations based on the repeat count can be performed.
     * 
     * The returned task will contain a `destroy` method that can be used to destroy the
     * task and cancel further calls. This is equivalent to the {@link #stop} method.
     *
     * @param {Object} task A config object that supports the following properties:
     * @param {Function} task.run The function to execute each time the task is invoked. The
     * function will be called at each interval and passed the `args` argument if specified,
     * and the current invocation count if not.
     * 
     * If a particular scope (`this` reference) is required, be sure to specify it using
     * the `scope` argument.
     * 
     * @param {Function} task.onError The function to execute in case of unhandled
     * error on task.run.
     *
     * @param {Boolean} task.run.return `false` from this function to terminate the task.
     *
     * @param {Number} task.interval The frequency in milliseconds with which the task
     * should be invoked.
     *
     * @param {Object[]} task.args An array of arguments to be passed to the function
     * specified by `run`. If not specified, the current invocation count is passed.
     *
     * @param {Object} task.scope The scope (`this` reference) in which to execute the
     * `run` function. Defaults to the task config object.
     *
     * @param {Number} task.duration The length of time in milliseconds to invoke the task
     * before stopping automatically (defaults to indefinite).
     *
     * @param {Number} task.repeat The number of times to invoke the task before stopping
     * automatically (defaults to indefinite).
     * @return {Object} The task
     */
    start: function(task) {
        var me = this,
            now = new Date().getTime();

        if (!task.pending) {
            me.tasks.push(task);
            task.pending = true; // don't allow the task to be added to me.tasks again
        }

        task.stopped = false; // might have been previously stopped...
        task.taskStartTime = now;
        task.taskRunTime = task.fireOnStart !== false ? 0 : task.taskStartTime;
        task.taskRunCount = 0;

        if (!me.firing) {
            if (task.fireOnStart !== false) {
                me.startTimer(0, now);
            } else {
                me.startTimer(task.interval, now);
            }
        }

        return task;
    },

    /**
     * Stops an existing running task.
     * @param {Object} task The task to stop
     * @return {Object} The task
     */
    stop: function(task) {
        // NOTE: we don't attempt to remove the task from me.tasks at this point because
        // this could be called from inside a task which would then corrupt the state of
        // the loop in onTick
        if (!task.stopped) {
            task.stopped = true;

            if (task.onStop) {
                task.onStop.call(task.scope || task, task);
            }
        }

        return task;
    },

    /**
     * Stops all tasks that are currently running.
     */
    stopAll: function() {
        // onTick will take care of cleaning up the mess after this point...
        Ext.each(this.tasks, this.stop, this);
    },

    //-------------------------------------------------------------------------

    firing: false,

    nextExpires: 1e99,

    // private
    onTick: function () {
        var me = this,
            tasks = me.tasks,
            now = new Date().getTime(),
            nextExpires = 1e99,
            len = tasks.length,
            expires, newTasks, i, task, rt, remove;

        me.timerId = null;
        me.firing = true; // ensure we don't startTimer during this loop...

        // tasks.length can be > len if start is called during a task.run call... so we
        // first check len to avoid tasks.length reference but eventually we need to also
        // check tasks.length. we avoid repeating use of tasks.length by setting len at
        // that time (to help the next loop)
        for (i = 0; i < len || i < (len = tasks.length); ++i) {
            task = tasks[i];

            if (!(remove = task.stopped)) {
                expires = task.taskRunTime + task.interval;

                if (expires <= now) {
                    rt = 1; // otherwise we have a stale "rt"
                    try {
                        rt = task.run.apply(task.scope || task, task.args || [++task.taskRunCount]);
                    } catch (taskError) {
                        try {
                            if (task.onError) {
                                rt = task.onError.call(task.scope || task, task, taskError);
                            }
                        } catch (ignore) { }
                    }
                    task.taskRunTime = now;
                    if (rt === false || task.taskRunCount === task.repeat) {
                        me.stop(task);
                        remove = true;
                    } else {
                        remove = task.stopped; // in case stop was called by run
                        expires = now + task.interval;
                    }
                }

                if (!remove && task.duration && task.duration <= (now - task.taskStartTime)) {
                    me.stop(task);
                    remove = true;
                }
            }

            if (remove) {
                task.pending = false; // allow the task to be added to me.tasks again

                // once we detect that a task needs to be removed, we copy the tasks that
                // will carry forward into newTasks... this way we avoid O(N*N) to remove
                // each task from the tasks array (and ripple the array down) and also the
                // potentially wasted effort of making a new tasks[] even if all tasks are
                // going into the next wave.
                if (!newTasks) {
                    newTasks = tasks.slice(0, i);
                    // we don't set me.tasks here because callbacks can also start tasks,
                    // which get added to me.tasks... so we will visit them in this loop
                    // and account for their expirations in nextExpires...
                }
            } else {
                if (newTasks) {
                    newTasks.push(task); // we've cloned the tasks[], so keep this one...
                }

                if (nextExpires > expires) {
                    nextExpires = expires; // track the nearest expiration time
                }
            }
        }

        if (newTasks) {
            // only now can we copy the newTasks to me.tasks since no user callbacks can
            // take place
            me.tasks = newTasks;
        }

        me.firing = false; // we're done, so allow startTimer afterwards

        if (me.tasks.length) {
            // we create a new Date here because all the callbacks could have taken a long
            // time... we want to base the next timeout on the current time (after the
            // callback storm):
            me.startTimer(nextExpires - now, new Date().getTime());
        }
    },

    // private
    startTimer: function (timeout, now) {
        var me = this,
            expires = now + timeout,
            timerId = me.timerId;

        // Check to see if this request is enough in advance of the current timer. If so,
        // we reschedule the timer based on this new expiration.
        if (timerId && me.nextExpires - expires > me.interval) {
            clearTimeout(timerId);
            timerId = null;
        }

        if (!timerId) {
            if (timeout < me.interval) {
                timeout = me.interval;
            }

            me.timerId = setTimeout(me.timerFn, timeout);
            me.nextExpires = expires;
        }
    }
},
function () {
    var me = this,
        proto = me.prototype;

    /**
     * Destroys this instance, stopping all tasks that are currently running.
     * @method destroy
     */
    proto.destroy = proto.stopAll;

    /**
    * @class Ext.TaskManager
    * @extends Ext.util.TaskRunner
    * @singleton
    *
    * A static {@link Ext.util.TaskRunner} instance that can be used to start and stop
    * arbitrary tasks. See {@link Ext.util.TaskRunner} for supported methods and task
    * config properties.
    *
    *    // Start a simple clock task that updates a div once per second
    *    var task = {
    *       run: function(){
    *           Ext.fly('clock').update(new Date().format('g:i:s A'));
    *       },
    *       interval: 1000 //1 second
    *    }
    *
    *    Ext.TaskManager.start(task);
    *
    * See the {@link #start} method for details about how to configure a task object.
    */
    Ext.util.TaskManager = Ext.TaskManager = new me();

    /**
     * Instances of this class are created by {@link Ext.util.TaskRunner#newTask} method.
     * 
     * For details on config properties, see {@link Ext.util.TaskRunner#start}.
     * @class Ext.util.TaskRunner.Task
     */
    me.Task = new Ext.Class({
        isTask: true,

        /**
         * This flag is set to `true` by {@link #stop}.
         * @private
         */
        stopped: true, // this avoids the odd combination of !stopped && !pending

        /**
         * Override default behavior
         */
        fireOnStart: false,

        constructor: function (config) {
            Ext.apply(this, config);
        },

        /**
         * Restarts this task, clearing it duration, expiration and run count.
         * @param {Number} [interval] Optionally reset this task's interval.
         */
        restart: function (interval) {
            if (interval !== undefined) {
                this.interval = interval;
            }

            this.manager.start(this);
        },

        /**
         * Starts this task if it is not already started.
         * @param {Number} [interval] Optionally reset this task's interval.
         */
        start: function (interval) {
            if (this.stopped) {
                this.restart(interval);
            }
        },

        /**
         * Stops this task.
         */
        stop: function () {
            this.manager.stop(this);
        }
    });

    proto = me.Task.prototype;

    /**
     * Destroys this instance, stopping this task's execution.
     * @method destroy
     */
    proto.destroy = proto.stop;
});

/**
 * @class Ext.perf.Accumulator
 * @private
 */
Ext.define('Ext.perf.Accumulator', (function () {
    var currentFrame = null,
        khrome = Ext.global['chrome'],
        formatTpl,
        // lazy init on first request for timestamp (avoids infobar in IE until needed)
        // Also avoids kicking off Chrome's microsecond timer until first needed
        getTimestamp = function () {

            getTimestamp = function () {
                return new Date().getTime();
            };
            
            var interval, toolbox;

            // If Chrome is started with the --enable-benchmarking switch
            if (Ext.isChrome && khrome && khrome.Interval) {
                interval = new khrome.Interval();
                interval.start();
                getTimestamp = function () {
                    return interval.microseconds() / 1000;
                };
            } else if (window.ActiveXObject) {
                try {
                    // the above technique is not very accurate for small intervals...
                    toolbox = new ActiveXObject('SenchaToolbox.Toolbox');
                    Ext.senchaToolbox = toolbox; // export for other uses
                    getTimestamp = function () {
                        return toolbox.milliseconds;
                    };
                } catch (e) {
                    // ignore
                }
            } else if (Date.now) {
                getTimestamp = Date.now;
            }

            Ext.perf.getTimestamp = Ext.perf.Accumulator.getTimestamp = getTimestamp;
            return getTimestamp();
        };

    function adjustSet (set, time) {
        set.sum += time;
        set.min = Math.min(set.min, time);
        set.max = Math.max(set.max, time);
    }

    function leaveFrame (time) {
        var totalTime = time ? time : (getTimestamp() - this.time), // do this first
            me = this, // me = frame
            accum = me.accum;

        ++accum.count;
        if (! --accum.depth) {
            adjustSet(accum.total, totalTime);
        }
        adjustSet(accum.pure, totalTime - me.childTime);

        currentFrame = me.parent;
        if (currentFrame) {
            ++currentFrame.accum.childCount;
            currentFrame.childTime += totalTime;
        }
    }

    function makeSet () {
        return {
            min: Number.MAX_VALUE,
            max: 0,
            sum: 0
        };
    }

    function makeTap (me, fn) {
        return function () {
            var frame = me.enter(),
                ret = fn.apply(this, arguments);

            frame.leave();
            return ret;
        };
    }

    function round (x) {
        return Math.round(x * 100) / 100;
    }

    function setToJSON (count, childCount, calibration, set) {
        var data = {
            avg: 0,
            min: set.min,
            max: set.max,
            sum: 0
        };

        if (count) {
            calibration = calibration || 0;
            data.sum = set.sum - childCount * calibration;
            data.avg = data.sum / count;
            // min and max cannot be easily corrected since we don't know the number of
            // child calls for them.
        }

        return data;
    }

    return {
        constructor: function (name) {
            var me = this;

            me.count = me.childCount = me.depth = me.maxDepth = 0;
            me.pure = makeSet();
            me.total = makeSet();
            me.name = name;
        },

        statics: {
            getTimestamp: getTimestamp
        },

        format: function (calibration) {
            if (!formatTpl) {
                formatTpl = new Ext.XTemplate([
                        '{name} - {count} call(s)',
                        '<tpl if="count">',
                            '<tpl if="childCount">',
                                ' ({childCount} children)',
                            '</tpl>',
                            '<tpl if="depth - 1">',
                                ' ({depth} deep)',
                            '</tpl>',
                            '<tpl for="times">',
                                ', {type}: {[this.time(values.sum)]} msec (',
                                     //'min={[this.time(values.min)]}, ',
                                     'avg={[this.time(values.sum / parent.count)]}',
                                     //', max={[this.time(values.max)]}',
                                     ')',
                            '</tpl>',
                        '</tpl>'
                    ].join(''), {
                        time: function (t) {
                            return Math.round(t * 100) / 100;
                        }
                    });
            }

            var data = this.getData(calibration);
            data.name = this.name;
            data.pure.type = 'Pure';
            data.total.type = 'Total';
            data.times = [data.pure, data.total];
            return formatTpl.apply(data);
        },

        getData: function (calibration) {
            var me = this;

            return {
                count: me.count,
                childCount: me.childCount,
                depth: me.maxDepth,
                pure: setToJSON(me.count, me.childCount, calibration, me.pure),
                total: setToJSON(me.count, me.childCount, calibration, me.total)
            };
        },

        enter: function () {
            var me = this,
                frame = {
                    accum: me,
                    leave: leaveFrame,
                    childTime: 0,
                    parent: currentFrame
                };

            ++me.depth;
            if (me.maxDepth < me.depth) {
                me.maxDepth = me.depth;
            }

            currentFrame = frame;
            frame.time = getTimestamp(); // do this last
            return frame;
        },

        monitor: function (fn, scope, args) {
            var frame = this.enter();
            if (args) {
                fn.apply(scope, args);
            } else {
                fn.call(scope);
            }
            frame.leave();
        },

        report: function () {
            Ext.log(this.format());
        },

        tap: function (className, methodName) {
            var me = this,
                methods = typeof methodName == 'string' ? [methodName] : methodName,
                klass, statik, i, parts, length, name, src,
                tapFunc;

            tapFunc = function(){
                if (typeof className == 'string') {
                    klass = Ext.global;
                    parts = className.split('.');
                    for (i = 0, length = parts.length; i < length; ++i) {
                        klass = klass[parts[i]];
                    }
                } else {
                    klass = className;
                }

                for (i = 0, length = methods.length; i < length; ++i) {
                    name = methods[i];
                    statik = name.charAt(0) == '!';

                    if (statik) {
                        name = name.substring(1);
                    } else {
                        statik = !(name in klass.prototype);
                    }

                    src = statik ? klass : klass.prototype;
                    src[name] = makeTap(me, src[name]);
                }
            };

            Ext.ClassManager.onCreated(tapFunc, me, className);

            return me;
        }
    };
}()),

function () {
    Ext.perf.getTimestamp = this.getTimestamp;
});

/**
 * @class Ext.perf.Monitor
 * @singleton
 * @private
 */
Ext.define('Ext.perf.Monitor', {
    singleton: true,
    alternateClassName: 'Ext.Perf',

    requires: [
        'Ext.perf.Accumulator'
    ],

    constructor: function () {
        this.accumulators = [];
        this.accumulatorsByName = {};
    },

    calibrate: function () {
        var accum = new Ext.perf.Accumulator('$'),
            total = accum.total,
            getTimestamp = Ext.perf.Accumulator.getTimestamp,
            count = 0,
            frame,
            endTime,
            startTime;

        startTime = getTimestamp();

        do {
            frame = accum.enter();
            frame.leave();
            ++count;
        } while (total.sum < 100);

        endTime = getTimestamp();

        return (endTime - startTime) / count;
    },

    get: function (name) {
        var me = this,
            accum = me.accumulatorsByName[name];

        if (!accum) {
            me.accumulatorsByName[name] = accum = new Ext.perf.Accumulator(name);
            me.accumulators.push(accum);
        }

        return accum;
    },

    enter: function (name) {
        return this.get(name).enter();
    },

    monitor: function (name, fn, scope) {
        this.get(name).monitor(fn, scope);
    },

    report: function () {
        var me = this,
            accumulators = me.accumulators,
            calibration = me.calibrate();

        accumulators.sort(function (a, b) {
            return (a.name < b.name) ? -1 : ((b.name < a.name) ? 1 : 0);
        });

        me.updateGC();

        Ext.log('Calibration: ' + Math.round(calibration * 100) / 100 + ' msec/sample');
        Ext.each(accumulators, function (accum) {
            Ext.log(accum.format(calibration));
        });
    },

    getData: function (all) {
        var ret = {},
            accumulators = this.accumulators;

        Ext.each(accumulators, function (accum) {
            if (all || accum.count) {
                ret[accum.name] = accum.getData();
            }
        });

        return ret;
    },

    reset: function(){
        Ext.each(this.accumulators, function(accum){
            var me = accum;
            me.count = me.childCount = me.depth = me.maxDepth = 0;
            me.pure = {
                min: Number.MAX_VALUE,
                max: 0,
                sum: 0
            };
            me.total = {
                min: Number.MAX_VALUE,
                max: 0,
                sum: 0
            };
        });
    },

    updateGC: function () {
        var accumGC = this.accumulatorsByName.GC,
            toolbox = Ext.senchaToolbox,
            bucket;

        if (accumGC) {
            accumGC.count = toolbox.garbageCollectionCounter || 0;

            if (accumGC.count) {
                bucket = accumGC.pure;
                accumGC.total.sum = bucket.sum = toolbox.garbageCollectionMilliseconds;
                bucket.min = bucket.max = bucket.sum / accumGC.count;
                bucket = accumGC.total;
                bucket.min = bucket.max = bucket.sum / accumGC.count;
            }
        }
    },

    watchGC: function () {
        Ext.perf.getTimestamp(); // initializes SenchaToolbox (if available)

        var toolbox = Ext.senchaToolbox;

        if (toolbox) {
            this.get("GC");
            toolbox.watchGarbageCollector(false); // no logging, just totals
        }
    },

    setup: function (config) {
        if (!config) {
            config = {
                /*insertHtml: {
                    'Ext.dom.Helper': 'insertHtml'
                },*/
                /*xtplCompile: {
                    'Ext.XTemplateCompiler': 'compile'
                },*/
//                doInsert: {
//                    'Ext.Template': 'doInsert'
//                },
//                applyOut: {
//                    'Ext.XTemplate': 'applyOut'
//                },
                render: {
                    'Ext.AbstractComponent': 'render'
                },
//                fnishRender: {
//                    'Ext.AbstractComponent': 'finishRender'
//                },
//                renderSelectors: {
//                    'Ext.AbstractComponent': 'applyRenderSelectors'
//                },
//                compAddCls: {
//                    'Ext.AbstractComponent': 'addCls'
//                },
//                compRemoveCls: {
//                    'Ext.AbstractComponent': 'removeCls'
//                },
//                getStyle: {
//                    'Ext.core.Element': 'getStyle'
//                },
//                setStyle: {
//                    'Ext.core.Element': 'setStyle'
//                },
//                addCls: {
//                    'Ext.core.Element': 'addCls'
//                },
//                removeCls: {
//                    'Ext.core.Element': 'removeCls'
//                },
//                measure: {
//                    'Ext.layout.component.Component': 'measureAutoDimensions'
//                },
//                moveItem: {
//                    'Ext.layout.Layout': 'moveItem'
//                },
//                layoutFlush: {
//                    'Ext.layout.Context': 'flush'
//                },
                layout: {
                    'Ext.layout.Context': 'run'
                }
            };
        }

        this.currentConfig = config;

        var key, prop,
            accum, className, methods;
        for (key in config) {
            if (config.hasOwnProperty(key)) {
                prop = config[key];
                accum = Ext.Perf.get(key);

                for (className in prop) {
                    if (prop.hasOwnProperty(className)) {
                        methods = prop[className];
                        accum.tap(className, methods);
                    }
                }
            }
        }

        this.watchGC();
    }
});

/**
 * @class Ext.is
 * 
 * Determines information about the current platform the application is running on.
 * 
 * @singleton
 */
Ext.is = {
    init : function(navigator) {
        var platforms = this.platforms,
            ln = platforms.length,
            i, platform;

        navigator = navigator || window.navigator;

        for (i = 0; i < ln; i++) {
            platform = platforms[i];
            this[platform.identity] = platform.regex.test(navigator[platform.property]);
        }

        /**
         * @property Desktop True if the browser is running on a desktop machine
         * @type {Boolean}
         */
        this.Desktop = this.Mac || this.Windows || (this.Linux && !this.Android);
        /**
         * @property Tablet True if the browser is running on a tablet (iPad)
         */
        this.Tablet = this.iPad;
        /**
         * @property Phone True if the browser is running on a phone.
         * @type {Boolean}
         */
        this.Phone = !this.Desktop && !this.Tablet;
        /**
         * @property iOS True if the browser is running on iOS
         * @type {Boolean}
         */
        this.iOS = this.iPhone || this.iPad || this.iPod;
        
        /**
         * @property Standalone Detects when application has been saved to homescreen.
         * @type {Boolean}
         */
        this.Standalone = !!window.navigator.standalone;
    },
    
    /**
     * @property iPhone True when the browser is running on a iPhone
     * @type {Boolean}
     */
    platforms: [{
        property: 'platform',
        regex: /iPhone/i,
        identity: 'iPhone'
    },
    
    /**
     * @property iPod True when the browser is running on a iPod
     * @type {Boolean}
     */
    {
        property: 'platform',
        regex: /iPod/i,
        identity: 'iPod'
    },
    
    /**
     * @property iPad True when the browser is running on a iPad
     * @type {Boolean}
     */
    {
        property: 'userAgent',
        regex: /iPad/i,
        identity: 'iPad'
    },
    
    /**
     * @property Blackberry True when the browser is running on a Blackberry
     * @type {Boolean}
     */
    {
        property: 'userAgent',
        regex: /Blackberry/i,
        identity: 'Blackberry'
    },
    
    /**
     * @property Android True when the browser is running on an Android device
     * @type {Boolean}
     */
    {
        property: 'userAgent',
        regex: /Android/i,
        identity: 'Android'
    },
    
    /**
     * @property Mac True when the browser is running on a Mac
     * @type {Boolean}
     */
    {
        property: 'platform',
        regex: /Mac/i,
        identity: 'Mac'
    },
    
    /**
     * @property Windows True when the browser is running on Windows
     * @type {Boolean}
     */
    {
        property: 'platform',
        regex: /Win/i,
        identity: 'Windows'
    },
    
    /**
     * @property Linux True when the browser is running on Linux
     * @type {Boolean}
     */
    {
        property: 'platform',
        regex: /Linux/i,
        identity: 'Linux'
    }]
};

Ext.is.init();

/**
 * @class Ext.supports
 *
 * Determines information about features are supported in the current environment
 * 
 * @singleton
 */
(function(){

    // this is a local copy of certain logic from (Abstract)Element.getStyle
    // to break a dependancy between the supports mechanism and Element
    // use this instead of element references to check for styling info
    var getStyle = function(element, styleName){
        var view = element.ownerDocument.defaultView,
            style = (view ? view.getComputedStyle(element, null) : element.currentStyle) || element.style;
        return style[styleName];
    };

Ext.supports = {
    /**
     * Runs feature detection routines and sets the various flags. This is called when
     * the scripts loads (very early) and again at {@link Ext#onReady}. Some detections
     * are flagged as `early` and run immediately. Others that require the document body
     * will not run until ready.
     *
     * Each test is run only once, so calling this method from an onReady function is safe
     * and ensures that all flags have been set.
     * @markdown
     * @private
     */
    init : function() {
        var me = this,
            doc = document,
            tests = me.tests,
            n = tests.length,
            div = n && Ext.isReady && doc.createElement('div'),
            test, notRun = [];

        if (div) {
            div.innerHTML = [
                '<div style="height:30px;width:50px;">',
                    '<div style="height:20px;width:20px;"></div>',
                '</div>',
                '<div style="width: 200px; height: 200px; position: relative; padding: 5px;">',
                    '<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>',
                '</div>',
                '<div style="position: absolute; left: 10%; top: 10%;"></div>',
                '<div style="float:left; background-color:transparent;"></div>'
            ].join('');

            doc.body.appendChild(div);
        }

        while (n--) {
            test = tests[n];
            if (div || test.early) {
                me[test.identity] = test.fn.call(me, doc, div);
            } else {
                notRun.push(test);
            }
        }

        if (div) {
            doc.body.removeChild(div);
        }

        me.tests = notRun;
    },

    /**
     * @property PointerEvents True if document environment supports the CSS3 pointer-events style.
     * @type {Boolean}
     */
    PointerEvents: 'pointerEvents' in document.documentElement.style,

    /**
     * @property CSS3BoxShadow True if document environment supports the CSS3 box-shadow style.
     * @type {Boolean}
     */
    CSS3BoxShadow: 'boxShadow' in document.documentElement.style || 'WebkitBoxShadow' in document.documentElement.style || 'MozBoxShadow' in document.documentElement.style,

    /**
     * @property ClassList True if document environment supports the HTML5 classList API.
     * @type {Boolean}
     */
    ClassList: !!document.documentElement.classList,

    /**
     * @property OrientationChange True if the device supports orientation change
     * @type {Boolean}
     */
    OrientationChange: ((typeof window.orientation != 'undefined') && ('onorientationchange' in window)),

    /**
     * @property DeviceMotion True if the device supports device motion (acceleration and rotation rate)
     * @type {Boolean}
     */
    DeviceMotion: ('ondevicemotion' in window),

    /**
     * @property Touch True if the device supports touch
     * @type {Boolean}
     */
    // is.Desktop is needed due to the bug in Chrome 5.0.375, Safari 3.1.2
    // and Safari 4.0 (they all have 'ontouchstart' in the window object).
    Touch: ('ontouchstart' in window) && (!Ext.is.Desktop),

    /**
     * @property TimeoutActualLateness True if the browser passes the "actualLateness" parameter to
     * setTimeout. See: https://developer.mozilla.org/en/DOM/window.setTimeout
     * @type {Boolean}
     */
    TimeoutActualLateness: (function(){
        setTimeout(function(){
            Ext.supports.TimeoutActualLateness = arguments.length !== 0;
        }, 0);
    }()),

    tests: [
        /**
         * @property Transitions True if the device supports CSS3 Transitions
         * @type {Boolean}
         */
        {
            identity: 'Transitions',
            fn: function(doc, div) {
                var prefix = [
                        'webkit',
                        'Moz',
                        'o',
                        'ms',
                        'khtml'
                    ],
                    TE = 'TransitionEnd',
                    transitionEndName = [
                        prefix[0] + TE,
                        'transitionend', //Moz bucks the prefixing convention
                        prefix[2] + TE,
                        prefix[3] + TE,
                        prefix[4] + TE
                    ],
                    ln = prefix.length,
                    i = 0,
                    out = false;

                for (; i < ln; i++) {
                    if (getStyle(div, prefix[i] + "TransitionProperty")) {
                        Ext.supports.CSS3Prefix = prefix[i];
                        Ext.supports.CSS3TransitionEnd = transitionEndName[i];
                        out = true;
                        break;
                    }
                }
                return out;
            }
        },

        /**
         * @property RightMargin True if the device supports right margin.
         * See https://bugs.webkit.org/show_bug.cgi?id=13343 for why this is needed.
         * @type {Boolean}
         */
        {
            identity: 'RightMargin',
            fn: function(doc, div) {
                var view = doc.defaultView;
                return !(view && view.getComputedStyle(div.firstChild.firstChild, null).marginRight != '0px');
            }
        },

        /**
         * @property DisplayChangeInputSelectionBug True if INPUT elements lose their
         * selection when their display style is changed. Essentially, if a text input
         * has focus and its display style is changed, the I-beam disappears.
         *
         * This bug is encountered due to the work around in place for the {@link #RightMargin}
         * bug. This has been observed in Safari 4.0.4 and older, and appears to be fixed
         * in Safari 5. It's not clear if Safari 4.1 has the bug, but it has the same WebKit
         * version number as Safari 5 (according to http://unixpapa.com/js/gecko.html).
         */
        {
            identity: 'DisplayChangeInputSelectionBug',
            early: true,
            fn: function() {
                var webKitVersion = Ext.webKitVersion;
                // WebKit but older than Safari 5 or Chrome 6:
                return 0 < webKitVersion && webKitVersion < 533;
            }
        },

        /**
         * @property DisplayChangeTextAreaSelectionBug True if TEXTAREA elements lose their
         * selection when their display style is changed. Essentially, if a text area has
         * focus and its display style is changed, the I-beam disappears.
         *
         * This bug is encountered due to the work around in place for the {@link #RightMargin}
         * bug. This has been observed in Chrome 10 and Safari 5 and older, and appears to
         * be fixed in Chrome 11.
         */
        {
            identity: 'DisplayChangeTextAreaSelectionBug',
            early: true,
            fn: function() {
                var webKitVersion = Ext.webKitVersion;

                /*
                Has bug w/textarea:

                (Chrome) Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; en-US)
                            AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.127
                            Safari/534.16
                (Safari) Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; en-us)
                            AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5
                            Safari/533.21.1

                No bug:

                (Chrome) Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7)
                            AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.57
                            Safari/534.24
                */
                return 0 < webKitVersion && webKitVersion < 534.24;
            }
        },

        /**
         * @property TransparentColor True if the device supports transparent color
         * @type {Boolean}
         */
        {
            identity: 'TransparentColor',
            fn: function(doc, div, view) {
                view = doc.defaultView;
                return !(view && view.getComputedStyle(div.lastChild, null).backgroundColor != 'transparent');
            }
        },

        /**
         * @property ComputedStyle True if the browser supports document.defaultView.getComputedStyle()
         * @type {Boolean}
         */
        {
            identity: 'ComputedStyle',
            fn: function(doc, div, view) {
                view = doc.defaultView;
                return view && view.getComputedStyle;
            }
        },

        /**
         * @property Svg True if the device supports SVG
         * @type {Boolean}
         */
        {
            identity: 'Svg',
            fn: function(doc) {
                return !!doc.createElementNS && !!doc.createElementNS( "http:/" + "/www.w3.org/2000/svg", "svg").createSVGRect;
            }
        },

        /**
         * @property Canvas True if the device supports Canvas
         * @type {Boolean}
         */
        {
            identity: 'Canvas',
            fn: function(doc) {
                return !!doc.createElement('canvas').getContext;
            }
        },

        /**
         * @property Vml True if the device supports VML
         * @type {Boolean}
         */
        {
            identity: 'Vml',
            fn: function(doc) {
                var d = doc.createElement("div");
                d.innerHTML = "<!--[if vml]><br/><br/><![endif]-->";
                return (d.childNodes.length == 2);
            }
        },

        /**
         * @property Float True if the device supports CSS float
         * @type {Boolean}
         */
        {
            identity: 'Float',
            fn: function(doc, div) {
                return !!div.lastChild.style.cssFloat;
            }
        },

        /**
         * @property AudioTag True if the device supports the HTML5 audio tag
         * @type {Boolean}
         */
        {
            identity: 'AudioTag',
            fn: function(doc) {
                return !!doc.createElement('audio').canPlayType;
            }
        },

        /**
         * @property History True if the device supports HTML5 history
         * @type {Boolean}
         */
        {
            identity: 'History',
            fn: function() {
                var history = window.history;
                return !!(history && history.pushState);
            }
        },

        /**
         * @property CSS3DTransform True if the device supports CSS3DTransform
         * @type {Boolean}
         */
        {
            identity: 'CSS3DTransform',
            fn: function() {
                return (typeof WebKitCSSMatrix != 'undefined' && new WebKitCSSMatrix().hasOwnProperty('m41'));
            }
        },

		/**
         * @property CSS3LinearGradient True if the device supports CSS3 linear gradients
         * @type {Boolean}
         */
        {
            identity: 'CSS3LinearGradient',
            fn: function(doc, div) {
                var property = 'background-image:',
                    webkit   = '-webkit-gradient(linear, left top, right bottom, from(black), to(white))',
                    w3c      = 'linear-gradient(left top, black, white)',
                    moz      = '-moz-' + w3c,
                    opera    = '-o-' + w3c,
                    options  = [property + webkit, property + w3c, property + moz, property + opera];

                div.style.cssText = options.join(';');

                return ("" + div.style.backgroundImage).indexOf('gradient') !== -1;
            }
        },

        /**
         * @property CSS3BorderRadius True if the device supports CSS3 border radius
         * @type {Boolean}
         */
        {
            identity: 'CSS3BorderRadius',
            fn: function(doc, div) {
                var domPrefixes = ['borderRadius', 'BorderRadius', 'MozBorderRadius', 'WebkitBorderRadius', 'OBorderRadius', 'KhtmlBorderRadius'],
                    pass = false,
                    i;
                for (i = 0; i < domPrefixes.length; i++) {
                    if (document.body.style[domPrefixes[i]] !== undefined) {
                        return true;
                    }
                }
                return pass;
            }
        },

        /**
         * @property GeoLocation True if the device supports GeoLocation
         * @type {Boolean}
         */
        {
            identity: 'GeoLocation',
            fn: function() {
                return (typeof navigator != 'undefined' && typeof navigator.geolocation != 'undefined') || (typeof google != 'undefined' && typeof google.gears != 'undefined');
            }
        },
        /**
         * @property MouseEnterLeave True if the browser supports mouseenter and mouseleave events
         * @type {Boolean}
         */
        {
            identity: 'MouseEnterLeave',
            fn: function(doc, div){
                return ('onmouseenter' in div && 'onmouseleave' in div);
            }
        },
        /**
         * @property MouseWheel True if the browser supports the mousewheel event
         * @type {Boolean}
         */
        {
            identity: 'MouseWheel',
            fn: function(doc, div) {
                return ('onmousewheel' in div);
            }
        },
        /**
         * @property Opacity True if the browser supports normal css opacity
         * @type {Boolean}
         */
        {
            identity: 'Opacity',
            fn: function(doc, div){
                // Not a strict equal comparison in case opacity can be converted to a number.
                if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
                    return false;
                }
                div.firstChild.style.cssText = 'opacity:0.73';
                return div.firstChild.style.opacity == '0.73';
            }
        },
        /**
         * @property Placeholder True if the browser supports the HTML5 placeholder attribute on inputs
         * @type {Boolean}
         */
        {
            identity: 'Placeholder',
            fn: function(doc) {
                return 'placeholder' in doc.createElement('input');
            }
        },

        /**
         * @property Direct2DBug True if when asking for an element's dimension via offsetWidth or offsetHeight,
         * getBoundingClientRect, etc. the browser returns the subpixel width rounded to the nearest pixel.
         * @type {Boolean}
         */
        {
            identity: 'Direct2DBug',
            fn: function() {
                return Ext.isString(document.body.style.msTransformOrigin);
            }
        },
        /**
         * @property BoundingClientRect True if the browser supports the getBoundingClientRect method on elements
         * @type {Boolean}
         */
        {
            identity: 'BoundingClientRect',
            fn: function(doc, div) {
                return Ext.isFunction(div.getBoundingClientRect);
            }
        },
        {
            identity: 'IncludePaddingInWidthCalculation',
            fn: function(doc, div){
                return div.childNodes[1].firstChild.offsetWidth == 210;
            }
        },
        {
            identity: 'IncludePaddingInHeightCalculation',
            fn: function(doc, div){
                return div.childNodes[1].firstChild.offsetHeight == 210;
            }
        },

        /**
         * @property ArraySort True if the Array sort native method isn't bugged.
         * @type {Boolean}
         */
        {
            identity: 'ArraySort',
            fn: function() {
                var a = [1,2,3,4,5].sort(function(){ return 0; });
                return a[0] === 1 && a[1] === 2 && a[2] === 3 && a[3] === 4 && a[4] === 5;
            }
        },
        /**
         * @property Range True if browser support document.createRange native method.
         * @type {Boolean}
         */
        {
            identity: 'Range',
            fn: function() {
                return !!document.createRange;
            }
        },
        /**
         * @property CreateContextualFragment True if browser support CreateContextualFragment range native methods.
         * @type {Boolean}
         */
        {
            identity: 'CreateContextualFragment',
            fn: function() {
                var range = Ext.supports.Range ? document.createRange() : false;

                return range && !!range.createContextualFragment;
            }
        },

        /**
         * @property WindowOnError True if browser supports window.onerror.
         * @type {Boolean}
         */
        {
            identity: 'WindowOnError',
            fn: function () {
                // sadly, we cannot feature detect this...
                return Ext.isIE || Ext.isGecko || Ext.webKitVersion >= 534.16; // Chrome 10+
            }
        },

        /**
         * @property TextAreaMaxLength True if the browser supports maxlength on textareas.
         * @type {Boolean}
         */
        {
            identity: 'TextAreaMaxLength',
            fn: function(){
                var el = document.createElement('textarea');
                return ('maxlength' in el);
            }
        },
        /**
         * @property GetPositionPercentage True if the browser will return the left/top/right/bottom
         * position as a percentage when explicitly set as a percentage value.
         * @type {Boolean}
         */
        // Related bug: https://bugzilla.mozilla.org/show_bug.cgi?id=707691#c7
        {
            identity: 'GetPositionPercentage',
            fn: function(doc, div){
               return getStyle(div.childNodes[2], 'left') == '10%';
            }
        }
    ]
};
}());

Ext.supports.init(); // run the "early" detections now

