/**
 * A layout that arranges items vertically down a Container. This layout optionally divides available vertical space
 * between child items containing a numeric `flex` configuration.
 *
 * This layout may also be used to set the widths of child items by configuring it with the {@link #align} option.
 *
 *     @example
 *     Ext.create('Ext.Panel', {
 *         width: 500,
 *         height: 400,
 *         title: "VBoxLayout Panel",
 *         layout: {
 *             type: 'vbox',
 *             align: 'center'
 *         },
 *         renderTo: document.body,
 *         items: [{
 *             xtype: 'panel',
 *             title: 'Inner Panel One',
 *             width: 250,
 *             flex: 2
 *         },
 *         {
 *             xtype: 'panel',
 *             title: 'Inner Panel Two',
 *             width: 250,
 *             flex: 4
 *         },
 *         {
 *             xtype: 'panel',
 *             title: 'Inner Panel Three',
 *             width: '50%',
 *             flex: 4
 *         }]
 *     });
 */
Ext.define('Ext.layout.container.VBox', {

    /* Begin Definitions */

    alias: ['layout.vbox'],
    extend: 'Ext.layout.container.Box',
    alternateClassName: 'Ext.layout.VBoxLayout',

    /* End Definitions */

    /**
     * @cfg {String} align
     * Controls how the child items of the container are aligned. Acceptable configuration values for this property are:
     *
     * - **left** : **Default** child items are aligned horizontally at the **left** side of the container
     * - **center** : child items are aligned horizontally at the **mid-width** of the container
     * - **stretch** : child items are stretched horizontally to fill the width of the container
     * - **stretchmax** : child items are stretched horizontally to the size of the largest item.
     */
    align : 'left', // left, center, stretch, strechmax

    type: 'vbox',

    direction: 'vertical',

    horizontal: false,

    names: {
        // parallel
        lr: 'tb',
        left: 'top',
        leftCap: 'Top',
        right: 'bottom',
        position: 'top',
        width: 'height',
        contentWidth: 'contentHeight',
        minWidth: 'minHeight',
        maxWidth: 'maxHeight',
        widthCap: 'Height',
        widthModel: 'heightModel',
        widthIndex: 1,
        x: 'y',
        scrollLeft: 'scrollTop',
        overflowX: 'overflowY',
        hasOverflowX: 'hasOverflowY',
        invalidateScrollX: 'invalidateScrollY',

        // perpendicular
        center: 'center',
        top: 'left',// 'before',
        topPosition: 'left',
        bottom: 'right',// 'after',
        height: 'width',
        contentHeight: 'contentWidth',
        minHeight: 'minWidth',
        maxHeight: 'maxWidth',
        heightCap: 'Width',
        heightModel: 'widthModel',
        heightIndex: 0,
        y: 'x',
        scrollTop: 'scrollLeft',
        overflowY: 'overflowX',
        hasOverflowY: 'hasOverflowX',
        invalidateScrollY: 'invalidateScrollX',

        // Methods
        getWidth: 'getHeight',
        getHeight: 'getWidth',
        setWidth: 'setHeight',
        setHeight: 'setWidth',
        gotWidth: 'gotHeight',
        gotHeight: 'gotWidth',
        setContentWidth: 'setContentHeight',
        setContentHeight: 'setContentWidth',
        setWidthInDom: 'setHeightInDom',
        setHeightInDom: 'setWidthInDom'
    },

    sizePolicy: {
        flex: {
            '': {
                setsWidth: 0,
                setsHeight: 1
            },
            stretch: {
                setsWidth: 1,
                setsHeight: 1
            },
            stretchmax: {
                readsWidth: 1,
                setsWidth: 1,
                setsHeight: 1
            }
        },
        '': {
            setsWidth: 0,
            setsHeight: 0
        },
        stretch: {
            setsWidth: 1,
            setsHeight: 0
        },
        stretchmax: {
            readsWidth: 1,
            setsWidth: 1,
            setsHeight: 0
        }
    }
});
