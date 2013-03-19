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
        'Docs.view.comments.LargeExpander',
        'Docs.view.cls.MemberWrap',
        'Docs.view.comments.MemberWrap',
        'Docs.Syntax',
        'Docs.Settings',
        'Docs.Comments'
    ],
    mixins: ['Docs.view.Scrolling'],

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

            // First make the element visible.
            // For example a private member might be hidden initially
            // so we can't scroll to it. But the element might be
            // inside a section that's fully hidden, in such case we
            // also make the section visible.
            el.show();
            if (!el.isVisible(true)) {
                el.up(".subsection").show();
                el.up(".members-section").show();
            }

            // expand the element
            if (isMember && el.down(".expandable")) {
                this.setMemberExpanded(query.replace(/#/, ''), true);
            }

            var top = this.body.getBox().y;
            this.scrollToView(el, {
                highlight: true,
                offset: (offset || 0) - (isMember ? top : top - 10)
            });
        }
    },

    /**
     * Renders class documentation in this panel.
     *
     * @param {Object} docClass
     */
    load: function(docClass) {
        this.docClass = docClass;
        this.accessors = this.buildAccessorsMap();

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
            accessors: this.accessors,
            listeners: {
                filter: function(search, show) {
                    this.filterMembers(search, show);
                },
                menubuttonclick: function(type) {
                    this.scrollToEl("h3.members-title.icon-"+type, -20);
                },
                commentcountclick: this.expandClassComments,
                scope: this
            }
        });
        this.addDocked(this.toolbar);

        this.update(docClass.html);

        Docs.Syntax.highlight(this.getEl());

        this.filterMembers("", Docs.Settings.get("show"));

        if (Docs.Comments.isEnabled()) {
            this.initComments();
        }
        else {
            this.initBasicMemberWrappers();
        }

        this.fireEvent('afterload');
    },

    initComments: function() {
        // Add comment button to toolbar
        this.toolbar.showCommentCount();
        this.toolbar.setCommentCount(Docs.Comments.getCount(["class", this.docClass.name, ""]));

        // Insert class level comment container under class intro docs
        this.clsExpander = new Docs.view.comments.LargeExpander({
            name: this.docClass.name,
            el: Ext.query('.doc-contents')[0]
        });

        // Add a comment container to each class member
        this.memberWrappers = {};
        Ext.Array.forEach(Ext.query('.member'), function(memberEl) {
            var wrap = new Docs.view.comments.MemberWrap({
                parent: this,
                className: this.docClass.name,
                el: memberEl
            });
            this.memberWrappers[wrap.getMemberId()] = wrap;
        }, this);
    },

    initBasicMemberWrappers: function() {
        this.memberWrappers = {};
        Ext.Array.forEach(Ext.query('.member'), function(memberEl) {
            var wrap = new Docs.view.cls.MemberWrap({
                el: memberEl
            });
            this.memberWrappers[wrap.getMemberId()] = wrap;
        }, this);
    },

    /**
     * Updates comment counts of the class itself and of all its members.
     */
    updateCommentCounts: function() {
        // do nothing when no class loaded
        if (!this.docClass) {
            return;
        }

        var clsCount = Docs.Comments.getCount(["class", this.docClass.name, ""]);
        this.toolbar.setCommentCount(clsCount);

        this.clsExpander.getExpander().setCount(clsCount);

        Ext.Object.each(this.memberWrappers, function(name, wrap) {
            wrap.setCount(Docs.Comments.getCount(wrap.getTarget()));
        }, this);
    },

    expandClassComments: function() {
        var expander = this.clsExpander.getExpander();
        expander.expand();
        // add a small arbitrary -40 offset to make the header visible.
        this.scrollToEl(expander.getEl(), -40);
    },

    /**
     * Expands or collapses the given member.
     * @param {String} memberName
     * @param {Boolean} expanded
     */
    setMemberExpanded: function(memberName, expanded) {
        this.memberWrappers[memberName].setExpanded(expanded);
    },

    /**
     * True when the given member is expanded.
     * @param {String} memberName
     * @return {Boolean}
     */
    isMemberExpanded: function(memberName) {
        return this.memberWrappers[memberName].isExpanded();
    },

    /**
     * Expands/collapses all members.
     */
    setAllMembersExpanded: function(expanded) {
        // When comments enabled, then first initialize all the
        // expanders to make the next actual expanding phase much
        // faster.
        if (Docs.Comments.isEnabled()) {
            Ext.Object.each(this.memberWrappers, function(name, wrap) {
                wrap.getExpander().show();
            }, this);
        }

        Ext.Object.each(this.memberWrappers, function(name, wrap) {
            wrap.setExpanded(expanded);
        }, this);
    },

    /**
     * Filters members by search string and inheritance.
     * @param {String} search
     * @param {Object} show
     * @private
     */
    filterMembers: function(search, show) {
        Docs.Settings.set("show", show);
        var isSearch = search.length > 0;

        // Hide the class documentation when filtering
        Ext.Array.forEach(Ext.query('.doc-contents, .hierarchy'), function(el) {
            Ext.get(el).setStyle({display: isSearch ? 'none' : 'block'});
        });

        // Only show members who's name matches with the search string
        // and its type is currently visible
        var re = new RegExp(Ext.String.escapeRegex(search), "i");
        this.eachMember(function(m) {
            var el = Ext.get(m.id);
            var visible = !(
                !show['public']    && !(m.meta['private'] || m.meta['protected']) ||
                !show['protected'] && m.meta['protected'] ||
                !show['private']   && m.meta['private'] ||
                !show['inherited'] && (m.owner !== this.docClass.name) ||
                !show['accessor']  && m.tagname === 'method' && this.accessors.hasOwnProperty(m.name) ||
                !show['deprecated'] && m.meta['deprecated'] ||
                !show['removed']   && m.meta['removed'] ||
                isSearch           && !re.test(m.name)
            );

            if (visible) {
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

        Ext.Array.forEach(Ext.query('.members-section'), function(section) {
            // Hide the section completely if all items in it are hidden
            var visibleEls = this.getVisibleElements(".member", section);
            Ext.get(section).setStyle({display: visibleEls.length > 0 ? 'block' : 'none'});

            // Hide subsections completely if all items in them are hidden
            Ext.Array.forEach(Ext.query(".subsection", section), function(subsection) {
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

        this.toolbar.showMenuItems(show, isSearch, re);
    },

    buildAccessorsMap: function(name) {
        var accessors = {};
        Ext.Array.forEach(this.docClass.members, function(m) {
            if (m.tagname === "cfg") {
                var capName = Ext.String.capitalize(m.name);
                accessors["get"+capName] = true;
                accessors["set"+capName] = true;
            }
        });
        return accessors;
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
        Ext.Array.forEach(this.docClass.members, callback, scope);
    }

});
