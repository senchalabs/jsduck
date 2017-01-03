# Editable Grid
______________________________________________

The {@link Ext.grid.Panel Grid} is a powerful way to display tabular data. It is an ideal solution for displaying dynamic data from a database. It can also allow users to edit the fields of the data displayed in the grid. Changes to the dataset can be easily saved back to the server. This guide describes how to create this functionality using Ext's MVC application architecture. If you're not familiar with this, then I recommend you checkout [the guide](link to MVC guide) about it for more details.

The example dataset we will be dealing with is the set of movies which Computer Geeks like. So we will call the demo app GeekFlicks.

## Setting up the Application

First, lets create a folder structure for our app as described in the [getting started guide](getting started link):

	GeekFlicks
		app/
			controller/
			model/
			store/
			view/
		extjs/

The extjs/ folder has the ExtJS 4 SDK (or a symlink to it). In the GeekFlicks folder, we create a index.html file with the following:


	<!doctype html>
	<html>
	  <head>
	    <meta charset="utf-8">
	    <title>Editable Grid</title>
	    <link rel="stylesheet" href="extjs/resources/css/ext-all.css">
	    <script src="extjs/ext-all-debug.js"></script>
	    <script>
	      Ext.Loader.setConfig({
	        enabled: true
	      });
	    </script>
	    <script type="text/javascript" src="app.js"> </script>
	  </head>
	  <body>

	  </body>
	</html>

I'm using the HTML5 recommended syntax here, though this is not necessary. Also, note that I have included 'ext-all-debug.js' not 'ext.js'. This ensures that all the Ext JS classes are available immediately after it is loaded, rather than loading them all dynamically, which is what would occur if you used 'ext.js' (or ext-debug.js). The grid does require a large number of classes, and this tends to slow down the initial page load, and clutter up the class list with a bunch of classes, which makes finding your own classes harder. However the MVC Application class does require the Loader to be enabled, and it is disabled by default when you use the 'ext-all' version. So I've manually re-enabled it here.

The app.js has this:

    Ext.application({
        name: "GeekFlicks",
        appFolder: "app",
        launch: function () {
            Ext.create('Ext.container.Viewport', {
                layout: 'fit',
                items: [{
                    xtype: 'panel',
                    title: 'Flicks for Geeks',
                    html: 'Add your favorite geeky movies'
                }]
            });
        }
    });

So, if you stick this on a webserver and navigate to it, you should see a panel with the title "Flicks for Geeks" and the text "Add your favorite geeky movies" beneath it. If not, check the console for errors.. perhaps something got misplaced. Now we still don't have a grid anywhere in sight, so lets remedy that.

### The View

Create a view for the editable grid in the 'views' folder, called 'Movies', with the following code :

	Ext.define('GeekFlicks.view.Movies', {
	    extend: 'Ext.grid.Panel',
	    id: "movies_editor",
	    alias: 'widget.movieseditor',
	    initComponent: function () {
			//hardcoded store with static data:
	        this.store = {
	            fields: ['title', 'year'],
	            data: [{
	                title: 'The Matrix',
	                year: '1999'
	            }, {
	                title: 'Star Wars: Return of the Jedi',
	                year: '1983'
	            }]
	        };
	        this.columns = [{
	            header: 'Title',
	            dataIndex: 'title',
	            flex: 1
	        }, {
	            header: 'Year',
	            dataIndex: 'year',
	            flex: 1
	        }];
	        this.callParent(arguments);
	    }
	});

This creates a new class called 'Movies' which extends the grid, and hardcodes some data in a store, which is simply declared inline. This will be refactored later, but is enough to get us going for now.

### The Controller

Lets now create the controller, in the 'controller' folder, as follows:

    Ext.define("GeekFlicks.controller.Movies", {
        extend: 'Ext.app.Controller',
		views: [
			'Movies'
		],
        init: function () {
            this.control({
                '#movies_editor': {
                    render: this.onEditorRender
                }
            });
        },

        onEditorRender: function () {
            console.log("movies editor was rendered");
        }
    });

This sets up a controller for the view we just created, by including it in the 'views' array.  The 'init()' method is automatically called by the Application when it starts. The 'control()' method adds the 'onEditorRender' event listener to the movies editor grid which was selected by the ComponentQuery expression '#movies_editor'. This is nice because it means the view does not have to know anything about the Controller (or the Model) and so it can potentially be reused in more than one context.

