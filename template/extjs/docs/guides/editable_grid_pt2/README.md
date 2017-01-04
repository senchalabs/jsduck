# Doing CRUD with the Editable Grid, Part 2
______________________________________________

## Part 2: Implementing CRUD Operations

Since we already have the Read operation working from part 1, we are left with the Create, Update, and Delete operations to implement. Let's start with updating existing movies in our grid.

### Updating

#### Making the Grid Editable
As explained in the {@link Ext.grid.Panel Grid} documentation, making a grid editable requires a couple of modifications to the grid's configuration:

 1. In the grid columns config, define which form control should be used to edit the editable fields, eg. 'textfield' for simple text
 2. Add the {@link Ext.grid.plugin.RowEditing RowEditing} plugin to the grid's plugins list.

Here is `view/Movies.js` after these changes have been applied:

    /**
     * The Grid of Movies
     */
    Ext.define('GeekFlicks.view.Movies', {
        extend: 'Ext.grid.Panel',
        alias: 'widget.movieseditor',
        selType: 'rowmodel',
        rowEditor: Ext.create('Ext.grid.plugin.RowEditing', {
            clicksToEdit: 2
        }),
        store: 'Movies',

        initComponent: function () {
            this.columns = [
                {
                    header: 'Title',
                    dataIndex: 'title',
                    editor: {
                        xtype: 'textfield',
                        allowBlank: true
                    },
                    flex: 1
                },
                {
                    header: 'Year',
                    dataIndex: 'year',
                    editor: {
                        xtype: 'numberfield',
                        allowBlank: true
                    },
                    flex: 1
                }
            ];
            this.plugins = [ this.rowEditor ];
            this.callParent(arguments);
        }
    });

The grid's `selType` config option determines whether clicking on the grid selects a whole row (the default) or a specific cell (`selType = 'cellmodel'`). Here, we've chosen 'rowmodel'. The definitions of the editable fields is done in the columns config. Finally, the RowEditing plugin allows you to choose whether it takes one or two clicks to edit the field. Since we may want to allow the user to select a row without editing it, we'll go with 2 clicks. We are also allowing the user to enter an empty value.

If you open this up in a browser, you should see that the rows of the grid are editable, ie. if you double-click on any one of them, all the fields in the row become editable. If you click `OK` or hit `Enter` while editing, the field goes back to being plain text, and now contains the edited text. If you have made changes, a small red marker will appear in the top left corner of the textfield. This indicates that the value has changed, but the changes have not been saved.

**Note** We specified the editor 'xtype' of the Year column to be 'numberfield'. When editing this column, the grid will use a {@link Ext.form.field.Number NumberField} to ensure that the user can only enter a number here (and they get the numeric stepper buttons to increment the values easily).


#### Updating the Server

Now that we have allowed the user to change the values in the grid, it would be nice to provide a way to save the changes to the server. One way would be to provide a 'Save' button, and then when it is clicked, call the `sync` method of the Movies Store. This would trigger the Store to save all changes made since the last time it was synced. The other is to set the `autoSync` config option of the grid to 'true' (it is false by default) and then the Store will automatically save each change as soon as it is made. We will use the `autoSave` approach here.

If we add the line `autoSync: true` just after the `autoLoad: true` line in the `app/store/Movies.js` file, reload the app and then edit one of the fields, we see that there is an error reported. This is because the Store attempts to save the value using its Proxy, which is currently the default Ajax proxy. The Ajax Proxy issued a POST request to its URL (/movies) containing a JSON representation of the value of the row which was edited. The request fails because we have not setup a handler for 'POST' requests in our Node.js app. So we need to go back to the server code and decide how to design our webservice API.

#### Designing the Server API: REST vs RPC

