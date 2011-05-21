Ext.define('Docs.view.clsTree.History', {
    	
	extend: 'Ext.Component',
	alias: 'widget.docshistorybutton',

	id: 'historyBtn',
	html: '<span></span>History',
		
	afterRender: function() {
	    
        this.callParent(arguments);

        this.getEl().on({
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
            click: function(e) {
                console.log(arguments)
                if (e.getTarget(".close")) {                    
                    console.log("Close");
                } else {
                    this.hoverMenu.hide();                    
                }
                e.preventDefault();
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
