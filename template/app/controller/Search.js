Ext.define('Docs.controller.Search', {
    extend: 'Ext.app.Controller',

    views: [
        'search.Dropdown'
    ],

    init: function() {
        
        this.control({
            '#treePanelCmp': {
                itemclick: this.treeItemClick
            }
        });
    },

    handleClick: function(curItem) {
        curItem = curItem || panel.getSelectionModel().getLastSelected();
        var cls = curItem.data.cls;
        if (curItem.data.type != 'cls') {
            cls += '-' + curItem.data.type + '-' + curItem.data.member;
        }
        panel.hide();
        Docs.controller.Classes.loadClass(cls);
    }
    
    // listeners: {
    //     itemclick: function(panel, item) {
    //         this.handleClick(item);
    //     }
    // }

});
