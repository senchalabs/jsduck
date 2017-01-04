Ext.require('Ext.button.*');
Ext.onReady(function() {
    var genericConfig = [{
            _name: 'Text Only'
        },{
            _name   : 'Disabled',
            disabled: true
        },{
            _name  : 'Icon Only',
            text   : null,
            iconCls: 'add'
        },{
            _name  : 'Icon and Text (left)',
            iconCls: 'add',
            iconAlign: 'left'
        },{
            _name  : 'Icon and Text (top)',
            iconCls: 'add',
            iconAlign: 'top'
        },{
            _name  : 'Icon and Text (right)',
            iconCls: 'add',
            iconAlign: 'right'
        },{
            _name  : 'Icon and Text (bottom)',
            iconCls: 'add',
            iconAlign: 'bottom'
        }],
        menu = {
            items: [{
                    text:'Menu Item 1'
                },{
                    text:'Menu Item 2'
                },{
                    text:'Menu Item 3'
            }]
        };
    
    function renderButtons(title, configs, defaultConfig) {
        Ext.getBody().createChild({
            tag : 'h2',
            html: title
        });
        
        Ext.each(configs, function(config) {
            var generateButtons = function(config) {
                //Ext.each(['gray', 'darkgray', 'blue', 'darkblue', 'red', 'green'], function(color) {
                Ext.each(['default'], function(color) {
                    Ext.widget(defaultConfig.defaultType || 'button', Ext.apply({
                        text : 'Small',
                        scale: 'small',
                        color: color
                    }, config, defaultConfig));

                    Ext.widget(defaultConfig.defaultType || 'button', Ext.apply({
                        text : 'Medium',
                        scale: 'medium',
                        color: color
                    }, config, defaultConfig));

                    Ext.widget(defaultConfig.defaultType || 'button', Ext.apply({
                        text : 'Large',
                        scale: 'large',
                        color: color
                    }, config, defaultConfig));
                }, this);
            };
            
            Ext.getBody().createChild({
                tag : 'h3',
                html: config._name
            });
            
            var el = Ext.getBody().createChild({});

            if (config.children) {
                Ext.each(config.children, function(child) {
                    el = el.createChild({
                        children: [
                            {
                                tag : 'h4',
                                html: child._name
                            }
                        ]
                    });
                }, this);
            } else {
                generateButtons(Ext.apply(config, {
                    renderTo: el
                }));
            }
        }, this);
    }
    
    renderButtons('Normal Buttons', genericConfig, {
        cls: 'floater'
    });
    
    renderButtons('Toggle Buttons', genericConfig, {
        cls: 'floater',
        enableToggle: true
    });
    
    renderButtons('Menu Buttons', genericConfig, {
        cls: 'floater',
        menu : menu
    });
    
    renderButtons('Split Buttons', genericConfig, {
        cls: 'floater',
        defaultType: 'splitbutton',
        menu : menu
    });
    
    renderButtons('Menu Buttons (Arrow on bottom)', genericConfig, {
        cls: 'floater',
        menu : menu,
        arrowAlign: 'bottom'
    });

    renderButtons('Split Buttons (Arrow on bottom)', genericConfig, {
        cls: 'floater',
        defaultType: 'splitbutton',
        menu : menu,
        arrowAlign: 'bottom'
    });

    renderButtons('Text align: left', genericConfig, {
        cls: 'floater',
        textAlign: 'left',
        width: 200
    });

    renderButtons('Text align: right', genericConfig, {
        cls: 'floater',
        textAlign: 'right',
        width: 200
    });

    renderButtons('Link Buttons', genericConfig, {
        cls: 'floater',
        href: 'http://www.sencha.com/'
    });
});
