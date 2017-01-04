/**
 * @class Ext.multisort.SortButton
 * @extends Ext.button.Button
 * @author Ed Spencer
 * 
 * 
 */
Ext.define('Ext.multisort.SortButton', {
    extend: 'Ext.button.Button',
    alias : 'widget.sortbutton',
    
    config: {
        direction: "ASC",
        dataIndex: undefined
    },
    
    constructor: function(config) {
        this.addEvents(
            /**
             * @event changeDirection
             * Fired whenever the user clicks this button to change its direction
             * @param {String} direction The new direction (ASC or DESC)
             */
            'changeDirection'
        );
        
        this.initConfig(config);
        
        this.callParent(arguments);
    },
    
    handler: function() {
        this.toggleDirection();
    },
    
    /**
     * Updates the new direction of this button
     * @param {String} direction The new direction
     */
    updateDirection: function(direction) {
        this.setIconCls('direction-' + direction.toLowerCase());
        this.fireEvent('changeDirection', direction);
    },
    
    /**
     * Toggles between ASC and DESC directions
     */
    toggleDirection: function() {
        this.setDirection(Ext.String.toggle(this.direction, "ASC", "DESC"));
    }
});
