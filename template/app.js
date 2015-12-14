Ext.ns("Docs");

Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'Docs': 'app'
    }
});

// Avoid downloading spacer gif from sencha.com in older IE-s.
if (Ext.isIE6 || Ext.isIE7) {
    Ext.BLANK_IMAGE_URL = 'resources/images/s.gif';
}

Ext.require('Ext.form.field.Trigger');
Ext.require('Ext.tab.Panel');
Ext.require('Ext.grid.column.Action');
Ext.require('Ext.grid.plugin.DragDrop');
Ext.require('Ext.layout.container.Border');
Ext.require('Ext.data.TreeStore');
Ext.require('Ext.toolbar.Spacer');

// The following is exactly what Ext.application() function does, but
// we use our own Application class that extends Ext.app.Application

Ext.require('Docs.Application');

Ext.onReady(function() {
    Ext.create('Docs.Application');
});
