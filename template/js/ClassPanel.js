Ext.define('Docs.ClassPanel', {
    extend: 'Ext.tab.Panel',

    id: 'docTabPanel',
    renderTo: 'docContent',

    style: 'border-color: #bfbfbf;',
    plain: true,

    // Remember tab scroll position on Webkit
    listeners: {
        beforetabchange: function(tabPanel, newCard, oldCard) {
            oldCard.prevScroll = oldCard.body.getScroll()['top'];
        },
        tabchange: function(tabPanel, newCard, oldCard) {
            if (newCard.prevScroll) {
                newCard.body.scrollTo('top', newCard.prevScroll);
            }
        },
        afterrender: function() {
            resizeWindowFn();
        }
    },

    initComponent: function() {
        this.height = Ext.get('docContent').getHeight() - 55;
        this.items = [ Ext.create('Docs.OverviewPanel') ];
        this.callParent(arguments);
    }
});
