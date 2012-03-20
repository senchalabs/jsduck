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
        iframeId: 0,
        
        getNextIframeId: function() {
            return this.iframeId++;
        },
        
        getPreviewByIframeId: function(iframeId) {
            return Ext.ComponentManager.get('inline-preview-' + iframeId);
        },
        
        previewSuccess: function(iframeId) {
            var preview = this.getPreviewByIframeId(iframeId);
            preview.fireEvent('previewsuccess', preview);
        },
        
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
             * @param {Ext.Component} this
             */
            'previewsuccess',
            /**
             * @event previewfailure
             * Fired when preview contains an error.
             * @param {Ext.Component} this
             * @param {Error} exception
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
        var options = this.options,
            iframeId = this.iframeId,
            iframe = document.getElementById(iframeId);

        if (iframe) {
            // Something is not quite ready when onload fires.
            // I'm unsure what I should wait for. So I'm currently adding just this nasty delay.
            // 1 ms works in Chrome, Firefox wants something bigger. Works in IE too.
            iframe.onload = function() {
                Ext.Function.defer(function() {
                    iframe.contentWindow.loadInlineExample(iframeId, code, options);
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
