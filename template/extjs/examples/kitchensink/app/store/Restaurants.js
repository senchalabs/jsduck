Ext.define('KitchenSink.store.Restaurants', {
    extend: 'Ext.data.Store',
    model: 'KitchenSink.model.Restaurant',
    
    storeId: 'restaraunts',
    groupField: 'cuisine',
    sorters: [
        { property: 'cuisine',  direction: 'DESC' },
        'name'
    ],
    
    data: [
        { description: getDescription(), rating: Math.random() * 5, name: 'Cheesecake Factory', cuisine: 'American' },
        { description: getDescription(), rating: Math.random() * 5, name: 'University Cafe', cuisine: 'American' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Slider Bar', cuisine: 'American' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Shokolaat', cuisine: 'American' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Gordon Biersch', cuisine: 'American' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Crepevine', cuisine: 'American' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Creamery', cuisine: 'American' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Old Pro', cuisine: 'American' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Nola\'s', cuisine: 'Cajun' },
        { description: getDescription(), rating: Math.random() * 5, name: 'House of Bagels', cuisine: 'Bagels' },
        { description: getDescription(), rating: Math.random() * 5, name: 'The Prolific Oven', cuisine: 'Sandwiches' },
        { description: getDescription(), rating: Math.random() * 5, name: 'La Strada', cuisine: 'Italian' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Buca di Beppo', cuisine: 'Italian' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Pasta?', cuisine: 'Italian' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Madame Tam', cuisine: 'Asian' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Sprout Cafe', cuisine: 'Salad' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Pluto\'s', cuisine: 'Salad' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Junoon', cuisine: 'Indian' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Bistro Maxine', cuisine: 'French' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Three Seasons', cuisine: 'Vietnamese' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Sancho\'s Taquira', cuisine: 'Mexican' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Reposado', cuisine: 'Mexican' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Siam Royal', cuisine: 'Thai' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Krung Siam', cuisine: 'Thai' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Thaiphoon', cuisine: 'Thai' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Tamarine', cuisine: 'Vietnamese' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Joya', cuisine: 'Tapas' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Jing Jing', cuisine: 'Chinese' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Patxi\'s Pizza', cuisine: 'Pizza' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Evvia Estiatorio', cuisine: 'Mediterranean' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Cafe 220', cuisine: 'Mediterranean' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Cafe Renaissance', cuisine: 'Mediterranean' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Kan Zeman', cuisine: 'Mediterranean' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Gyros-Gyros', cuisine: 'Mediterranean' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Mango Caribbean Cafe', cuisine: 'Caribbean' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Coconuts Caribbean Restaurant &amp; Bar', cuisine: 'Caribbean' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Rose &amp; Crown', cuisine: 'English' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Baklava', cuisine: 'Mediterranean' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Mandarin Gourmet', cuisine: 'Chinese' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Bangkok Cuisine', cuisine: 'Thai' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Darbar Indian Cuisine', cuisine: 'Indian' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Mantra', cuisine: 'Indian' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Janta', cuisine: 'Indian' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Hyderabad House', cuisine: 'Indian' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Starbucks', cuisine: 'Coffee' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Peet\'s Coffee', cuisine: 'Coffee' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Coupa Cafe', cuisine: 'Coffee' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Lytton Coffee Company', cuisine: 'Coffee' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Il Fornaio', cuisine: 'Italian' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Lavanda', cuisine: 'Mediterranean' },
        { description: getDescription(), rating: Math.random() * 5, name: 'MacArthur Park', cuisine: 'American' },
        { description: getDescription(), rating: Math.random() * 5, name: 'St Michael\'s Alley', cuisine: 'Californian' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Cafe Renzo', cuisine: 'Italian' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Osteria', cuisine: 'Italian' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Vero', cuisine: 'Italian' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Cafe Renzo', cuisine: 'Italian' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Miyake', cuisine: 'Sushi' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Sushi Tomo', cuisine: 'Sushi' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Kanpai', cuisine: 'Sushi' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Pizza My Heart', cuisine: 'Pizza' },
        { description: getDescription(), rating: Math.random() * 5, name: 'New York Pizza', cuisine: 'Pizza' },
        { description: getDescription(), rating: Math.random() * 5, name: 'California Pizza Kitchen', cuisine: 'Pizza' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Round Table', cuisine: 'Pizza' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Loving Hut', cuisine: 'Vegan' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Garden Fresh', cuisine: 'Vegan' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Cafe Epi', cuisine: 'French' },
        { description: getDescription(), rating: Math.random() * 5, name: 'Tai Pan', cuisine: 'Chinese' }
    ]
});

function getDescription(){
    var description;
    if (!getDescription.description) {
        getDescription.description = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.".split(/[\W]+/);
    }
    description = getDescription.description.sort(randomSorter);
    return description.join(' ');
}
function randomSorter(a,b) {
    return 0.5 - Math.random();
}
