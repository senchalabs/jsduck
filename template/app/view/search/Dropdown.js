/**
 * Renders search results list.
 */
Ext.define('Docs.view.search.Dropdown', {
    extend: 'Ext.view.View',
    alias: 'widget.searchdropdown',

    floating: true,
    autoShow: false,
    autoRender: true,
    toFrontOnShow: true,
    focusOnToFront: false,

    store: 'Search',

    id: 'search-dropdown',
    overItemCls:'x-view-over',
    trackOver: true,
    itemSelector:'div.item',
    singleSelect: true,

    pageStart: 0,
    pageSize: 10,

    initComponent: function() {
        this.addEvents(
            /**
             * @event
             * Fired when previous or next page link clicked.
             * @param {Ext.view.View} this
             * @param {Number} delta  Either +1 for next page or -1 for previous page
             */
            "changePage",
            /**
             * @event
             * Fired when the footer area is clicked.
             * Used to prevent hiding of dropdown.
             * @param {Ext.view.View} this
             */
            "footerClick"
        );

        this.tpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="item {type}">',
                    '<div class="title">{member}</div>',
                    '<div class="class">{cls}</div>',
                '</div>',
            '</tpl>',
            '<div class="footer">',
                '<a href="#" class="prev">&lt;</a>',
                '<span class="total">{[this.getStart()+1]}-{[this.getEnd()]} of {[this.getTotal()]}</span>',
                '<a href="#" class="next">&gt;</a>',
            '</div>',
            {
                getTotal: Ext.bind(this.getTotal, this),
                getStart: Ext.bind(this.getStart, this),
                getEnd: Ext.bind(this.getEnd, this)
            }
        );

        // Listen for clicks on next and prev links
        this.on("afterrender", function() {
            this.el.addListener('click', function() {
                this.fireEvent("changePage", this, -1);
            }, this, {
                preventDefault: true,
                delegate: '.prev'
            });

            this.el.addListener('click', function() {
                this.fireEvent("changePage", this, +1);
            }, this, {
                preventDefault: true,
                delegate: '.next'
            });

            this.el.addListener('click', function() {
                this.fireEvent("footerClick", this);
            }, this, {
                delegate: '.footer'
            });
        }, this);

        this.callParent(arguments);
    },

    /**
     * Sets number of total search results
     * @param {Number} total
     */
    setTotal: function(total) {
        this.total = total;
    },

    /**
     * Returns number of total search results
     * @return {Number}
     */
    getTotal: function() {
        return this.total;
    },

    /**
     * Sets the index of first item in dropdown of total
     * @param {Number} start
     */
    setStart: function(start) {
        this.pageStart = start;
    },

    /**
     * Returns the index of first item in dropdown of total
     * @return {Number}
     */
    getStart: function(start) {
        return this.pageStart;
    },

    /**
     * Returns the index of last item in dropdown of total
     * @return {Number}
     */
    getEnd: function(start) {
        var end = this.pageStart + this.pageSize;
        return end > this.total ? this.total : end;
    }
});
