/**
 * @class Ext.chart.Legend
 *
 * Defines a legend for a chart's series.
 * The 'chart' member must be set prior to rendering.
 * The legend class displays a list of legend items each of them related with a
 * series being rendered. In order to render the legend item of the proper series
 * the series configuration object must have `showInLegend` set to true.
 *
 * The legend configuration object accepts a `position` as parameter.
 * The `position` parameter can be `left`, `right`
 * `top` or `bottom`. For example:
 *
 *     legend: {
 *         position: 'right'
 *     },
 *
 * ## Example
 *
 *     @example
 *     var store = Ext.create('Ext.data.JsonStore', {
 *         fields: ['name', 'data1', 'data2', 'data3', 'data4', 'data5'],
 *         data: [
 *             { 'name': 'metric one',   'data1': 10, 'data2': 12, 'data3': 14, 'data4': 8,  'data5': 13 },
 *             { 'name': 'metric two',   'data1': 7,  'data2': 8,  'data3': 16, 'data4': 10, 'data5': 3  },
 *             { 'name': 'metric three', 'data1': 5,  'data2': 2,  'data3': 14, 'data4': 12, 'data5': 7  },
 *             { 'name': 'metric four',  'data1': 2,  'data2': 14, 'data3': 6,  'data4': 1,  'data5': 23 },
 *             { 'name': 'metric five',  'data1': 27, 'data2': 38, 'data3': 36, 'data4': 13, 'data5': 33 }
 *         ]
 *     });
 *
 *     Ext.create('Ext.chart.Chart', {
 *         renderTo: Ext.getBody(),
 *         width: 500,
 *         height: 300,
 *         animate: true,
 *         store: store,
 *         shadow: true,
 *         theme: 'Category1',
 *         legend: {
 *             position: 'top'
 *         },
 *         axes: [
 *             {
 *                 type: 'Numeric',
 *                 grid: true,
 *                 position: 'left',
 *                 fields: ['data1', 'data2', 'data3', 'data4', 'data5'],
 *                 title: 'Sample Values',
 *                 grid: {
 *                     odd: {
 *                         opacity: 1,
 *                         fill: '#ddd',
 *                         stroke: '#bbb',
 *                         'stroke-width': 1
 *                     }
 *                 },
 *                 minimum: 0,
 *                 adjustMinimumByMajorUnit: 0
 *             },
 *             {
 *                 type: 'Category',
 *                 position: 'bottom',
 *                 fields: ['name'],
 *                 title: 'Sample Metrics',
 *                 grid: true,
 *                 label: {
 *                     rotate: {
 *                         degrees: 315
 *                     }
 *                 }
 *             }
 *         ],
 *         series: [{
 *             type: 'area',
 *             highlight: false,
 *             axis: 'left',
 *             xField: 'name',
 *             yField: ['data1', 'data2', 'data3', 'data4', 'data5'],
 *             style: {
 *                 opacity: 0.93
 *             }
 *         }]
 *     });
 */
