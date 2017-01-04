Ext.define('KitchenSink.view.examples.tabs.BasicTabs', {
    extend: 'KitchenSink.view.examples.Example',
    requires: [
        'Ext.tab.Panel'
    ],

    // defaults: {
    //     margin: '0 0 10 0'
    // },
    
    items: [
        {
            xtype: 'tabpanel',
            defaults: {
                bodyPadding: 10,
                autoScroll: true,
                styleHtmlContent: true
            },
            margin: '0 0 20 0',
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
                },
                {
                    title: 'Disabled Tab',
                    disabled: true
                }
            ]
        },
        {
            xtype: 'tabpanel',
            defaults: {
                bodyPadding: 10,
                autoScroll: true,
                styleHtmlContent: true
            },
            plain: true,
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
                },
                {
                    title: 'Disabled Tab',
                    disabled: true
                }
            ]
        }
    ]
});