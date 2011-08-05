/**
 * The Welcome page of docs app.
 */
Ext.define('Docs.view.index.Welcome', {
    extend: 'Ext.container.Container',
    alias : 'widget.welcomecontainer',
    id : 'welcome',
    cls: 'welcome iScroll',

    html: [
        '<img src="resources/images/welcome.jpg" style="display: block; margin: 10px auto 0 auto;" />',
        '<div class="news">',
            '<div class="l">',
                '<h1>SDK Updates</h1>',
                '<div class="item"><span class="date">Jul 24</span> Ext 4.0.5 Released (support subscribers only)</div>',
                '<div class="item"><span class="date">Jun 29</span> Ext 4.0.4 Released (support subscribers only)</div>',
                '<div class="item"><span class="date">Jun 14</span> Ext 4.0.3 Released (support subscribers only)</div>',
                '<div class="item"><span class="date">Jun 9</span> Ext 4.0.2a Released</div>',
                '<div class="item"><span class="date">May 17</span> Ext 4.0.1 Released</div>',
                '<div class="item"><span class="date">Apr 26</span> Ext 4.0.0 Final Released</div>',
                '<div class="item"><span class="date">Apr 14</span> Ext 4 Beta 3 Released</div>',
                '<div class="item"><span class="date">Apr 6</span> Ext 4 Beta 2 Released</div>',
                '<div class="item"><span class="date">Mar 30</span> Ext 4 Beta 1 Released</div>',
                '<div class="item"><span class="date">Mar 18</span> Ext 4 PR 5 Released</div>',
                '<div class="item"><span class="date">Mar 15</span> Ext 4 PR 4 Released</div>',
                '<div class="item"><span class="date">Mar 3</span> Ext 4 PR 3 Released</div>',
                '<div class="item"><span class="date">Feb 23</span> Ext 4 PR 2 Released</div>',
                '<div class="item"><span class="date">Feb 16</span> Ext 4 PR 1 Released</div>',
            '</div>',
            '<div class="r">',
                '<h1>Documentation updates</h1>',
                '<div class="item"><span class="date">Jul 14</span> Favorite classes</div>',
                '<div class="item"><span class="date">Jul 8</span> Search results pagination</div>',
                '<div class="item"><span class="date">Jun 29</span> Components Guide</div>',
                '<div class="item"><span class="date">Jun 26</span> Inline examples</div>',
                '<div class="item"><span class="date">Jun 21</span> Forms guide</div>',
                '<div class="item"><span class="date">Jun 16</span> Tree guide updates</div>',
                '<div class="item"><span class="date">Jun 15</span> Layouts guide</div>',
                '<div class="item"><span class="date">Jun 9</span> Grid guide updates</div>',
                '<div class="item"><span class="date">Jun 6</span> Data guide updates</div>',
                '<div class="item"><span class="date">Jun 2</span> MVC guide updates</div>',
                '<div class="item"><span class="date">May 31</span> Getting started guide updates</div>',
            '</div>',
        '</div>'
    ]
});
