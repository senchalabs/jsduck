Ext.require([
    'Ext.window.Window',
    'Ext.panel.Panel',
    'Ext.toolbar.*',
    'Ext.tree.Panel',
    'Ext.container.Viewport',
    'Ext.container.ButtonGroup',
    'Ext.form.*',
    'Ext.tab.*',
    'Ext.slider.*',
    'Ext.layout.*',
    'Ext.button.*',
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',

    'Ext.perf.Monitor'
]);

function hasOption (name) {
    return window.location.search.indexOf(name) >= 0;
}

var useDeferRender = true,
    rtl = hasOption('rtl');

if (hasOption('diag')) {
    Ext.require([
        'Ext.diag.layout.ContextItem',
        'Ext.diag.layout.Context'
    ]);
}

if (rtl) {
    Ext.require([
        'Ext.rtl.Element',
        'Ext.rtl.AbstractComponent'
    ]);
}

function getBasicPanel () {
    return {
        xtype: 'panel',

        x: 20, y: 20,

        width : 150,
        height: 90,
        rtl: rtl,

        title: 'Basic Panel',
        animCollapse: true,
        bodyPadding: 5,
        html       : 'Some content'
    };
}

function getCollapsedPanel () {
    return {
        xtype: 'panel',

        x: 20, y: 120,

        width : 150,
        height: 70,
        rtl: rtl,

        title: 'Collapsed Panel',
        animCollapse: true,
        bodyPadding: 5,
        html       : 'Some content',
        collapsible: true,
        collapsed: true
    };
}

function getMaskedPanel (rtl) {
    return Ext.widget({
        xtype: 'panel',

        x: 180, y: 20,

        width : 130,
        height: 170,
        rtl: rtl,

        title: 'Masked Panel',

        bodyPadding: 5,
        html       : 'Some content',
        animCollapse: true,
        collapsible: true
    });
}

function getFramedPanel () {
    return {
        xtype: 'panel',

        x: 320, y: 20,

        width : 170,
        height: 100,
        rtl: rtl,

        title: 'Framed Panel',
        animCollapse: true,

        dockedItems: [{
            dock: 'top',
            xtype: 'toolbar',
            items: [{
                text: 'test'
            }]
        }, {
            dock: 'right',
            xtype: 'toolbar',
            items: [{
                text: 'test B'
            }]
        }, {
            dock: 'left',
            xtype: 'toolbar',
            items: [{
                text: 'test A'
            }]
        }],

        html : 'Some content',
        frame: true
    };
}

function getCollapsedFramedPanel () {
    return {
        xtype: 'panel',

        x: 320, y: 130,

        width : 170,
        height: 60,
        rtl: rtl,

        title: 'Collapsed Framed Panel',
        animCollapse: true,
        bodyPadding: 5,
        bodyBorder: true,
        html       : 'Some content',
        frame      : true,
        collapsible: true,
        collapsed: true
    };
}

