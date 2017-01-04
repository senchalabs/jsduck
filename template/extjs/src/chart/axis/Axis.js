/**
 * @class Ext.chart.axis.Axis
 *
 * Defines axis for charts. The axis position, type, style can be configured.
 * The axes are defined in an axes array of configuration objects where the type,
 * field, grid and other configuration options can be set. To know more about how
 * to create a Chart please check the Chart class documentation. Here's an example for the axes part:
 * An example of axis for a series (in this case for an area chart that has multiple layers of yFields) could be:
 *
 *     axes: [{
 *         type: 'Numeric',
 *         position: 'left',
 *         fields: ['data1', 'data2', 'data3'],
 *         title: 'Number of Hits',
 *         grid: {
 *             odd: {
 *                 opacity: 1,
 *                 fill: '#ddd',
 *                 stroke: '#bbb',
 *                 'stroke-width': 1
 *             }
 *         },
 *         minimum: 0
 *     }, {
 *         type: 'Category',
 *         position: 'bottom',
 *         fields: ['name'],
 *         title: 'Month of the Year',
 *         grid: true,
 *         label: {
 *             rotate: {
 *                 degrees: 315
 *             }
 *         }
 *     }]
 *
 * In this case we use a `Numeric` axis for displaying the values of the Area series and a `Category` axis for displaying the names of
 * the store elements. The numeric axis is placed on the left of the screen, while the category axis is placed at the bottom of the chart.
 * Both the category and numeric axes have `grid` set, which means that horizontal and vertical lines will cover the chart background. In the
 * category axis the labels will be rotated so they can fit the space better.
 */
