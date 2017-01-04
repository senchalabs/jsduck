Ext.require(['Ext.data.*', 'Ext.grid.*']);
Ext.onReady(function() {
    // wrapped in closure to prevent global vars.
    Ext.define('Restaurant', {
        extend: 'Ext.data.Model',
        fields: ['name', 'cuisine']
    });

    var restaurants = Ext.create('Ext.data.Store', {
        storeId: 'restaraunts',
        model: 'Restaurant',
        groupField: 'cuisine',
        sorters: ['cuisine','name'],
        data: [{
            name: 'Cheesecake Factory',
            cuisine: 'American'
        },{
            name: 'University Cafe',
            cuisine: 'American'
        },{
            name: 'Slider Bar',
            cuisine: 'American'
        },{
            name: 'Shokolaat',
            cuisine: 'American'
        },{
            name: 'Gordon Biersch',
            cuisine: 'American'
        },{
            name: 'Crepevine',
            cuisine: 'American'
        },{
            name: 'Creamery',
            cuisine: 'American'
        },{
            name: 'Old Pro',
            cuisine: 'American'
        },{
            name: 'Nola\'s',
            cuisine: 'Cajun'
        },{
            name: 'House of Bagels',
            cuisine: 'Bagels'
        },{
            name: 'The Prolific Oven',
            cuisine: 'Sandwiches'
        },{
            name: 'La Strada',
            cuisine: 'Italian'
        },{
            name: 'Buca di Beppo',
            cuisine: 'Italian'
        },{
            name: 'Pasta?',
            cuisine: 'Italian'
        },{
            name: 'Madame Tam',
            cuisine: 'Asian'
        },{
            name: 'Sprout Cafe',
            cuisine: 'Salad'
        },{
            name: 'Pluto\'s',
            cuisine: 'Salad'
        },{
            name: 'Junoon',
            cuisine: 'Indian'
        },{
            name: 'Bistro Maxine',
            cuisine: 'French'
        },{
            name: 'Three Seasons',
            cuisine: 'Vietnamese'
        },{
            name: 'Sancho\'s Taquira',
            cuisine: 'Mexican'
        },{
            name: 'Reposado',
            cuisine: 'Mexican'
        },{
            name: 'Siam Royal',
            cuisine: 'Thai'
        },{
            name: 'Krung Siam',
            cuisine: 'Thai'
        },{
            name: 'Thaiphoon',
            cuisine: 'Thai'
        },{
            name: 'Tamarine',
            cuisine: 'Vietnamese'
        },{
            name: 'Joya',
            cuisine: 'Tapas'
        },{
            name: 'Jing Jing',
            cuisine: 'Chinese'
        },{
            name: 'Patxi\'s Pizza',
            cuisine: 'Pizza'
        },{
            name: 'Evvia Estiatorio',
            cuisine: 'Mediterranean'
        },{
            name: 'Cafe 220',
            cuisine: 'Mediterranean'
        },{
            name: 'Cafe Renaissance',
            cuisine: 'Mediterranean'
        },{
            name: 'Kan Zeman',
            cuisine: 'Mediterranean'
        },{
            name: 'Gyros-Gyros',
            cuisine: 'Mediterranean'
        },{
            name: 'Mango Caribbean Cafe',
            cuisine: 'Caribbean'
        },{
            name: 'Coconuts Caribbean Restaurant &amp; Bar',
            cuisine: 'Caribbean'
        },{
            name: 'Rose &amp; Crown',
            cuisine: 'English'
        },{
            name: 'Baklava',
            cuisine: 'Mediterranean'
        },{
            name: 'Mandarin Gourmet',
            cuisine: 'Chinese'
        },{
            name: 'Bangkok Cuisine',
            cuisine: 'Thai'
        },{
            name: 'Darbar Indian Cuisine',
            cuisine: 'Indian'
        },{
            name: 'Mantra',
            cuisine: 'Indian'
        },{
            name: 'Janta',
            cuisine: 'Indian'
        },{
            name: 'Hyderabad House',
            cuisine: 'Indian'
        },{
            name: 'Starbucks',
            cuisine: 'Coffee'
        },{
            name: 'Peet\'s Coffee',
            cuisine: 'Coffee'
        },{
            name: 'Coupa Cafe',
            cuisine: 'Coffee'
        },{
            name: 'Lytton Coffee Company',
            cuisine: 'Coffee'
        },{
            name: 'Il Fornaio',
            cuisine: 'Italian'
        },{
            name: 'Lavanda',
            cuisine: 'Mediterranean'
        },{
            name: 'MacArthur Park',
            cuisine: 'American'
        },{
            name: 'St Michael\'s Alley',
            cuisine: 'Californian'
        },{
            name: 'Osteria',
            cuisine: 'Italian'
        },{
            name: 'Vero',
            cuisine: 'Italian'
        },{
            name: 'Cafe Renzo',
            cuisine: 'Italian'
        },{
            name: 'Miyake',
            cuisine: 'Sushi'
        },{
            name: 'Sushi Tomo',
            cuisine: 'Sushi'
        },{
            name: 'Kanpai',
            cuisine: 'Sushi'
        },{
            name: 'Pizza My Heart',
            cuisine: 'Pizza'
        },{
            name: 'New York Pizza',
            cuisine: 'Pizza'
        },{
            name: 'California Pizza Kitchen',
            cuisine: 'Pizza'
        },{
            name: 'Round Table',
            cuisine: 'Pizza'
        },{
            name: 'Loving Hut',
            cuisine: 'Vegan'
        },{
            name: 'Garden Fresh',
            cuisine: 'Vegan'
        },{
            name: 'Cafe Epi',
            cuisine: 'French'
        },{
            name: 'Tai Pan',
            cuisine: 'Chinese'
        }],
        listeners: {
            groupchange: function(store, groupers) {
                var grouped = restaurants.isGrouped(),
                    groupBy = groupers.items[0] ? groupers.items[0].property : '',
                    toggleMenuItems, len, i = 0;

                // Clear grouping button only valid if the store is grouped
                grid.down('[text=Clear Grouping]').setDisabled(!grouped);
                
                // Sync state of group toggle checkboxes
                if (grouped && groupBy === 'cuisine') {
                    toggleMenuItems = grid.down('button[text=Toggle groups...]').menu.items.items;
                    for (len = toggleMenuItems.length; i < len; i++) {
                        toggleMenuItems[i].setChecked(groupingFeature.isExpanded(toggleMenuItems[i].text));
                    }
                    grid.down('[text=Toggle groups...]').enable();
                } else {
                    grid.down('[text=Toggle groups...]').disable();
                }
            }
        }
    });

    var groupingFeature = Ext.create('Ext.grid.feature.Grouping', {
            groupHeaderTpl: '{columnName}: {name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})',
            hideGroupedHeader: true,
            startCollapsed: true,
            id: 'restaurantGrouping'
        }),
        groups = restaurants.getGroups(),
        len = groups.length, i = 0,
        toggleMenu = [],
        toggleGroup = function(item) {
            var groupName = item.text;
            if (item.checked) {
                groupingFeature.expand(groupName, true);
            } else {
                groupingFeature.collapse(groupName, true);
            }
        };

    // Create checkbox menu items to toggle associated groupd
    for (; i < len; i++) {
        toggleMenu[i] = {
            xtype: 'menucheckitem',
            text: groups[i].name,
            handler: toggleGroup
        }
    }

    var grid = Ext.create('Ext.grid.Panel', {
        renderTo: Ext.getBody(),
        collapsible: true,
        iconCls: 'icon-grid',
        frame: true,
        store: restaurants,
        width: 600,
        height: 400,
        title: 'Restaurants',
        resizable: true,
        features: [groupingFeature],
        tbar: ['->', {
            text: 'Toggle groups...',
            menu: toggleMenu
        }],
    
        // Keep checkbox menu items in sync with expand/collapse
        viewConfig: {
            listeners: {
                groupcollapse: function(v, n, groupName) {
                    if (!grid.down('[text=Toggle groups...]').disabled) {
                        grid.down('menucheckitem[text=' + groupName + ']').setChecked(false, true);
                    }
                },
                groupexpand: function(v, n, groupName) {
                    if (!grid.down('[text=Toggle groups...]').disabled) {
                        grid.down('menucheckitem[text=' + groupName + ']').setChecked(true, true);
                    }
                }
            }
        },
        columns: [{
            text: 'Name',
            flex: 1,
            dataIndex: 'name'
        },{
            text: 'Cuisine',
            flex: 1,
            dataIndex: 'cuisine'
        }],
        fbar  : ['->', {
            text:'Clear Grouping',
            iconCls: 'icon-clear-group',
            handler : function() {
                groupingFeature.disable();
            }
        }]
    });
});
