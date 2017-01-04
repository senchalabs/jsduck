# Optimizing Ext JS 4.1-based Applications

Sencha improved performance with Ext JS 4.1, but when it comes to optimal performance of Ext JS-based applications, that’s only part of the battle. The rest comes from optimizing applications for performance, which often includes making a few changes so your code can take advantage of Ext JS enhancements.

This guide tells you how to do that and also introduce you to a new performance measurement tool released with Ext JS 4.1, Page Analyzer. Measurement is key when it comes to improving the performance of your applications. You need to figure out what to measure and how to measure it so you can identify bottlenecks in your code and take the right steps to eliminate them. Page Analyzer helps you do that. Finally, we discuss grid optimization and introduce you to another new Ext JS tool for evaluating grid performance, Infinite Grid Tuner.

A few common trends in the way developers write Ext JS applications provide opportunities for performance tuning. We can’t enumerate every single coding technique that might bog down your application; however, we’ve seen that the way developers use the framework in the following areas can often stand in the way of a high performing application.

## General optimization tips

Here are a few things you can do to avoid common areas that slow down Ext JS code.

### Check your event listeners
The way your application uses event listeners is a key performance concern. For example, you might set a load event to fire the first time a store gets data. If you’re not careful, that same load event might fire every time the store gets new data. Turning that off, and having load fire only the first time the store retrieves data can make a substantial difference in the overall performance of your application. To do this, add `single:true` to your listener:

    listeners: {
        load: onFirstLoadData,
        single: true
    }

Another event to be careful of is `afterrender`, which fires after all DOM elements already exist. Changing elements after rendering causes reflows, slowing your application. Instead, adjust classes and set styles before rendering takes place using `beforerender` so that the element renders with the correct classes and styles. Some code that must run after render may require the element size to have been acquired. Ext JS 4.1 provides a new event, `boxready`, which you should consider using if that is the case. It runs after the size of a component has been determined.

### Remove `doLayout` and `doComponentLayout` calls

Simply put, remove these expensive calls whenever possible. In older versions of Ext JS (prior to 4.0), `doLayout` was how you told the framework you were done with a component or container and to go ahead and recalculate its layout. Even in Ext JS 4.0, these calls were sometimes needed after direct DOM updates or to work around certain bugs.

With Ext JS 4.1, layouts are triggered differently, so your code should seldom need to call `doLayout` or `doComponentLayout`. If it turns out that these calls are still needed as bug workarounds in your application, please file a bug report so we can fix it.

The only time `doLayout` or `doComponentLayout` should be needed for non-bug reasons is when the DOM is directly changed by application code. Since the framework is unaware of such changes, these calls are needed to update the affected layouts.

### Reduce container nesting

Developers can commonly use excessive nesting of containers in Ext JS applications. For example, there might be a container that owns a single container which owns multiple components where all the work is taking place. You can often eliminate the outer container and accomplish the same thing with one container. It is important to remember that each container takes time to initialize, render, and layout, so the more you can get rid of unneeded nested containers like this, the faster your application will run. Look for code like the following (the `id` properties are seldom seen in practice but are added here to clarify that there are two containers):

    {
        id: 'container1',
        items: [{
            id: 'container2',
            items: [{
                id: 'component3'
                }]
        }]
    }
If possible, the above should be reduced to a single container:

    {
        id: 'container1',
        items: [{
            id: 'component3'
            }]
    }

### Replace Panels with Containers

Remember that Ext JS Panels are more powerful (and expensive!) than basic Containers. So specify `xtype: 'container'` to avoid having your application use the default 'panel', as shown below.

    {
        xtype: 'container', // defaultType is 'panel'
        items: [ ... ]
    }

### Reduce border layout nesting

With Ext JS 4.1, there are many cases where you no longer need to use nesting with the border layout. Removing this nesting will reduce the time to initialize, render, and layout your components. Previous versions of Ext JS required nesting when you needed, for example, to have two or more instances of the same region. You also had to nest border layouts if you needed two North regions above the center region. Now you can just have two North regions as part of the single border layout.

With Ext JS 4.1, regions can be added dynamically when they are needed, instead of having to add all regions up-front and hide them when not in use. You can also use the weight property to give precedence to a region—for example, giving precedence to the West region over the North region. All these changes mean that you should not often need nesting with border layout, speeding up rendering of components that use that layout.

### Reduce DOM reads and writes

