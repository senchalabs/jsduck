/**
 * The example page.
 *
 * Renders the example inside iframe.
 */
Ext.define('Docs.view.examples.Container', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.examplecontainer',
    layout: 'fit',

    cls: 'example-container iScroll',
    autoScroll: true,
    bodyPadding: '10 0 5 0',

    initComponent: function() {

        this.dockedItems = [{
            xtype: 'container',
            dock: 'top',
            html: [
                '<h1>Kitchen Sink Example</h1>',
                '<div class="cls-grouping example-toolbar">',
                    '<div class="devices">',
                        '<button class="selected ipad">iPad</button>',
                        '<button class="iphone">iPhone</button>',
                        // '<button class="nexus">Nexus S</button>',
                    '</div>',
                    '<span class="separator">&nbsp;</span>',
                    '<div class="orientations">',
                        '<button class="landscape selected">Landscape</button>',
                        '<button class="portrait">Portrait</button>',
                    '<div>',
                '</div>'
            ].join('')
        }];

        this.callParent(arguments);
    },

    /**
     * Loads example into the page.
     * @param {Object} example Example object
     */
    load: function(example) {

        example = Ext.applyIf(example, {
            device: 'ipad',
            orientation: 'landscape',
            width: '1024px',
            height: '768px'
        });

        this.tpl = this.tpl || new Ext.XTemplate(
            '<div class="touchExample {device} {orientation}">',
                '<iframe style="width: {width}; height: {height}; border: 0;" src="touch/examples/{url}"></iframe>',
            '</div>'
        );

        this.update(this.tpl.apply(example));
    },

    /**
     * Clear the previously loaded example.
     */
    clear: function() {
        this.update('');
    }
});