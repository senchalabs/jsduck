/**
 * @private
 */
Ext.define('Ext.chart.axis.Radial', {

    /* Begin Definitions */

    extend: 'Ext.chart.axis.Abstract',

    /* End Definitions */

    position: 'radial',

    alias: 'axis.radial',

    drawAxis: function(init) {
        var chart = this.chart,
            surface = chart.surface,
            bbox = chart.chartBBox,
            store = chart.store,
            l = store.getCount(),
            centerX = bbox.x + (bbox.width / 2),
            centerY = bbox.y + (bbox.height / 2),
            rho = Math.min(bbox.width, bbox.height) /2,
            sprites = [], sprite,
            steps = this.steps,
            i, j, pi2 = Math.PI * 2,
            cos = Math.cos, sin = Math.sin;

        if (this.sprites && !chart.resizing) {
            this.drawLabel();
            return;
        }

        if (!this.sprites) {
            //draw circles
            for (i = 1; i <= steps; i++) {
                sprite = surface.add({
                    type: 'circle',
                    x: centerX,
                    y: centerY,
                    radius: Math.max(rho * i / steps, 0),
                    stroke: '#ccc'
                });
                sprite.setAttributes({
                    hidden: false
                }, true);
                sprites.push(sprite);
            }
            //draw lines
            for (i = 0; i < l; i++) {
                sprite = surface.add({
                    type: 'path',
                    path: ['M', centerX, centerY, 'L', centerX + rho * cos(i / l * pi2), centerY + rho * sin(i / l * pi2), 'Z'],
                    stroke: '#ccc'
                });
                sprite.setAttributes({
                    hidden: false
                }, true);
                sprites.push(sprite);
            }
        } else {
            sprites = this.sprites;
            //draw circles
            for (i = 0; i < steps; i++) {
                sprites[i].setAttributes({
                    x: centerX,
                    y: centerY,
                    radius: Math.max(rho * (i + 1) / steps, 0),
                    stroke: '#ccc'
                }, true);
            }
            //draw lines
            for (j = 0; j < l; j++) {
                sprites[i + j].setAttributes({
                    path: ['M', centerX, centerY, 'L', centerX + rho * cos(j / l * pi2), centerY + rho * sin(j / l * pi2), 'Z'],
                    stroke: '#ccc'
                }, true);
            }
        }
        this.sprites = sprites;

        this.drawLabel();
    },

    drawLabel: function() {
        var chart = this.chart,
            seriesItems = chart.series.items,
            series,
            surface = chart.surface,
            bbox = chart.chartBBox,
            store = chart.store,
            data = store.data.items,
            ln, record,
            centerX = bbox.x + (bbox.width / 2),
            centerY = bbox.y + (bbox.height / 2),
            rho = Math.min(bbox.width, bbox.height) /2,
            max = Math.max, round = Math.round,
            labelArray = [], label,
            fields = [], nfields,
            categories = [], xField,
            aggregate = !this.maximum,
            maxValue = this.maximum || 0,
            steps = this.steps, i = 0, j, dx, dy,
            pi2 = Math.PI * 2,
            cos = Math.cos, sin = Math.sin,
            display = this.label.display,
            draw = display !== 'none',
            margin = 10;

        if (!draw) {
            return;
        }

        //get all rendered fields
        for (i = 0, ln = seriesItems.length; i < ln; i++) {
            series = seriesItems[i];
            fields.push(series.yField);
            xField = series.xField;
        }
        
        //get maxValue to interpolate
        for (j = 0, ln = data.length; j < ln; j++) {
            record = data[j];
            if (aggregate) {
                for (i = 0, nfields = fields.length; i < nfields; i++) {
                    maxValue = max(+record.get(fields[i]), maxValue);
                }
            }
            categories.push(record.get(xField));
        }
        if (!this.labelArray) {
            if (display != 'categories') {
                //draw scale
                for (i = 1; i <= steps; i++) {
                    label = surface.add({
                        type: 'text',
                        text: round(i / steps * maxValue),
                        x: centerX,
                        y: centerY - rho * i / steps,
                        'text-anchor': 'middle',
                        'stroke-width': 0.1,
                        stroke: '#333'
                    });
                    label.setAttributes({
                        hidden: false
                    }, true);
                    labelArray.push(label);
                }
            }
            if (display != 'scale') {
                //draw text
                for (j = 0, steps = categories.length; j < steps; j++) {
                    dx = cos(j / steps * pi2) * (rho + margin);
                    dy = sin(j / steps * pi2) * (rho + margin);
                    label = surface.add({
                        type: 'text',
                        text: categories[j],
                        x: centerX + dx,
                        y: centerY + dy,
                        'text-anchor': dx * dx <= 0.001? 'middle' : (dx < 0? 'end' : 'start')
                    });
                    label.setAttributes({
                        hidden: false
                    }, true);
                    labelArray.push(label);
                }
            }
        }
        else {
            labelArray = this.labelArray;
            if (display != 'categories') {
                //draw values
                for (i = 0; i < steps; i++) {
                    labelArray[i].setAttributes({
                        text: round((i + 1) / steps * maxValue),
                        x: centerX,
                        y: centerY - rho * (i + 1) / steps,
                        'text-anchor': 'middle',
                        'stroke-width': 0.1,
                        stroke: '#333'
                    }, true);
                }
            }
            if (display != 'scale') {
                //draw text
                for (j = 0, steps = categories.length; j < steps; j++) {
                    dx = cos(j / steps * pi2) * (rho + margin);
                    dy = sin(j / steps * pi2) * (rho + margin);
                    if (labelArray[i + j]) {
                        labelArray[i + j].setAttributes({
                            type: 'text',
                            text: categories[j],
                            x: centerX + dx,
                            y: centerY + dy,
                            'text-anchor': dx * dx <= 0.001? 'middle' : (dx < 0? 'end' : 'start')
                        }, true);
                    }
                }
            }
        }
        this.labelArray = labelArray;
    }
});