With Ext JS 4.1, we have tuned how layouts interacts with the DOM to reduce reads and writes wherever possible. You should do the same with your code. DOM reads by themselves can slow an application, but they have especially high-overhead when mixed with DOM writes, as this combination causes reflows. Try to manipulate styles and classes using `beforerender` so they are rendered with a component instead of changed after rendering. Avoid using `setStyle`, `addCls`, `removeCls`, and other direct DOM element modifications that cause writes. As a general rule, for better performance, try to manipulate the DOM in batches of reads and writes when writes are needed.

Eliminate extra layouts with `Ext.suspendLayouts` and `Ext.resumeLayouts`
Ext JS 4.1 provides two new methods, `Ext.suspendLayouts` and `Ext.resumeLayouts`, to help you coordinate updates to multiple components and containers. Adding two items in rapid succession to two containers, for example, causes multiple layout and render operations to be performed. If you use `Ext.suspendLayouts` before you add these items the framework will no longer perform the layout for each individual item. Once you’re done making your additions, use `Ext.resumeLayouts` and the framework will perform a single render and layout operation.

Keep in mind that adding items to containers is not the only thing that can trigger a layout. Other operations and changes to components and containers will also trigger layouts. It is important to analyze use cases in your application that have performance issues and make sure there are no extraneous layouts being performed.

    {
        Ext.suspendLayouts();
        // batch of updates
        Ext.resumeLayouts(true);
    }

## Introducing the Ext JS Page Analyzer

Ext JS 4.1 includes a new tool to help you look at what’s going on under the covers of an application and measure its performance. You can also use it to quickly measure the performance impact of changes you make to code. Page Analyzer loads Ext JS 4.1 pages and instruments them with diagnostic hooks. The Page Analyzer contains many experimental features, but perhaps the most useful for optimizing application performance is the Layout tab, which we’ll take a look at in a moment.

You can find the tool in the Ext JS 4.1 Examples folder, at the following location in the SDK:

    ./examples/page-analyzer/page-analyzer.html

Copy the entire `page-analyzer` folder on the server that also hosts the application you want to analyze, since browser security only allows the kind of communication required by Page Analyzer between pages from the same server. Also, be sure the version of Page Analyzer you use matches the build number of Ext JS, since it won’t work if you’re using a different build.

As you use it, remember that this is the first release of the tool and that it’s a work in progress. Please give us your feedback about the tool through the Ext JS forum.

Here’s how to use page analyzer:

 1. Open a browser and enter the URL for Page Analyzer.
 2. When it opens, type in the address of page you want to test.
 3. The page then loads in an iframe, which is why the tool and the application have to be on the same server. Page Analyzer will look something like this when you open the page:

    {@img optextjs4.11.png Page Analyzer opening page}

 4. Click the Layout tab. You will see a set of layout runs, like this:

    {@img optextjs4.12.png Page Analyzer layout runs}

 5. Looking for multiple layouts of the same components. When you find that, go back to your code and eliminate anything that reduces layouts of that component, which should improve performance.

## Grid optimizations

Ext JS grids can pose a particular problem for web application performance, especially those that represent large data sets. When grids render small data sets, speed is not an issue. However grids with large data sets that call for so-called “infinite scrolling” can pose performance bottlenecks if they’re not created with some care. Infinite scrolling relies on a page cache where a paging scroller object stores pages of the dataset before the user scrolls to the part of the grid that needs to display it.

As the user scrolls, the cached data becomes visible and then disappears off the top of the page and is typically no longer kept in the DOM. The main way to tune this is to keep the DOM size as small as possible, and cache data on the client side to minimize server round-trips.

### Scrolling terminology

