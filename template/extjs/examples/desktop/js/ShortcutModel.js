/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

/**
 * @class Ext.ux.desktop.ShortcutModel
 * @extends Ext.data.Model
 * This model defines the minimal set of fields for desktop shortcuts.
 */
Ext.define('Ext.ux.desktop.ShortcutModel', {
    extend: 'Ext.data.Model',
    fields: [
       { name: 'name' },
       { name: 'iconCls' },
       { name: 'module' }
    ]
});
