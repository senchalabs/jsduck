Ext.define('Docs.view.examples.Inline', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.inlineexample',
    activeTab: 0,
    deferredRender: false,
    style: 'border-color: #bfbfbf;',
    plain: true,
    items: [
        {
            id: 'code',
            title: 'Code',
            cls: 'codemirrorCode',
            autoScroll: true
        },
        {
            id: 'preview',
            title: 'Preview',
            bodyPadding: 10,
            html: '<iframe src="egIframe.html" name="egIframe" style="width: 100%; height: 100%; border: 0"></iframe>',
            listeners: {
                show: function(a,b,c) {
                    window.frames['egIframe'].refreshPage(this.ownerCt.codeEditor.getValue(), this.ownerCt.cssEditor.getValue());
                }
            }
        },
        {
            id: 'cssEditor',
            title: 'CSS',
            cls: 'codemirrorCode',
            autoScroll: true
        }
    ],
    codeEditor: null,
    cssEditor: null,

    showExample: function(exampleId) {
        var url = '/sencha_examples/' + exampleId;
        var inlineEg = this;

        Ext.Ajax.request({
            method  : 'GET',
            url     : url,
            headers : { 'Content-Type' : 'application/json' },

            success : function(response, opts) {
                var doc = Ext.JSON.decode(response.responseText);

                // inlineEg.setHeight(inlineEg.codeEditor.body.getHeight());
                inlineEg.codeEditor.setValue(doc.content);
                inlineEg.cssEditor.setValue(doc.css || '');

                window.frames['egIframe'].refreshPage(inlineEg.codeEditor.getValue(), inlineEg.cssEditor.getValue());
            },
            failure : function(response, opts) {
            }
        });
    },

    setEditorHeights: function() {
        // var codeCmp = this.getComponent('code');
        // var el = new Ext.core.Element(Ext.DomQuery.selectNode('.CodeMirror-lines', codeCmp.body.dom));
        // this.setHeight(el.getHeight() + 50)
    },

    listeners: {
        afterlayout: function() {
            var inlineEditor = this;
            if(!this.codeEditor) {
                this.codeEditor = CodeMirror(this.getComponent('code').body, {
                    value: '',
                    mode:  "javascript",
                    lineNumbers: true,
                    indentUnit: 4,
                    onChange: function() {
                        inlineEditor.setEditorHeights();
                    }
                });
                this.cssEditor = CodeMirror(this.getComponent('cssEditor').body, {
                    value: '',
                    mode:  "css",
                    onChange: function() {
                        inlineEditor.setEditorHeights();
                    }
                });
            }
        }
    }
});