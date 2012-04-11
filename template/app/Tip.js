/**
 * Central manager of tooltip-like notifications.
 */
Ext.define('Docs.Tip', {
    singleton: true,

    /**
     * Displays a notification tip anchored at specified element.
     *
     * @param {String} msg The message to display.
     * @param {HTMLElement/Ext.Element} el The element where to anchor our message.
     * @param {String} [anchor='right'] On which side to anchor the tip.
     * @private
     */
    show: function(msg, el, anchor) {
        anchor = anchor || 'right';
        // We keep tip instance for each anchor position as there is
        // no way to change the anchoring after the tip has been
        // created.
        this.tips = this.tips || {};
        if (this.tips[anchor]) {
            var tip = this.tips[anchor];
            tip.update(msg);
            tip.setTarget(el);
            tip.show();
        }
        else {
            var tip = this.tips[anchor] = Ext.create('Ext.tip.ToolTip', {
                anchor: anchor,
                target: el,
                html: msg
            });
            tip.show();
        }
    }
});
