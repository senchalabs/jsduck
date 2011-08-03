Ext.define('Docs.view.guides.Index', {
    extend: 'Ext.container.Container',
    alias : 'widget.guideindex',
    cls: 'class-list iScroll',
    margin: '15 10',

    initComponent: function() {
        this.tpl = new Ext.XTemplate(
            '<h1 class="top" style="padding-bottom: 10px;">Guides</h1>',
            '<div class="section guides">',
                '{guides}',
            '</div>'
        );

        var guideData = Ext.get("guides-content");
        this.data = { guides: guideData.dom.innerHTML };
        guideData.remove();

        this.callParent(arguments);
    }

});

