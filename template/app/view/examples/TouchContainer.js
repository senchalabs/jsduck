/**
 * The example page for Sencha Touch.
 *
 * Renders the example inside an image of iPhone or iPad.
 */
Ext.define('Docs.view.examples.TouchContainer', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.touchexamplecontainer',
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
                    '<div>',
                '</div>'
            ].join('')
        }];

        // Template for the DIV containing device image and iframe
        this.tpl = new Ext.XTemplate(
            '<div class="touchExample {device} {orientation}">',
                '<iframe style="width: {width}; height: {height}; border: 0;" ',
                        'src="touch/examples/{url}"></iframe>',
            '</div>'
        );

        this.callParent(arguments);
    },

    /**
     * Loads example into the page.
     * @param {Object} example Example object
     */
    load: function(example) {
        // Copy example config over new object containing default values.
        // Don't modify the supplied config itself.
        this.example = Ext.apply({
            device: 'phone',
            orientation: 'landscape'
        }, example);

        // Add dimensions of the current device in current orientation
        Ext.apply(this.example, this.getIFrameSize());

        this.update(this.tpl.apply(this.example));
        this.updateTitle();
        this.updateButtons();
    },

    /**
     * Changes the device that example is shown in.
     *
     * @param {String} device Either "phone" or "tablet"
     */
    setDevice: function(device) {
        this.example.device = device;
        this.load(this.example);
    },

    /**
     * Changes the orientation of the device the example is shown in.
     *
     * @param {String} orientation Either "portrait" or "landscape"
     */
    setOrientation: function(orientation) {
        this.example.orientation = orientation;
        this.load(this.example);
    },

    updateTitle: function() {
        Ext.get(Ext.query('.example-title')).update(this.example.text + " Example");
    },

    updateButtons: function() {
        Ext.Array.each(Ext.query('.example-toolbar .orientations button'), function(el) {
            Ext.get(el).removeCls('selected');
        });
        Ext.get(Ext.query('.example-toolbar .orientations button.' + this.example.orientation)).addCls('selected');

        Ext.Array.each(Ext.query('.example-toolbar .devices button'), function(el) {
            Ext.get(el).removeCls('selected');
        });
        Ext.get(Ext.query('.example-toolbar .devices button.' + this.example.device)).addCls('selected');
    },

    /**
     * Clears the previously loaded example.
     */
    clear: function() {
        this.update('');
    },

    // Returns width and height of current device iframe.
    getIFrameSize: function() {
        // device dimensions in landscape orientation
        var landscape = {
            phone: {width: '480px', height: '320px'},
            tablet: {width: '1024px', height: '768px'}
        }[this.example.device];

        // return landscape w/h or swap the dimensions
        if (this.example.orientation === 'landscape') {
            return landscape;
        }
        else {
            return {width: landscape.height, height: landscape.width};
        }
    }
});
