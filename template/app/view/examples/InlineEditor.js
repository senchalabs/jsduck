/**
 * Runs the CodeMirror editor.
 */
Ext.define('Docs.view.examples.InlineEditor', {
    extend: 'Ext.Panel',
    style: 'border: 0',
    bodyPadding: 2,
    bodyStyle: 'background: #f7f7f7',
    autoScroll: true,

    initComponent: function() {
        this.addEvents(
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
                onChange: Ext.Function.bind(function(e) {
                    this.fireEvent("change");
                }, this)
            });
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
