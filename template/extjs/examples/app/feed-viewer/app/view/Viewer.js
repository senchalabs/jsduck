Ext.define('FV.view.Viewer', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.viewer',
    
    requires: ['FV.view.feed.Show'],
    
    activeItem: 0,
    margins: '5 5 5 5',
    
    cls: 'preview',
    
    initComponent: function() {
        this.items = [{
            xtype: 'feedshow',
            title: 'Sencha Blog'
        }];
        
        this.callParent(arguments);
    }
});