Webservices come in two main flavors: RPC (Remote Procedure Call) and RESTful. [RPC](http://en.wikipedia.org/wiki/Remote_procedure_call) style APIs have been a common approach, but for this tutorial we will be using a [RESTful API](http://en.wikipedia.org/wiki/Representational_state_transfer). In a nutshell, a RESTful API defines resources using unique URLs, while the CRUD actions are indicated by the HTTP request methods POST, GET, PUT, and DELETE respectively. We can describe the desired API of our application as follows:

<table>
<tr><td>    Request Method</td><td>     URL       </td><td>   Action Performed              </td><td>         Response (JSON)                                </td></tr>
<tr><td>    GET       </td><td>    /movies    </td><td>   READ the movies               </td><td>         The list of movies                             </td></tr>
<tr><td>    GET       </td><td>    /movies/123</td><td>   READ the movie with id = 123  </td><td>         The movie with id 123                          </td></tr>
<tr><td>    POST      </td><td>    /movies    </td><td>   CREATE the given movie        </td><td>         The new movie with a unique ID                 </td></tr>
<tr><td>    PUT       </td><td>    /movies/123</td><td>   UPDATE the movie with id = 123</td><td>         The movie with the id 123, after it was updated</td></tr>
<tr><td>    DELETE    </td><td>    /movies/123</td><td>   DELETE the movie with id = 123</td><td>         Whether the delete succeeded or not            </td></tr>
</table>

#### Using the REST Proxy

There is a {@link Ext.data.proxy.Rest REST Proxy} for use with RESTful APIs, so let's change the definition of the store to use it. The Movies Store now looks like this:

    /**
     * The Movies store
     */
    Ext.define('GeekFlicks.store.Movies', {
        extend: 'Ext.data.Store',

        autoLoad: true,
        autoSync: true,
        fields: ['_id', 'title', 'year'],

        proxy: {
            type: 'rest',
            url: '/movies',
            model: 'GeekFlicks.model.Movie',
            reader: {
                type: 'json',
                root: 'data',
                successProperty: 'success'
            }
        }
    });

Note that we specified the Model that the Proxy must use, and we added the `_id` field which was missing from the list of fields before. In addition, we need to specify that the `_id` field is indeed the idProperty of the Model by adding the config `idProperty: '_id'` to the Model as defined in /app/model/Movie.js.

#### Handling the PUT Request to Update

Now when we reload the app and modify a field, we see that there is a PUT request made to a URL of the form, '/movies/1234' where the number in the path is the ID of the movie in our database. We still receive a server error in response, so we should implement the web service in our Node.js server app. We can do this by defining a new route in the Express application (the toplevel /app.js) as follows:

    // Routes...

    app.put('/movies/:id', function(req, res){
        movieModel.find({_id: req.params.id}, function (err, movies) {
            // update db
            var movie = movies[0];
            movie.set(req.body);
            movie.save(function (err) {
                res.contentType('json');
                res.json({
                    success: !err,
                    data: req.body
                });
            });
        });
    });

The '/movies/:id' special URL causes the movie ID part of the URL to be captured as 'req.params.id'. We plug this in the Mongoose find() function which acts like a SELECT statement in SQL, and grab the first result. Then we use the 'set' Mongoose method to set all the fields of the movie model to the values which were posted. Note: the JSON request body is automatically parsed into the 'req.body' object because of this configuration line:

    app.use(express.bodyParser()); //parse JSON into objects

Finally, we respond with a JSON response containing the 'success' parameter (true if no error was reported) and the updated value of the document (which will be the same as the request since it was successfully set).

Now if you stop and restart the node app, you should be able to make modifications to the movies, and see that they are preserved after refreshing the browser.

{@img editing.png Updating a Movie}

### Creating new Movies

#### Adding an 'Add Movie' Button

In order to allow the user to add new movies, we need to change the view to include an 'Add Movie' button somewhere. Currently the Movies view extends from GridPanel, which extends from Panel. This means that we can add a bottom toolbar as one of its `dockedItems`:

    // app/view/Movies.js

    //... at the end of initComponent method override:

    this.dockedItems = [{
        xtype: 'toolbar',
        dock: 'bottom',
        items: [
            '->',
            {
                text: 'Add Movie'
            }
        ]
    }];

    this.callParent(arguments);

In case you are wondering, the '->' special form expands to a ToolbarFill which ensures that the Add Movie Button is aligned to the right of the toolbar. The default xtype inside a Toolbar is a Button, so we only need to specify its label text.

#### Adding a new Movie Model to the Store

Handling events such as button clicks is the Controller's job, so lets tell it to listen for them by adding another item to the `control()` function in `app/controller/Movies.js`:

    //...
    init: function () {
        this.control({
            'movieseditor': {
                render: this.onEditorRender
            },
            'movieseditor button': {
                click: this.addMovie
            }
        });
    },

    //...
    addMovie: function () {
        var newMovie,
            movieStore = this.getStore('Movies');

        // add blank item to store -- will automatically add new row to grid
        newMovie = movieStore.add({
            title: '',
            year: ''
        })[0];

        this.rowEditor.startEdit(newMovie, this.moviesEditor.columns[0]);
    }

The `addMovie()` handler for the click event adds a new movie to the Store and starts editing the new movie, allowing the user to fill in the field values, which are initially empty.

#### Handling the POST request to Create a new Movie

Because `autoSync` is set to `true` on the Store, as soon as the new empty movie is added to the Store, it will attempt to save it to the server using the POST method. This is not going to work yet as we have not yet added that capability to our server. We need to add another route to our Express app to handle the create action, as follows:

    //... Routes
    app.post('/movies', function (req, res) {
        var newMovie = new Movie();
        var newMovieData = req.body;

        // remove the id which the client sends since it is a new Movie
        delete newMovieData['_id'];
        newMovie.set(newMovieData);
        newMovie.save(function (err, movie) {
            res.contentType('json');
            res.json({
                success: !err,
                data: movie
            });
        });
    });

We renamed the `movieModel` variable to be simply `Movie`, so you'll need to do a search and replace if you're following along... Sorry about that. However, the code reads a lot better with this change. The other tricky thing to note is that we want MongoDB to generate a new ID for the new Movie, so we delete the bogus one we got from the client, and then the `_id` field will automatically be created when the new Movie is saved to the database. Don't forget to restart the Node app for the changes to take effect.

#### The Case of the Disappearing Row Editor

Now you may have noticed that when we click the 'Add Movie' button, the row becomes editable for an instant, and then reverts back to read-only mode, having saved the empty row. What is happening here is an unfortunate side-effect of `autoSync: true`: once we create a new empty Movie Model and add it to the Store, the store sends the request to the server and when the response comes back the grid is updated with the new data (which has the server-generated `_id`). At this point the Grid re-renders its view, causing the RowEditor to be obliterated.

So now we must reconsider the `autoSync` setting: it was helpful for modifying existing Movies, but it is causing us more trouble than good when it comes to adding new ones using a Row Editor. So let's set `autoSync` to `false` now in the Movie Store, and see if we can get our CRUD actions working another way. Since we are simply adding an empty Movie and then allowing the user to edit it, we only really need to save to the server after the edit action is complete. This can be done by adding an event listener for the `edit` event, which the Grid Panel fires after an edit finishes. Change the Movies Controller's `init` method to listen for this event and also add an event handler which simply calls `sync` on the Store:

    //...
    init: function () {
        this.control({
            'movieseditor': {
                render: this.onEditorRender,
                edit: this.afterMovieEdit
            },
            'movieseditor button': {
                click: this.addMovie
            }
        });
    },

    onEditorRender: function () {
        // cache a reference to the moviesEditor and rowEditor
        this.moviesEditor = Ext.ComponentQuery.query('movieseditor')[0];
        this.rowEditor = this.moviesEditor.rowEditor;
    },

    afterMovieEdit: function () {
        var movieStore = this.getStore('Movies');
        movieStore.sync();
    }

Now you should be able to add a new Movie and find that it is saved to the database (it is still there after a page refresh). The `onEditorRender` handler now does something useful, by storing a reference to the movies editor grid and its RowEditor. This helps keep some of the other code more readable.

### Deleting Movies

#### Adding Delete and Edit Icons

By now you probably have a whole bunch of random movies in your grid from testing out the previous command. Let's clean them up. Thanks once again to our the REST Proxy, triggering a DELETE request to the server is as easy as removing the offending item from the Store. But we need some way to make this easy for the user. One way to do this is to add a delete icon in every row of the column. The {@link Ext.grid.column.Action Action Column} is the perfect solution to this, and can be configured in the view for the Movie Grid. While we're at it, we might as well add an icon for editing movies as well, as not every user will realize that double-clicking on a row is required for editing it.

    //...
    initComponent: function () {
        var movieEditor = this;
        this.addEvents(['movieEdit', 'movieDelete']);
        this.columns = [
            //... other columns
            {
                xtype: 'actioncolumn',
                width: 50,
                items: [
                    {
                        icon: 'images/edit.png',  // Use a URL in the icon config
                        tooltip: 'Edit',
                        handler: function(grid, rowIndex, colIndex) {
                            movieEditor.fireEvent('movieEdit', {
                                rowIndex: rowIndex,
                                colIndex: colIndex
                            });
                        }
                    },
                    {
                        icon: 'images/delete.png',
                        tooltip: 'Delete',
                        handler: function(grid, rowIndex, colIndex) {
                            movieEditor.fireEvent('movieDelete', {
                                rowIndex: rowIndex,
                                colIndex: colIndex
                            });
                        }
                    }
                ]
            }
        ];
        //...

In the icon event handlers we fire a custom event: 'movieEdit' or 'movieDelete' depending on which icon was clicked. The events were added just before the columns declaration. We also pass the row and column which was clicked in a data object which is passed to the event. Of course, the icons will need to be located in the 'images/' folder of the app (they are included in the tutorial download files). I also added a line of CSS to the index.html to space them out a bit:

        <style>
          img.x-action-col-icon {
            margin-right: 5px;
          }
        </style>

{@img icons.png Delete and Edit Icons}

#### Deleting Movies from the Store

Now we add a couple more handlers for our custom events into the Movies Controller:

    //...
    init: function () {
        this.control({
            'movieseditor': {
                render: this.onEditorRender,
                edit: this.afterMovieEdit,
                movieEdit: this.onMovieEdit,
                movieDelete: this.onMovieDelete
            },
            'movieseditor button': {
                click: this.addMovie
            }
        });
    },

    //...

    onMovieEdit: function (evtData) {
        var movieStore = this.getStore('Movies');
        var record = movieStore.getAt(evtData.rowIndex);
        if(record) {
            this.rowEditor.startEdit(record, this.moviesEditor.columns[evtData.colIndex]);
        }
    },

    onMovieDelete: function (evtData) {
        var movieStore = this.getStore('Movies');
        var record = movieStore.getAt(evtData.rowIndex);
        if(record) {
            movieStore.remove(record);
            movieStore.sync();
        }
    }

 When the `onMovieEdit()` handler gets called, we start editing the record which was referenced by the data we passed in from the View event. The `onMovieDelete()` handler is similar, but simply removes the record, and then calls `sync` since in this case the `edit` event does not fire.

#### Handling DELETE Requests

Since the REST Proxy will send a DELETE request to the Node.js app when we remove a Movie from the Store, we must add another route to the app to handle it.

    //... Routes

    app.del('/movies/:id', function(req, res){
        Movie.remove({_id: req.params.id}, function (err, movies) {
            res.contentType('json');
            res.json({
                success: !err,
                data: []
            });
        });
    });

This route is very simple: it just calls `remove()` on any Movies which have the id which was in the request (there will be just one). So now you can remove the blank row which was inadvertently added earlier. After you refresh the page, it should still be gone.

### Operation CRUD Complete

Our application now supports full CRUD operations! In a real-world application you would add input validation and escaping... but we will not be covering that here. Hopefully you have found that creating a database driven web application using ExtJS, NodeJS, and MongoDB was an effective solution. Being able to use Javascript on the server and even to access a database is indeed an exciting development.

[Download project files](guides/editable_grid_pt2/geekflicks.zip)

**About the Author**: David Wilhelm ([blog](http://www.dafishinsea.com/blog/), [linkedin](http://www.linkedin.com/in/dewilhelm), [google+](https://plus.google.com/105009766412274176330/about)) is a UI developer at Blue Coat Systems.
