/**
 * Field for filtering users list.
 */
Ext.define("Docs.view.comments.FilterField", {
    extend: "Ext.form.field.Trigger",
    alias: "widget.commentsFilterField",
    triggerCls: 'reset',
    componentCls: 'comments-filter-field',
    hideTrigger: true,
    enableKeyEvents: true,

    initComponent: function() {
        this.callParent(arguments);

        this.on({
            keyup: this.onKeyUp,
            specialkey: this.onSpecialKey,
            scope: this
        });
    },

    onKeyUp: function() {
        this.fireEvent("filter", this.getValue());
        this.setHideTrigger(this.getValue().length === 0);
    },

    onSpecialKey: function(cmp, event) {
        if (event.keyCode === Ext.EventObject.ESC) {
            this.reset();
            this.fireEvent("filter", "");
        }
    },

    onTriggerClick: function() {
        this.reset();
        this.focus();
        this.fireEvent("filter", "");
        this.setHideTrigger(true);
    }
});