/**
 * @class Ext.ComponentManager
 * <p>Provides a registry of all Components (instances of {@link Ext.Component} or any subclass
 * thereof) on a page so that they can be easily accessed by {@link Ext.Component component}
 * {@link Ext.Component#id id} (see {@link #get}, or the convenience method {@link Ext#getCmp Ext.getCmp}).</p>
 * <p>This object also provides a registry of available Component <i>classes</i>
 * indexed by a mnemonic code known as the Component's {@link Ext.Component#xtype xtype}.
 * The <code>xtype</code> provides a way to avoid instantiating child Components
 * when creating a full, nested config object for a complete Ext page.</p>
 * <p>A child Component may be specified simply as a <i>config object</i>
 * as long as the correct <code>{@link Ext.Component#xtype xtype}</code> is specified so that if and when the Component
 * needs rendering, the correct type can be looked up for lazy instantiation.</p>
 * <p>For a list of all available <code>{@link Ext.Component#xtype xtypes}</code>, see {@link Ext.Component}.</p>
 * @singleton
 */
Ext.define('Ext.ComponentManager', {
    extend: 'Ext.AbstractManager',
    alternateClassName: 'Ext.ComponentMgr',
    
    singleton: true,
    
    typeName: 'xtype',
    
    /**
     * Creates a new Component from the specified config object using the
     * config object's xtype to determine the class to instantiate.
     * @param {Object} config A configuration object for the Component you wish to create.
     * @param {String} defaultType (optional) The xtype to use if the config object does not
     * contain a <code>xtype</code>. (Optional if the config contains a <code>xtype</code>).
     * @return {Ext.Component} The newly instantiated Component.
     */
    create: function(component, defaultType){
        if (typeof component == 'string') {
            return Ext.widget(component);
        }
        if (component.isComponent) {
            return component;
        }
        return Ext.widget(component.xtype || defaultType, component);
    },

    registerType: function(type, cls) {
        this.types[type] = cls;
        cls[this.typeName] = type;
        cls.prototype[this.typeName] = type;
    }
});