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
 * [1]: http://docs.sencha.com/ext-js/4.0/
 *
 * @author Rene Saarsoo <rene@example.com>
 * @docauthor John Smith <john@example.com>
 */
Ext.define('Ext.master.Switch', {
    // These are all detected automatically
    // No need to use @extends, @alternateClassName, @mixin, @singleton
    extend: 'Ext.button.Button',
    alternateClassName: 'Ext.MasterSwitch',
    mixins: {
        observable: 'Ext.util.Observable',
        floating: 'Ext.util.Floating'
    },
    singleton: true,

    // The same as: @xtype masterswitch
    alias: 'widget.masterswitch',

    /**
     * @cfg {String} [text="Click Me!"]
     * A config option with explicit type, name, and default value.
     */

    /**
     * @cfg
     * A config option with type (String), name (icon), and default value
     * ("some/file.png") auto-detected.
     */
    icon: "some/file.png",

    /**
     * @cfg {String} name (required)
     * A very importand config option that must be specified.
     */

    /**
     * @property {Object} size
     * A property with explicit type name and name.
     * An object containing the following fields:
     * @property {Number} size.width The width.
     * @property {Number} size.height The height.
     */

    /**
     * @property
     * A property with auto-detected type (Boolean) and name (disabled).
     */
    disabled: false,

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
             */
            "click"
        );
    },

    /**
     * Sets the size.
     * @param {Object} size An object describing width and height.
     * If either of them is left unspecified, it defaults to `0`.
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
         * Filters out subcomponents.
         * @param {Function} fn Callback function.
         * @param {Ext.Component} fn.cmp The component.
         * @param {Number} fn.index Component index.
         * @param {Boolean} fn.return True to include the component, false to exclude.
         * @param {Object} scope Scope for the callback.
         * @return {Ext.Component[]} Array of components.
         * @static
         */
        filter: function(fn, scope) {
            return this.items.filter(fn, scope);
        }
    },

    inheritableStatics: {
        /**
         * Achieves something.
         * @static
         * @inheritable
         */
        doSomething: function() {
        }
    }
});

Ext.apply(Ext, {
    /**
     * A method belonging to Ext.
     * @member Ext
     * @alias Ext.master.Switch#setSize
     */
    setMasterSwitchSize: Ext.master.Switch.setSize
});
