Ext.define('KitchenSink.view.examples.windows.BasicWindow', {
    extend: 'KitchenSink.view.examples.Example',
    requires: [
        'Ext.window.Window'
    ],
    
    items: [
        {
            xtype: 'window',
            title: 'Window',
            floating: false,
            draggable: false,
            resizable: false,
            hidden: false,
            bodyPadding: 10,
            autoScroll: true,
            html: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque auctor vestibulum molestie. Sed \
            aliquet adipiscing massa, id vehicula erat aliquam vel. Quisque vulputate eleifend mauris, non luctus mauris \
            pellentesque in. Sed eros orci, ultrices ut sagittis eget, rhoncus sit amet dolor. Phasellus tempus nisl eget \
            nisi molestie ultrices. Praesent ante arcu, imperdiet vel volutpat a, mattis ut magna. Ut felis mauris, rutrum \
            vitae ultricies et, dignissim ac enim.<br /><br />Maecenas eu diam dolor, ac facilisis dolor. Mauris sollicitudin, \
            odio at consectetur scelerisque, dui est porttitor ligula, eu \egestas diam tortor vel quam. Cum sociis natoque \
            penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum condimentum mauris eget enim elementum \
            sed condimentum leo aliquam. Donec condimentum metus non turpis tincidunt congue. Donec cursus justo sed lacus \
            eleifend elementum lobortis quam posuere. Quisque cursus dui nisl, sagittis fringilla enim. Mauris sodales malesuada \
            auctor. Nulla sed ultrices enim. Curabitur auctor volutpat nibh, et venenatis libero imperdiet ac.<br /><br />Suspendisse \
            quis turpis magna, et ultricies dui. Nulla facilisi. Praesent nec lectus erat. Class aptent taciti sociosqu ad litora \
            torquent per conubia nostra, per inceptos himenaeos. Fusce vel ultrices ligula. Sed tincidunt tempus pretium. Nunc erat \
            leo, porta et congue ut, condimentum vitae diam. Proin euismod commodo iaculis. Integer vitae ligula at eros scelerisque \
            vestibulum. Quisque semper, odio vitae dictum molestie, erat dolor faucibus metus, sit amet aliquet magna nunc a quam.'
        }
    ]
});