function getPanelWithToolbars () {
    /**
     * Toolbar with a menu
     */
    /*var xxxxxxx = Ext.widget('menu', {
        items: [
            {text: 'Menu item'},
            {text: 'Check 1', checked: true},
            {text: 'Check 2', checked: false},
            '-',
            {text: 'Option 1', checked: true,  group: 'opts'},
            {text: 'Option 2', checked: false, group: 'opts'},
            '-',
            {
                text: 'Sub-items',
                menu: Ext.widget('menu', {
                    items: [
                        {text: 'Item 1'},
                        {text: 'Item 2'}
                    ]
                })
            }
        ]
    });*/
    return {
        xtype: 'panel',
        id: 'panelWithToolbars',

        x: 660, y: 20,

        width : 450,
        height: 170,
        rtl: rtl,

        title: 'Basic Panel With Toolbars',
        collapsible: true,

        tbar: {
            id: 'panelWithToolbars_tbar',
            items: [{
                xtype: 'buttongroup',
                title: 'Button Group',
                id: 'panelWithToolbars_btngroup',
                columns: 2,
                defaults: {
                    scale: 'small'
                },
                items: [
                    {
                        xtype:'splitbutton',
                        text: 'Menu Button',
                        iconCls: 'add16',
                        menu: [{text: 'Menu Button 1'}]
                    },
                    {
                        xtype:'splitbutton',
                        text: 'Cut',
                        icon: '../shared/icons/fam/cross.gif',
                        id: 'panelWithToolbars_splitbtn',
                        menu: [{text: 'Cut Menu Item'}]
                    }
                ]
            }]
        },
        bbar: {
            id: 'panelWithToolbars_bbar',
            items: [
                'Toolbar',
                ' ',
                '-',
                {text: 'Button'},
                {
                    text: 'Menu Button',
                    id  : 'menu-btn',
                    menu: [
                        {text: 'Menu item'},
                        {text: 'Check 1', checked: true},
                        {text: 'Check 2', checked: false},
                        '-',
                        {text: 'Option 1', checked: true,  group: 'opts'},
                        {text: 'Option 2', checked: false, group: 'opts'},
                        '-',
                        {
                            text: 'Sub-items',
                            menu: Ext.widget('menu', {
                                items: [
                                    {text: 'Item 1'},
                                    {text: 'Item 2'}
                                ]
                            })
                        }
                    ]
                },
                {
                    xtype: 'splitbutton',
                    text : 'Split Button',
                    menu : Ext.widget('menu', {
                        items: [
                            {text: 'Item 1'},
                            {text: 'Item 2'}
                        ]
                    })
                },
                {
                    xtype       : 'button',
                    enableToggle: true,
                    pressed     : true,
                    text        : 'Toggle Button'
                }
            ]
        },
        lbar: {
            id: 'panelWithToolbars_lbar',
            items: [
                { text: 'Left' }
            ]
        },
        rbar: {
            id: 'panelWithToolbars_rbar',
            items: [
                { text: 'Right' }
            ]
        }
    };
}

function getFormWidgets () {
    return {
        xtype: 'form',

        id   : 'form-widgets',
        title: 'Form Widgets',

        x: 20, y: 200,

        width : 630,
        height: 750,
        rtl: rtl,

        frame: true,
        collapsible: true,

        tools: [
            {type:'toggle'},
            {type:'close'},
            {type:'minimize'},
            {type:'maximize'},
            {type:'restore'},
            {type:'gear'},
            {type:'pin'},
            {type:'unpin'},
            {type:'right'},
            {type:'left'},
            {type:'down'},
            {type:'refresh'},
            {type:'minus'},
            {type:'plus'},
            {type:'help'},
            {type:'search'},
            {type:'save'},
            {type:'print'}
        ],

        bodyPadding: '10 20',

        defaults: {
            anchor    : '98%',
            msgTarget : 'side',
            allowBlank: false
        },

        items: [
            {
                xtype: 'label',
                text : 'Plain Label'
            },
            {
                fieldLabel: 'TextField',
                xtype     : 'textfield',
                name      : 'someField',
                emptyText : 'Enter a value'
            },
            {
                fieldLabel: 'ComboBox',
                xtype: 'combo',
                store: ['Foo', 'Bar']
            },
            {
                fieldLabel: 'DateField',
                xtype     : 'datefield',
                name      : 'date'
            },
            {
                fieldLabel: 'TimeField',
                name: 'time',
                xtype: 'timefield'
            },
            {
                fieldLabel: 'NumberField',
                xtype     : 'numberfield',
                name      : 'number',
                emptyText : '(This field is optional)',
                allowBlank: true
            },
            {
                fieldLabel: 'TextArea',
                xtype     : 'textareafield',
                name      : 'message',
                cls       : 'x-form-valid',
                value     : 'This field is hard-coded to have the "valid" style (it will require some code changes to add/remove this style dynamically)'
            },
            {
                fieldLabel: 'Checkboxes',
                xtype: 'checkboxgroup',
                columns: [100,100],
                items: [
                    {boxLabel: 'Foo', checked: true,id:'fooChk',inputId:'fooChkInput'},
                    {boxLabel: 'Bar'}
                ]
            },
            {
                fieldLabel: 'Radios',
                xtype: 'radiogroup',
                columns: [100,100],
                items: [{boxLabel: 'Foo', checked: true, name: 'radios'},{boxLabel: 'Bar', name: 'radios'}]
            },
            {
                hideLabel   : true,
                id          : 'htmleditor',
                xtype       : 'htmleditor',
                name        : 'html',
                enableColors: false,
                value       : 'Mouse over toolbar for tooltips.<br /><br />The HTMLEditor IFrame requires a refresh between a stylesheet switch to get accurate colors.',
                height      : 110
            },
            {
                xtype : 'fieldset',
                title : 'Plain Fieldset',
                items: [
                    {
                        hideLabel: true,
                        xtype: 'radiogroup',
                        items: [
                            {boxLabel: 'Radio A', checked: true, name: 'radiogrp2'},
                            {boxLabel: 'Radio B', name: 'radiogrp2'}
                        ]
                    }
                ]
            },
            {
                xtype      : 'fieldset',
                title      : 'Collapsible Fieldset',
                collapsible: true,
                items: [
                    { xtype: 'checkbox', boxLabel: 'Checkbox 1' },
                    { xtype: 'checkbox', boxLabel: 'Checkbox 2' }
                ]
            },
            {
                xtype         : 'fieldset',
                title         : 'Checkbox Fieldset',
                checkboxToggle: true,
                items: [
                    { xtype: 'radio', boxLabel: 'Radio 1', name: 'radiongrp1' },
                    { xtype: 'radio', boxLabel: 'Radio 2', name: 'radiongrp1' }
                ]
            }
        ],

        buttons: [
            {
                text   :'Toggle Enabled',
                handler: function() {
                    this.up('form').items.each(function(item) {
                        item.setDisabled(!item.disabled);
                    });
                }
            },
            {
                text   : 'Reset Form',
                handler: function() {
                    Ext.getCmp('form-widgets').getForm().reset();
                }
            },
            {
                text   : 'Validate',
                handler: function() {
                    Ext.getCmp('form-widgets').getForm().isValid();
                }
            }
        ]
    };
}

