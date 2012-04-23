/**
 * Demonstrates an example inside iframe.
 */
Ext.define('Docs.view.examples.InlinePreview', {
    extend: 'Ext.Panel',
    requires: [
        'Docs.view.examples.Device'
    ],

    bodyPadding: '0 10',

    statics: {
        /**
         * @private
         * @static
         */
        iframeId: 0,

        /**
         * Returns the next available iframeId.
         *
         * @return {String} iframeId
         * @private
         * @static
         */
        getNextIframeId: function() {
            this.iframeId++;
            return this.iframeId.toString();
        },

        /**
         * Returns the preview component with the matching iframeId.
         *
         * @param {String} iframeId
         * @return {Ext.Component}
         * @private
         * @static
         */
        getPreviewByIframeId: function(iframeId) {
            return Ext.ComponentManager.get('inline-preview-' + iframeId.toString());
        },

        /**
         * Called when an preview has been successfully executed.
         *
         * @param {String} iframeId
         * @static
         */
        previewSuccess: function(iframeId) {
            var preview = this.getPreviewByIframeId(iframeId);
            preview.fireEvent('previewsuccess', preview);
        },

        /**
         * Called when an error occured during preview execution.
         *
         * @param {String} iframeId
         * @param {Error} e
         * @static
         */
        previewFailure: function(iframeId, e) {
            var preview = this.getPreviewByIframeId(iframeId);
            preview.fireEvent('previewfailure', preview, e);
        }
    },

    /**
     * @cfg {Object} options
     * A set of options for configuring the preview.
     * See docs of parent component.
     */
    options: {},

    constructor: function(config) {
        config = config || {};
        config.iframeId = this.self.getNextIframeId();
        config.id = 'inline-preview-' + config.iframeId;
        this.callParent([config]);

        this.addEvents([
            /**
             * @event previewsuccess
             * Fired when preview was successfully created.
             * @param {Ext.Component} preview
             */
            'previewsuccess',
            /**
             * @event previewfailure
             * Fired when preview contains an error.
             * @param {Ext.Component} preview
             * @param {Error} e
             */
            'previewfailure'
        ]);
    },

    initComponent: function() {
        this.html = this.getHtml();

        this.callParent(arguments);

        this.on('success', this.onSuccess, this);
        this.on('failure', this.onFailure, this);
    },

    getHtml: function() {
        if (Docs.data.touchExamplesUi) {
            return Ext.create('Docs.view.examples.Device', {
                url: "eg-iframe.html",
                id: this.getIframeId(),
                device: this.options.device,
                orientation: this.options.orientation
            }).toHtml();
        }
        else {
            var tpl = new Ext.XTemplate(
                '<iframe id="{id}" style="width: 100%; height: 100%; border: 0"></iframe>'
            );
            return tpl.apply({
                id: this.iframeId
            });
        }
    },

    /**
     * Updates the live example inside iframe with new code.
     * @param {String} code  The code to run inside iframe.
     */
    update: function(code) {
        var iframeId = this.iframeId,
            options = Ext.apply({iframeId: iframeId}, this.options),
            iframe = document.getElementById(iframeId);

        if (iframe) {
            // Something is not quite ready when onload fires.
            // I'm unsure what I should wait for. So I'm currently adding just this nasty delay.
            // 1 ms works in Chrome, Firefox wants something bigger. Works in IE too.
            iframe.onload = function() {
                Ext.Function.defer(function() {
                    iframe.contentWindow.loadInlineExample(code, options);
                }, 100);
            };
            iframe.src = "eg-iframe.html";
        }
    },

    /**
     * Returns the current height of the preview.
     * @return {Number}
     */
    getHeight: function() {
        return document.getElementById(this.iframeId).parentNode.clientHeight;
    }
});
