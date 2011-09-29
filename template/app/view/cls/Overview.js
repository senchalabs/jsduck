/**
 * Panel that displays class documentation.
 * Including the toolbar and some behavior.
 */
Ext.define('Docs.view.cls.Overview', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.classoverview',
    requires: [
        'Docs.view.cls.Toolbar',
        'Docs.view.examples.Inline',
        'Docs.Syntax',
        'Docs.Settings'
    ],

    cls: 'class-overview iScroll',
    autoScroll: true,
    border: false,
    bodyPadding: '20 8 20 5',

    initComponent: function() {
        this.addEvents(
            /**
             * @event
             * Fired after class docs loaded panel.
             */
            'afterload'
        );
        this.callParent(arguments);
    },

    /**
     * Scrolls the specified element into view
     *
     * @param {String} query  DomQuery selector string.
     * @param {String} offset  Additional scroll offset.
     */
    scrollToEl: function(query, offset) {
        var el = (typeof query == 'string') ? Ext.get(Ext.query(query)[0]) : query;
        if (el) {
            var isMember = el.hasCls("member");
            var scrollOffset = el.getY() - (isMember ? 165 : 155) + (offset || 0);
            var docContent = this.getEl().down('.x-panel-body');
            var currentScroll = docContent.getScroll()['top'];
            docContent.scrollTo('top', currentScroll + scrollOffset);

            if (isMember && el.down(".expandable")) {
                el.addCls('open');
            }
            el.highlight();
        }
    },

    /**
     * Renders class documentation in this panel.
     *
     * @param {Object} docClass
     */
    load: function(docClass) {
        this.docClass = docClass;

        if (this.toolbar) {
            // Workaround for bug in ExtJS.
            // 1. autoDestroy needs to be set to fals explicitly
            // 2. using autoDestroy=true doesn't work, don't know why
            //    but destroying the toolbar explicitly afterwards works fine.
            this.removeDocked(this.toolbar, false);
            this.toolbar.destroy();
        }
        this.toolbar = Ext.create('Docs.view.cls.Toolbar', {
            docClass: this.docClass,
            listeners: {
                hideInherited: function(hideInherited) {
                    this.filterMembers(this.toolbar.getFilterValue(), hideInherited);
                },
                filter: function(search) {
                    this.filterMembers(search, Docs.Settings.get("hideInherited"));
                },
                scope: this
            }
        });
        this.addDocked(this.toolbar);

        this.update(docClass.html);

        Docs.Syntax.highlight(this.getEl());

        if (Docs.Settings.get("hideInherited")) {
            this.filterMembers("", true);
        }

        this.fireEvent('afterload');
    },

    /**
     * Filters members by search string and inheritance.
     * @param {String} search
     * @param {Boolean} hideInherited
     * @private
     */
    filterMembers: function(search, hideInherited) {
        Docs.Settings.set("hideInherited", hideInherited);
        var isSearch = search.length > 0;

        // Hide the class documentation when filtering
        Ext.Array.forEach(Ext.query('.doc-contents, .hierarchy'), function(el) {
            Ext.get(el).setStyle({display: isSearch ? 'none' : 'block'});
        });

        // Hide members who's name doesn't match with the search string
        // and hide inherited members if hideInherited=true
        var re = new RegExp(Ext.String.escapeRegex(search), "i");
        this.eachMember(function(m) {
            var el = Ext.get(m.id);
            var byInheritance = !hideInherited || (m.owner === this.docClass.name);
            var byFilter = !isSearch || re.test(m.name);
            if (byInheritance && byFilter) {
                el.setStyle({display: 'block'});
            }
            else {
                el.setStyle({display: 'none'});
            }
        }, this);

        // Remove all first-child classes
        Ext.Array.forEach(Ext.query('.member.first-child'), function(m) {
            Ext.get(m).removeCls('first-child');
        });

        Ext.Array.forEach(['cfg', 'property', 'method', 'event'], function(type) {
            var sectionId = '#m-' + type;

            // Hide the section completely if all items in it are hidden
            var visibleEls = this.getVisibleElements(sectionId + " .member");
            var section = Ext.query(sectionId)[0];
            section && Ext.get(section).setStyle({display: visibleEls.length > 0 ? 'block' : 'none'});

            // Hide subsections completely if all items in them are hidden
            Ext.Array.forEach(Ext.query(sectionId+" .subsection"), function(subsection) {
                var visibleEls = this.getVisibleElements(".member", subsection);
                if (visibleEls.length > 0) {
                    // add first-child class to first member in subsection
                    visibleEls[0].addCls('first-child');
                    // make sure subsection is visible
                    Ext.get(subsection).setStyle({display: 'block'});
                }
                else {
                    // Hide subsection completely if empty
                    Ext.get(subsection).setStyle({display: 'none'});
                }
            }, this);
        }, this);

        this.toolbar.hideInherited(hideInherited);
    },

    getVisibleElements: function(selector, root) {
        var els = Ext.Array.map(Ext.query(selector, root), function(node) {
            return Ext.get(node);
        });
        return Ext.Array.filter(els, function(el) {
            return el.isVisible();
        });
    },

    // Loops through each member of class
    eachMember: function(callback, scope) {
        Ext.Array.forEach(['members', 'statics'], function(group) {
            Ext.Object.each(this.docClass[group], function(type, members) {
                Ext.Array.forEach(members, callback, scope);
            }, this);
        }, this);
    }

});
