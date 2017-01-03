Ext.require('Ext.chart.*');
Ext.require(['Ext.layout.container.Fit', 'Ext.window.MessageBox']);

Ext.onReady(function() {

    var downloadChart = function(chart){
        Ext.MessageBox.confirm('Confirm Download', 'Would you like to download the chart as an image?', function(choice){
            if(choice == 'yes'){
                chart.save({
                    type: 'image/png'
                });
            }
        });
    };

    var chart1 = Ext.create('Ext.chart.Chart',{
            xtype: 'chart',
            animate: false,
            store: store1,
            insetPadding: 30,
            axes: [{
                type: 'Numeric',
                minimum: 0,
                position: 'left',
                fields: ['data1'],
                title: false,
                grid: true,
                label: {
                    renderer: Ext.util.Format.numberRenderer('0,0'),
                    font: '10px Arial'
                }
            }, {
                type: 'Category',
                position: 'bottom',
                fields: ['name'],
                title: false,
                label: {
                    font: '11px Arial',
                    renderer: function(name) {
                        return name.substr(0, 3) + ' 07';
                    }
                }
            }],
            series: [{
                type: 'line',
                axis: 'left',
                xField: 'name',
                yField: 'data1',
                listeners: {
                  itemmouseup: function(item) {
                      Ext.example.msg('Item Selected', item.value[1] + ' visits on ' + Ext.Date.monthNames[item.value[0]]);
                  }  
                },
                tips: {
                    trackMouse: true,
                    width: 80,
                    height: 40,
                    renderer: function(storeItem, item) {
                        this.setTitle(storeItem.get('name'));
                        this.update(storeItem.get('data1'));
                    }
                },
                style: {
                    fill: '#38B8BF',
                    stroke: '#38B8BF',
                    'stroke-width': 3
                },
                markerConfig: {
                    type: 'circle',
                    size: 4,
                    radius: 4,
                    'stroke-width': 0,
                    fill: '#38B8BF',
                    stroke: '#38B8BF'
                }
            }]
        });
 

    var panel1 = Ext.create('widget.panel', {
        width: 600,
        height: 300,
        title: 'ExtJS.com Visits Trends, 2007/2008 (No styling)',
        renderTo: Ext.getBody(),
        layout: 'fit',
        tbar: [{
            text: 'Save Chart',
            handler: function(){ downloadChart(chart1); }
        }],
        items: chart1
    });
    
    var chart2 = Ext.create('Ext.chart.Chart',{
            xtype: 'chart',
            animate: false,
            store: store1,
            insetPadding: 30,
            axes: [{
                type: 'Numeric',
                minimum: 0,
                position: 'left',
                fields: ['data1'],
                title: false,
                grid: true,
                label: {
                    renderer: Ext.util.Format.numberRenderer('0,0'),
                    font: '10px Arial'
                }
            }, {
                type: 'Category',
                position: 'bottom',
                fields: ['name'],
                title: false,
                label: {
                    font: '11px Arial',
                    renderer: function(name) {
                        return name.substr(0, 3);
                    }
                }
            }],
            series: [{
                type: 'line',
                axis: 'left',
                xField: 'name',
                yField: 'data1',
                tips: {
                    trackMouse: true,
                    width: 110,
                    height: 25,
                    renderer: function(storeItem, item) {
                        this.setTitle(storeItem.get('data1') + ' visits in ' + storeItem.get('name').substr(0, 3));
                    }
                },
                style: {
                    fill: '#38B8BF',
                    stroke: '#38B8BF',
                    'stroke-width': 3
                },
                markerConfig: {
                    type: 'circle',
                    size: 4,
                    radius: 4,
                    'stroke-width': 0,
                    fill: '#38B8BF',
                    stroke: '#38B8BF'
                }
            }]
        });
 

    var panel2 = Ext.create('widget.panel', {
        width: 600,
        height: 300,
        title: 'ExtJS.com Visits Trends, 2007/2008 (Simple styling)',
        renderTo: Ext.getBody(),
        layout: 'fit',
        tbar: [{
            text: 'Save Chart',
            handler: function(){ downloadChart(chart2); }
        }],
        items: chart2
    });
    
    var chart3 = Ext.create('Ext.chart.Chart', {
            xtype: 'chart',
            animate: false,
            store: store1,
            insetPadding: 30,
            gradients: [{
              angle: 90,
              id: 'bar-gradient',
              stops: {
                  0: {
                      color: '#99BBE8'
                  },
                  70: {
                      color: '#77AECE'
                  },
                  100: {
                      color: '#77AECE'
                  }
              }
            }],
            axes: [{
                type: 'Numeric',
                minimum: 0,
                maximum: 100,
                position: 'left',
                fields: ['data1'],
                title: false,
                grid: true,
                label: {
                    renderer: Ext.util.Format.numberRenderer('0,0'),
                    font: '10px Arial'
                }
            }, {
                type: 'Category',
                position: 'bottom',
                fields: ['name'],
                title: false,
                grid: true,
                label: {
                    font: '11px Arial',
                    renderer: function(name) {
                        return name.substr(0, 3);
                    }
                }
            }],
            series: [{
                type: 'column',
                axis: 'left',
                xField: 'name',
                yField: 'data1',
                style: {
                    fill: 'url(#bar-gradient)',
                    'stroke-width': 3
                },
                markerConfig: {
                    type: 'circle',
                    size: 4,
                    radius: 4,
                    'stroke-width': 0,
                    fill: '#38B8BF',
                    stroke: '#38B8BF'
                }
            }, {
                type: 'line',
                axis: 'left',
                xField: 'name',
                yField: 'data2',
                tips: {
                    trackMouse: true,
                    width: 110,
                    height: 25,
                    renderer: function(storeItem, item) {
                        this.setTitle(storeItem.get('data2') + ' visits in ' + storeItem.get('name').substr(0, 3));
                    }
                },
                style: {
                    fill: '#18428E',
                    stroke: '#18428E',
                    'stroke-width': 3
                },
                markerConfig: {
                    type: 'circle',
                    size: 4,
                    radius: 4,
                    'stroke-width': 0,
                    fill: '#18428E',
                    stroke: '#18428E'
                }
            }]
        }); 

    var panel3 = Ext.create('widget.panel', {
        width: 600,
        height: 300,
        title: 'ExtJS.com Visits Trends, 2007/2008 (Full styling)',
        renderTo: Ext.getBody(),
        layout: 'fit',
        tbar: [{
            text: 'Save Chart',
            handler: function(){ downloadChart(chart3); }
        }],
        items: chart3
    });
});
