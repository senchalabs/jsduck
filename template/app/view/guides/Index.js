Ext.define('Docs.view.guides.Index', {
    extend: 'Ext.container.Container',
    alias : 'widget.guideindex',
    cls: 'class-list',

    initComponent: function() {
        this.tpl = new Ext.XTemplate(
            '<div class="section guides">',
                '<h1>Guides</h1>',
                '{guides}',
            '</div>'
        );

        var guideData = Ext.get("guides-content");
        this.data = { guides: guideData.dom.innerHTML };
        guideData.remove();

        this.callParent(arguments);
    }

});

