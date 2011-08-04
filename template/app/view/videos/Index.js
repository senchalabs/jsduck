/**
 * Container for videos listing.
 */
Ext.define('Docs.view.videos.Index', {
    extend: 'Ext.container.Container',
    alias: 'widget.videoindex',

    cls: 'all-demos iScroll',
    margin: '10 0 0 0',
    autoScroll: true,

    initComponent: function() {
        var catalog = Docs.videos;

        Ext.Array.forEach(catalog, function(c, i) {
            c.id = 'sample-' + i;
        });

        var store = Ext.create('Ext.data.JsonStore', {
            idProperty: 'id',
            fields: ['id', 'title', 'description', 'thumb'],
            data: catalog
        });

        this.items = [
            { xtype: 'container', html: '<h1 class="eg">Videos</h1>' },
            Ext.create('Docs.view.videos.List', {
                store: store
            })
        ];

        this.callParent(arguments);
    }

});

Docs.videos = [
    {
        group: 'Ext JS',
        videos: [
            {
                "id": "22863837",
                "title": "Ext JS 4 - The Most Advanced JavaScript Framework for Web Apps",
                "description": "Ext JS 4 represents a major upgrade of the flagship Sencha JavaScript framework, which is used by more than one million developers to create amazing cross-browser app experiences that execute with precision and performance. Highlights of the release include major enhancements to the drawing and charting capabilities of Ext JS, comprehensive cross-browser support, and an improved data package — all based on a modern architecture.",
                "thumb": "http://b.vimeocdn.com/ts/148/397/148397103_200.jpg"
            },
            {
                "id": "17666102",
                "title": "SenchaCon 2010: Introducing Ext JS 4",
                "description": "Ext JS 4 is a major advance in JavaScript frameworks providing significantly expanded and refactored functionality in practically every area of the product. It's faster, easier and more stable.\n\nPresented by Ed Spencer.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/110/118/110118333_200.jpg"
            },
            {
                "id": "25264626",
                "title": "What's New in Ext JS 4 Webinar",
                "description": "Ext JS 4 raises the bar for cross-browser web apps. New features include plug-in-free charting, fully customizable theming, upgraded components — all packaged in a modern app framework that delivers high-quality, predictable results faster and easier than ever.\n\nJoin us for this one-hour webinar where we'll discuss the new features and benefits of using Ext JS 4. We'll also provide tips and resources for migrating from Ext JS 3 to Ext JS 4.\n\nHosting this webinar from Sencha will be Aditya Bansod, Sr. Director of Product Management, Ed Spencer, Sr. Software Architect, and Brian Moeskau, Sr. Software Architect.",
                "thumb": "http://b.vimeocdn.com/ts/166/239/166239450_200.jpg"
            },
            {
                "id": "17733892",
                "title": "SenchaCon 2010: Ext JS 4 Architecture",
                "description": "Ext JS 4 has a thoroughly revamped architecture that enables faster performance and more developer flexibility. In this session, we will take a tour through the revamped architecture of Ext JS 4.x, taking a high-level look at the updated data package, component hierarchy and core APIs. Afterwards, developers will have an understanding of why Ext JS 4 works the way it does and how best to leverage its underlying APIs.\n\nPresented by Ed Spencer.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/110/628/110628273_200.jpg"
            },
            {
                "id": "17917111",
                "title": "SenchaCon 2010: The Ext JS 4 Layout System",
                "description": "Ext JS 4 has a fully refactored layout engine with higher efficiency and performance. During this session, you'll learn all the in-depth details with a hands-on coding review of the updated ContainerLayouts and newly introduced ComponentLayouts. \n\nPresented by Jamie Avins.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/112/023/112023545_200.jpg"
            },
            {
                "id": "17673342",
                "title": "SenchaCon 2010: Charting & Data Visualization in Ext JS 4",
                "description": "The exciting future of full JavaScript-powered charts and data visualizations coming in Ext JS 4.0! No Flash required! \n\nPresented by Jamie Avins.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/110/173/110173068_200.jpg"
            },
            {
                "id": "23027769",
                "title": "Ext JS 3 to 4 Migration (Part 1 of 2)",
                "description": "In this video tutorial series Brian Moeskau teaches you how to use the Ext compatibility layer to migrate existing Ext 3 applications to Ext 4. The tutorial covers setup, debugging, dealing with common problems, and techniques for properly updating your application code.\n\nPart 1 focuses on the initial setup of the compatibility layer and getting a demo Ext 3 application running under Ext 4 in compatibility mode.\n\nPart 2 builds on the first video, migrating the demo application off of the compatibility layer and getting it fully converted to Ext 4, including using the new class system and dynamic loading.\n\nSee Part 2: http://vimeo.com/23046756\n\nSee the accompanying blog post for more details and to download the Ext JS 3 to 4 Migration Pack: http://www.sencha.com/blog/ext-js-3-to-4-migration",
                "thumb": "http://b.vimeocdn.com/ts/149/792/149792412_200.jpg"
            },
            {
                "id": "23046756",
                "title": "Ext JS 3 to 4 Migration (Part 2 of 2)",
                "description": "In this video tutorial series Brian Moeskau teaches you how to use the Ext compatibility layer to migrate existing Ext 3 applications to Ext 4. The tutorial covers setup, debugging, dealing with common problems, and techniques for properly updating your application code.\n\nPart 1 focuses on the initial setup of the compatibility layer and getting a demo Ext 3 application running under Ext 4 in compatibility mode.\n\nSee Part 1: http://vimeo.com/23027769\n\nPart 2 builds on the first video, migrating the demo application off of the compatibility layer and getting it fully converted to Ext 4, including using the new class system and dynamic loading.\n\nSee the accompanying blog post for more details and to download the Ext 3 to 4 Migration Pack: http://www.sencha.com/blog/ext-js-3-to-4-migration",
                "thumb": "http://b.vimeocdn.com/ts/149/936/149936004_200.jpg"
            },
            {
                "id": "19159630",
                "title": "SenchaCon 2010: Theming Ext JS 4",
                "description": "Ext JS 4 has a new CSS architecture which uses SASS & Compass. This will enable developers to easily create new themes. During this session you will learn how the Ext JS 4 theme was constructed, how to quickly customize the look and feel of your application and how to optimize your stylesheets for faster downloads.",
                "thumb": "http://b.vimeocdn.com/ts/121/202/121202378_200.jpg"
            },
            {
                "id": "17876920",
                "title": "SenchaCon 2010: Advanced Server Integration with Data and Direct",
                "description": "Many Ext JS developers have yet to take advantage of Ext Direct to directly call server methods from the browser. During this session, you'll learn how to leverage Ext.Direct's existing functionality to make accessing your server data easier while eliminating common boiler-plate code. This session will spend more time on introductory material. The session repeat on Tuesday will spend more time on advanced material including developing routers, using ColdFusion as an example. \n\nPresented by Aaron Conran.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/111/724/111724762_200.jpg"
            },
            {
                "id": "17905336",
                "title": "SenchaCon 2010: Advanced Templates for Ext JS",
                "description": "In this session you'll learn how to go beyond basic templating and harness the power of XTemplate to create complex, data-bound HTML. We'll show you how to use XTemplate in ways you didn't think were possible. Among other topics, we'll look at Javascript member functions, recursive templates, subtemplates, and layouts for lists. \n\nPresented by James Brantly.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/111/935/111935062_200.jpg"
            },
            {
                "id": "17920271",
                "title": "SenchaCon 2010: Creating Ext JS Extensions and Components",
                "description": "One of the great benefits of developing in Ext JS is its clean extensibility. This lets you create reusable components easily that other developers can simply drop into their own applications with minimal effort. In this session, you'll learn how to create a re-usable component for Ext JS, and I'll describe my own experience creating Ext Scheduler - the scheduling component for Ext JS. \n\nPresented by Mats Bryntse.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/112/046/112046224_200.jpg"
            },
            {
                "id": "18080793",
                "title": "SenchaCon 2010: Debugging Your Ext JS Code",
                "description": "To err is human, to code flawlessly is divine. During this session, you'll learn how to debug your JavaScript, Data, and Ext JS based applications using commonly available tools and advanced insight into the Ext JS component framework and life-cycle.\n\nPresented by Aaron Conran & Jarred Nicholls.\n\nCheck out http://sencha.com/​conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/113/275/113275508_200.jpg"
            }
        ]
    },
    {
        group: "Sencha Touch",
        videos: [
            {
                "id": "17677004",
                "title": "SenchaCon 2010: Sencha Touch for the Mobile Web",
                "description": "Sencha Touch leverages HTML5 and CSS3 to provide a robust web app framework for webkit based mobile browsers. This session is a high-level introduction to Sencha Touch. We will cover components and data handling, theming, best practices, and deployment, and talk about the roadmap for Sencha Touch 2.0.\n\nPresented by David Kaneda.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/110/201/110201978_200.jpg"
            },
            {
                "id": "17705448",
                "title": "SenchaCon 2010: Structuring Your Sencha Touch Application",
                "description": "In this session you'll learn about the recommended application structure for Sencha Touch (or Ext JS) applications. The new application structure enables any Sencha developer to quickly understand any Sencha application using the new Sencha MVC package.\n\nPresented by Tommy Maintz.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/110/423/110423355_200.jpg"
            },
            {
                "id": "17838527",
                "title": "SenchaCon 2010: Mobile Development Challenges & Solutions",
                "description": "Mobile web development is becoming exciting again! HTML5 capable mobile devices have blown away the old conventions about how to develop mobile web experiences. But significant challenges still remain. Please join our panel of mobile technology and device experts as they discuss the big challenges in mobile web development as well as what's next for the mobile web. Panel.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/111/434/111434781_200.jpg"
            },
            {
                "id": "17806772",
                "title": "SenchaCon 2010: Creating Native Apps with Sencha and PhoneGap",
                "description": "Creating native, cross-platform mobile applications doesn't need to be any more complicated than creating a mobile web app. In this session, we will discuss using PhoneGap to create installable web apps that work seamlessly across iOS, Android, BlackBerry and other platforms. We'll look at what features of your web server you can port to the client side, and how to manage syncing with a remote server to create the best mobile experience, online or off.\n\nPresented by Andrew Lunny.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/111/189/111189208_200.jpg"
            },
            {
                "id": "17799772",
                "title": "SenchaCon 2010: Developing Mobile Web Apps for RIM BB6",
                "description": "After years of false starts, the mobile web is finally getting it right by essentially keeping desktop web standards as is, providing enticing HTML5 capabilities, and having frameworks addressing user experience issues unique to the mobile form factor. RIM has built its BlackBerry WebWorks platform using de-facto standards such as WebKit, and great implementations of key web standards such as HTML5, CSS3, SVG and JavaScript. BlackBerry WebWorks enables developers to use modern web technologies to build mobile applications. In this session, we will review the core aspects of this new platform, and provide a few best practices and code samples.\n\nPresented by Laurent Hasson.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/111/138/111138013_200.jpg"
            },
            {
                "id": "17699976",
                "title": "SenchaCon 2010: Performance Optimization for Sencha Touch",
                "description": "Mobile devices have very limited processing power compared to modern desktops. It's essential to keep performance optimization in mind when developing Touch applications. Here, we'll discuss how to keep your mobile web app fast and lightweight. We'll learn about such techniques as keeping your DOM slim, managing troublesome CSS3 properties, and other ways to keep your app sleek and responsive.\n\nPresented by Tommy Maintz.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/110/383/110383037_200.jpg"
            },
            {
                "id": "17414405",
                "title": "Sencha Touch - Intro to Listeners",
                "description": "Drew Neil (@nelstrom) describes the basics of how listeners work in Sencha Touch. This tutorial is perfect for beginners who want to understand how to create custom behavior and functionality inside their Sencha Touch mobile app.\n\nSencha Touch is a JavaScript framework for mobile touchscreens like Apple iOS and Google Android devices. Learn more at http://sencha.com/touch\n\nGitHub repo: http://github.com/nelstrom/Sencha-Touch-listeners-demo",
                "thumb": "http://b.vimeocdn.com/ts/108/175/108175461_200.jpg"
            },
            {
                "id": "16289757",
                "title": "XTemplates in Sencha Touch,        Part 1 of 2",
                "description": "Drew Neil (@nelstrom) has created a two-part series describing how to use XTemplates, a powerful templating system in Ext JS and Sencha Touch that allows developers to easily format views around dynamic data.\n\nCheck out part 2 here: http://vimeo.com/16289990\n\nGitHub repo: http://github.com/nelstrom/Sencha-Touch-templates-demo\n\nRead more about Sencha Touch at http://sencha.com/touch/",
                "thumb": "http://b.vimeocdn.com/ts/995/102/99510249_200.jpg"
            },
            {
                "id": "16289990",
                "title": "XTemplates in Sencha Touch,        Part 2 of 2",
                "description": "Drew Neil (@nelstrom) has created a two-part series describing how to use XTemplates, a powerful templating system in Ext JS and Sencha Touch that allows developers to easily format views around dynamic data.\n\nCheck out part 1 here: http://vimeo.com/16289757\n\nGithub repo: http://github.com/nelstrom/Sencha-Touch-templates-demo\n\nRead more about Sencha Touch at http://sencha.com/touch/",
                "thumb": "http://b.vimeocdn.com/ts/995/124/99512436_200.jpg"
            },
            {
                "id": "15888504",
                "title": "Sencha Touch - Intro to Layouts",
                "description": "Drew Neil (@nelstrom) describes the basics of how layouts work in Sencha Touch. This tutorial is perfect for beginners who want to understand how to create components and buttons inside their Sencha Touch mobile app.\n\nSencha Touch is a JavaScript framework for mobile touchscreens like Apple iOS and Google Android devices. Learn more at http://sencha.com/touch",
                "thumb": "http://b.vimeocdn.com/ts/964/302/96430249_200.jpg"
            },
            {
                "id": "15879797",
                "title": "Sencha Touch - Intro to Panels",
                "description": "Drew Neil (@nelstrom) describes the basics of how panels work in Sencha Touch. This tutorial is perfect for beginners who want to understand how to create components and buttons inside their Sencha Touch mobile app.\n\nGithub repo: http://github.com/nelstrom/Sencha-Touch-panels-demo\n\nSencha Touch is a JavaScript framework for mobile touchscreens like Apple iOS and Google Android devices. Learn more at http://sencha.com/touch",
                "thumb": "http://b.vimeocdn.com/ts/964/296/96429682_200.jpg"
            },
            {
                "id": "15672696",
                "title": "Sencha Touch - Create a Twitter App w/ Geolocation",
                "description": "Drew Neil (@nelstrom) demonstrates how to create a Geolocation-powered Twitter mobile app with Sencha Touch in this 12:30 tutorial video.\n\nSencha Touch is a JavaScript framework for mobile touchscreens like Apple iOS and Google Android devices. Learn more at http://sencha.com/touch",
                "thumb": "http://b.vimeocdn.com/ts/948/005/94800528_200.jpg"
            },
            {
                "id": "15672257",
                "title": "Sencha Touch - Layouts Walkthrough",
                "description": "Brian Suda describes and demonstrates how Sencha Touch layouts work in this nine minute tutorial. \n\nSencha Touch is a JavaScript framework for mobile touchscreens like Apple iOS and Google Android devices.\n\nHopefully these tutorials give you a head start on your next great mobile web app! Enter our App Contest today! http://sencha.com/contest",
                "thumb": "http://b.vimeocdn.com/ts/947/950/94795088_200.jpg"
            },
            {
                "id": "12636777",
                "title": "Sencha Touch Introduction",
                "description": "See more at:\n\nhttp://www.sencha.com/products/touch/",
                "thumb": "http://b.vimeocdn.com/ts/712/681/71268191_200.jpg"
            },
            {
                "id": "26784522",
                "title": "Sencha Touch - Working With Forms",
                "description": "Drew Neil (@nelstrom) demonstrates how to use Sencha Touch to create applications that allow users to interact with data through forms, and using a simple MVC pattern.\n\nThe GitHub repo for the application is at https://github.com/senchalearn/Forms-demo\n\nSencha Touch is a JavaScript framework for mobile touchscreens like Apple iOS, BlackBerry OS, and Google Android devices. Learn more at http://sencha.com/​touch",
                "thumb": "http://b.vimeocdn.com/ts/177/225/177225322_200.jpg"
            },
            {
                "id": "26651228",
                "title": "Sencha Touch Charts",
                "description": "Introducing Sencha Touch Charts — the world’s first HTML5-based, mobile charting and drawing product. Sencha Touch Charts enables you to build complex radar, bar, line, stacked, and pie charts wiith stunning interactivity and incredible ease of use. Visualizing rich data on the mobile web has never been easier.",
                "thumb": "http://b.vimeocdn.com/ts/176/207/176207932_200.jpg"
            },
            {
                "id": "24475654",
                "title": "Sencha Touch - An Introduction to Carousels",
                "description": "Drew Neil (@nelstrom) demonstrates how to use Sencha Touch to create carousel-based apps, such as this artist's portfolio.\n\nHe also gives a brief introduction to the src.sencha.io resizing service.\n\nThe GitHub repo for the application is at https://github.com/nelstrom/Sencha-Touch-Carousel-demo\n\nSencha Touch is a JavaScript framework for mobile touchscreens like Apple iOS, BlackBerry OS, and Google Android devices. Learn more at http://sencha.com/​touch",
                "thumb": "http://b.vimeocdn.com/ts/160/390/160390728_200.jpg"
            },
            {
                "id": "23358554",
                "title": "Sencha Touch & PhoneGap demo,          SourceDevCon 2011",
                "description": "This is the final demo from James Pearce's PhoneGap session at Source DevCon, 2011.\n\nThe standard SeattleBars application is enhanced to add a button to each detail page, which in turn fires the createContact() function, containing the code to add a new record via the PhoneGap contacts API.\n\nThe new contact record contains name, telephone number, and photo. The PhoneGap notification API is used to alert the user to the API's success.\n\nThe source code for this demo can be found in Jesse MacFadyen's fork of the app: https://github.com/purplecabbage/seattlebars",
                "thumb": "http://b.vimeocdn.com/ts/152/004/152004852_200.jpg"
            },
            {
                "id": "22499845",
                "title": "Sencha Touch running on a Sony Touch TV/PC",
                "description": "The Sencha Touch kitchen sync demo app, running on a Sony Touch TV/PC",
                "thumb": "http://b.vimeocdn.com/ts/145/472/145472382_200.jpg"
            },
            {
                "id": "22264545",
                "title": "Sencha Touch UI for iPad",
                "description": "Sencha Touch user interface walkthrough for large touchscreens like Apple iPad.\n\nThis video showcases Sencha Touch 1.0, which was released November 14th, 2010. Learn more at http://sencha.com/touch",
                "thumb": "http://b.vimeocdn.com/ts/143/765/143765029_200.jpg"
            },
            {
                "id": "22251762",
                "title": "Sencha Touch Tabs and Toolbars",
                "description": "Drew Neil (@nelstrom) demonstrates how to use Sencha Touch to create a tabbed interface with icons, and how toolbars can be used to hold buttons, or a titlebar.\n\nGitHub repo: https://github.com/nelstrom/Sencha-Touch-tabs-and-toolbars-demo\n\nSencha Touch is a JavaScript framework for mobile touchscreens like Apple iOS and Google Android devices. Learn more at http://sencha.com/touch",
                "thumb": "http://b.vimeocdn.com/ts/143/657/143657434_200.jpg"
            },
            {
                "id": "20672408",
                "title": "Sencha Labs EventRecorder for Android",
                "description": "The WebKit team at Sencha Inc. has created an open source tool essential to anyone doing web app development on Android mobile devices.\n\nRead more about this project on our blog: http://www.sencha.com/blog/event-recorder-for-android-web-applications/",
                "thumb": "http://b.vimeocdn.com/ts/132/808/132808875_200.jpg"
            },
            {
                "id": "20580117",
                "title": "Sencha Touch - Intro to Nested List Component",
                "description": "Drew Neil (@nelstrom) demonstrates using the NestedList Component in Sencha Touch. Sencha Touch is a JavaScript framework for mobile touchscreens like Apple iOS and Google Android devices.\n\nGitHub repo: https://github.com/nelstrom/Sencha-Touch-nested-list-demo",
                "thumb": "http://b.vimeocdn.com/ts/144/050/144050526_200.jpg"
            },
            {
                "id": "19245335",
                "title": "Sencha Touch - Intro to List Component",
                "description": "Drew Neil (@nelstrom) demonstrates using the List Component in Sencha Touch. Sencha Touch is a JavaScript framework for mobile touchscreens like Apple iOS and Google Android devices.\n\nGitHub repo: https://github.com/nelstrom/Sencha-Touch-list-view-demo",
                "thumb": "http://b.vimeocdn.com/ts/144/050/144050468_200.jpg"
            },
            {
                "id": "18446970",
                "title": "SenchaCon 2010: Developing Mobile Web Apps for RIM BB6",
                "description": "After years of false starts, the mobile web is finally getting it right by essentially keeping desktop web standards as is, providing enticing HTML5 capabilities, and having frameworks addressing user experience issues unique to the mobile form factor. RIM has built its BlackBerry WebWorks platform using de-facto standards such as WebKit, and great implementations of key web standards such as HTML5, CSS3, SVG and JavaScript. BlackBerry WebWorks enables developers to use modern web technologies to build mobile applications. In this session, we will review the core aspects of this new platform, and provide a few best practices and code samples.\n\nPresented by Laurent Hasson.\n\nCheck out http://sencha.com/​conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/116/043/116043775_200.jpg"
            },
            {
                "id": "18036452",
                "title": "SenchaCon 2010: Serving Mobile Apps from Content Management Systems",
                "description": "Hundreds of millions of web sites around the world are served from Content Management Systems like WordPress and Drupal. How do you equip these platforms to deal with the inevitable rise of mobile web technologies? In this session, we will explore how to create great mobile sites and apps from your existing content, using Sencha Touch.\n\nPresented by James Pearce.\n\nCheck out http://sencha.com/​conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/112/915/112915586_200.jpg"
            },
            {
                "id": "17882927",
                "title": "SenchaCon 2010: Performance Optimization for Sencha Touch",
                "description": "Mobile devices have very limited processing power compared to modern desktops. It's essential to keep performance optimization in mind when developing Touch applications. Here, we'll discuss how to keep your mobile web app fast and lightweight. We'll learn about such techniques as keeping your DOM slim, managing troublesome CSS3 properties, and other ways to keep your app sleek and responsive. \n\nPresented by Tommy Maintz.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/111/768/111768410_200.jpg"
            },
            {
                "id": "17879651",
                "title": "SenchaCon 2010: Theming Sencha Touch",
                "description": "Sencha Touch features a novel theming system built on top of SASS & Compass. This session will show you how to quickly customize the look and feel of your application, extend core styles, and optimize your stylesheets to download faster. Lot of code samples and walkthroughs included. \n\nPresented by David Kaneda.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/111/744/111744470_200.jpg"
            },
            {
                "id": "17853133",
                "title": "SenchaCon 2010: Debugging Sencha Touch Apps",
                "description": "Debugging applications on mobile devices is challenging. Although simulators exist, tooling is limited. Luckily, with some accomodations, you can debug your mobile web applications using most desktop tools. In this session, we'll go over what works, what doesn't and how to use tools appropriately to debug your mobile web app. \n\nPresented by Tommy Maintz.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/111/533/111533399_200.jpg"
            },
            {
                "id": "18134446",
                "title": "Introduction to Sencha Touch: Hello World",
                "description": "Ready to build your first mobile web app with Sencha Touch? We recently conducted a great introductory webinar, which provides step-by-step instructions for getting started with Sencha Touch. We run through the absolute basics of building your first Sencha Touch app in the time-honored tradition of displaying the words \"Hello World.\"\n\nPresented by James Pearce.\n\nCheck out http://sencha.com/​conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/113/695/113695030_200.jpg"
            },
            {
                "id": "18093057",
                "title": "SenchaCon 2010: Designing The Mobile User Experience",
                "description": "Creating mobile applications that people love to use is a challenging task. In this session, we'll go over the steps required to create a great user experience for different categories of applications and use contexts. We'll review great, and not-so-great mobile design examples and provide practical tips and best practices.\n\nPresented by Brian Fling.\n\nCheck out http://sencha.com/​conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/113/368/113368889_200.jpg"
            }
        ]
    },
    {
        group: 'EXT GWT',
        videos: [
            {
                "id": "17796860",
                "title": "SenchaCon 2010: Best Practices in Ext GWT",
                "description": "Ext GWT provides a solid foundation to build rich internet applications. In this session, you will learn the best practices used to build these applications. Topics include how to use HTML templates and HtmlLayout, MVC / MVP, RPC, and managing data.\n\nPresented by Darrell Meyer.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/111/115/111115670_200.jpg"
            },
            {
                "id": "17735654",
                "title": "SenchaCon 2010: Building Custom Components in Ext GWT",
                "description": "Although Ext GWT contains a very rich component toolkit, it is often necessary to extend existing components or create completely new custom components. In this session, you will learn how to effectively create custom Ext GWT components via custom HTML, CSS and code.\n\nPresented by Rasmus Ersmarker.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/110/642/110642455_200.jpg"
            },
            {
                "id": "17707091",
                "title": "SenchaCon 2010: Advanced Performance Tuning in Ext GWT",
                "description": "Application performance is critical to a usable user interface. Learn about the tools and techniques that Ext GWT developers can use to tune client-side code. Get detailed instructions on how to use the available performance profiling tools including Speed Tracer, Firebug, and Visual Studio.\n\nPresented by Darrell Meyer.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/110/432/110432008_200.jpg"
            },
            {
                "id": "17681624",
                "title": "SenchaCon 2010: Introducing Ext GWT 3",
                "description": "Ext GWT 3 is coming! Learn about the new features in Ext GWT 3.0, including the implementation of the GWT handler design, UIBinder support, component lifecycle changes, and new and improved components such as the tri-state tree panel and tree grid and pivot grid.\n\nPresented by Darrell Meyer.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/110/237/110237369_200.jpg"
            },
            {
                "id": "18318520",
                "title": "SenchaCon 2010: Data Loading for Ext GWT",
                "description": "The Ext GWT Data Loading API provides a powerful and flexible mechanism for retrieving remote or local data and binding the data to user interface components. During this session, you will learn will learn the difference between Data Loaders, Proxies and Readers and how they work together.\n\nPresented by Darrell Meyer & Sven Brunken.\n\nCheck out http://sencha.com/​conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/115/068/115068126_200.jpg"
            }
        ]
    },
    {
        group: 'Animator and Designer',
        videos: [
            {
                "id": "16219994",
                "title": "Sencha Animator Bouncing Ball Demo",
                "description": "Introducing Sencha Animator, a powerful desktop application to create awesome CSS3 animations for WebKit browsers and touchscreen mobile devices. \n\nMake your static content come to life quickly and easily, without the dependency of third-party plugins or writing a single line of CSS code. In no time at all, you’ll be creating rich experiences for today’s most popular devices; including Apple iPhone/iPad, BlackBerry Torch and Google Android.\n\nRead more: http://www.sencha.com/​products/​animator/​",
                "thumb": "http://b.vimeocdn.com/ts/989/313/98931329_200.jpg"
            },
            {
                "id": "16219355",
                "title": "Sencha Animator Introduction",
                "description": "Introducing Sencha Animator, a powerful desktop application to create awesome CSS3 animations for WebKit browsers and touchscreen mobile devices. \n\nMake your static content come to life quickly and easily, without the dependency of third-party plugins or writing a single line of CSS code. In no time at all, you’ll be creating rich experiences for today’s most popular devices; including Apple iPhone/iPad, BlackBerry Torch and Google Android.\n\nRead more: http://www.sencha.com/products/animator/",
                "thumb": "http://b.vimeocdn.com/ts/989/288/98928805_200.jpg"
            },
            {
                "id": "25109950",
                "title": "Sencha Animator Rocking Boat Demo",
                "description": "",
                "thumb": "http://b.vimeocdn.com/ts/165/147/165147784_200.jpg"
            },
            {
                "id": "23624568",
                "title": "Sencha Animator - 1.0 Beta 1 Highlights",
                "description": "Luca Candela gives you a tour of the highlighted features in Sencha Animator 1.0 Beta 1, including the gradient editor, custom easing, scene support, click actions, and previewing in your browser.\n\nSencha Animator is a desktop app to create CSS3 animations for WebKit browsers and touchscreen mobile devices. Find out more about Sencha Animator: http://sencha.com/animator",
                "thumb": "http://b.vimeocdn.com/ts/153/994/153994732_200.jpg"
            },
            {
                "id": "23624550",
                "title": "Sencha Animator - Making a Loading Bar",
                "description": "Arne Bech (@arnebech) shows you how to make an indefinite loading bar with HTML5 and CSS3 animations created with Sencha Animator.\n\nDownload the project files: http://dev.sencha.com/animator/demos/LoadingBar.zip \n\nSencha Animator is a desktop app to create CSS3 animations for WebKit browsers and touchscreen mobile devices. Find out more about Sencha Animator: http://sencha.com/animator",
                "thumb": "http://b.vimeocdn.com/ts/153/994/153994330_200.jpg"
            },
            {
                "id": "17858901",
                "title": "SenchaCon 2010: Creating CSS3 Animations with Sencha Animator",
                "description": "CSS3 animations are a new tool in the armory of web developers and designers. In this session, we'll walk you through the building blocks of a CSS3 animation and show you how to create them with Sencha Animator, our new CSS3 Animation builder. We'll also talk about the limitations of today's CSS3 animations, and how to leverage some of the more obscure CSS3 properties to get around them. \n\nPresented by Michael Mullany.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/111/584/111584318_200.jpg"
            },
            {
                "id": "14588615",
                "title": "Ext Designer screencast",
                "description": "Build a simple product browser in less than five minutes.",
                "thumb": "http://b.vimeocdn.com/ts/126/241/126241425_200.jpg"
            },
            {
                "id": "17921733",
                "title": "SenchaCon 2010: Advanced Techniques for Ext Designer",
                "description": "Ext Designer enables developers and non-developers alike to rapidly prototype their UI and Data Stores. In this session, learn how to best utilize and integrate the Ext Designer with your project. Discover the features and advanced techniques of the Ext Designer that promote reusable component-oriented development across all of your projects. We'll also show you Ext Designer working with Sencha Touch projects.\n\nPresented by Jarred Nicholls and Aaron Conran.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/112/055/112055350_200.jpg"
            },
            {
                "id": "18299682",
                "title": "SenchaCon 2010: Bring Your Own Laptop: Ext Designer Hands-on",
                "description": "Bring your laptop to this hands-on session and learn to build a Movie Store app using Ext Designer. You will understand how to export your project and add behavior to your Ext JS app using your favorite IDE.\n\nPresented by Ashvin Radiya.\n\nCheck out http://sencha.com/​conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/114/922/114922536_200.jpg"
            }
        ]
    },
    {
        group: 'Miscelaneous',
        videos: [
            {
                "id": "17802908",
                "title": "SenchaCon 2010: HTML5: State of the Union",
                "description": "HTML5 has emerged as this year's web technology buzzword, but it's quickly become overloaded and overused. In this session, we'll walk through the various parts of \"HTML5\" separating out the core spec from its satellite specs, as well as the CSS3 family. We'll also take a look at the state of implementations on mobile and desktop browsers.\n\nPresented by Michael Mullany.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/111/160/111160207_200.jpg"
            },
            {
                "id": "17628355",
                "title": "SenchaCon 2010: Welcome and Keynote Address",
                "description": "See what the future holds for Sencha products and endeavors. Presented by CEO Abe Elias and team.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/109/825/109825415_200.jpg"
            },
            {
                "id": "17131795",
                "title": "Sencha Customer Testimonials",
                "description": "Hear how AdMob, Widgetbox, Marketo, and Momentum Design Lab use Sencha frameworks to develop amazing web applications.",
                "thumb": "http://b.vimeocdn.com/ts/105/981/105981266_200.jpg"
            },
            {
                "id": "16874581",
                "title": "Sencha Touch App Contest Winner,        Cahit Gurguc with DailyCrossword",
                "description": "Cahit Gurguc, the winner of our Sencha Touch App Contest, sent us his acceptance speech from Turkey. We showed it during our keynote address at SenchaCon 2010 in San Francisco to a packed room of over 500 people.\n\nSee more at http://sencha.com/contest",
                "thumb": "http://b.vimeocdn.com/ts/103/997/103997434_200.jpg"
            },
            {
                "id": "17844271",
                "title": "SenchaCon 2010: All About HTML5 Offline Storage",
                "description": "HTML5 gives us a number of different techniques for storing information on the client machine: AppCache for storing local copies of assets, localStorage for quick and simple key/value data, WebSQL and IndexDB for full SQL-like queries, and the FileSystem APIs for reading/writing files to a persistent sandbox. We'll spend time discussing all of these solutions and when you would want to use each. \n\nPresented by Eric Bidelman.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/111/478/111478226_200.jpg"
            },
            {
                "id": "17840717",
                "title": "SenchaCon 2010: Designing for Accessibility with ARIA",
                "description": "ARIA is an accessibility standard that provides capabilities such as screen-reader access to application functionality. During this session, we'll take a tour of the latest accessibility enhancements to Ext JS and Ext GWT including improved keyboard navigation, ARIA and focus management. We'll also discuss how government standards like Section 508 may apply to your organization. \n\nPresented by Aaron Conran.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/111/451/111451316_200.jpg"
            },
            {
                "id": "18783283",
                "title": "SenchaCon 2010: JavaScript Engines: Under the Hood",
                "description": "A browser's JavaScript engine can seem like a magical black box. During this session, we'll show you how they work from 10, 000 feet and give you the tricks to compile all the popular engines out there including JavaScriptCore, V8, and SpiderMonkey). We'll inspect the internals of the engine, and debug+profile your favorite code snippets. Armed with just a little extra knowledge about this black box, you will be ready to take a new look at JavaScript apps.",
                "thumb": "http://b.vimeocdn.com/ts/118/429/118429198_200.jpg"
            },
            {
                "id": "18780399",
                "title": "SenchaCon 2010: Compiling and Optimizing Your Own Browser with WebKit",
                "description": "Webkit is the layout engine behind Safari, Chrome and almost every mobile browser. But did you ever wonder how to build WebKit yourself? In this session, you'll learn the simple steps, along with never-seen-before techniques, on how to experiment with WebKit on your own. You'll learn how to find the root of various performance problems, automate a wide array of regression tests, and see how WebKit works to produce the render tree, resolve complex styling, execute scripts, and more.",
                "thumb": "http://b.vimeocdn.com/ts/118/409/118409944_200.jpg"
            },
            {
                "id": "18777458",
                "title": "SenchaCon 2010: Creating Optimal Desktop User Experiences",
                "description": "Great User Experiences savs money in training and support and makes money in strong word-of-mouth marketing as well as customer referrals. However, the techniques and process to make great UX happen are often counter-intuitive and tricky. This session will demystify UX greatness and show you how you can create the optimal desktop user experience. This session will be content-rich with many topics covered.",
                "thumb": "http://b.vimeocdn.com/ts/118/390/118390396_200.jpg"
            },
            {
                "id": "17874381",
                "title": "SenchaCon 2010: Introduction to jQTouch",
                "description": "jQTouch, a Sencha Labs project, is a popular jQuery plugin for creating mobile web sites. It adds animations and simple behaviors to web content, and embodies a progressive enhancement/degradation approach to mobile web design. \n\nPresented by Sid Maestre.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/111/707/111707108_200.jpg"
            },
            {
                "id": "17872119",
                "title": "SenchaCon 2010: Developing in HTML5: Widgetbox & Sencha Touch",
                "description": "The future of mobile is with cross platform mobile web apps. In this session you'll discover how Widgetbox used Sencha Touch to rebuild their existing HTML5 mobile apps from the ground up. Using real-life product examples, we'll cover all aspects of developing on top of the Sencha framework including using Javascript, styling in CSS3, and taking advantage of performance optimization and workarounds. \n\nPresented by Giles Goodwin.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/111/689/111689944_200.jpg"
            },
            {
                "id": "18312985",
                "title": "SenchaCon 2010: JavaScript: Advanced Scoping & Other Puzzles",
                "description": "In this session, we'll review the fundamentals of JavaScript variable scope and common \"execution context\" (scope) challenges associated with early/late binding of event handlers, specifically within complex Ext JS layouts. We'll also bring several patterns (namespaced references, Function closures, inline references, ref/refOwner, and the \"Poor-man's message bus\") to bear on the bowl of soup we call \"scope.\"\n\nPresented by Doug Hendricks.\n\nCheck out http://sencha.com/​conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/115/026/115026061_200.jpg"
            },
            {
                "id": "18309352",
                "title": "SenchaCon 2010: Architecting for the Enterprise",
                "description": "Adopting early planning and architectural design strategies is essential to create scalable Enterprise apps that are ready to meet the demands of dynamic workforces, and can scale to meet future business needs. You'll learn how to leverage class-based UI development within evolving Agile/Waterfall development methodologies and how Ext.Direct, Connect, and Ext.data packages can assist with integration. We'll also review best practices for strong, unit-tested foundation classes that will support your 'next' enterprise solution.\n\nPresented by Doug Hendricks.\n\nCheck out http://sencha.com/​conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/114/998/114998224_200.jpg"
            },
            {
                "id": "18077379",
                "title": "SenchaCon 2010: Server-side JavaScript with Node,          Connect & Express",
                "description": "Node.js has unleashed a new wave of interest in server side Javascript. In this session, you'll learn how to get productive with node.js by leveraging Connect and Express node middleware. Connect makes it simple to stack layers and build complex web services with minimal effort and maximum reuse. We'll also walk quickly through Express - an easy-to-use framework built on top of Connect that makes development even faster.\n\nPresented by Tim Casewell & Ryan Dahl.\n\nCheck out http://sencha.com/​conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/113/250/113250420_200.jpg"
            },
            {
                "id": "17912546",
                "title": "SenchaCon 2010: Payments anywhere using PayPal Web API's",
                "description": "Lightweight web API's have exploded in the last few years. Payments, advertising and analytics services all have web API's that are easily integrated into mobile applications. In this session, you'll get a close look at the PayPal API and how it can be integrated into Sencha Touch applications. \n\nPresented by Praveen Alavilli of PayPal.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/111/990/111990039_200.jpg"
            },
            {
                "id": "18537381",
                "title": "SenchaCon 2010: The \"In Action\" Pattern for RIA Development",
                "description": "With RIAs growing in complexity, JavaScript developers today have to make tough choices on how to organize their code and do so in a manner that both allows for growth and ease of management. Often the wrong choices are made, impacting the maintenance cycles of the applications. In this session, we'll discuss exactly how to organize your code from ground up by exploring popular patterns used by today's industry leaders.\n\nPresented by Jay Garcia.\n\nCheck out http://sencha.com/​conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/116/691/116691974_200.jpg"
            },
            {
                "id": "18100173",
                "title": "SenchaCon 2010: Behavior Driven Testing with Jasmine",
                "description": "An intro to Jasmine: BDD for JavaScript. We'll talk about why you want to use a test framework for JavaScript testing, why use Jasmine, and review its features, syntax and infrastructure, including how best to incorporate into a Sencha application. \n\nPresented by Davis Frank.\n\nCheck out http://sencha.com/​conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/113/422/113422915_200.jpg"
            },
            {
                "id": "17834923",
                "title": "SenchaCon 2010: Introduction to Raphaël",
                "description": "Flash is not the only choice for cross-browser graphics on the web! In this session, you will learn about Raphaël, a rich SVG javascript library for developing vector graphics applications on the web, and walk through its API. Raphaël provides an adapter that makes drawing vector art cross-browser compatible and easy. Learn about the many possibilities for creating web applications using Raphaël.\n\nPresented by Dmitry Baranovskiy.\n\nCheck out http://sencha.com/conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/111/407/111407235_200.jpg"
            },
            {
                "id": "26506883",
                "title": "Theming Sencha Frameworks with Sass and Compass",
                "description": "",
                "thumb": "http://b.vimeocdn.com/ts/175/125/175125406_200.jpg"
            },
            {
                "id": "18084338",
                "title": "SenchaCon 2010: SASS - The Next Wave in Styling and Theming",
                "description": "CSS and CSS3 are an amazing toolbox for styling your applications, but they're a challenge to wrangle due to their wordy and encyclopedic nature. SASS is an overlay language for CSS that allows powerful and thorough control of CSS properties with a minimum of typing. In this session, we'll give you a thorough grounder in SASS.\n\nPresented by Chris Eppstein.\n\nCheck out http://sencha.com/​conference for more session videos.",
                "thumb": "http://b.vimeocdn.com/ts/113/301/113301648_200.jpg"
            }
        ]
    },
    {
        group: 'Archived',
        videos: [
            {
                "id": "25777031",
                "title": "Tour of Ext 1.x",
                "description": "Note: This video showcases a deprecated version of Ext JS. It is shown here for historical purposes only. Originally appeared on extjs.com in June 2007: \n\n\"If you're new here and wondering what Ext is all about, check out this video tour put together by Ext community member Scott Walter. At under 11 minutes long, it's packed with demonstrations of many of our most popular components.\"",
                "thumb": "http://b.vimeocdn.com/ts/169/917/169917645_200.jpg"
            }
        ]
    }
];