function getBorderLayout() {
    return {
        xtype: 'panel',

        width : 450,
        height: 350,
        rtl: rtl,

        x: 660, y: 200,

        title : 'BorderLayout Panel',
        layout: {
            type: 'border',
            padding: 5
        },
        collapsible: true,

        defaults: {
            collapsible: true,
            split      : true
        },

        items: [
            {
                title  : 'North',
                region : 'north',
                html   : 'North',
                ctitle : 'North',
                //margins: '5 5 0 5', // TRBL
                height : 70
            },
            {
                title       : 'South',
                region      : 'south',
                html        : 'South',
                collapseMode: 'mini',
                //margins     : '0 5 5 5', // TRBL
                height      : 70
            },
            {
                title       : 'West',
                region      : 'west',
                html        : 'West',
                collapseMode: 'mini',
                //margins     : '0 0 0 5', // TRBL
                width       : 100
            },
            {
                title  : 'East',
                region : 'east',
                html   : 'East',
                //margins: '0 5 0 0', // TRBL
                width  : 100
            },
            {
                title      : 'Center',
                region     : 'center',
                collapsible: false,
                html       : 'Center'
            }
        ]
    };
}

function getStore () {
     var myData = [
         ['3m Co',71.72,0.02,0.03,'9/1 12:00am'],
         ['Alcoa Inc',29.01,0.42,1.47,'9/1 12:00am'],
         ['Altria Group Inc',83.81,0.28,0.34,'9/1 12:00am'],
         ['American Express Company',52.55,0.01,0.02,'9/1 12:00am'],
         ['American International Group, Inc.',64.13,0.31,0.49,'9/1 12:00am'],
         ['AT&T Inc.',31.61,-0.48,-1.54,'9/1 12:00am'],
         ['Boeing Co.',75.43,0.53,0.71,'9/1 12:00am'],
         ['Caterpillar Inc.',67.27,0.92,1.39,'9/1 12:00am'],
         ['Citigroup, Inc.',49.37,0.02,0.04,'9/1 12:00am'],
         ['E.I. du Pont de Nemours and Company',40.48,0.51,1.28,'9/1 12:00am']
     ];

    return Ext.create('Ext.data.ArrayStore', {
        fields: [
           {name: 'company'},
           {name: 'price', type: 'float', convert: null},
           {name: 'change', type: 'float', convert: null},
           {name: 'pctChange', type: 'float', convert: null},
           {name: 'lastChange', type: 'date', dateFormat: 'n/j h:ia'}
        ],
        sorters: {
            property : 'company',
            direction: 'ASC'
        },
        data: myData,
        pageSize: 8
    });
}

