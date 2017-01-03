Ext.require('Ext.chart.*');
Ext.require(['Ext.Window', 'Ext.fx.target.Sprite', 'Ext.layout.container.Fit', 'Ext.window.MessageBox']);

Ext.onReady(function () {
    store1.loadData(generateData(5, 20));

    var chart = Ext.create('Ext.chart.Chart', {
            id: 'chartCmp',
            xtype: 'chart',
            style: 'background:#fff',
            animate: true,
            shadow: true,
            store: store1,
            series: [{
                type: 'pie',
                animate: true,
                angleField: 'data1', //bind angle span to visits
                lengthField: 'data2', //bind pie slice length to views
                highlight: {
                  segment: {
                    margin: 20
                  }
                },
                label: {
                    field: 'name',   //bind label text to name
                    display: 'rotate', //rotate labels (also middle, out).
                    font: '14px Arial',
                    contrast: true
                },                                
                style: {
                    'stroke-width': 1,
                    'stroke': '#fff'
                },
                //add renderer
                renderer: function(sprite, record, attr, index, store) {
                    var value = (record.get('data1') >> 0) % 9;
                    var color = [ "#94ae0a", "#115fa6","#a61120", "#ff8809", "#ffd13e", "#a61187", "#24ad9a", "#7c7474", "#a66111"][value];
                    return Ext.apply(attr, {
                        fill: color
                    });
                }
            }]
        });

    var win = Ext.create('Ext.Window', {
        width: 800,
        height: 600,
        minHeight: 400,
        minWidth: 550,
        hidden: false,
        maximizable: true,
        title: 'Pie Renderer Chart',
        renderTo: Ext.getBody(),
        layout: 'fit',
        tbar: [{
            text: 'Save Chart',
            handler: function() {
                Ext.MessageBox.confirm('Confirm Download', 'Would you like to download the chart as an image?', function(choice){
                    if(choice == 'yes'){
                        chart.save({
                            type: 'image/png'
                        });
                    }
                });
            }
        }, {
            text: 'Reload Data',
            handler: function() {
                store1.loadData(generateData(5));
            }
        }],
        items: chart
    });
});
