Ext.require([
    'Ext.data.*',
    'Ext.form.*'
]);

Ext.onReady(function(){

    Ext.define("Post", {
        extend: 'Ext.data.Model',
        proxy: {
            type: 'jsonp',
            url : 'http://www.sencha.com/forum/topics-remote.php',
            reader: {
                type: 'json',
                root: 'topics',
                totalProperty: 'totalCount'
            }
        },

        fields: [
            {name: 'id', mapping: 'post_id'},
            {name: 'title', mapping: 'topic_title'},
            {name: 'topicId', mapping: 'topic_id'},
            {name: 'author', mapping: 'author'},
            {name: 'lastPost', mapping: 'post_time', type: 'date', dateFormat: 'timestamp'},
            {name: 'excerpt', mapping: 'post_text'}
        ]
    });

    ds = Ext.create('Ext.data.Store', {
        pageSize: 10,
        model: 'Post'
    });

    panel = Ext.create('Ext.panel.Panel', {
        renderTo: Ext.getBody(),
        title: 'Search the Ext Forums',
        width: 600,
        bodyPadding: 10,
        layout: 'anchor',

        items: [{
            xtype: 'combo',
            store: ds,
            displayField: 'title',
            typeAhead: false,
            hideLabel: true,
            hideTrigger:true,
            anchor: '100%',

            listConfig: {
                loadingText: 'Searching...',
                emptyText: 'No matching posts found.',

                // Custom rendering template for each item
                getInnerTpl: function() {
                    return '<a class="search-item" href="http://www.sencha.com/forum/showthread.php?t={topicId}&p={id}">' +
                        '<h3><span>{[Ext.Date.format(values.lastPost, "M j, Y")]}<br />by {author}</span>{title}</h3>' +
                        '{excerpt}' +
                    '</a>';
                }
            },
            pageSize: 10
        }, {
            xtype: 'component',
            style: 'margin-top:10px',
            html: 'Live search requires a minimum of 4 characters.'
        }]
    });
});