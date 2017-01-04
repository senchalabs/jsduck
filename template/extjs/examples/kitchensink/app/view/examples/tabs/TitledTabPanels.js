Ext.define('KitchenSink.view.examples.tabs.TitledTabPanels', {
    extend: 'KitchenSink.view.examples.PanelExample',
    requires: [
        'Ext.tab.Panel',
        'Ext.layout.container.HBox'
    ],

    items: [
        {
            xtype: 'container',

            layout: {
                type: 'hbox',
                align: 'center',
                pack: 'center'
            },

            defaults: {
                xtype: 'tabpanel',
                title: 'Ext.tab.Panel',
                width: 400,
                height: 300,
                margin: 10,
                defaults: {
                    bodyPadding: 10,
                    autoScroll: true
                }
            },

            items: [
                {
                    items: [
                        {
                            title: 'Active Tab',
                            html: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed egestas gravida nibh, quis porttitor felis \
                            venenatis id. Nam sodales mollis quam eget venenatis. Aliquam metus lorem, tincidunt ut egestas imperdiet, convallis \
                            lacinia tortor. Mauris accumsan, nisl et sodales tristique, massa dui placerat erat, at venenatis tortor libero nec \
                            tortor. Pellentesque quis elit ac dolor commodo tincidunt. Curabitur lorem eros, tincidunt quis viverra id, lacinia \
                            sed nisl. Quisque viverra ante eu nisl consectetur hendrerit.'
                        },
                        {
                            title: 'Inactive Tab',
                            html: '<b>This tab is scrollable.</b><br /><br />\
                            Aenean sit amet quam ipsum. Nam aliquet ullamcorper lorem, vel commodo neque auctor quis. Vivamus ac purus in \
                            tortor tempor viverra eget a magna. Nunc accumsan dolor porta mauris consequat nec mollis felis mattis. Nunc ligula nisl, \
                            tempor ut pellentesque et, viverra eget tellus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sodales \
                            rhoncus massa, sed lobortis risus euismod at. Suspendisse dictum, lectus vitae aliquam egestas, quam diam consequat augue, \
                            non porta odio ante a dui. Vivamus lacus mi, ultrices sed feugiat elementum, ultrices et lectus. Donec aliquet hendrerit magna, \
                            in venenatis ante faucibus ut. Duis non neque magna. Quisque iaculis luctus nibh, id pellentesque lorem egestas non. Phasellus \
                            id risus eget felis auctor scelerisque. Fusce porttitor tortor eget magna pretium viverra. Sed tempor vulputate felis aliquam \
                            scelerisque. Quisque eget libero non lectus tempus varius eu a tortor.\
                            <br /><br />\
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed egestas gravida nibh, quis porttitor felis \
                            venenatis id. Nam sodales mollis quam eget venenatis. Aliquam metus lorem, tincidunt ut egestas imperdiet, convallis \
                            lacinia tortor. Mauris accumsan, nisl et sodales tristique, massa dui placerat erat, at venenatis tortor libero nec \
                            tortor. Pellentesque quis elit ac dolor commodo tincidunt. Curabitur lorem eros, tincidunt quis viverra id, lacinia \
                            sed nisl. Quisque viverra ante eu nisl consectetur hendrerit.'
                        }
                    ]
                },
                {
                    frame: true,
                    title: 'Ext.tab.Panel with frame: true',
                    activeTab: 1,
                    items: [
                        {
                            title: 'Inactive Tab',
                            html: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed egestas gravida nibh, quis porttitor felis \
                            venenatis id. Nam sodales mollis quam eget venenatis. Aliquam metus lorem, tincidunt ut egestas imperdiet, convallis \
                            lacinia tortor. Mauris accumsan, nisl et sodales tristique, massa dui placerat erat, at venenatis tortor libero nec \
                            tortor. Pellentesque quis elit ac dolor commodo tincidunt. Curabitur lorem eros, tincidunt quis viverra id, lacinia \
                            sed nisl. Quisque viverra ante eu nisl consectetur hendrerit.'
                        },
                        {
                            title: 'Active Tab',
                            html: '<b>This tab is scrollable.</b><br /><br />\
                            Aenean sit amet quam ipsum. Nam aliquet ullamcorper lorem, vel commodo neque auctor quis. Vivamus ac purus in \
                            tortor tempor viverra eget a magna. Nunc accumsan dolor porta mauris consequat nec mollis felis mattis. Nunc ligula nisl, \
                            tempor ut pellentesque et, viverra eget tellus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sodales \
                            rhoncus massa, sed lobortis risus euismod at. Suspendisse dictum, lectus vitae aliquam egestas, quam diam consequat augue, \
                            non porta odio ante a dui. Vivamus lacus mi, ultrices sed feugiat elementum, ultrices et lectus. Donec aliquet hendrerit magna, \
                            in venenatis ante faucibus ut. Duis non neque magna. Quisque iaculis luctus nibh, id pellentesque lorem egestas non. Phasellus \
                            id risus eget felis auctor scelerisque. Fusce porttitor tortor eget magna pretium viverra. Sed tempor vulputate felis aliquam \
                            scelerisque. Quisque eget libero non lectus tempus varius eu a tortor.\
                            <br /><br />\
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed egestas gravida nibh, quis porttitor felis \
                            venenatis id. Nam sodales mollis quam eget venenatis. Aliquam metus lorem, tincidunt ut egestas imperdiet, convallis \
                            lacinia tortor. Mauris accumsan, nisl et sodales tristique, massa dui placerat erat, at venenatis tortor libero nec \
                            tortor. Pellentesque quis elit ac dolor commodo tincidunt. Curabitur lorem eros, tincidunt quis viverra id, lacinia \
                            sed nisl. Quisque viverra ante eu nisl consectetur hendrerit.'
                        }
                    ]
                }
            ]
        },

        {
            xtype: 'container',

            layout: {
                type: 'hbox',
                align: 'center',
                pack: 'center'
            },

            defaults: {
                xtype: 'tabpanel',
                title: 'Ext.tab.Panel',
                width: 400,
                height: 300,
                margin: '0 10 10 10',
                plain: true,
                defaults: {
                    bodyPadding: 10,
                    autoScroll: true
                }
            },

            items: [
                {
                    items: [
                        {
                            title: 'Active Tab',
                            html: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed egestas gravida nibh, quis porttitor felis \
                            venenatis id. Nam sodales mollis quam eget venenatis. Aliquam metus lorem, tincidunt ut egestas imperdiet, convallis \
                            lacinia tortor. Mauris accumsan, nisl et sodales tristique, massa dui placerat erat, at venenatis tortor libero nec \
                            tortor. Pellentesque quis elit ac dolor commodo tincidunt. Curabitur lorem eros, tincidunt quis viverra id, lacinia \
                            sed nisl. Quisque viverra ante eu nisl consectetur hendrerit.'
                        },
                        {
                            title: 'Inactive Tab',
                            html: '<b>This tab is scrollable.</b><br /><br />\
                            Aenean sit amet quam ipsum. Nam aliquet ullamcorper lorem, vel commodo neque auctor quis. Vivamus ac purus in \
                            tortor tempor viverra eget a magna. Nunc accumsan dolor porta mauris consequat nec mollis felis mattis. Nunc ligula nisl, \
                            tempor ut pellentesque et, viverra eget tellus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sodales \
                            rhoncus massa, sed lobortis risus euismod at. Suspendisse dictum, lectus vitae aliquam egestas, quam diam consequat augue, \
                            non porta odio ante a dui. Vivamus lacus mi, ultrices sed feugiat elementum, ultrices et lectus. Donec aliquet hendrerit magna, \
                            in venenatis ante faucibus ut. Duis non neque magna. Quisque iaculis luctus nibh, id pellentesque lorem egestas non. Phasellus \
                            id risus eget felis auctor scelerisque. Fusce porttitor tortor eget magna pretium viverra. Sed tempor vulputate felis aliquam \
                            scelerisque. Quisque eget libero non lectus tempus varius eu a tortor.\
                            <br /><br />\
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed egestas gravida nibh, quis porttitor felis \
                            venenatis id. Nam sodales mollis quam eget venenatis. Aliquam metus lorem, tincidunt ut egestas imperdiet, convallis \
                            lacinia tortor. Mauris accumsan, nisl et sodales tristique, massa dui placerat erat, at venenatis tortor libero nec \
                            tortor. Pellentesque quis elit ac dolor commodo tincidunt. Curabitur lorem eros, tincidunt quis viverra id, lacinia \
                            sed nisl. Quisque viverra ante eu nisl consectetur hendrerit.'
                        }
                    ]
                },
                {
                    frame: true,
                    title: 'Ext.tab.Panel with frame: true',
                    activeTab: 1,
                    items: [
                        {
                            title: 'Inactive Tab',
                            html: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed egestas gravida nibh, quis porttitor felis \
                            venenatis id. Nam sodales mollis quam eget venenatis. Aliquam metus lorem, tincidunt ut egestas imperdiet, convallis \
                            lacinia tortor. Mauris accumsan, nisl et sodales tristique, massa dui placerat erat, at venenatis tortor libero nec \
                            tortor. Pellentesque quis elit ac dolor commodo tincidunt. Curabitur lorem eros, tincidunt quis viverra id, lacinia \
                            sed nisl. Quisque viverra ante eu nisl consectetur hendrerit.'
                        },
                        {
                            title: 'Active Tab',
                            html: '<b>This tab is scrollable.</b><br /><br />\
                            Aenean sit amet quam ipsum. Nam aliquet ullamcorper lorem, vel commodo neque auctor quis. Vivamus ac purus in \
                            tortor tempor viverra eget a magna. Nunc accumsan dolor porta mauris consequat nec mollis felis mattis. Nunc ligula nisl, \
                            tempor ut pellentesque et, viverra eget tellus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sodales \
                            rhoncus massa, sed lobortis risus euismod at. Suspendisse dictum, lectus vitae aliquam egestas, quam diam consequat augue, \
                            non porta odio ante a dui. Vivamus lacus mi, ultrices sed feugiat elementum, ultrices et lectus. Donec aliquet hendrerit magna, \
                            in venenatis ante faucibus ut. Duis non neque magna. Quisque iaculis luctus nibh, id pellentesque lorem egestas non. Phasellus \
                            id risus eget felis auctor scelerisque. Fusce porttitor tortor eget magna pretium viverra. Sed tempor vulputate felis aliquam \
                            scelerisque. Quisque eget libero non lectus tempus varius eu a tortor.\
                            <br /><br />\
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed egestas gravida nibh, quis porttitor felis \
                            venenatis id. Nam sodales mollis quam eget venenatis. Aliquam metus lorem, tincidunt ut egestas imperdiet, convallis \
                            lacinia tortor. Mauris accumsan, nisl et sodales tristique, massa dui placerat erat, at venenatis tortor libero nec \
                            tortor. Pellentesque quis elit ac dolor commodo tincidunt. Curabitur lorem eros, tincidunt quis viverra id, lacinia \
                            sed nisl. Quisque viverra ante eu nisl consectetur hendrerit.'
                        }
                    ]
                }
            ]
        }
    ]
});
