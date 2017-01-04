/**
 * This plugin provides drag and/or drop functionality for a TreeView.
 *
 * It creates a specialized instance of {@link Ext.dd.DragZone DragZone} which knows how to drag out of a
 * {@link Ext.tree.View TreeView} and loads the data object which is passed to a cooperating
 * {@link Ext.dd.DragZone DragZone}'s methods with the following properties:
 *
 *   - copy : Boolean
 *
 *     The value of the TreeView's `copy` property, or `true` if the TreeView was configured with `allowCopy: true` *and*
 *     the control key was pressed when the drag operation was begun.
 *
 *   - view : TreeView
 *
 *     The source TreeView from which the drag originated.
 *
 *   - ddel : HtmlElement
 *
 *     The drag proxy element which moves with the mouse
 *
 *   - item : HtmlElement
 *
 *     The TreeView node upon which the mousedown event was registered.
 *
 *   - records : Array
 *
 *     An Array of {@link Ext.data.Model Models} representing the selected data being dragged from the source TreeView.
 *
 * It also creates a specialized instance of {@link Ext.dd.DropZone} which cooperates with other DropZones which are
 * members of the same ddGroup which processes such data objects.
 *
 * Adding this plugin to a view means that two new events may be fired from the client TreeView, {@link #beforedrop} and
 * {@link #drop}.
 *
 * Note that the plugin must be added to the tree view, not to the tree panel. For example using viewConfig:
 *
 *     viewConfig: {
 *         plugins: { ptype: 'treeviewdragdrop' }
 *     }
 */
