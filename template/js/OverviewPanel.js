Ext.define('Docs.OverviewPanel', {
    extend: 'Ext.panel.Panel',

    id: 'doc-overview',
    cls: 'doc-tab iScroll',
    title: 'Overview',
    autoScroll: true,

    /**
     * @cfg {Object} docClass
     * Documentation for a class.
     */
    docClass: {},

    scrollToEl: function(query) {
        var el = Ext.get(Ext.query(query)[0]);
        if (el) {
            var scrollOffset = el.getY() - 150;
            var docContent = Ext.get(Ext.query('#doc-overview .x-panel-body')[0]);
            var currentScroll = docContent.getScroll()['top'];
            docContent.scrollTo('top', currentScroll + scrollOffset, true);

            var prnt = el.up('.member');
            if (prnt) {
                Ext.get(prnt).addCls('open');
            }
        }
    },

    listeners: {
        afterrender: function(cmp) {
            cmp.el.addListener('click', function(cmp, el) {
                Ext.get(Ext.get(el).up('.member')).toggleCls('open');
            }, this, {
                preventDefault: true,
                delegate: '.expand'
            });
            cmp.el.addListener('click', function(cmp, el) {
                getDocClass(el.rel);
            }, this, {
                preventDefault: true,
                delegate: '.docClass'
            });
            prettyPrint();
        }
    },

    initComponent: function() {
        this.dockedItems = [
            this.toolbar = Ext.create('Docs.OverviewToolbar', {
              docClass: this.docClass
            })
        ];

        if (Ext.get('doc-overview-content')) {
            this.contentEl = 'doc-overview-content';
        }

        this.callParent(arguments);

        var cfgTemplate = new Ext.XTemplate(
            '<div class="member f ni">',
                '<a href="Ext.Action.html#config-disabled" rel="config-disabled" class="expand more">',
                    '<span>&nbsp;</span>',
                '</a>',
                '<div class="title">',
                    '<div class="meta">',
                        '<a href="Ext.Action.html" class="definedIn docClass">{member}</a><br/>',
                        '<a href="../source/Action.html#Ext-Action-cfg-disabled" class="viewSource">view source</a>',
                    '</div>',
                    '<a name="disabled"></a>',
                    '<a name="config-disabled"></a>',
                    '<a href="Ext.Action.html#" rel="config-disabled" class="cls expand">{name}</a>',
                    '<span> : {type}</span>',
                '</div>',
                '<div class="description">',
                    '{doc}',
                '</div>',
            '</div>'
        );

        this.tpl = new Ext.XTemplate(
            '<div class="doc-overview-content">',
            '{doc}',
            '<div class="members">',
                '<div class="m-cfgs">',
                    '<div class="definedBy">Defined By</div>',
                    '<a name="configs"></a>',
                    '<h3 class="cfg p">Config Options</h3>',
                    '<tpl for="cfg">',
                        '{[this.renderMember(values)]}',
                    '</tpl>',
                '</div>',
                '<div class="m-properties">',
                    '<div class="definedBy">Defined By</div>',
                    '<a name="properties"></a>',
                    '<h3 class="prp p">Properties</h3>',
                    '<tpl for="property">',
                        '{[this.renderMember(values)]}',
                    '</tpl>',
                '</div>',
                '<div class="m-methods">',
                    '<div class="definedBy">Defined By</div>',
                    '<a name="methods"></a>',
                    '<h3 class="mth p">Methods</h3>',
                    '<tpl for="method">',
                        '{[this.renderMember(values)]}',
                    '</tpl>',
                '</div>',
                '<div class="m-events">',
                    '<div class="definedBy">Defined By</div>',
                    '<a name="events"></a>',
                    '<h3 class="evt p">Events</h3>',
                    '<tpl for="event">',
                        '{[this.renderMember(values)]}',
                    '</tpl>',
                '</div>',
            '</div>',
            '</div>',
            {
                renderMember: function(cfg) {
                    return cfgTemplate.apply(cfg);
                }
            }
        );
    },

    load: function(docClass) {
      this.removeDocked(this.toolbar, true);
      this.toolbar = Ext.create('Docs.OverviewToolbar', {
        docClass: docClass
      });
      this.addDocked(this.toolbar);

      this.update(this.tpl.apply(docClass));
    }
});
