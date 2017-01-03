/**
 * The example page for Sencha Touch.
 *
 * Renders the example inside an image of iPhone or iPad.
 */
Ext.define('Docs.view.examples.TouchContainer', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.touchexamplecontainer',
    requires: [
        'Docs.view.examples.Device'
    ],

    layout: 'fit',
    cls: 'example-container iScroll',
    autoScroll: true,
    bodyPadding: '10 0 5 0',

    initComponent: function() {
        this.dockedItems = [{
            xtype: 'container',
            dock: 'top',
            html: [
                '<h1 class="example-title">Example</h1>',
                '<div class="cls-grouping example-toolbar">',
                    '<div class="devices">',
                        '<button class="phone selected">Phone</button>',
                        '<button class="tablet">Tablet</button>',
                    '</div>',
                    '<span class="separator">&nbsp;</span>',
                    '<div class="orientations">',
                        '<button class="landscape selected">Landscape</button>',
                        '<button class="portrait">Portrait</button>',
                    '</div>',
                    '<div>',
                        '<button class="new-window">Open in new window</button>',
                    '</div>',
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
        this.title = example.title + " Example";
        this.device = Ext.create('Docs.view.examples.Device', {
            url: example.url,
            device: example.device || "phone",
            orientation: example.orientation || "landscape"
        });
        this.refresh();
    },

    refresh: function() {
        this.update(this.device.toHtml());
        this.updateScale();
        this.updateTitle();
        this.updateButtons();
    },

    /**
     * Changes the device that example is shown in.
     *
     * @param {String} device Either "phone" or "tablet"
     */
    setDevice: function(device) {
        this.device.setDevice(device);
        this.refresh();
    },

    /**
     * Changes the orientation of the device the example is shown in.
     *
     * @param {String} orientation Either "portrait" or "landscape"
     */
    setOrientation: function(orientation) {
        this.device.setOrientation(orientation);
        this.refresh();
    },

    // Scale down the example when in tablet mode
    updateScale: function() {
        var iframe = Ext.query('iframe', this.el.dom)[0];

        if (iframe) {
            iframe.onload = Ext.Function.bind(function() {
                var style = document.createElement("style");
                var styleContent = "html { overflow: hidden }";

                // Scale to 70% of original. Default font-size is 114%
                if (this.device.getDevice() === "tablet") {
                    styleContent += "body { font-size: 79.8% !important; }";
                }
                style.innerHTML = styleContent;
                iframe.contentWindow.document.body.appendChild(style);
            }, this);
        }
    },

    updateTitle: function() {
        Ext.get(Ext.query('.example-title')).update(this.title);
    },

    updateButtons: function() {
        Ext.Array.each(Ext.query('.example-toolbar .orientations button'), function(el) {
            Ext.get(el).removeCls('selected');
        });
        Ext.get(Ext.query('.example-toolbar .orientations button.' + this.device.getOrientation())).addCls('selected');

        Ext.Array.each(Ext.query('.example-toolbar .devices button'), function(el) {
            Ext.get(el).removeCls('selected');
        });
        Ext.get(Ext.query('.example-toolbar .devices button.' + this.device.getDevice())).addCls('selected');
    },

    /**
     * Clears the previously loaded example.
     */
    clear: function() {
        this.update('');
    }

});
