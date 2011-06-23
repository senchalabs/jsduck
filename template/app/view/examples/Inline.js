/**
 * Inline example tab panel. Allows code to be demonstrated and edited inline.
 */
Ext.define('Docs.view.examples.Inline', {

    extend: 'Ext.tab.Panel',
    alias: 'widget.inlineexample',

    plain: true,
    deferredRender: false,

    initComponent: function() {

        Docs.view.examples.Inline.prototype.iframeId = Docs.view.examples.Inline.prototype.iframeId || 0;
        Docs.view.examples.Inline.prototype.iframeId = Docs.view.examples.Inline.prototype.iframeId + 0;

        this.iframeId = "egIframe" + Docs.view.examples.Inline.prototype.iframeId;

        this.items = [{
            id: 'code',
            title: 'Code',
            cls: 'codemirrorCode',
            autoScroll: true
        }];

        this.items.push({
            id: 'preview',
            title: 'Preview',
            bodyPadding: 10,
            html: '<iframe src="egIframe.html" name="' + this.iframeId + '" style="width: 100%; height: 100%; border: 0"></iframe>',
            listeners: {
                show: function(a,b,c) {
                    window.frames[this.ownerCt.iframeId].refreshPage(this.ownerCt.codeEditor.getValue(), this.ownerCt.cssEditor.getValue());
                }
            }
        });

        this.items.push({
            id: 'cssEditor',
            title: 'CSS',
            cls: 'codemirrorCode',
            autoScroll: true
        });

        this.callParent(arguments);
    },

    showExample: function(exampleId) {

        var inlineEg = this;
        var url = 'doc-resources/' + exampleId;

        if (exampleId.match(/^https:\/\/api\.github\.com/)) {
            Ext.data.JsonP.request({
                url: exampleId,
                // callbackName: name,
                success: function(json) {
                    inlineEg.codeEditor.setValue(json.data.files["basic_grid_panel.js"].content);
                    window.frames[inlineEg.iframeId].refreshPage(inlineEg.codeEditor.getValue(), inlineEg.cssEditor.getValue());
                },
                scope: this
            });

        } else {
            Ext.Ajax.request({
                method  : 'GET',
                url     : url,
                headers : { 'Content-Type' : 'application/json' },

                success : function(response, opts) {
                    // inlineEg.setHeight(inlineEg.codeEditor.body.getHeight());
                    inlineEg.codeEditor.setValue(response.responseText);
                    console.log(inlineEg.iframeId);
                    window.frames[inlineEg.iframeId].refreshPage(inlineEg.codeEditor.getValue(), inlineEg.cssEditor.getValue());
                },
                failure : function(response, opts) {
                }
            });
        }


    },

    listeners: {
        afterlayout: function() {
            var inlineEditor = this;
            if(!this.codeEditor) {
                this.codeEditor = CodeMirror(this.getComponent('code').body, {
                    value: '',
                    mode:  "javascript",
                    lineNumbers: true,
                    indentUnit: 4
                });
                this.cssEditor = CodeMirror(this.getComponent('cssEditor').body, {
                    value: '',
                    mode:  "css"
                });
            }
        }
    }
});