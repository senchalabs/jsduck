/**
 * Demonstrates an example inside iframe.
 */
Ext.define('Docs.view.examples.InlinePreview', {
    extend: 'Ext.Panel',
    bodyPadding: '0 10',

    statics: {
        iframeId: 0
    },

    initComponent: function() {
        this.html = this.getHtml();

        this.callParent(arguments);
    },

    getHtml: function() {
        if (Docs.touchExamplesUi) {
            var tpl = new Ext.XTemplate(
                '<div class="touchExample {device} {orientation}">',
                    '<iframe id="{id}" style="border: 0;"></iframe>',
                '</div>'
            );
            return tpl.apply({
                id: this.getIframeId(),
                device: this.options.tablet ? "tablet" : "phone",
                orientation: this.options.portrait ? "portrait" : "landscape"
            });
        }
        else {
            var tpl = new Ext.XTemplate(
                '<iframe id="{id}" style="width: 100%; height: 100%; border: 0"></iframe>'
            );
            return tpl.apply({
                id: this.getIframeId()
            });
        }
    },

    /**
     * Updates the live example inside iframe with new code.
     * @param {String} code  The code to run inside iframe.
     */
    update: function(code) {
        var options = this.options.raw;
        var iframe = document.getElementById(this.getIframeId());
        // Something is not quite ready when onload fires.
        // I'm unsure what I should wait for. So I'm currently adding just this nasty delay.
        // 1 ms works in Chrome, Firefox wants something bigger. Works in IE too.
        iframe.onload = function() {
            Ext.Function.defer(function() {
                iframe.contentWindow.refreshPage(code, options.raw);
            }, 100);
        };
        iframe.src = Docs.touchExamplesUi ? "touchIframe.html" : "extIframe.html";
    },

    // Returns iframe ID for this inline example component.
    getIframeId: function() {
        if (!this.iframeId) {
            this.statics().iframeId += 1;
            this.iframeId = "egIframe" + this.statics().iframeId;
        }
        return this.iframeId;
    }

});
