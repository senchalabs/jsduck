# Unit Testing with Jasmine

## I. Introduction

In this tutorial we will take an existing Ext application and introduce the Jasmine assertion library for unit testing. Readers must be familiar with JavaScript, Ext JS 4, the MVC architecture as well as the fundamentals of HTML, CSS, and using resources.

**Why Test?** There are many reasons to test applications. Tests can verify an application's functionality to eliminate the need to enumerate all the use cases manually. Also, if the application were to be refactored, or updated, the tests could verify that the changes did not introduce new bugs into the system

## II. Getting started

For this tutorial, use the "simple" example of the MVC in the ExtJS bundle — found under `<ext>/examples/app/simple`. Copy the simple folder to your workspace or desktop.

Add these folders:

    <simple dir>/app-test
    <simple dir>/app-test/specs

[Download][1] and extract the Jasmine standalone library into the app-test folder.

Create these files (leave them empty for now, you will fill them in next)

    <simple dir>/app-test.js
    <simple dir>/run-tests.html

**Note:** These file names are arbitrary. You may name them however you would like. These names were chosen simply from what they are. The *app-test.js* file is essentially *app.js* for testing purposes, and *run-tests.html* is simply the bootstrap.

Your project should look like this now:

{@img folder.jpg}

Now that you have the files and folders set up, we'll create a test-running environment. This will be a web page that, when viewed, will run our tests and report the results. Open the run-tests.html and add the following markup:

    <html>
    <head>
        <title id="page-title">Tester</title>

        <link rel="stylesheet" type="text/css" href="app-test/lib/jasmine-1.1.0/jasmine.css">

        <script type="text/javascript" src="extjs/ext-debug.js"></script>

        <script type="text/javascript" src="app-test/lib/jasmine-1.1.0/jasmine.js"></script>
        <script type="text/javascript" src="app-test/lib/jasmine-1.1.0/jasmine-html.js"></script>

        <!-- include specs here -->

        <!-- test launcher -->
        <script type="text/javascript" src="app-test.js"></script>

    </head>
    <body>
    </body>
    </html>

There are a few key things to remember here: the Jasmine resources, the Ext JS framework resource and app-test.js. These will need to be included with your tests (this order is important). You will include the specs (Jasmine assertion js files) above the app-test.js and below the rest of the files.

Next, open app-test.js and copy this code into it:

    Ext.require('Ext.app.Application');

    var Application = null;

    Ext.onReady(function() {
        Application = Ext.create('Ext.app.Application', {
            name: 'AM',

            controllers: [
                'Users'
            ],

            launch: function() {
                //include the tests in the test.html head
                jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
                jasmine.getEnv().execute();
            }
        });
    });

The effect of the above code is a global reference to the _Application_ instance and bootstrap for the Jasmine assertion library. This is accomplished by directly constructing the _Application_ object and storing the reference when the document is ready, bypassing the Ext.application() method.

**Note:** this _Application_ definition is not a copy and paste of your regular _Application_ definition in your app.js. This version will only include the controllers, stores, models, etc and when _launch_ is called it will invoke the Jasmine tests.

Now you should have a working test environment. Open the run-tests.html file in your browser to verify. You should see the Jasmine UI with a passing green bar that reads `0 specs, 0 failures in 0s`. Ex:

{@img jasmine-setup.jpg}


## III. Writing Tests

Under the specs folder (`<simple>/app-test/specs`) create two empty text files named:

    example.js
    users.js

Then go back to the _run-tests.html_ file and add these two lines under the comment _`<!-- include specs here -->`_

    <!-- include specs here -->
    <script type="text/javascript" src="app-test/specs/example.js"></script>
    <script type="text/javascript" src="app-test/specs/users.js"></script>

**Note:** Some examples use a `*.spec.js` double extention. It is not required, it is nice to indicate what the file is for. (in our case the folder of `specs` instead of just the double extension of `*.spec.js`)

Start by filling in `specs/example.js`. Jasmine's specification syntax is very descriptive. Each suite of tests is contained in a describe function, and each test is defined by an "it" function.