function getGrid () {
    var store = getStore(),
        pagingBar = Ext.widget('pagingtoolbar', {
            store      : store,
            displayInfo: true,
            displayMsg : 'Displaying topics {0} - {1} of {2}'
        });

    return {
        xtype: 'gridpanel',

        height: 200,
        width : 450,
        rtl: rtl,

        x: 660, y: 560,

        title: 'GridPanel',
        collapsible: true,
        deferRowRender: useDeferRender,

        store: store,

        columns: [
            {header: "Company",      flex: 1, sortable: true, dataIndex: 'company'},
            {header: "Price",        width: 75,  sortable: true, dataIndex: 'price'},
            {header: "Change",       width: 75,  sortable: true, dataIndex: 'change'},
            {header: "% Change",     width: 75,  sortable: true, dataIndex: 'pctChange'},
            {header: "Last Updated", width: 85,  sortable: true, xtype: 'datecolumn', dataIndex: 'lastChange'}
        ],
        loadMask: true,

        viewConfig: {
            stripeRows: true
        },

        bbar: pagingBar,
        tbar: [
            {text: 'Toolbar'},
            '->',
            {
                xtype: 'triggerfield',
                trigger1Cls: Ext.baseCSSPrefix + 'form-clear-trigger',
                trigger2Cls: Ext.baseCSSPrefix + 'form-search-trigger'
            }
        ]
    };
}

function getAccordion () {
    var tree = Ext.create('Ext.tree.Panel', {
        title: 'TreePanel',
        deferRowRender: useDeferRender,
        root: {
            text: 'Root Node',
            expanded: true,
            children: [{
                text: 'Item 1',
                leaf: true
            }, {
                text: 'Item 2',
                leaf: true
            }, {
                text: 'Folder',
                children: [{
                    text: 'Item 3',
                    leaf: true
                }]
            }]
        }
    });

    return {
        title : 'Accordion and TreePanel',
        collapsible: true,
        layout: 'accordion',

        x: 660, y: 770,

        width : 450,
        height: 240,
        rtl: rtl,

        bodyStyle: {
            'background-color': '#eee'
        },

        items: [
            tree, {
                title: 'Item 2',
                html: 'Some content'
            }, {
                title: 'Item 3',
                html : 'Some content'
            }
        ]
    };
}

function getTabs (config) {
    return Ext.apply({
        xtype: 'tabpanel',

        width : 310,
        height: 150,
        rtl: rtl,

        activeTab: 0,

        defaults: {
            bodyStyle: 'padding:10px;'
        },

        items: [
            {
                title: 'Tab 1',
                html : 'Free-standing tab panel'
            },
            {
                title   : 'Tab 2',
                closable: true
            },
            {
                title   : 'Tab 3',
                closable: true
            }
        ]
    }, config);
}

function getScrollingTabs () {
    return getTabs({
        x: 20, y: 960,

        enableTabScroll: true,

        items: [
            {
                title: 'Tab 1',
                html : 'Tab panel 1 content'
            },
            {
                title: 'Tab 2',
                html : 'Tab panel 2 content',
                closable: true
            },
            {
                title: 'Tab 3',
                html : 'Tab panel 3 content',
                closable: true
            },
            {
                title: 'Tab 4',
                html : 'Tab panel 4 content',
                closable: true
            },
            {
                title: 'Tab 5',
                html : 'Tab panel 5 content',
                closable: true
            },
            {
                title: 'Tab 6',
                html : 'Tab panel 6 content',
                closable: true
            }
        ]
    });
}

function getPlainTabs () {
    return getTabs({
        plain: true,
        x    : 340, y: 960
    });
}

