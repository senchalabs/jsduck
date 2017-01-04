/**
 * @class Ext.layout.container.Auto
 *
 * The AutoLayout is the default layout manager delegated by {@link Ext.container.Container} to
 * render any child Components when no `{@link Ext.container.Container#layout layout}` is configured into
 * a `{@link Ext.container.Container Container}.` AutoLayout provides only a passthrough of any layout calls
 * to any child containers.
 *
 *     @example
 *     Ext.create('Ext.Panel', {
 *         width: 500,
 *         height: 280,
 *         title: "AutoLayout Panel",
 *         layout: 'auto',
 *         renderTo: document.body,
 *         items: [{
 *             xtype: 'panel',
 *             title: 'Top Inner Panel',
 *             width: '75%',
 *             height: 90
 *         },
 *         {
 *             xtype: 'panel',
 *             title: 'Bottom Inner Panel',
 *             width: '75%',
 *             height: 90
 *         }]
 *     });
 */
Ext.define('Ext.layout.container.Auto', {

    /* Begin Definitions */

    alias: ['layout.auto', 'layout.autocontainer'],

    extend: 'Ext.layout.container.Container',

    /* End Definitions */

    type: 'autocontainer',

    childEls: [
        'clearEl'
    ],

    renderTpl: [
        '{%this.renderBody(out,values)%}',
        // clear element is needed to prevent the bottom margins of the last child element from collapsing
        '<div id="{ownerId}-clearEl" class="', Ext.baseCSSPrefix, 'clear" role="presentation"></div>'
    ],

    // TODO - do we need to clear sizes in beginLayout?

    calculate: function(ownerContext) {
        var me = this,
            containerSize;

        if (!ownerContext.hasDomProp('containerChildrenDone')) {
            me.done = false;
        } else {
            // Once the child layouts are done we can determine the content sizes...
            containerSize = me.getContainerSize(ownerContext);
            if (!containerSize.gotAll) {
                me.done = false;
            }

            me.calculateContentSize(ownerContext);
        }
    }
});
