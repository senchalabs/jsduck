/**
 * Container for guides listing.
 */
Ext.define('Docs.view.guides.Index', {
    extend: 'Ext.container.Container',
    alias: 'widget.guideindex',
    requires: [
        'Docs.view.ThumbList'
    ],

    cls: 'all-demos iScroll',
    margin: '10 0 0 0',
    autoScroll: true,

    initComponent: function() {
        var catalog = Docs.guides;

        Ext.Array.forEach(catalog, function(c, i) {
            c.id = 'sample-' + i;
        });

        var store = Ext.create('Ext.data.JsonStore', {
            idProperty: 'url',
            fields: ['id', 'title', 'items'],
            data: catalog
        });

        this.items = [
            { xtype: 'container', html: '<h1 class="eg">Guides</h1>' },
            Ext.create('Docs.view.ThumbList', {
                itemTpl: [
                    '<dd ext:url="guide/{name}"><img src="guides/{name}/icon-lg.png"/>',
                        '<div><h4>{title}</h4><p>{description}</p></div>',
                    '</dd>'
                ],
                store: store
            })
        ];

        this.callParent(arguments);
    }
});

Docs.guides = [
    {
        title: 'Official Ext JS 4.0 Guides',
        items: [
            {
                "name": "getting_started",
                "title": "Getting Started with Ext JS 4",
                "description": "This introduction to Ext JS 4 explains how you can get started with creating your first application."
            },
            {
                "name": "class_system",
                "title": "The Class System",
                "description": "This manual is intended for any developer who wants to create new or extend existing classes with the new class system in Ext JS 4.x."
            },
            {
                "name": "application_architecture",
                "title": "The MVC Application Architecture",
                "description": "Ext JS 4 comes with a new application architecture that not only organizes your code but reduces the amount you have to write."
            },
            {
                "name": "layouts_and_containers",
                "title": "Layouts and Containers",
                "description": "The layout system handles the sizing and positioning of every component in your application."
            },
            {
                "name": "data",
                "title": "The Data Package",
                "description": "The data package is what loads and saves all of the data in your application."
            },
            {
                "name": "grid",
                "title": "The Grid Component",
                "description": "The grid provides a great way to view lots of data at once, formatted exactly how you need it."
            },
            {
                "name": "tree",
                "title": "Trees",
                "description": "Tree and grid now both extend from the same base class. All of the benefits of grid can now be used on trees."
            },
            {
                "name": "drawing_and_charting",
                "title": "Drawing and Charting",
                "description": "The drawing and charting packages enable you to create cross browser and cross device graphics in a versatile way."
            },
            {
                "name": "forms",
                "title": "The Form Package",
                "description": "The Form package enables you to create powerful forms backed with the Ext Data package"
            },
            {
                "name": "components",
                "title": "Components",
                "description": "A simple example, and videos, about how to create components in Ext JS."
            },
            {
                "name": "theming",
                "title": "Theming",
                "description": "This guide explains how to use the theming system to customize the look and feel of your application."
            }
        ]
    }
];