function getDatePicker () {
    return {
        xtype: 'panel',

        x: 20, y: 1120,

        width : 180,
        rtl: rtl,
        border: false,
        items: {
            xtype: 'datepicker'
        }
    };
}

function getProgressBar () {
    var progressbar = Ext.widget('progressbar', {
        value: 0.5
    });

    if (!hasOption('nopbar')) {
        setTimeout(function() {
            progressbar.wait({
                //animate: true,
                text: 'Progress text...'
            });
        }, 7000);
    }

    return {
        xtype: 'panel',
        title: 'ProgressBar / Slider',

        x: 660, y: 1020,

        width: 450,
        height: 200,
        rtl: rtl,

        bodyPadding: 5,
        layout: 'anchor',

        items: [
            progressbar,
            {
                xtype    : 'slider',
                hideLabel: true,
                value    : 50,
                margin   : '5 0 0 0',
                anchor   : '100%'
            },
            {
                xtype   : 'slider',
                vertical: true,
                value   : 50,
                height  : 100,
                margin  : '5 0 0 0'
            }
        ]
    };
}

function getFramedGrid () {
    return {
        width: 450,
        height:182,
        x: 660, y: 1230,
        rtl: rtl,
        xtype: 'grid',
        title: 'Framed Grid',
        collapsible: true,
        store: getStore(),
        multiSelect: true,
        emptyText: 'No images to display',
        deferRowRender: useDeferRender,
        frame: true,
        enableColumnMove: false,
        columns: [
            {header: "Company", flex:  1,   sortable: true, dataIndex: 'company'},
            {header: "Price",   width: 75,  sortable: true, dataIndex: 'price'},
            {header: "Change",  width: 75,  sortable: true, dataIndex: 'change'}
        ]
    };
}

function getBasicWindow () {
    return Ext.widget('window', {
        id: 'basicWindow',
        x: 500, y: 20,
        hidden: false,
        width   : 150,
        height  : 170,
        minWidth: 150,
        minHeight: 150,
        maxHeight: 170,
        rtl: rtl,

        title: 'Window',

        bodyPadding: 5,
        html       : 'Click Submit for Confirmation Msg.',

        collapsible: true,
        floating   : false,
        closable   : false,
        draggable  : false,
        resizable: { handles: 's' },
        animCollapse: true,

        tbar: [
            {text: 'Toolbar'}
        ],
        buttons: [
            {
                text   : 'Submit',
                id     : 'message_box',
                handler: function() {
                    Ext.MessageBox.confirm('Confirm', 'Are you sure you want to do that?');
                }
            }
        ]
    });
}

function addResizer(containerEl) {
    var rszEl = containerEl.createChild({
        style: 'background: transparent;position:absolute;left:210px;top:1120px;width:440px;height:200px;overflow:hidden',
        html: '<div style="padding:20px;position:absolute">Resizable handles</div>'
    });

    Ext.create('Ext.resizer.Resizer', {
        id: 'resizer',
        el: rszEl,
        handles: 'all',
        pinned: true
    });
}