Ext.define('Ext.chart.axis.Axis', {

    /* Begin Definitions */

    extend: 'Ext.chart.axis.Abstract',

    alternateClassName: 'Ext.chart.Axis',

    requires: ['Ext.draw.Draw'],

    /* End Definitions */

    /**
     * @cfg {Boolean/Object} grid
     * The grid configuration enables you to set a background grid for an axis.
     * If set to *true* on a vertical axis, vertical lines will be drawn.
     * If set to *true* on a horizontal axis, horizontal lines will be drawn.
     * If both are set, a proper grid with horizontal and vertical lines will be drawn.
     *
     * You can set specific options for the grid configuration for odd and/or even lines/rows.
     * Since the rows being drawn are rectangle sprites, you can set to an odd or even property
     * all styles that apply to {@link Ext.draw.Sprite}. For more information on all the style
     * properties you can set please take a look at {@link Ext.draw.Sprite}. Some useful style properties are `opacity`, `fill`, `stroke`, `stroke-width`, etc.
     *
     * The possible values for a grid option are then *true*, *false*, or an object with `{ odd, even }` properties
     * where each property contains a sprite style descriptor object that is defined in {@link Ext.draw.Sprite}.
     *
     * For example:
     *
     *     axes: [{
     *         type: 'Numeric',
     *         position: 'left',
     *         fields: ['data1', 'data2', 'data3'],
     *         title: 'Number of Hits',
     *         grid: {
     *             odd: {
     *                 opacity: 1,
     *                 fill: '#ddd',
     *                 stroke: '#bbb',
     *                 'stroke-width': 1
     *             }
     *         }
     *     }, {
     *         type: 'Category',
     *         position: 'bottom',
     *         fields: ['name'],
     *         title: 'Month of the Year',
     *         grid: true
     *     }]
     *
     */

    /**
     * @cfg {Number} majorTickSteps
     * If `minimum` and `maximum` are specified it forces the number of major ticks to the specified value.
     * If a number of major ticks is forced, it wont search for pretty numbers at the ticks.
     */

    /**
     * @cfg {Number} minorTickSteps
     * The number of small ticks between two major ticks. Default is zero.
     */

    /**
     * @cfg {String} title
     * The title for the Axis
     */

    // @private force min/max values from store
    forceMinMax: false,

    /**
     * @cfg {Number} dashSize
     * The size of the dash marker. Default's 3.
     */
    dashSize: 3,

    /**
     * @cfg {String} position
     * Where to set the axis. Available options are `left`, `bottom`, `right`, `top`. Default's `bottom`.
     */
    position: 'bottom',

    // @private
    skipFirst: false,

    /**
     * @cfg {Number} length
     * Offset axis position. Default's 0.
     */
    length: 0,

    /**
     * @cfg {Number} width
     * Offset axis width. Default's 0.
     */
    width: 0,

    /**
     * @cfg {Boolean} adjustEnd
     * Whether to adjust the label at the end of the axis.
     */
    adjustEnd: true,

    majorTickSteps: false,

    // @private
    applyData: Ext.emptyFn,

    getRange: function () {
        var me = this,
            chart = me.chart,
            store = chart.getChartStore(),
            data = store.data.items,
            series = chart.series.items,
            position = me.position,
            boundedAxes,
            seriesClasses = Ext.chart.series,
            aggregations = [],
            min = Infinity, max = -Infinity,
            vertical = me.position === 'left' || me.position === 'right',
            i, ln, ln2, j, k, dataLength = data.length, aggregates,
            countedFields = {},
            allFields = {},
            excludable = true,
            fields, fieldMap, record, field, value;

        fields = me.fields;
        for (j = 0, ln = fields.length; j < ln; j++) {
            allFields[fields[j]] = true;
        }

        for (i = 0, ln = series.length; i < ln; i++) {
            if (series[i].seriesIsHidden) {
                continue;
            }
            if (!series[i].getAxesForXAndYFields) {
                continue;
            }

            boundedAxes = series[i].getAxesForXAndYFields();
            if (boundedAxes.xAxis && boundedAxes.xAxis !== position && boundedAxes.yAxis && boundedAxes.yAxis !== position) {
                // If the series explicitly exclude current Axis, then exit.
                continue;
            }

            if (seriesClasses.Bar && series[i] instanceof seriesClasses.Bar && !series[i].column) {
                // If this is a horizontal bar series, then flip xField and yField.
                fields = vertical ? Ext.Array.from(series[i].xField) : Ext.Array.from(series[i].yField);
            } else {
                fields = vertical ? Ext.Array.from(series[i].yField) : Ext.Array.from(series[i].xField);
            }

            if (me.fields.length) {
                for (j = 0, ln2 = fields.length; j < ln2; j++) {
                    if (allFields[fields[j]]) {
                        break;
                    }
                }
                if (j == ln2) {
                    // Not matching fields, skipping this series.
                    continue;
                }
            }

            if (aggregates = series[i].stacked) {
                // If this is a bar/column series, then it will be aggregated if it is of the same direction of the axis.
                if (seriesClasses.Bar && series[i] instanceof seriesClasses.Bar) {
                    if (series[i].column != vertical) {
                        aggregates = false;
                        excludable = false;
                    }
                }
                // Otherwise it is stacked vertically
                else if (!vertical) {
                    aggregates = false;
                    excludable = false;
                }
            }


            if (aggregates) {
                fieldMap = {};
                for (j = 0; j < fields.length; j++) {
                    if (excludable && series[i].__excludes && series[i].__excludes[j]) {
                        continue;
                    }
                    if (!allFields[fields[j]]) {
                        Ext.Logger.warn('Field `' + fields[j] + '` is not included in the ' + position + ' axis config.');
                    }
                    allFields[fields[j]] = fieldMap[fields[j]] = true;
                }
                aggregations.push({
                    fields: fieldMap,
                    value: 0
                });
            } else {

                if (!fields || fields.length == 0) {
                    fields = me.fields;
                }
                for (j = 0; j < fields.length; j++) {
                    if (excludable && series[i].__excludes && series[i].__excludes[j]) {
                        continue;
                    }
                    allFields[fields[j]] = countedFields[fields[j]] = true;
                }
            }
        }

        for (i = 0; i < dataLength; i++) {
            record = data[i];
            for (k = 0; k < aggregations.length; k++) {
                aggregations[k].value = 0;
            }
            for (field in allFields) {
                value = record.get(field);
                if (isNaN(value)) {
                    continue;
                }
                if (value === undefined) {
                    value = 0;
                }
                if (countedFields[field]) {
                    if (min > value) {
                        min = value;
                    }
                    if (max < value) {
                        max = value;
                    }
                }
                for (k = 0; k < aggregations.length; k++) {
                    if (aggregations[k].fields[field]) {
                        aggregations[k].value += value;
                        // If any aggregation is actually hit, then the min value should be at most 0.
                        if (min > 0) {
                            min = 0;
                        }
                        if (max < aggregations[k].value) {
                            max = aggregations[k].value;
                        }
                    }
                }
            }
        }

        if (!isFinite(max)) {
            max = me.prevMax || 0;
        }
        if (!isFinite(min)) {
            min = me.prevMin || 0;
        }

        //normalize min max for snapEnds.
        if (min != max && (max != Math.floor(max))) {
            max = Math.floor(max) + 1;
        }

        if (!isNaN(me.minimum)) {
            min = me.minimum;
        }

        if (!isNaN(me.maximum)) {
            max = me.maximum;
        }

        if (min >= max) {
            // snapEnds will return NaN if max >= min;
            max = min + 1;
        }

        return {min: min, max: max};
    },

    // @private creates a structure with start, end and step points.
    calcEnds: function () {
        var me = this,
            range = me.getRange(),
            min = range.min,
            max = range.max,
            steps, prettyNumbers, out, changedRange;

        steps = (Ext.isNumber(me.majorTickSteps) ? me.majorTickSteps + 1 : me.steps);
        prettyNumbers = !(Ext.isNumber(me.maximum) && Ext.isNumber(me.minimum) && Ext.isNumber(me.majorTickSteps) && me.majorTickSteps > 0);

        out = Ext.draw.Draw.snapEnds(min, max, steps, prettyNumbers);

        if (Ext.isNumber(me.maximum)) {
            out.to = me.maximum;
            changedRange = true;
        }
        if (Ext.isNumber(me.minimum)) {
            out.from = me.minimum;
            changedRange = true;
        }
        if (me.adjustMaximumByMajorUnit) {
            out.to = Math.ceil(out.to / out.step) * out.step;
            changedRange = true;
        }
        if (me.adjustMinimumByMajorUnit) {
            out.from = Math.floor(out.from / out.step) * out.step;
            changedRange = true;
        }

        if (changedRange) {
            out.steps = Math.ceil((out.to - out.from) / out.step);            
        }

        me.prevMin = (min == max ? 0 : min);
        me.prevMax = max;
        return out;
    },

    /**
     * Renders the axis into the screen and updates its position.
     */
    drawAxis: function (init) {
        var me = this,
            i, 
            x = me.x,
            y = me.y,
            gutterX = me.chart.maxGutter[0],
            gutterY = me.chart.maxGutter[1],
            dashSize = me.dashSize,
            subDashesX = me.minorTickSteps || 0,
            subDashesY = me.minorTickSteps || 0,
            length = me.length,
            position = me.position,
            inflections = [],
            calcLabels = false,
            stepCalcs = me.applyData(),
            step = stepCalcs.step,
            steps = stepCalcs.steps,
            from = stepCalcs.from,
            to = stepCalcs.to,
            trueLength,
            currentX,
            currentY,
            path,
            dashesX,
            dashesY,
            delta;

        //If no steps are specified
        //then don't draw the axis. This generally happens
        //when an empty store.
        if (me.hidden || isNaN(step) || (from > to)) {
            return;
        }

        me.from = stepCalcs.from;
        me.to = stepCalcs.to;

        if (position == 'left' || position == 'right') {
            currentX = Math.floor(x) + 0.5;
            path = ["M", currentX, y, "l", 0, -length];
            trueLength = length - (gutterY * 2);
        }
        else {
            currentY = Math.floor(y) + 0.5;
            path = ["M", x, currentY, "l", length, 0];
            trueLength = length - (gutterX * 2);
        }

        // Supports the case that we have only 1 record.
        delta = steps && trueLength / steps;
        dashesX = Math.max(subDashesX + 1, 0);
        dashesY = Math.max(subDashesY + 1, 0);
        if (me.type == 'Numeric' || me.type == 'Time') {
            calcLabels = true;
            me.labels = [stepCalcs.from];
        }

        if (position == 'right' || position == 'left') {
            currentY = y - gutterY;
            currentX = x - ((position == 'left') * dashSize * 2);
            while (currentY >= y - gutterY - trueLength) {
                path.push("M", currentX, Math.floor(currentY) + 0.5, "l", dashSize * 2 + 1, 0);
                if (currentY != y - gutterY) {
                    for (i = 1; i < dashesY; i++) {
                        path.push("M", currentX + dashSize, Math.floor(currentY + delta * i / dashesY) + 0.5, "l", dashSize + 1, 0);
                    }
                }
                inflections.push([ Math.floor(x), Math.floor(currentY) ]);
                currentY -= delta;

                if (calcLabels) {
                    me.labels.push(me.labels[me.labels.length - 1] + step);
                }

                if (delta === 0) {
                    break;
                }
            }
            if (Math.round(currentY + delta - (y - gutterY - trueLength))) {
                path.push("M", currentX, Math.floor(y - length + gutterY) + 0.5, "l", dashSize * 2 + 1, 0);
                for (i = 1; i < dashesY; i++) {
                    path.push("M", currentX + dashSize, Math.floor(y - length + gutterY + delta * i / dashesY) + 0.5, "l", dashSize + 1, 0);
                }
                inflections.push([ Math.floor(x), Math.floor(currentY) ]);
                if (calcLabels) {
                    me.labels.push(me.labels[me.labels.length - 1] + step);
                }
            }
        } else {
            currentX = x + gutterX;
            currentY = y - ((position == 'top') * dashSize * 2);
            while (currentX <= x + gutterX + trueLength) {
                path.push("M", Math.floor(currentX) + 0.5, currentY, "l", 0, dashSize * 2 + 1);
                if (currentX != x + gutterX) {
                    for (i = 1; i < dashesX; i++) {
                        path.push("M", Math.floor(currentX - delta * i / dashesX) + 0.5, currentY, "l", 0, dashSize + 1);
                    }
                }
                inflections.push([ Math.floor(currentX), Math.floor(y) ]);
                currentX += delta;
                if (calcLabels) {
                    me.labels.push(me.labels[me.labels.length - 1] + step);
                }
                if (delta === 0) {
                    break;
                }
            }
            if (Math.round(currentX - delta - (x + gutterX + trueLength))) {
                path.push("M", Math.floor(x + length - gutterX) + 0.5, currentY, "l", 0, dashSize * 2 + 1);
                for (i = 1; i < dashesX; i++) {
                    path.push("M", Math.floor(x + length - gutterX - delta * i / dashesX) + 0.5, currentY, "l", 0, dashSize + 1);
                }
                inflections.push([ Math.floor(currentX), Math.floor(y) ]);
                if (calcLabels) {
                    me.labels.push(me.labels[me.labels.length - 1] + step);
                }
            }
        }

        // the label on index "inflections.length-1" is the last label that gets rendered
        if (calcLabels) {
            me.labels[inflections.length - 1] = +(me.labels[inflections.length - 1]).toFixed(10);
        }

        if (!me.axis) {
            me.axis = me.chart.surface.add(Ext.apply({
                type: 'path',
                path: path
            }, me.axisStyle));
        }
        me.axis.setAttributes({
            path: path
        }, true);
        me.inflections = inflections;
        if (!init && me.grid) {
            me.drawGrid();
        }
        me.axisBBox = me.axis.getBBox();
        me.drawLabel();
    },

    /**
     * Renders an horizontal and/or vertical grid into the Surface.
     */
    drawGrid: function () {
        var me = this,
            surface = me.chart.surface,
            grid = me.grid,
            odd = grid.odd,
            even = grid.even,
            inflections = me.inflections,
            ln = inflections.length - ((odd || even) ? 0 : 1),
            position = me.position,
            gutter = me.chart.maxGutter,
            width = me.width - 2,
            point, prevPoint,
            i = 1,
            path = [], styles, lineWidth, dlineWidth,
            oddPath = [], evenPath = [];

        if ((gutter[1] !== 0 && (position == 'left' || position == 'right')) ||
            (gutter[0] !== 0 && (position == 'top' || position == 'bottom'))) {
            i = 0;
            ln++;
        }
        for (; i < ln; i++) {
            point = inflections[i];
            prevPoint = inflections[i - 1];
            if (odd || even) {
                path = (i % 2) ? oddPath : evenPath;
                styles = ((i % 2) ? odd : even) || {};
                lineWidth = (styles.lineWidth || styles['stroke-width'] || 0) / 2;
                dlineWidth = 2 * lineWidth;
                if (position == 'left') {
                    path.push("M", prevPoint[0] + 1 + lineWidth, prevPoint[1] + 0.5 - lineWidth,
                        "L", prevPoint[0] + 1 + width - lineWidth, prevPoint[1] + 0.5 - lineWidth,
                        "L", point[0] + 1 + width - lineWidth, point[1] + 0.5 + lineWidth,
                        "L", point[0] + 1 + lineWidth, point[1] + 0.5 + lineWidth, "Z");
                }
                else if (position == 'right') {
                    path.push("M", prevPoint[0] - lineWidth, prevPoint[1] + 0.5 - lineWidth,
                        "L", prevPoint[0] - width + lineWidth, prevPoint[1] + 0.5 - lineWidth,
                        "L", point[0] - width + lineWidth, point[1] + 0.5 + lineWidth,
                        "L", point[0] - lineWidth, point[1] + 0.5 + lineWidth, "Z");
                }
                else if (position == 'top') {
                    path.push("M", prevPoint[0] + 0.5 + lineWidth, prevPoint[1] + 1 + lineWidth,
                        "L", prevPoint[0] + 0.5 + lineWidth, prevPoint[1] + 1 + width - lineWidth,
                        "L", point[0] + 0.5 - lineWidth, point[1] + 1 + width - lineWidth,
                        "L", point[0] + 0.5 - lineWidth, point[1] + 1 + lineWidth, "Z");
                }
                else {
                    path.push("M", prevPoint[0] + 0.5 + lineWidth, prevPoint[1] - lineWidth,
                        "L", prevPoint[0] + 0.5 + lineWidth, prevPoint[1] - width + lineWidth,
                        "L", point[0] + 0.5 - lineWidth, point[1] - width + lineWidth,
                        "L", point[0] + 0.5 - lineWidth, point[1] - lineWidth, "Z");
                }
            } else {
                if (position == 'left') {
                    path = path.concat(["M", point[0] + 0.5, point[1] + 0.5, "l", width, 0]);
                }
                else if (position == 'right') {
                    path = path.concat(["M", point[0] - 0.5, point[1] + 0.5, "l", -width, 0]);
                }
                else if (position == 'top') {
                    path = path.concat(["M", point[0] + 0.5, point[1] + 0.5, "l", 0, width]);
                }
                else {
                    path = path.concat(["M", point[0] + 0.5, point[1] - 0.5, "l", 0, -width]);
                }
            }
        }
        if (odd || even) {
            if (oddPath.length) {
                if (!me.gridOdd && oddPath.length) {
                    me.gridOdd = surface.add({
                        type: 'path',
                        path: oddPath
                    });
                }
                me.gridOdd.setAttributes(Ext.apply({
                    path: oddPath,
                    hidden: false
                }, odd || {}), true);
            }
            if (evenPath.length) {
                if (!me.gridEven) {
                    me.gridEven = surface.add({
                        type: 'path',
                        path: evenPath
                    });
                }
                me.gridEven.setAttributes(Ext.apply({
                    path: evenPath,
                    hidden: false
                }, even || {}), true);
            }
        }
        else {
            if (path.length) {
                if (!me.gridLines) {
                    me.gridLines = me.chart.surface.add({
                        type: 'path',
                        path: path,
                        "stroke-width": me.lineWidth || 1,
                        stroke: me.gridColor || '#ccc'
                    });
                }
                me.gridLines.setAttributes({
                    hidden: false,
                    path: path
                }, true);
            }
            else if (me.gridLines) {
                me.gridLines.hide(true);
            }
        }
    },

    // @private
    getOrCreateLabel: function (i, text) {
        var me = this,
            labelGroup = me.labelGroup,
            textLabel = labelGroup.getAt(i),
            surface = me.chart.surface;
        if (textLabel) {
            if (text != textLabel.attr.text) {
                textLabel.setAttributes(Ext.apply({
                    text: text
                }, me.label), true);
                textLabel._bbox = textLabel.getBBox();
            }
        }
        else {
            textLabel = surface.add(Ext.apply({
                group: labelGroup,
                type: 'text',
                x: 0,
                y: 0,
                text: text
            }, me.label));
            surface.renderItem(textLabel);
            textLabel._bbox = textLabel.getBBox();
        }
        //get untransformed bounding box
        if (me.label.rotation) {
            textLabel.setAttributes({
                rotation: {
                    degrees: 0
                }
            }, true);
            textLabel._ubbox = textLabel.getBBox();
            textLabel.setAttributes(me.label, true);
        } else {
            textLabel._ubbox = textLabel._bbox;
        }
        return textLabel;
    },

    rect2pointArray: function (sprite) {
        var surface = this.chart.surface,
            rect = surface.getBBox(sprite, true),
            p1 = [rect.x, rect.y],
            p1p = p1.slice(),
            p2 = [rect.x + rect.width, rect.y],
            p2p = p2.slice(),
            p3 = [rect.x + rect.width, rect.y + rect.height],
            p3p = p3.slice(),
            p4 = [rect.x, rect.y + rect.height],
            p4p = p4.slice(),
            matrix = sprite.matrix;
        //transform the points
        p1[0] = matrix.x.apply(matrix, p1p);
        p1[1] = matrix.y.apply(matrix, p1p);

        p2[0] = matrix.x.apply(matrix, p2p);
        p2[1] = matrix.y.apply(matrix, p2p);

        p3[0] = matrix.x.apply(matrix, p3p);
        p3[1] = matrix.y.apply(matrix, p3p);

        p4[0] = matrix.x.apply(matrix, p4p);
        p4[1] = matrix.y.apply(matrix, p4p);
        return [p1, p2, p3, p4];
    },

    intersect: function (l1, l2) {
        var r1 = this.rect2pointArray(l1),
            r2 = this.rect2pointArray(l2);
        return !!Ext.draw.Draw.intersect(r1, r2).length;
    },

    drawHorizontalLabels: function () {
        var me = this,
            labelConf = me.label,
            floor = Math.floor,
            max = Math.max,
            axes = me.chart.axes,
            insetPadding = me.chart.insetPadding,
            position = me.position,
            inflections = me.inflections,
            ln = inflections.length,
            labels = me.labels,
            maxHeight = 0,
            ratio,
            bbox, point, prevLabel, prevLabelId,
            adjustEnd = me.adjustEnd,
            hasLeft = axes.findIndex('position', 'left') != -1,
            hasRight = axes.findIndex('position', 'right') != -1,
            textLabel, text,
            last, x, y, i, firstLabel;

        last = ln - 1;
        //get a reference to the first text label dimensions
        point = inflections[0];
        firstLabel = me.getOrCreateLabel(0, me.label.renderer(labels[0]));
        ratio = Math.floor(Math.abs(Math.sin(labelConf.rotate && (labelConf.rotate.degrees * Math.PI / 180) || 0)));

        for (i = 0; i < ln; i++) {
            point = inflections[i];
            text = me.label.renderer(labels[i]);
            textLabel = me.getOrCreateLabel(i, text);
            bbox = textLabel._bbox;
            maxHeight = max(maxHeight, bbox.height + me.dashSize + me.label.padding);
            x = floor(point[0] - (ratio ? bbox.height : bbox.width) / 2);
            if (adjustEnd && me.chart.maxGutter[0] == 0) {
                if (i == 0 && !hasLeft) {
                    x = point[0];
                }
                else if (i == last && !hasRight) {
                    x = Math.min(x, point[0] - bbox.width + insetPadding);
                }
            }
            if (position == 'top') {
                y = point[1] - (me.dashSize * 2) - me.label.padding - (bbox.height / 2);
            }
            else {
                y = point[1] + (me.dashSize * 2) + me.label.padding + (bbox.height / 2);
            }

            textLabel.setAttributes({
                hidden: false,
                x: x,
                y: y
            }, true);

            // Skip label if there isn't available minimum space
            if (i != 0 && (me.intersect(textLabel, prevLabel)
                || me.intersect(textLabel, firstLabel))) {
                if (i === last && prevLabelId !== 0) {
                    prevLabel.hide(true);
                } else {
                    textLabel.hide(true);
                    continue;
                }
            }

            prevLabel = textLabel;
            prevLabelId = i;
        }

        return maxHeight;
    },

    drawVerticalLabels: function () {
        var me = this,
            inflections = me.inflections,
            position = me.position,
            ln = inflections.length,
            chart = me.chart,
            insetPadding = chart.insetPadding,
            labels = me.labels,
            maxWidth = 0,
            max = Math.max,
            floor = Math.floor,
            ceil = Math.ceil,
            axes = me.chart.axes,
            gutterY = me.chart.maxGutter[1],
            bbox, point, prevLabel, prevLabelId,
            hasTop = axes.findIndex('position', 'top') != -1,
            hasBottom = axes.findIndex('position', 'bottom') != -1,
            adjustEnd = me.adjustEnd,
            textLabel, text,
            last = ln - 1, x, y, i;

        for (i = 0; i < ln; i++) {
            point = inflections[i];
            text = me.label.renderer(labels[i]);
            textLabel = me.getOrCreateLabel(i, text);
            bbox = textLabel._bbox;

            maxWidth = max(maxWidth, bbox.width + me.dashSize + me.label.padding);
            y = point[1];
            if (adjustEnd && gutterY < bbox.height / 2) {
                if (i == last && !hasTop) {
                    y = Math.max(y, me.y - me.length + ceil(bbox.height / 2) - insetPadding);
                }
                else if (i == 0 && !hasBottom) {
                    y = me.y + gutterY - floor(bbox.height / 2);
                }
            }
            if (position == 'left') {
                x = point[0] - bbox.width - me.dashSize - me.label.padding - 2;
            }
            else {
                x = point[0] + me.dashSize + me.label.padding + 2;
            }
            textLabel.setAttributes(Ext.apply({
                hidden: false,
                x: x,
                y: y
            }, me.label), true);
            // Skip label if there isn't available minimum space
            if (i != 0 && me.intersect(textLabel, prevLabel)) {
                if (i === last && prevLabelId !== 0) {
                    prevLabel.hide(true);
                } else {
                    textLabel.hide(true);
                    continue;
                }
            }
            prevLabel = textLabel;
            prevLabelId = i;
        }

        return maxWidth;
    },

    /**
     * Renders the labels in the axes.
     */
    drawLabel: function () {
        var me = this,
            position = me.position,
            labelGroup = me.labelGroup,
            inflections = me.inflections,
            maxWidth = 0,
            maxHeight = 0,
            ln, i;

        if (position == 'left' || position == 'right') {
            maxWidth = me.drawVerticalLabels();
        } else {
            maxHeight = me.drawHorizontalLabels();
        }

        // Hide unused bars
        ln = labelGroup.getCount();
        i = inflections.length;
        for (; i < ln; i++) {
            labelGroup.getAt(i).hide(true);
        }

        me.bbox = {};
        Ext.apply(me.bbox, me.axisBBox);
        me.bbox.height = maxHeight;
        me.bbox.width = maxWidth;
        if (Ext.isString(me.title)) {
            me.drawTitle(maxWidth, maxHeight);
        }
    },

    /**
     * Updates the {@link #title} of this axis.
     * @param {String} title
     */
    setTitle: function (title) {
        this.title = title;
        this.drawLabel();
    },

    // @private draws the title for the axis.
    drawTitle: function (maxWidth, maxHeight) {
        var me = this,
            position = me.position,
            surface = me.chart.surface,
            displaySprite = me.displaySprite,
            title = me.title,
            rotate = (position == 'left' || position == 'right'),
            x = me.x,
            y = me.y,
            base, bbox, pad;

        if (displaySprite) {
            displaySprite.setAttributes({text: title}, true);
        } else {
            base = {
                type: 'text',
                x: 0,
                y: 0,
                text: title
            };
            displaySprite = me.displaySprite = surface.add(Ext.apply(base, me.axisTitleStyle, me.labelTitle));
            surface.renderItem(displaySprite);
        }
        bbox = displaySprite.getBBox();
        pad = me.dashSize + me.label.padding;

        if (rotate) {
            y -= ((me.length / 2) - (bbox.height / 2));
            if (position == 'left') {
                x -= (maxWidth + pad + (bbox.width / 2));
            }
            else {
                x += (maxWidth + pad + bbox.width - (bbox.width / 2));
            }
            me.bbox.width += bbox.width + 10;
        }
        else {
            x += (me.length / 2) - (bbox.width * 0.5);
            if (position == 'top') {
                y -= (maxHeight + pad + (bbox.height * 0.3));
            }
            else {
                y += (maxHeight + pad + (bbox.height * 0.8));
            }
            me.bbox.height += bbox.height + 10;
        }
        displaySprite.setAttributes({
            translate: {
                x: x,
                y: y
            }
        }, true);
    }
});
