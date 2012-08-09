/**
 * Renders search results list.
 */
Ext.define('Docs.view.search.Container', {
    extend: 'Ext.container.Container',
    alias: 'widget.searchcontainer',
    requires: 'Docs.view.search.Dropdown',

    initComponent: function() {

        if (Docs.data.search.length) {

            this.cls = 'search';

            this.items = [
                {
                    xtype: 'triggerfield',
                    triggerCls: 'reset',
                    emptyText: 'Search',
                    width: 170,
                    id: 'search-field',
                    enableKeyEvents: true,
                    hideTrigger: true,
                    onTriggerClick: function() {
                        this.reset();
                        this.focus();
                        this.setHideTrigger(true);
                        Ext.getCmp('search-dropdown').hide();
                    }
                },
                {
                    xtype: 'searchdropdown'
                }
            ];
        }

        this.callParent();
    }
});