When a data store is configured with buffered: true, a [PagingScroller](http://docs.sencha.com/ext-js/4-0/#!/api/Ext.grid.PagingScroller) object is instantiated to monitor scrolling of the View (grids are specially configured data Views), and attempt to maintain a cache of pages ready to provide data immediately it becomes needed as the view traverses down the dataset.

In the diagram below, the user has scrolled the view some way down the dataset. The PagingScroller maintains a leading buffer zone of records ready to render in the direction of travel, and a slightly smaller zone behind the direction of travel.


{@img optextjs4.13.png PagingScroller with leading buffer zone of records ready to render}


The PagingScroller requests that the data store ensures that the [trailingBufferZone](http://docs.sencha.com/ext-js/4-0/#!/api/Ext.grid.PagingScroller-cfg-trailingBufferZone), and the [leadingBufferZone](http://docs.sencha.com/ext-js/4-0/#!/api/Ext.grid.PagingScroller-cfg-leadingBufferZone) are in the cache. This causes the store to calculate which pages that requires, and ensure they are cached. The store only makes Ajax requests pages that are not already in the cache.

As the view scrolls down, the edge of the rendered table almost comes into view. When it is [numFromEdge](http://docs.sencha.com/ext-js/4-0/#!/api/Ext.grid.PagingScroller-cfg-numFromEdge) rows from reaching the edge, the datastore is reloaded with data from further down the dataset, and the vertical position synchronized to keep the visible rows at the same position. When the required data is in the page cache, this operation is instantaneous and invisible. If the scroller is dragged down past the cached pages, an Ajax request will be made, and there will be a LoadMask displayed until the data arrives.

If scrolling proceeds at a reasonable pace, and the leading edge of the “required zone” moves into a page which is not in the cache, an Ajax request is fired off for that page. In most cases, if the leading buffer zone is large enough, it will arrive in the cache before the rows are needed by the rendered table.

By default the page cache only stores the most recently used 5 pages. This can be increased if the dataset will be “browsed”, so that a larger proportion of the dataset is cached in the client, and fewer Ajax requests are made. The store’s [purgePageCount](http://docs.sencha.com/ext-js/4-0/#!/api/Ext.data.Store-cfg-purgePageCount) controls this behavior.

If the dataset is not unreasonably large—up to maybe 50,000 rows, then it may be desirable to cache the entire dataset on the client. Configure the store with `purgePageCount: 0` to never discard pages once they are cached.

How you design this depends on how large the table is that’s being rendered and browser speed. The larger the table, the more it can scroll without having the edge come into view and without having to refresh the data from the prefetch buffer. However, the more data obtained from the prefetch buffer, the longer the delay in re-rendering. You need to maintain a balance between how much data is visible and how frequently re-rendering is required. If your application targets a fast browser, you can display a larger set of rows and data. For slower browsers, display a smaller table with fewer rows that reaches a visible edge more often and has to refresh more frequently

To help you tune grids, Ext JS 4.1 includes an example called Infinite Grid Tuner, which you can find in the Examples directory. Infinite Grid Tuner, shown below, includes a large data set—50K of records—and lets you set different ways to load the data into the store to prime the prefetch buffer. For example, you can simulate Ajax latency, change the number of rows that are prefetched, and tune the table size. You can experiment with the various parameters, shown on the left of the next image, to see what works best in the browser(s) your application targets.

{@img optextjs4.14.png Infinite Grid Tuner. Experiment with parameters on the left to see what works best in the browser(s) your application targets}

Using the Infinite Grid Tuner, you can also adjust the purge page count setting of the store. This sets the amount of data that’s removed from the page cache after it’s been rendered. If you set this number to 0, it keeps all of the data in the buffer, which means that if the user scrolls back up the grid, the data is reloaded without having to refetch data from the server.

Two other concepts to keep in mind as you experiment with the tuner: A grid’s visible data set can be thought of as a sliding window. Similarly, the page cache can also be thought of as a sliding window into all the data associated with the grid. You can change the size of both using the tuner. You can also set the rules for when each is replenished, determining at which point in user scrolling (the number of rows from the visible edge) to request more data for the visible part of the grid and the page cache.

## Additional Resources

The following resources are also useful for application performance tuning:

 - View a 50-minute [webinar video](https://vimeo.com/37636229) version with the material in this guide
 - Suggestions from other Ext JS users in the Sencha Ext: Open Discussion forum [Performance Best Practices thread](http://www.sencha.com/forum/showthread.php?153565)
 - Tips for optimizing [Internet Explorer 8 and higher](http://msdn.microsoft.com/en-us/library/gg699341.aspx)
 - Information about [dynaTrace](http://ajax.dynatrace.com/ajax/en/) performance management technology for Internet Explorer and FireFox
 - Chrome Speed Tracer [website](http://code.google.com/webtoolkit/speedtracer/) and [tutorial](http://www.youtube.com/watch?v=Sn_3rJaexKc)
 - Firebug profiler [tutorial](http://michaelsync.net/2007/09/10/firebugtutorial-logging-profiling-and-commandline-part-ii)