Example:

    describe("Basic Assumptions", function() {

        it("has ExtJS4 loaded", function() {
            expect(Ext).toBeDefined();
            expect(Ext.getVersion()).toBeTruthy();
            expect(Ext.getVersion().major).toEqual(4);
        });

        it("has loaded AM code",function(){
            expect(AM).toBeDefined();
        });
    });

To pass a test (each "it" block) simply call `expect(someValue).toBe<something>()`

Next a more complicated example. Testing a store, which is asynchronous, and retrieved from a Controller. (This is where that global application reference will come in handy) This code goes in `specs/users.js`

    describe("Users", function() {
        var store = null, ctlr = null;

        beforeEach(function(){
            if (!ctlr) {
                ctlr = Application.getController('Users');
            }

            if (!store) {
                store = ctlr.getStore('Users');
            }

            expect(store).toBeTruthy();

            waitsFor(
                function(){ return !store.isLoading(); },
                "load never completed",
                4000
            );
        });

        it("should have users",function(){
            expect(store.getCount()).toBeGreaterThan(1);
        });

        it("should open the editor window", function(){
            var grid = Ext.ComponentQuery.query('userlist')[0];

            ctlr.editUser(grid,store.getAt(0));

            var edit = Ext.ComponentQuery.query('useredit')[0];

            expect(edit).toBeTruthy();
            if(edit)edit.destroy();
        });

    });

Notice the "beforeEach" function (this will be called before each "it"). This function sets up the stage for each test, and this example:

  1. gets a _Store_ from a _Controller_
  2. asserts that the store was successfully retrieved (not null or undefined)
  3. waits for the store to complete loading -- see the "waitFor" function --
     This store auto loads data when its constructed: do not run tests before its ready.

## IV. Automating

Combining this with [PhantomJS][2] allows us to run these tests from the command line or from a cron job. The provided `run-jasmine.js` in the PhantomJS distribution is all that is needed. (you can tweak it to make the output suit your needs, [here][3] is an example tweaked version )

Example command line:

    phantomjs run-jasmine.js http://localhost/app/run-tests.html

You will need to run the tests from a web server because XHR's cannot be made
from the `file://` protocol

## Setting up PhantomJS:

On Windows and Mac (without mac ports) you will need to download the static binary from [here][10]. Once you have it downloaded extract it some place useful. (Ex: `<profile dir>/Applications/PhantomeJS`.) Then update your `PATH` environment variable to include the phantomjs binary. For Mac's open a terminal and edit either `.bashrc` or `.profile` and add this line to the bottom:

	export PATH=$PATH:~/Applications/PhantomJS/bin

For Windows, open the `System Properties` control panel and select the `Advanced` tab and then click on the `Environment variables` button. Under the user variables box find and edit the `PATH` by adding this to the end:

	;%USERPROFILE%\Applications\PhantomJS

If there is not an entry for `PATH` in the user variables, add one and set this as the value:

	%PATH%;%USERPROFILE%\Applications\PhantomJS

Save your work by selecting the `OK` buttons and closing the windows.

### Setting up PhantomJS (Alternative Path)
For Linux users and mac ports users there is a simple command to enter in the terminal to get and install PhantomJS.

   * Debian(Ubuntu) based distribution use:

		sudo apt-get install phantomjs.

   * RedHat(Fedora) based distribution use:

		su -c 'yum install phantomjs'

   * Mac's with [mac ports][9], use:

		sudo port install phantomjs.

### Verifying PhantomJS

To verify simply open a terminal (or command prompt) window and type this:

	phantomjs --version

If there is output (other than "command not found") phantomjs is setup and ready for use.

---

**About the Author:** [Jonathan Grimes][4] ([facebook][5], [twitter][6], [google+][7]) is a software engineer at [NextThought][8], a technology start-up company that is currently building an integrated platform for online education.

   [1]: http://pivotal.github.com/jasmine/download.html
   [2]: http://www.phantomjs.org/
   [3]: guides/testing/run-jasmine.js
   [4]: http://jonathangrimes.com
   [5]: http://www.facebook.com/jonathan.grimes
   [6]: http://twitter.com/jsg2021
   [7]: https://plus.google.com/u/0/102578638400305127370/about
   [8]: http://nextthought.com
   [9]: http://www.macports.org
   [10]: http://code.google.com/p/phantomjs/downloads/list

