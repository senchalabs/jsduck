Ext.define('Docs.view.clsTree.History', {
	
	extend: 'Ext.button.Button',
	alias: 'widget.docshistorybutton',
	id: 'historyBtn',
	
	text: 'History',
	
	afterRender: function() {
	    
        this.on({
            mouseover: function() {
                
                if (!this.hoverMenu) {
                    this.renderMenu();
                }
                
                this.hoverMenu.show();
                clearTimeout(this.hideTimeout);
    	    },
            mouseout: this.deferHideMenu,
            scope: this
        });

	},
	
    renderMenu: function() {
        
        this.hoverMenu = Ext.create('Docs.view.clsTree.HistoryItems', {
            store: Docs.App.getStore('History')
        });
        
        this.hoverMenu.getEl().setVisibilityMode(Ext.core.Element.DISPLAY);
        
        this.hoverMenu.getEl().on({
            mouseover: function() {
                clearTimeout(this.hideTimeout);
            },
            mouseout: this.deferHideMenu,
            click: function() {
                this.hoverMenu.hide();
            },
            scope: this
        });
        
        var p = this.getEl().getXY();
        this.hoverMenu.getEl().setStyle({
            left: "35px",
            top: (p[1]+23)+"px"
        });
    },

    deferHideMenu: function() {
        this.hideTimeout = Ext.Function.defer(function() {
            this.hoverMenu.hide();
        }, 200, this);
    }
});