So now we have added a view, and a controller to listen for its events. We now need to tell the Application about them. Firstly, the view: we simply replace the hardcoded panel we had before with an item of the 'movieseditor' xtype, which will add the view. We also set the 'controllers' array to contain the 'Movies' controller.

	Ext.application({
	    name: "GeekFlicks",
	    appFolder: "app",
	    controllers: ['Movies'],
	    launch: function () {
	        Ext.create('Ext.container.Viewport', {
	            layout: 'fit',
	            items: [{
	                xtype: 'panel',
	                title: 'Top Geek Flicks of All Time',
	                items: [{
	                    xtype: 'movieseditor'
	                }]
	            }]
	        });
	    }
	});


Now, you should see the actual grid panel show up, with the data we hardcoded into the view. Next we will refactor, to make this data load dynamically.

### The Model

The Model element of the MVC trinity, consists of a few classes with specific responsibilities. They are as follows:

* The Model: defines the schema of the data (think of it as a data-model or object-model)
* The Store: stores records of data (which are defined by the Model)
* The Proxy: loads the Store from the server (or other storage) and saves changes

These are covered in more detail in the [data package guide](guide/data). So lets define our data, first by creating a Movie.js in the 'model' folder:

	Ext.define('GeekFlicks.model.Movie', {
	    extend: 'Ext.data.Model',
	    fields: [{
	        name: 'title',
	        type: 'string'
	    }, {
	        name: 'year',
	        type: 'int'
	    }]
	});

Then, in store/Movies.js, add the following:

	Ext.define('GeekFlicks.store.Movies', {
	    extend: 'Ext.data.Store',
		model: 'GeekFlicks.model.Movie',
	    data: [{
	        title: 'The Matrix',
	        year: '1999'
	    }, {
	        title: 'Star Wars: Return of the Jedi',
	        year: '1983'
	    }]
	});

Which is just copied from the View, where it was previously set in the initComponent() method. The one change is that instead on the fields being defined inline, there is a reference to the Model we just created, where they are defined. Let's now clean up the view to reference our store... change the contents of the view/Movies.js to:

	Ext.define('GeekFlicks.view.Movies', {
	    extend: 'Ext.grid.Panel',
	    id: "movies_editor",
	    alias: 'widget.movieseditor',
	    store: 'Movies',
	    initComponent: function () {
	        //note: store removed
	        this.columns = [{
	            header: 'Title',
	            dataIndex: 'title',
	            flex: 1
	        }, {
	            header: 'Year',
	            dataIndex: 'year',
	            flex: 1
	        }];
	        this.callParent(arguments);

	    }
	});

Note that the 'store' configuration property was set to 'Movies' which will cause an instance of the Movies store to be instantiated at run time, and assigned to the grid.

The Controller also needs to know about the Model and Store, so we tell it about them by adding a couple of config items, named (surprise!) 'models' and 'stores':

	Ext.define("GeekFlicks.controller.Movies", {
	    extend: 'Ext.app.Controller',
	    views: ['Movies'],
	    models: ['Movie'],
	    stores: ['Movies'],
	    init: function () {
	        this.control({
	            '#movies_editor': {
	                render: this.onEditorRender
	            }
	        });
	    },

	    onEditorRender: function () {
	        console.log("movies editor was rendered");
	    }
	});

Now we still have hard-coded data in our Store, so lets fix tht using a Proxy. The proxy will load the data from a server-side script hosted at /movies.php. The first version of this script simply echoes back a JSON representation of the current movies. Here is the script:

	<?php
	header("Content-type: application/json");
	?>
	{
	  "success": true,
	  "data": [{
	      "title": "The Matrix",
	      "year": "1999"
	  }, {
	      "title": "Star Wars: Return of the Jedi",
	      "year": "1983"
	  }]
	}

Now this data is still hardcoded - just on the server-side. In the Real World you will be reading this out of a database. But at least we can remove the hardcoded data from our store, and replace it with the Proxy definition:

	Ext.define('GeekFlicks.store.Movies', {
	    extend: 'Ext.data.Store',
	    autoLoad: true,
	    fields: ['title', 'year'],
		//data removed, instead using proxy:
	    proxy: {
	        type: 'ajax',
	        url: 'movies.php',
	        reader: {
	            type: 'json',
	            root: 'data',
	            successProperty: 'success'
	        }
	    }
	});

[Download project files](guides/editable_grid/geekflicks.zip)

**About the Author**: David Wilhelm ([blog](http://www.dafishinsea.com/blog/), [linkedin](http://www.linkedin.com/in/dewilhelm), [google+](https://plus.google.com/105009766412274176330/about)) is a UI developer at Blue Coat Systems.