Ext.define('Ext.tree.plugin.TreeViewDragDrop', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.treeviewdragdrop',

    uses: [
        'Ext.tree.ViewDragZone',
        'Ext.tree.ViewDropZone'
    ],

    /**
     * @event beforedrop
     *
     * **This event is fired through the TreeView. Add listeners to the TreeView object**
     *
     * Fired when a drop gesture has been triggered by a mouseup event in a valid drop position in the TreeView.
     *
     * @param {HTMLElement} node The TreeView node **if any** over which the mouse was positioned.
     *
     * Returning `false` to this event signals that the drop gesture was invalid, and if the drag proxy will animate
     * back to the point from which the drag began.
     *
     * Returning `0` To this event signals that the data transfer operation should not take place, but that the gesture
     * was valid, and that the repair operation should not take place.
     *
     * Any other return value continues with the data transfer operation.
     *
     * @param {Object} data The data object gathered at mousedown time by the cooperating
     * {@link Ext.dd.DragZone DragZone}'s {@link Ext.dd.DragZone#getDragData getDragData} method it contains the following
     * properties:
     * @param {Boolean} data.copy The value of the TreeView's `copy` property, or `true` if the TreeView was configured with
     * `allowCopy: true` and the control key was pressed when the drag operation was begun
     * @param {Ext.tree.View} data.view The source TreeView from which the drag originated.
     * @param {HTMLElement} data.ddel The drag proxy element which moves with the mouse
     * @param {HTMLElement} data.item The TreeView node upon which the mousedown event was registered.
     * @param {Ext.data.Model[]} data.records An Array of {@link Ext.data.Model Model}s representing the selected data being
     * dragged from the source TreeView.
     *
     * @param {Ext.data.Model} overModel The Model over which the drop gesture took place.
     *
     * @param {String} dropPosition `"before"`, `"after"` or `"append"` depending on whether the mouse is above or below
     * the midline of the node, or the node is a branch node which accepts new child nodes.
     *
     * @param {Object} dropHandler An object containing methods to complete/cancel the data transfer operation and either
     * move or copy Model instances from the source View's Store to the destination View's Store.
     *
     * This is useful when you want to perform some kind of asynchronous processing before confirming/cancelling
     * the drop, such as an {@link Ext.window.MessageBox#confirm confirm} call, or an Ajax request.
     *
     * Set dropHandler.wait = true in this event handler to delay processing. When you want to complete the event, call
     * dropHandler.processDrop(). To cancel the drop, call dropHandler.cancelDrop.
     */

    /**
     * @event drop
     *
     * **This event is fired through the TreeView. Add listeners to the TreeView object** Fired when a drop operation
     * has been completed and the data has been moved or copied.
     *
     * @param {HTMLElement} node The TreeView node **if any** over which the mouse was positioned.
     *
     * @param {Object} data The data object gathered at mousedown time by the cooperating
     * {@link Ext.dd.DragZone DragZone}'s {@link Ext.dd.DragZone#getDragData getDragData} method it contains the following
     * properties:
     * @param {Boolean} data.copy The value of the TreeView's `copy` property, or `true` if the TreeView was configured with
     * `allowCopy: true` and the control key was pressed when the drag operation was begun
     * @param {Ext.tree.View} data.view The source TreeView from which the drag originated.
     * @param {HTMLElement} data.ddel The drag proxy element which moves with the mouse
     * @param {HTMLElement} data.item The TreeView node upon which the mousedown event was registered.
     * @param {Ext.data.Model[]} data.records An Array of {@link Ext.data.Model Model}s representing the selected data being
     * dragged from the source TreeView.
     *
     * @param {Ext.data.Model} overModel The Model over which the drop gesture took place.
     *
     * @param {String} dropPosition `"before"`, `"after"` or `"append"` depending on whether the mouse is above or below
     * the midline of the node, or the node is a branch node which accepts new child nodes.
     */

    //<locale>
    /**
     * @cfg
     * The text to show while dragging.
     *
     * Two placeholders can be used in the text:
     *
     * - `{0}` The number of selected items.
     * - `{1}` 's' when more than 1 items (only useful for English).
     */
    dragText : '{0} selected node{1}',
    //</locale>

    /**
     * @cfg {Boolean} allowParentInserts
     * Allow inserting a dragged node between an expanded parent node and its first child that will become a sibling of
     * the parent when dropped.
     */
    allowParentInserts: false,

    /**
     * @cfg {Boolean} allowContainerDrops
     * True if drops on the tree container (outside of a specific tree node) are allowed.
     */
    allowContainerDrops: false,

    /**
     * @cfg {Boolean} appendOnly
     * True if the tree should only allow append drops (use for trees which are sorted).
     */
    appendOnly: false,

    /**
     * @cfg {String} ddGroup
     * A named drag drop group to which this object belongs. If a group is specified, then both the DragZones and
     * DropZone used by this plugin will only interact with other drag drop objects in the same group.
     */
    ddGroup : "TreeDD",

    /**
     * @cfg {String} dragGroup
     * The ddGroup to which the DragZone will belong.
     *
     * This defines which other DropZones the DragZone will interact with. Drag/DropZones only interact with other
     * Drag/DropZones which are members of the same ddGroup.
     */

    /**
     * @cfg {String} dropGroup
     * The ddGroup to which the DropZone will belong.
     *
     * This defines which other DragZones the DropZone will interact with. Drag/DropZones only interact with other
     * Drag/DropZones which are members of the same ddGroup.
     */

    /**
     * @cfg {String} expandDelay
     * The delay in milliseconds to wait before expanding a target tree node while dragging a droppable node over the
     * target.
     */
    expandDelay : 1000,

    /**
     * @cfg {Boolean} enableDrop
     * Set to `false` to disallow the View from accepting drop gestures.
     */
    enableDrop: true,

    /**
     * @cfg {Boolean} enableDrag
     * Set to `false` to disallow dragging items from the View.
     */
    enableDrag: true,

    /**
     * @cfg {String} nodeHighlightColor
     * The color to use when visually highlighting the dragged or dropped node (default value is light blue).
     * The color must be a 6 digit hex value, without a preceding '#'. See also {@link #nodeHighlightOnDrop} and
     * {@link #nodeHighlightOnRepair}.
     */
    nodeHighlightColor: 'c3daf9',

    /**
     * @cfg {Boolean} nodeHighlightOnDrop
     * Whether or not to highlight any nodes after they are
     * successfully dropped on their target. Defaults to the value of `Ext.enableFx`.
     * See also {@link #nodeHighlightColor} and {@link #nodeHighlightOnRepair}.
     */
    nodeHighlightOnDrop: Ext.enableFx,

    /**
     * @cfg {Boolean} nodeHighlightOnRepair
     * Whether or not to highlight any nodes after they are
     * repaired from an unsuccessful drag/drop. Defaults to the value of `Ext.enableFx`.
     * See also {@link #nodeHighlightColor} and {@link #nodeHighlightOnDrop}.
     */
    nodeHighlightOnRepair: Ext.enableFx,

    init : function(view) {
        view.on('render', this.onViewRender, this, {single: true});
    },

    /**
     * @private
     * AbstractComponent calls destroy on all its plugins at destroy time.
     */
    destroy: function() {
        Ext.destroy(this.dragZone, this.dropZone);
    },

    onViewRender : function(view) {
        var me = this;

        if (me.enableDrag) {
            me.dragZone = new Ext.tree.ViewDragZone({
                view: view,
                ddGroup: me.dragGroup || me.ddGroup,
                dragText: me.dragText,
                repairHighlightColor: me.nodeHighlightColor,
                repairHighlight: me.nodeHighlightOnRepair
            });
        }

        if (me.enableDrop) {
            me.dropZone = new Ext.tree.ViewDropZone({
                view: view,
                ddGroup: me.dropGroup || me.ddGroup,
                allowContainerDrops: me.allowContainerDrops,
                appendOnly: me.appendOnly,
                allowParentInserts: me.allowParentInserts,
                expandDelay: me.expandDelay,
                dropHighlightColor: me.nodeHighlightColor,
                dropHighlight: me.nodeHighlightOnDrop
            });
        }
    }
});
