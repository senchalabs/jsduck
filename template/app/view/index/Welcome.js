/**
 * The Welcome page of docs app.
 */
Ext.define('Docs.view.index.Welcome', {
    extend: 'Ext.container.Container',
    alias : 'widget.welcomecontainer',
    id : 'welcome',
    cls: 'welcome',

    html: [
        '<h1>SDK Updates</h1>',
        '<div>Jul 24. Ext 4.0.5 Released (support subscribers only)</div>',
        '<div>Jun 29. Ext 4.0.4 Released (support subscribers only)</div>',
        '<div>Jun 14. Ext 4.0.3 Released (support subscribers only)</div>',
        '<div>Jun 9. Ext 4.0.2a Released</div>',
        '<div>May 17. Ext 4.0.1 Released</div>',
        '<div>Apr 26. Ext 4.0.0 Final Released</div>',
        '<div>Apr 14. Ext 4 Beta 3 Released</div>',
        '<div>Apr 6. Ext 4 Beta 2 Released</div>',
        '<div>Mar 30. Ext 4 Beta 1 Released</div>',
        '<div>Mar 18. Ext 4 PR 5 Released</div>',
        '<div>Mar 15. Ext 4 PR 4 Released</div>',
        '<div>Mar 3. Ext 4 PR 3 Released</div>',
        '<div>Feb 23. Ext 4 PR 2 Released</div>',
        '<div>Feb 16. Ext 4 PR 1 Released</div>',
        '<h1>Documentation updates</h1>',
        '<div>Jul 14. Favorite classes</div>',
        '<div>Jul 8. Search results pagination</div>',
        '<div>Jun 29. Components Guide</div>',
        '<div>Jun 26. Inline examples</div>',
        '<div>Jun 21. Forms guide</div>',
        '<div>Jun 16. Tree guide updates</div>',
        '<div>Jun 15. Layouts guide</div>',
        '<div>Jun 9. Grid guide updates</div>',
        '<div>Jun 6. Data guide updates</div>',
        '<div>Jun 2. MVC guide updates</div>',
        '<div>May 31. Getting started guide updates</div>',
        '<h1>Release Notes</h1>',
        ''
    ]
});
