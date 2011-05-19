/**
 * The documentation panel.
 * TODO: Source code tab, Examples, Q&A
 */
Ext.define('Docs.view.class.Panel', {
    extend: 'Ext.tab.Panel',

    id: 'docTabPanel',
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
        }
    },

    initComponent: function() {
        this.items = [
            Ext.create('Docs.view.class.Overview', {
                docClass: this.docClass
            })
        ];

        this.callParent(arguments);
    }
});
