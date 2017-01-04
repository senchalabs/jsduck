/**
 * The AbstractPlugin class is the base class from which user-implemented plugins should inherit.
 *
 * This class defines the essential API of plugins as used by Components by defining the following methods:
 *
 *   - `init` : The plugin initialization method which the owning Component calls at Component initialization time.
 *
 *     The Component passes itself as the sole parameter.
 *
 *     Subclasses should set up bidirectional links between the plugin and its client Component here.
 *
 *   - `destroy` : The plugin cleanup method which the owning Component calls at Component destruction time.
 *
 *     Use this method to break links between the plugin and the Component and to free any allocated resources.
 *
 *   - `enable` : The base implementation just sets the plugin's `disabled` flag to `false`
 *
 *   - `disable` : The base implementation just sets the plugin's `disabled` flag to `true`
 */
Ext.define('Ext.AbstractPlugin', {
    disabled: false,

    constructor: function(config) {
        this.initialConfig = config;
        Ext.apply(this, config);
    },

    clone: function() {
        return new this.self(this.initialConfig);
    },

    getCmp: function() {
        return this.cmp;
    },

    /**
     * @cfg {String} pluginId
     * A name for the plugin that can be set at creation time to then retrieve the plugin
     * through {@link Ext.AbstractComponent#getPlugin getPlugin} method.  For example:
     *
     *     var grid = Ext.create('Ext.grid.Panel', {
     *         plugins: [{
     *             ptype: 'cellediting',
     *             clicksToEdit: 2,
     *             pluginId: 'cellplugin'
     *         }]
     *     });
     *
     *     // later on:
     *     var plugin = grid.getPlugin('cellplugin');
     */

    /**
     * @method
     * The init method is invoked after initComponent method has been run for the client Component.
     *
     * The supplied implementation is empty. Subclasses should perform plugin initialization, and set up bidirectional
     * links between the plugin and its client Component in their own implementation of this method.
     * @param {Ext.Component} client The client Component which owns this plugin.
     */
    init: Ext.emptyFn,

    /**
     * @method
     * The destroy method is invoked by the owning Component at the time the Component is being destroyed.
     *
     * The supplied implementation is empty. Subclasses should perform plugin cleanup in their own implementation of
     * this method.
     */
    destroy: Ext.emptyFn,

    /**
     * The base implementation just sets the plugin's `disabled` flag to `false`
     *
     * Plugin subclasses which need more complex processing may implement an overriding implementation.
     */
    enable: function() {
        this.disabled = false;
    },

    /**
     * The base implementation just sets the plugin's `disabled` flag to `true`
     *
     * Plugin subclasses which need more complex processing may implement an overriding implementation.
     */
    disable: function() {
        this.disabled = true;
    }
});