function addFormWindow () {
    Ext.widget('window', {
        x: 660, y: 1230,

        width   : 450,
        // height  : 360,
        minWidth: 450,
        rtl: rtl,

        title: 'Window',

        bodyPadding: '5 5 0 5',

        collapsible: true,
        closable   : false,
        draggable  : false,
        resizable: { handles: 's' },
        animCollapse: true,

        items: [
            {
                xtype : 'fieldset',
                title : 'Plain Fieldset',
                items: [
                    {
                        fieldLabel: 'TextField',
                        xtype     : 'textfield',
                        name      : 'someField',
                        emptyText : 'Enter a value',
                        anchor    : '100%'
                    },
                    {
                        fieldLabel: 'ComboBox',
                        xtype     : 'combo',
                        store     : ['Foo', 'Bar'],
                        anchor    : '100%'
                    },
                    {
                        fieldLabel: 'DateField',
                        xtype     : 'datefield',
                        name      : 'date',
                        anchor    : '100%'
                    },
                    {
                        fieldLabel: 'TimeField',
                        name      : 'time',
                        xtype     : 'timefield',
                        anchor    : '100%'
                    },
                    {
                        fieldLabel: 'NumberField',
                        xtype     : 'numberfield',
                        name      : 'number',
                        emptyText : '(This field is optional)',
                        allowBlank: true,
                        anchor    : '100%'
                    },
                    {
                        fieldLabel: 'TextArea',
                        xtype     : 'textareafield',
                        name      : 'message',
                        cls       : 'x-form-valid',
                        value     : 'This field is hard-coded to have the "valid" style (it will require some code changes to add/remove this style dynamically)',
                        anchor    : '100%'
                    },
                    {
                        fieldLabel: 'Checkboxes',
                        xtype: 'checkboxgroup',
                        columns: [100,100],
                        items: [
                            {boxLabel: 'Foo', checked: true,id:'winFooChk',inputId:'winFooChkInput'},
                            {boxLabel: 'Bar'}
                        ]
                    },
                    {
                        xtype: 'radiogroup',
                        columns: [100,100],
                        fieldLabel: 'Radio Group',
                        items: [
                            {boxLabel: 'Radio A', checked: true, name: 'radiogrp2'},
                            {boxLabel: 'Radio B', name: 'radiogrp2'}
                        ]
                    }
                ]
            }
        ],

        buttons: [
            {
                text   : 'Submit',
                handler: function() {
                    Ext.MessageBox.confirm('Confirm', 'Are you sure you want to do that?');
                }
            }
        ]
    }).show();
}

function doThemes (rtl) {
    var time = Ext.perf.getTimestamp(),
        maskedPanel,
        mainContainer;

    if (hasOption('nocss3')) {
        Ext.supports.CSS3BorderRadius = false;
        Ext.getBody().addCls('x-nbr x-nlg');
    }

    var items = [
        getBasicPanel(rtl),
        getCollapsedPanel(rtl),
        maskedPanel = getMaskedPanel(rtl),
        getFramedPanel(rtl),
        getCollapsedFramedPanel(rtl),
        getBasicWindow(rtl),
        getPanelWithToolbars(rtl),
        getFormWidgets(rtl),
        getBorderLayout(rtl),
        getGrid(rtl),
        getAccordion(rtl),
        getScrollingTabs(rtl),
        getPlainTabs(rtl),
        getDatePicker(rtl),
        getProgressBar(rtl),
        getFramedGrid(rtl),
        0 // end of list (makes commenting out any of the above easy
    ];
    items.pop(); // remove the 0 on the end

    mainContainer = Ext.create('Ext.container.Container', {
        id: 'main-container',
        renderTo: document.body,
        height: 1460,
        width: 1130,
        layout: 'absolute',
        items: items
    });
        
    addResizer(mainContainer.el);
    //addFormWindow();

    /**
     * Stylesheet Switcher
     */
    Ext.get('styleswitcher_select').on('change', function(e, select) {
        var name = select[select.selectedIndex].value,
            currentPath = window.location.pathname,
            isCurrent = currentPath.match(name);
        
        if (!isCurrent) {
            window.location = name;
        }
    });

    setTimeout(function() {
        // we may comment out the creation of this for testing
        if (maskedPanel) {
            maskedPanel.setLoading({
                msg: 'Loading...',
                useTargetEl: true
            });
        }
        
        if (!hasOption('notips')) {
            Ext.QuickTips.init();
        }
    }, 2000);

    time = Ext.perf.getTimestamp() - time;
    Ext.log('total time: ' + Math.round(time));
}

Ext.onReady(function() {
    if (!hasOption('perf')) {
        useDeferRender = !hasOption('nodefer');
        if (hasOption('delay')) {
            setTimeout(doThemes, 1000);
        } else {
            doThemes();
        }
    } else {
        setTimeout(function () {
            var a = document.createElement('a');
            a.innerHTML = 'Page Analyzer';
            a.style.position = "absolute";
            a.style.left = "5px";
            a.style.top = "5px";
            a.href = 'javascript:void(window.open("../page-analyzer/page-analyzer.html","pageAn"))';
            document.body.appendChild(a);

            useDeferRender = hasOption('defer');

            Ext.Perf.setup();
            Ext.Perf.monitor('onReady', doThemes);
            Ext.Perf.report();
        }, 1000);
    }
});
