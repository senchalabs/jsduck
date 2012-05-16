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
        iframeCounter: 0,

        /**
         * Returns the next available iframeId.
         *
         * @return {String} iframeId
         * @private
         * @static
         */
        getNextIframeId: function() {
            this.iframeCounter++;
            return this.iframeCounter.toString();
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
    },

    getHtml: function() {
        if (Docs.data.touchExamplesUi) {
            return Ext.create('Docs.view.examples.Device', {
                url: "eg-iframe.html",
                id: this.iframeId,
                device: this.options.device,
                orientation: this.options.orientation
            }).toHtml();
        }
        else {
            // frameBorder=0 is needed to hide the border in IE8
            var tpl = new Ext.XTemplate(
                '<iframe id="{id}" style="width: 100%; height: 100%; border: 0" frameBorder="0"></iframe>'
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
        var options = this.options;
        var iframe = Ext.get(this.iframeId);
        var callback = Ext.Function.bind(this.iframeCallback, this);

        if (iframe) {
            // Something is not quite ready when onload fires.
            // I'm unsure what I should wait for. So I'm currently adding just this nasty delay.
            // 1 ms works in Chrome, Firefox wants something bigger. Works in IE too.
            iframe.on('load', function() {
                Ext.Function.defer(function() {
                    // Append newline to code, otherwise we might result in syntax error as
                    // eval() doesn't like when code ends with line-comment.
                    iframe.dom.contentWindow.loadInlineExample(code+"\n", options, callback);
                }, 100);
            }, this, {single: true});
            iframe.dom.src = "eg-iframe.html";
        }
    },

    /**
     * Called from within iframe.
     *
     * @param {Boolean} success True when iframe code ran fine.
     * @param {Error} [e] The exception object in case of failure.
     * @private
     */
    iframeCallback: function(success, e) {
        if (success) {
            this.fireEvent("previewsuccess", this);
        }
        else {
            this.fireEvent("previewfailure", this, e);
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
