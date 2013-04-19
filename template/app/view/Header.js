/**
 * Renders the title of the docs app (extracted from "header-content" div).
 *
 * When `Docs.otherProducts` is defined, also renders the menu with
 * links to these other products.
 */
Ext.define('Docs.view.Header', {
    extend: 'Ext.button.Button',
    alias: 'widget.docheader',

    contentEl: 'header-content-menu',

    width: 150,
    height: 23,
    textAlign: 'left',
    border: 2,

    initComponent: function() {
        this.text = Ext.getDom('header-content-menu').textContent;
        if (Docs.otherProducts) {
            this.style = "cursor: 'pointer';";
            this.cls = 'dropdown';
            this.menu = Ext.create('Ext.menu.Menu', {
                renderTo: Ext.getBody(),
                id: 'doc-site-menu',
                width: 120,
                plain: true, 
                items: Docs.otherProducts
            });
        }

        this.callParent();
    },

    listeners: {
        afterrender: function(cmp) {
            if (this.menu) {
                cmp.el.addListener('mouseover', function(cmp, el) {
                    this.menu.showBy(this.el, 't-b');
                }, this);
                this.menu.addListener('mouseleave', function(cmp, el) {
                    this.menu.hide();
                }, this);
            }
        }
    }
});
