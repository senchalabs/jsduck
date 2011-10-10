Ext.define('Docs.view.Header', {
    extend: 'Ext.container.Container',
    alias: 'widget.docheader',

    contentEl: 'header-content',

    initComponent: function() {

        if (Docs.otherProducts) {
            this.style = 'cursor: pointer;',
            this.cls = 'dropdown';

            this.menu = Ext.create('Ext.menu.Menu', {
                renderTo: Ext.getBody(),
                plain: true,
                items: Docs.otherProducts
            });
        }

        this.callParent();
    },

    listeners: {
        afterrender: function(cmp) {
            if (this.menu) {
                cmp.el.addListener('click', function(cmp, el) {
                    this.menu.showBy(this.el, 'bl', [120, 0]);
                }, this);
            }
        }
    }
});
