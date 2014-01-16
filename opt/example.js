/**
 * An example class showcasing the features of JSDuck.
 *
 * **Markdown** is supported thoughout the [docs][1].
 *
 * Link to {@link Ext.form.field.Text external class} and
 * {@link Ext.form.field.Text#reset its method}.
 * Link to {@link #setSize method of this class}.
 *
 * {@img some/path.png Alt text}
 *
 * An embedded live example:
 *
 *     @example
 *     Ext.create('Ext.master.Switch', {
 *         text: 'Click me, please!',
 *         handler: function() {
 *             alert('You clicked me!')
 *         }
 *     });
 *
 * **Note:** this is not a fully working example. When you run it
 * through JSDuck you will get warnings about a lot of missing classes
 * that this example class references, additionally it doesn't make
 * sense for singleton class to have static methods.
 *
 * [1]: http://docs.sencha.com/ext-js/4.0/
 */
Ext.define('Ext.master.Switch', {
    // These are all detected automatically
    // No need to use @extends, @alternateClassName, @mixin, @alias, @singleton
    extend: 'Ext.button.Button',
    alternateClassName: 'Ext.MasterSwitch',
    mixins: {
        observable: 'Ext.util.Observable',
        floating: 'Ext.util.Floating'
    },
    alias: 'widget.masterswitch',
    singleton: true,

    /**
     * @cfg {String} [text="Click Me!"]
     * A config option with explicit type, name, and default value.
     */

    config: {
        /**
         * A config option with type, name, and default value
         * auto-detected.  Additionally docs for getIcon and setIcon
         * accessor methods are generated.
         */
        icon: "some/file.png",

        // A private config option of boolean type.
        open: true
    },

    /**
     * @cfg {String} name (required)
     * A very importand config option that must be specified.
     */

    /**
     * @property {Object} size
     * A property with explicit type name and name.
     * It's an object containing the following fields:
     * @property {Number} size.width The width.
     * @property {Number} size.height The height.
     */

    /**
     * A property with auto-detected type and name.
     */
    disabled: false,

    // A private property
    cache: {},

    /**
     * Constructor documentation.
     * @param {Object} [cfg] An optional config object
     */
    constructor: function(cfg) {
        Ext.apply(this, cfg || {});
        this.addEvents(
            /**
             * @event
             * Fired when button clicked.
             * @param {Ext.master.Switch} this
             * @param {Number} times The number of times clicked.
             */
            "click"
        );
    },

    /**
     * Sets the size.
     * @param {Object} size An object describing width and height:
     * @param {Number} [size.width=0] The width.
     * @param {Number} [size.height=0] The height.
     */
    setSize: function(size) {
        this.size = size;
    },

    /**
     * Returns the size of component.
     * @return {Object} Object with properties:
     * @return {Number} return.width The width.
     * @return {Number} return.height The height.
     * @method
     */
    getSize: (function() {
        return function() { return this.size; };
    })(),

    statics: {
        /**
         * A method documented as static.
         * @param {Function} fn Callback function.
         * @param {Ext.Component} fn.cmp The component parameter.
         * @param {Number} fn.index Component index parameter.
         * @param {Boolean} fn.return The return value of callback
         * must be true to include the component, false to exclude.
         * @param {Object} scope Scope for the callback.
         * @return {Ext.Component[]} Array of components.
         */
        filter: function(fn, scope) {
            return this.items.filter(fn, scope);
        }
    },

    inheritableStatics: {
        /**
         * A static method that gets inherited by subclasses.
         */
        doSomething: function() {
        }
    },

    // A private method
    // One can also use tags inside here.
    // @return {Ext.master.Switch} this
    // @chainable
    highlight: function() {
        return this;
    }
});

Ext.apply(Ext, {
    /**
     * A method belonging to Ext.
     * @member Ext
     * @method
     * @inheritdoc Ext.master.Switch#setSize
     */
    setMasterSwitchSize: Ext.master.Switch.setSize
});
