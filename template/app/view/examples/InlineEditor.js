/**
 * Runs the CodeMirror editor.
 */
Ext.define('Docs.view.examples.InlineEditor', {
    extend: 'Ext.Panel',
    bodyPadding: 2,
    autoScroll: true,
    componentCls: 'inline-example-editor',

    initComponent: function() {
        this.addEvents(
            /**
             * @event
             * Fired after CodeMirror initialized.
             */
            "init",
            /**
             * @event
             * Fired when CodeMirror onChange is called.
             */
            "change"
        );
        this.on("afterlayout", this.initCodeMirror, this);
        this.callParent(arguments);
    },

    initCodeMirror: function(cmp) {
        if (!this.codemirror) {
            this.codemirror = CodeMirror(this.body, {
                mode:  "javascript",
                indentUnit: 4,
                value: this.value,
                extraKeys: {
                    "Tab": "indentMore",
                    "Shift-Tab": "indentLess"
                },
                onChange: Ext.Function.bind(function(e) {
                    this.fireEvent("change");
                }, this)
            });
            this.fireEvent("init");
        }
    },

    /**
     * Refreshes the editor.
     */
    refresh: function() {
        this.codemirror.refresh();
    },

    /**
     * Returns the current code in editor.
     * @return {String}
     */
    getValue: function() {
        return this.codemirror ? this.codemirror.getValue() : this.value;
    },

    /**
     * Returns the height of embedded CodeMirror editor.
     * @return {Number}
     */
    getHeight: function() {
        var el = this.el.down('.CodeMirror-lines');
        return el ? el.getHeight() : undefined;
    },

    /**
     * Selects all text currently in editor.
     */
    selectAll: function() {
        var lastLine = this.codemirror.lineCount() - 1;
        var lastCh = this.codemirror.getLine(lastLine).length;
        this.codemirror.setSelection({line: 0, ch: 0}, {line: lastLine, ch: lastCh});
    }

});