Ext.define('Ext.chart.Legend', {

    /* Begin Definitions */

    requires: ['Ext.chart.LegendItem'],

    /* End Definitions */

    /**
     * @cfg {Boolean} visible
     * Whether or not the legend should be displayed.
     */
    visible: true,
    
    /**
     * @cfg {Boolean} update
     * If set to true the legend will be refreshed when the chart is.
     * This is useful to update the legend items if series are
     * added/removed/updated from the chart. Default is true.
     */
    update: true,

    /**
     * @cfg {String} position
     * The position of the legend in relation to the chart. One of: "top",
     * "bottom", "left", "right", or "float". If set to "float", then the legend
     * box will be positioned at the point denoted by the x and y parameters.
     */
    position: 'bottom',

    /**
     * @cfg {Number} x
     * X-position of the legend box. Used directly if position is set to "float", otherwise
     * it will be calculated dynamically.
     */
    x: 0,

    /**
     * @cfg {Number} y
     * Y-position of the legend box. Used directly if position is set to "float", otherwise
     * it will be calculated dynamically.
     */
    y: 0,

    /**
     * @cfg {String} labelColor
     * Color to be used for the legend labels, eg '#000'
     */
    labelColor: '#000',

    /**
     * @cfg {String} labelFont
     * Font to be used for the legend labels, eg '12px Helvetica'
     */
    labelFont: '12px Helvetica, sans-serif',

    /**
     * @cfg {String} boxStroke
     * Style of the stroke for the legend box
     */
    boxStroke: '#000',

    /**
     * @cfg {String} boxStrokeWidth
     * Width of the stroke for the legend box
     */
    boxStrokeWidth: 1,

    /**
     * @cfg {String} boxFill
     * Fill style for the legend box
     */
    boxFill: '#FFF',

    /**
     * @cfg {Number} itemSpacing
     * Amount of space between legend items
     */
    itemSpacing: 10,

    /**
     * @cfg {Number} padding
     * Amount of padding between the legend box's border and its items
     */
    padding: 5,

    // @private
    width: 0,
    // @private
    height: 0,

    /**
     * @cfg {Number} boxZIndex
     * Sets the z-index for the legend. Defaults to 100.
     */
    boxZIndex: 100,

    /**
     * Creates new Legend.
     * @param {Object} config  (optional) Config object.
     */
    constructor: function(config) {
        var me = this;
        if (config) {
            Ext.apply(me, config);
        }
        me.items = [];
        /**
         * Whether the legend box is oriented vertically, i.e. if it is on the left or right side or floating.
         * @type {Boolean}
         */
        me.isVertical = ("left|right|float".indexOf(me.position) !== -1);

        // cache these here since they may get modified later on
        me.origX = me.x;
        me.origY = me.y;
    },

    /**
     * @private Create all the sprites for the legend
     */
    create: function() {
        var me = this,
            seriesItems = me.chart.series.items,
            i, ln, series;

        me.createBox();
        
        if (me.rebuild !== false) {
            me.createItems();
        }
        
        if (!me.created && me.isDisplayed()) {
            me.created = true;

            // Listen for changes to series titles to trigger regeneration of the legend
            for (i = 0, ln = seriesItems.length; i < ln; i++) {
                series = seriesItems[i];
                series.on('titlechange', function() {
                    me.create();
                    me.updatePosition();
                });
            }
        }
    },

    /**
     * @private Determine whether the legend should be displayed. Looks at the legend's 'visible' config,
     * and also the 'showInLegend' config for each of the series.
     */
    isDisplayed: function() {
        return this.visible && this.chart.series.findIndex('showInLegend', true) !== -1;
    },

    /**
     * @private Create the series markers and labels
     */
    createItems: function() {
        var me = this,
            chart = me.chart,
            seriesItems = chart.series.items,
            ln, series,
            surface = chart.surface,
            items = me.items,
            padding = me.padding,
            itemSpacing = me.itemSpacing,
            spacingOffset = 2,
            maxWidth = 0,
            maxHeight = 0,
            totalWidth = 0,
            totalHeight = 0,
            vertical = me.isVertical,
            math = Math,
            mfloor = math.floor,
            mmax = math.max,
            index = 0,
            i = 0,
            len = items ? items.length : 0,
            x, y, spacing, item, bbox, height, width,
            fields, field, nFields, j;

        //remove all legend items
        if (len) {
            for (; i < len; i++) {
                items[i].destroy();
            }
        }
        //empty array
        items.length = [];
        // Create all the item labels, collecting their dimensions and positioning each one
        // properly in relation to the previous item
        for (i = 0, ln = seriesItems.length; i < ln; i++) {
            series = seriesItems[i];
            if (series.showInLegend) {
                fields = [].concat(series.yField);
                for (j = 0, nFields = fields.length; j < nFields; j++) {
                    field = fields[j];
                    item = new Ext.chart.LegendItem({
                        legend: this,
                        series: series,
                        surface: chart.surface,
                        yFieldIndex: j
                    });
                    bbox = item.getBBox();

                    //always measure from x=0, since not all markers go all the way to the left
                    width = bbox.width;
                    height = bbox.height;

                    if (i + j === 0) {
                        spacing = vertical ? padding + height / 2 : padding;
                    }
                    else {
                        spacing = itemSpacing / (vertical ? 2 : 1);
                    }
                    // Set the item's position relative to the legend box
                    item.x = mfloor(vertical ? padding : totalWidth + spacing);
                    item.y = mfloor(vertical ? totalHeight + spacing : padding + height / 2);

                    // Collect cumulative dimensions
                    totalWidth += width + spacing;
                    totalHeight += height + spacing;
                    maxWidth = mmax(maxWidth, width);
                    maxHeight = mmax(maxHeight, height);

                    items.push(item);
                }
            }
        }

        // Store the collected dimensions for later
        me.width = mfloor((vertical ? maxWidth : totalWidth) + padding * 2);
        if (vertical && items.length === 1) {
            spacingOffset = 1;
        }
        me.height = mfloor((vertical ? totalHeight - spacingOffset * spacing : maxHeight) + (padding * 2));
        me.itemHeight = maxHeight;
    },

    /**
     * @private Get the bounds for the legend's outer box
     */
    getBBox: function() {
        var me = this;
        return {
            x: Math.round(me.x) - me.boxStrokeWidth / 2,
            y: Math.round(me.y) - me.boxStrokeWidth / 2,
            width: me.width,
            height: me.height
        };
    },

    /**
     * @private Create the box around the legend items
     */
    createBox: function() {
        var me = this,
            box, bbox;

        if (me.boxSprite) {
            me.boxSprite.destroy();
        }

        bbox = me.getBBox();
        //if some of the dimensions are NaN this means that we
        //cannot set a specific width/height for the legend
        //container. One possibility for this is that there are
        //actually no items to show in the legend, and the legend
        //should be hidden.
        if (isNaN(bbox.width) || isNaN(bbox.height)) {
            me.boxSprite = false;
            return;
        }
        
        box = me.boxSprite = me.chart.surface.add(Ext.apply({
            type: 'rect',
            stroke: me.boxStroke,
            "stroke-width": me.boxStrokeWidth,
            fill: me.boxFill,
            zIndex: me.boxZIndex
        }, bbox));

        box.redraw();
    },

    /**
     * @private Update the position of all the legend's sprites to match its current x/y values
     */
    updatePosition: function() {
        var me = this,
            items = me.items,
            i, ln,
            x, y,
            legendWidth = me.width || 0,
            legendHeight = me.height || 0,
            padding = me.padding,
            chart = me.chart,
            chartBBox = chart.chartBBox,
            insets = chart.insetPadding,
            chartWidth = chartBBox.width - (insets * 2),
            chartHeight = chartBBox.height - (insets * 2),
            chartX = chartBBox.x + insets,
            chartY = chartBBox.y + insets,
            surface = chart.surface,
            mfloor = Math.floor,
            bbox;

        if (me.isDisplayed()) {
            // Find the position based on the dimensions
            switch(me.position) {
                case "left":
                    x = insets;
                    y = mfloor(chartY + chartHeight / 2 - legendHeight / 2);
                    break;
                case "right":
                    x = mfloor(surface.width - legendWidth) - insets;
                    y = mfloor(chartY + chartHeight / 2 - legendHeight / 2);
                    break;
                case "top":
                    x = mfloor(chartX + chartWidth / 2 - legendWidth / 2);
                    y = insets;
                    break;
                case "bottom":
                    x = mfloor(chartX + chartWidth / 2 - legendWidth / 2);
                    y = mfloor(surface.height - legendHeight) - insets;
                    break;
                default:
                    x = mfloor(me.origX) + insets;
                    y = mfloor(me.origY) + insets;
            }
            me.x = x;
            me.y = y;

            // Update the position of each item
            for (i = 0, ln = items.length; i < ln; i++) {
                items[i].updatePosition();
            }

            bbox = me.getBBox();

            //if some of the dimensions are NaN this means that we
            //cannot set a specific width/height for the legend
            //container. One possibility for this is that there are
            //actually no items to show in the legend, and the legend
            //should be hidden.
            if (isNaN(bbox.width) || isNaN(bbox.height)) {
                if (me.boxSprite) {
                    me.boxSprite.hide(true);
                }
            } else {
                if (!me.boxSprite) {
                    me.createBox();
                }
                // Update the position of the outer box
                me.boxSprite.setAttributes(bbox, true);
                me.boxSprite.show(true);
            }
        }
    },
    
    /** toggle
     * @param {Boolean} Whether to show or hide the legend.
     *
     */
    toggle: function(show) {
      var me = this,
          i = 0,
          items = me.items,
          len = items.length;

      if (me.boxSprite) {
          if (show) {
              me.boxSprite.show(true);
          } else {
              me.boxSprite.hide(true);
          }
      }

      for (; i < len; ++i) {
          if (show) {
            items[i].show(true);
          } else {
              items[i].hide(true);
          }
      }

      me.visible = show;
    }
});
