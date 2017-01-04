/**
 * Renders the title of the docs app (extracted from "header-content" div).
 *
 * When `Docs.otherProducts` is defined, also renders the menu with
 * links to these other products.
 */
Ext.define('Docs.view.Header', {
    extend: 'Ext.container.Container',
    alias: 'widget.docheader',
    initComponent: function() {
        if (Docs.otherProducts) {
            var dropMenu = Ext.create('Ext.menu.Menu', {
                renderTo: Ext.getBody(),
                id: 'doc-site-menu',
                width: 180,
                plain: true, 
                items: Docs.otherProducts
            });
            var button = Ext.create('Ext.button.Button', {
                text: Ext.getDom('header-content-menu').textContent,
                menu: dropMenu,
                width: 200,
                height: 23,
                border: 2,
                cls: 'dropdown',
                textAlign: 'left',
                listeners: {
                    afterrender: function(cmp) {
                        cmp.el.addListener('mouseover', function(cmp, el) {
                            this.menu.showBy(this.el, 't-b');
                        }, this);
                        this.menu.addListener('mouseleave', function(cmp, el) {
                            this.menu.hide();
                        }, this);
                    }
                }
            })
            this.items = [button];
        } else {
            var label = Ext.create('Ext.form.Label', {
                text: Ext.getDom('header-content-menu').textContent,
                cls: 'x-btn-inner'
            });
            this.margin = '15 0 0 0';
            this.items = [label];
        }
        this.callParent();
    }
});
