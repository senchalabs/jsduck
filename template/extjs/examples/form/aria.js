Ext.require([
    'Ext.form.*',
    'Ext.layout.container.Column',
    'Ext.tab.Panel'
]);

/**
 * @class Ext.aria.AriaController
 * <p>This class supplies support methods for integrating ARIA support into Components.</p>
 * 
 */
Ext.define('Ext.aria.AriaController', {
    singleton: true,

    requires: ['Ext.AbstractComponent'],

    handlerRe: /^on(\w+)/,

    // This function is called as an interceptor of the target class's fireEvent method
    // It invokes the event's ariaHandler if present
    ariaFireEvent: function(evt){
        var me = this,
            evtName = evt.toLowerCase(),
            args = Array.prototype.slice.call(arguments, 1),
            classFn = Ext.aria.AriaController.getClassAriaHandler(this.self.prototype, evtName),
            ariaFn = Ext.aria.AriaController[evtName],
            result;
    
        // Call user event handlers first.
        result = Ext.util.Observable.prototype.fireEvent.apply(me, arguments);
        if (result !== false) {
            // Then AriaController's event handler
            if (typeof ariaFn === 'function') {
                result = ariaFn.apply(me, args);
            }
            // Then class's configured ARIA event handler
            if (typeof classFn === 'function') {
                result = classFn.apply(me, args);
            }
        }
        return result;
    },

    // Examine the passed class prototype for an aria_event_handler, and if not found, continue up the prototype chain.
    getClassAriaHandler: function(clsProto, evtName) {
        var curProto = clsProto,
            generatedHandlerName  = 'generated_aria_' + evtName + '_handler',
            configuredHandlerName = 'aria_' + evtName + '_handler',
            fn,
            result = clsProto.hasOwnProperty(generatedHandlerName) ? clsProto[generatedHandlerName] : null;

        // If there is no generated ariaEventHandler for the class/event, we must generate one
        // which calls the cascade of event handlers for the inheritance chain
        if (!result) {
            var handlerStack = [];

            // Collect the stack of event handlers from each level in the inheritance tree
            while (curProto) {
                if (curProto.hasOwnProperty(configuredHandlerName)) {
                    fn = curProto[configuredHandlerName];
                    if (fn) {
                        handlerStack.unshift(fn);
                    }
                }
                curProto = curProto.superclass;
            }

            // Generate a closure which captures the handler stack, and loops through it
            // to invoke them all.
            result = clsProto[generatedHandlerName] = (function(handlerStack) {
                var result = handlerStack.length ? function() {
                    var i = 0, len = handlerStack.length;
                    for (; i < len; i++) {
                        handlerStack[i].apply(this, arguments);
                    }
                } : Ext.emptyFn;
                return result;
            })(handlerStack);
        }
        return result;
    },

    processClass: function(cls, props) {
        var me = this,
            clsProto = cls.prototype,
            propName,
            value,
            k;

        for (propName in props) {
            if (props.hasOwnProperty(propName)) {
                value = props[propName];
                k = me.handlerRe.exec(propName);

                // Handle properties like onHide: function(){...}
                // Copy it into ariaHandlers.hide where it can be called
                // by the fireEvent interceptor
                if (k && (typeof value === 'function')) {
                    propName = propName.toLowerCase();

                    // Hang the ariaHandlers on the class's prototype.
                    clsProto['aria_' + k[1].toLowerCase() + '_handler'] = value;
                } else if (propName === 'role') {
                    clsProto.ariaRole = value;
                }
            }
        }

        // Replace the class's fireEvent method with our code which intercepts relevant events,
        // performs known processing (such as setting the role on render), and calls any defined
        // ariaHandlers
        clsProto.fireEvent = me.ariaFireEvent;
    },

    // ARIA event handler for the render event.
    render: function() {
        var me = this,
            p = me.pendingProps,
            len = p ? p.length : 0,
            i = 0;

        // Apply any pending ARIA updates from when applied before render
        for (; i < len; i++) {
            me.updateAria.apply(me, p[i]);
        }
    }
}, function() {
    
    // Inject an updateAria method into AbstractComponent's prorotype
    Ext.override(Ext.AbstractComponent, {
        getElConfig: function() {
            var result = this.callOverridden();
            result.role = this.ariaRole;
            return result;
        },

        updateAria: function(el, props) {
            var me = this;

            // Queue the attributes up if not rendered.
            // They will be applied in the global render handler.
            if (!me.rendered) {
                if (!me.pendingProps) {
                    me.pendingProps = [];
                }
                me.pendingProps.push(Array.prototype.slice.call(arguments));
                return;
            }

            // The one argument form updates the actionEl
            if (arguments.length == 1) {
                props = el;
                el = this.getActionEl();
            }

            // Ensure events are added
            if (!me.events.beforeariaupdate) {
                me.addEvents('beforeariaupdate', 'ariaupdate');
            }

            if (me.fireEvent('beforeariaupdate', el, props) !== false) {
                Ext.fly(el).set(props);
                me.fireEvent('ariaupdate', el, props);
            }
        }
    });
    
    Ext.core.Element.prototype.set = function(o, useSet) {
        var el = this.dom,
            attr,
            val;
        useSet = (useSet !== false) && !!el.setAttribute;

        for (attr in o) {
            if (o.hasOwnProperty(attr)) {
                val = o[attr];
                if (attr == 'style') {
                    DH.applyStyles(el, val);
                } else if (attr == 'cls') {
                    el.className = val;
                } else if (useSet) {
                    if (val === undefined) {
                        el.removeAttribute(attr);
                    } else {
                        el.setAttribute(attr, val);
                    }
                } else {
                    el[attr] = val;
                }
            }
        }
        return this;
    };
});

Ext.onReady(function() {
    Ext.aria.AriaController.processClass(Ext.AbstractComponent, {
        onDisable: function() {
            this.updateAria(this.getActionEl(), {
                'aria-disabled': true
            })
        },
        onEnable: function() {
            this.updateAria(this.getActionEl(), {
                'aria-disabled': false
            })
        },
        onHide: function() {
            this.updateAria(this.getActionEl(), {
                'aria-hidden': true
            })
        },
        onShow: function() {
            this.updateAria(this.getActionEl(), {
                'aria-hidden': false
            })
        }
    });

    Ext.aria.AriaController.processClass(Ext.form.FieldSet, {
        onRender: function() {
            this.updateAria({
                'aria-expanded': !this.collapsed
            });
        },
        onExpand: function() {
            this.updateAria({
                'aria-expanded': true
            });
        },
        onCollapse: function() {
            this.updateAria({
                'aria-expanded': false
            });
        }
    });

    Ext.aria.AriaController.processClass(Ext.form.field.Base, {
        onRender: function() {
            if (this.labelEl) {
                this.updateAria(this.inputEl, {
                    'aria-labelledby': this.labelEl.id
                });
            }
        },
        onValidityChange: function(f, isValid) {
            this.updateAria(this.inputEl, {
                'aria-invalid': !isValid,
                'aria-describedby': isValid ? undefined : f.errorEl.id
            });
        }
    });

    Ext.aria.AriaController.processClass(Ext.form.field.Text, {
        role: 'textbox'
    });

    Ext.aria.AriaController.processClass(Ext.form.field.Number, {
        role: 'spinbutton',

        onRender: function() {
            var me = this,
                props = {};

            if (isFinite(me.minValue)) {
                props['aria-valuemin'] = me.minValue;
            }
            if (isFinite(me.maxValue)) {
                props['aria-valuemax'] = me.maxValue;
            }
            me.updateAria(me.inputEl, props);
        },

        onChange: function(f) {
            var v = this.getValue();
            this.updateAria(this.inputEl, {
                'aria-valuenow': (this.isValid() && v !== null) ? v: undefined
            });
        }
    });

    // Picker fields are combobox type functionality
    Ext.aria.AriaController.processClass(Ext.form.field.Picker, function() {
        var listFns = {
            onListHighlight: function(node) {
                this.updateAria({
                    'aria-activedescendant': node.id
                });
            },
            onListUnhighlight: function(node) {
                var n = this.getPicker().getSelectedNodes();
                this.updateAria({
                    'aria-activedescendant': n.length ? n[0].id : undefined
                });
            },
            onListSelectionChange: function(sm, selected) {
                if (selected.length) {
                    var n = this.getPicker().getSelectedNodes();
                    this.updateAria({
                        'aria-activedescendant': n[0].id
                    });
                } else {
                    this.updateAria({
                        'aria-activedescendant': undefined
                    });
                }
            }
        };
        
        return {
            role: 'combobox',

            onRender: function() {
                this.updateAria(this.inputEl, {
                    'aria-autocomplete': 'inline'
                });
            },
            onExpand: function() {
                var me = this,
                    picker = me.getPicker();

                me.updateAria(me.inputEl, {
                    'aria-owns': picker.el.id,
                    'aria-expanded': true
                });
                // On first expand, add listeners to the "picker" list to maintain our ARIA state
                if (!me.pickerListenersAdded) {
                    picker.mon(picker, {
                        highlight: listFns.onListHighlight,
                        unhighlight: listFns.onListUnhighlight,
                        selectionchange: listFns.onListSelectionChange,
                        scope: me
                    });
                    me.pickerListenersAdded = true;
                }
            },
            onCollapse: function() {
                var p = this.getPicker(),
                    n = p.getSelectedNodes ? p.getSelectedNodes() : [null];
                this.updateAria({
                    'aria-expanded': false,
                    'aria-activedescendant': n.length ? n[0].id: undefined
                });
            }
        };
    }());

    Ext.aria.AriaController.processClass(Ext.view.BoundList, {
        role: 'listbox'
    });

    Ext.QuickTips.init();

    var bd = Ext.getBody();

    /*
     * ================  Simple form  =======================
     */
    bd.createChild({tag: 'h2', html: 'Form 1 - Very Simple'});


    var simple = Ext.create('Ext.form.Panel', {
        url:'save-form.php',
        frame:true,
        title: 'Simple Form',
        bodyStyle:'padding:5px 5px 0',
        width: 350,
        fieldDefaults: {
            msgTarget: 'side',
            labelWidth: 75
        },
        defaultType: 'textfield',
        defaults: {
            anchor: '100%'
        },

        items: [{
            fieldLabel: 'First Name',
            name: 'first',
            allowBlank:false
        },{
            fieldLabel: 'Last Name',
            name: 'last'
        },{
            fieldLabel: 'Company',
            name: 'company'
        }, {
            fieldLabel: 'Email',
            name: 'email',
            vtype:'email'
        }, {
            fieldLabel: 'DOB',
            name: 'dob',
            xtype: 'datefield'
        }, {
            fieldLabel: 'Age',
            name: 'age',
            xtype: 'numberfield',
            minValue: 0,
            maxValue: 100
        }, {
            xtype: 'timefield',
            fieldLabel: 'Time',
            name: 'time',
            minValue: '8:00am',
            maxValue: '6:00pm'
        }],

        buttons: [{
            text: 'Save'
        },{
            text: 'Cancel'
        }]
    });

    simple.render(document.body);


    /*
     * ================  Form 2  =======================
     */
    bd.createChild({tag: 'h2', html: 'Form 2 - Adding fieldsets'});

    var fsf = Ext.create('Ext.form.Panel', {
        url:'save-form.php',
        frame:true,
        title: 'Simple Form with FieldSets',
        bodyStyle:'padding:5px 5px 0',
        width: 350,
        fieldDefaults: {
            msgTarget: 'side',
            labelWidth: 75
        },
        defaults: {
            anchor: '100%'
        },

        items: [{
            xtype:'fieldset',
            checkboxToggle:true,
            title: 'User Information',
            defaultType: 'textfield',
            collapsed: true,
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },
            items :[{
                fieldLabel: 'First Name',
                name: 'first',
                allowBlank:false
            },{
                fieldLabel: 'Last Name',
                name: 'last'
            },{
                fieldLabel: 'Company',
                name: 'company'
            }, {
                fieldLabel: 'Email',
                name: 'email',
                vtype:'email'
            }]
        },{
            xtype:'fieldset',
            title: 'Phone Number',
            collapsible: true,
            defaultType: 'textfield',
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },
            items :[{
                fieldLabel: 'Home',
                name: 'home',
                value: '(888) 555-1212'
            },{
                fieldLabel: 'Business',
                name: 'business'
            },{
                fieldLabel: 'Mobile',
                name: 'mobile'
            },{
                fieldLabel: 'Fax',
                name: 'fax'
            }]
        }],

        buttons: [{
            text: 'Save'
        },{
            text: 'Cancel'
        }]
    });

    fsf.render(document.body);

    /*
     * ================  Form 3  =======================
     */
    bd.createChild({tag: 'h2', html: 'Form 3 - A little more complex'});


    var top = Ext.create('Ext.form.Panel', {
        frame:true,
        title: 'Multi Column, Nested Layouts and Anchoring',
        bodyStyle:'padding:5px 5px 0',
        width: 600,
        fieldDefaults: {
            labelAlign: 'top',
            msgTarget: 'side'
        },

        items: [{
            xtype: 'container',
            anchor: '100%',
            layout:'column',
            items:[{
                xtype: 'container',
                columnWidth:.5,
                layout: 'anchor',
                items: [{
                    xtype:'textfield',
                    fieldLabel: 'First Name',
                    name: 'first',
                    anchor:'96%'
                }, {
                    xtype:'textfield',
                    fieldLabel: 'Company',
                    name: 'company',
                    anchor:'96%'
                }]
            },{
                xtype: 'container',
                columnWidth:.5,
                layout: 'anchor',
                items: [{
                    xtype:'textfield',
                    fieldLabel: 'Last Name',
                    name: 'last',
                    anchor:'100%'
                },{
                    xtype:'textfield',
                    fieldLabel: 'Email',
                    name: 'email',
                    vtype:'email',
                    anchor:'100%'
                }]
            }]
        }, {
            xtype: 'htmleditor',
            name: 'bio',
            fieldLabel: 'Biography',
            height: 200,
            anchor: '100%'
        }],

        buttons: [{
            text: 'Save'
        },{
            text: 'Cancel'
        }]
    });

    top.render(document.body);


    /*
     * ================  Form 4  =======================
     */
    bd.createChild({tag: 'h2', html: 'Form 4 - Forms can be a TabPanel...'});



    var tabs = Ext.create('Ext.form.Panel', {
        width: 350,
        border: false,
        bodyBorder: false,
        fieldDefaults: {
            labelWidth: 75,
            msgTarget: 'side'
        },
        defaults: {
            anchor: '100%'
        },

        items: {
            xtype:'tabpanel',
            activeTab: 0,
            defaults:{
                bodyStyle:'padding:10px'
            },

            items:[{
                title:'Personal Details',
                defaultType: 'textfield',

                items: [{
                    fieldLabel: 'First Name',
                    name: 'first',
                    allowBlank:false,
                    value: 'Ed'
                },{
                    fieldLabel: 'Last Name',
                    name: 'last',
                    value: 'Spencer'
                },{
                    fieldLabel: 'Company',
                    name: 'company',
                    value: 'Ext JS'
                }, {
                    fieldLabel: 'Email',
                    name: 'email',
                    vtype:'email'
                }]
            },{
                title:'Phone Numbers',
                defaultType: 'textfield',

                items: [{
                    fieldLabel: 'Home',
                    name: 'home',
                    value: '(888) 555-1212'
                },{
                    fieldLabel: 'Business',
                    name: 'business'
                },{
                    fieldLabel: 'Mobile',
                    name: 'mobile'
                },{
                    fieldLabel: 'Fax',
                    name: 'fax'
                }]
            }]
        },

        buttons: [{
            text: 'Save'
        },{
            text: 'Cancel'
        }]
    });

    tabs.render(document.body);



    /*
     * ================  Form 5  =======================
     */
    bd.createChild({tag: 'h2', html: 'Form 5 - ... and forms can contain TabPanel(s)'});

    var tab2 = Ext.create('Ext.form.Panel', {
        title: 'Inner Tabs',
        bodyStyle:'padding:5px',
        width: 600,
        fieldDefaults: {
            labelAlign: 'top',
            msgTarget: 'side'
        },
        defaults: {
            anchor: '100%'
        },

        items: [{
            layout:'column',
            border:false,
            items:[{
                columnWidth:.5,
                border:false,
                layout: 'anchor',
                defaultType: 'textfield',
                items: [{
                    fieldLabel: 'First Name',
                    name: 'first',
                    anchor:'95%'
                }, {
                    fieldLabel: 'Company',
                    name: 'company',
                    anchor:'95%'
                }]
            },{
                columnWidth:.5,
                border:false,
                layout: 'anchor',
                defaultType: 'textfield',
                items: [{
                    fieldLabel: 'Last Name',
                    name: 'last',
                    anchor:'95%'
                },{
                    fieldLabel: 'Email',
                    name: 'email',
                    vtype:'email',
                    anchor:'95%'
                }]
            }]
        },{
            xtype:'tabpanel',
            plain:true,
            activeTab: 0,
            height:235,
            defaults:{bodyStyle:'padding:10px'},
            items:[{
                title:'Personal Details',
                defaults: {width: 230},
                defaultType: 'textfield',

                items: [{
                    fieldLabel: 'First Name',
                    name: 'first',
                    allowBlank:false,
                    value: 'Jamie'
                },{
                    fieldLabel: 'Last Name',
                    name: 'last',
                    value: 'Avins'
                },{
                    fieldLabel: 'Company',
                    name: 'company',
                    value: 'Ext JS'
                }, {
                    fieldLabel: 'Email',
                    name: 'email',
                    vtype:'email'
                }]
            },{
                title:'Phone Numbers',
                defaults: {width: 230},
                defaultType: 'textfield',

                items: [{
                    fieldLabel: 'Home',
                    name: 'home',
                    value: '(888) 555-1212'
                },{
                    fieldLabel: 'Business',
                    name: 'business'
                },{
                    fieldLabel: 'Mobile',
                    name: 'mobile'
                },{
                    fieldLabel: 'Fax',
                    name: 'fax'
                }]
            },{
                cls: 'x-plain',
                title: 'Biography',
                layout: 'fit',
                items: {
                    xtype: 'htmleditor',
                    name: 'bio2',
                    fieldLabel: 'Biography'
                }
            }]
        }],

        buttons: [{
            text: 'Save'
        },{
            text: 'Cancel'
        }]
    });

    tab2.render(document.body);

});

/**
 * @class Ext.picker.Date
 * @extends Ext.Component
 * <p>A date picker. This class is used by the {@link Ext.form.field.Date} field to allow browsing and
 * selection of valid dates in a popup next to the field, but may also be used with other components.</p>
 * <p>Typically you will need to implement a handler function to be notified when the user chooses a color from the
 * picker; you can register the handler using the {@link #select} event, or by implementing the {@link #handler}
 * method.</p>
 * <p>By default the user will be allowed to pick any date; this can be changed by using the {@link #minDate},
 * {@link #maxDate}, {@link #disabledDays}, {@link #disabledDatesRE}, and/or {@link #disabledDates} configs.</p>
 * <p>All the string values documented below may be overridden by including an Ext locale file in your page.</p>
 * <p>Example usage:</p>
 * <pre><code>new Ext.panel.Panel({
    title: 'Choose a future date:',
    width: 200,
    bodyPadding: 10,
    renderTo: Ext.getBody(),
    items: [{
        xtype: 'datepicker',
        minDate: new Date(),
        handler: function(picker, date) {
            // do something with the selected date
        }
    }]
});</code></pre>
 * {@img Ext.picker.Date/Ext.picker.Date.png Ext.picker.Date component}
 *
 */
Ext.define('Ext.picker.NewDate', {
    extend: 'Ext.Container',
    requires: [
        'Ext.data.Model',
        'Ext.view.BoundList',
        'Ext.XTemplate',
        'Ext.button.Button',
        'Ext.button.Split',
        'Ext.util.ClickRepeater',
        'Ext.util.KeyNav',
        'Ext.EventObject',
        'Ext.fx.Manager',
        'Ext.picker.Month'
    ],
    alias: 'widget.newdatepicker',
    alternateClassName: 'Ext.DatePicker',

    renderTpl: [
        '<div class="{cls}" id="{id}" role="grid" title="{ariaTitle} {value:this.longDay}">',
            '<div role="presentation" class="{baseCls}-header">',
                '<div class="{baseCls}-prev"><a id="{id}-prevEl" href="#" role="button" title="{prevText}"></a></div>',
                '<div class="{baseCls}-month" id="{id}-middleBtnEl"></div>',
                '<div class="{baseCls}-next"><a id="{id}-nextEl" href="#" role="button" title="{nextText}"></a></div>',
            '</div>',
            '<div id="{id}-calendarContainer"></div>',
            '<tpl if="showToday">',
                '<div id="{id}-footerEl" role="presentation" class="{baseCls}-footer"></div>',
            '</tpl>',
        '</div>',
        {
            longDay: function(value){
                return Ext.Date.format(value, this.longDayFormat);
            }
        }
    ],

    calendarTpl: [
        '<table class="{baseCls}-inner" cellspacing="0" role="presentation">' +
            '<thead role="presentation"><tr role="presentation">' +
                '<tpl for="dayNames">' +
                    '<th role="columnheader" title="{.}"><span>{.:this.firstInitial}</span></th>' +
                '</tpl>' +
            '</tr></thead>' +
            '<tbody role="presentation"><tr role="presentation">' +
                '<tpl for="days">' +
                    '{#:this.isEndOfWeek}' +
                    '<td role="gridcell" id="{[Ext.id()]}" class="{[this.getCellClass(values, parent)]}" title="{date:this.titleFormat}">' +
                        '<a role="presentation" href="#" hidefocus="on" class="{parent.baseCls}-date" tabIndex="1">' +
                            '<em role="presentation"><span role="presentation">{.:date("j")</span></em>' +
                        '</a>' +
                    '</td>' +
                '</tpl>' +
            '</tr></tbody>' +
        '</table>', {
        
        cellClass: function(value, data) {
            
        },
        titleFormat: function(value) {
            return Ext.date.format(value, this.longDayFormat);
        },
        firstInitial: function(value) {
            return value.substr(0,1);
        },
        isEndOfWeek: function(value) {
            // convert from 1 based index to 0 based
            // by decrementing value once.
            value--;
            var end = value % 7 === 0 && value !== 0;
            return end ? '</tr><tr role="row">' : '';
        }
    }],

    ariaTitle: 'Date Picker',
    /**
     * @cfg {String} todayText
     * The text to display on the button that selects the current date (defaults to <code>'Today'</code>)
     */
    todayText : 'Today',
    /**
     * @cfg {Function} handler
     * Optional. A function that will handle the select event of this picker.
     * The handler is passed the following parameters:<div class="mdetail-params"><ul>
     * <li><code>picker</code> : Ext.picker.Date <div class="sub-desc">This Date picker.</div></li>
     * <li><code>date</code> : Date <div class="sub-desc">The selected date.</div></li>
     * </ul></div>
     */
    /**
     * @cfg {Object} scope
     * The scope (<code><b>this</b></code> reference) in which the <code>{@link #handler}</code>
     * function will be called.  Defaults to this DatePicker instance.
     */
    /**
     * @cfg {String} todayTip
     * A string used to format the message for displaying in a tooltip over the button that
     * selects the current date. Defaults to <code>'{0} (Spacebar)'</code> where
     * the <code>{0}</code> token is replaced by today's date.
     */
    todayTip : '{0} (Spacebar)',
    /**
     * @cfg {String} minText
     * The error text to display if the minDate validation fails (defaults to <code>'This date is before the minimum date'</code>)
     */
    minText : 'This date is before the minimum date',
    /**
     * @cfg {String} maxText
     * The error text to display if the maxDate validation fails (defaults to <code>'This date is after the maximum date'</code>)
     */
    maxText : 'This date is after the maximum date',
    /**
     * @cfg {String} format
     * The default date format string which can be overriden for localization support.  The format must be
     * valid according to {@link Ext.Date#parse} (defaults to {@link Ext.Date#defaultFormat}).
     */
    /**
     * @cfg {String} disabledDaysText
     * The tooltip to display when the date falls on a disabled day (defaults to <code>'Disabled'</code>)
     */
    disabledDaysText : 'Disabled',
    /**
     * @cfg {String} disabledDatesText
     * The tooltip text to display when the date falls on a disabled date (defaults to <code>'Disabled'</code>)
     */
    disabledDatesText : 'Disabled',
    /**
     * @cfg {Array} monthNames
     * An array of textual month names which can be overriden for localization support (defaults to Ext.Date.monthNames)
     */
    /**
     * @cfg {Array} dayNames
     * An array of textual day names which can be overriden for localization support (defaults to Ext.Date.dayNames)
     */
    /**
     * @cfg {String} nextText
     * The next month navigation button tooltip (defaults to <code>'Next Month (Control+Right)'</code>)
     */
    nextText : 'Next Month (Control+Right)',
    /**
     * @cfg {String} prevText
     * The previous month navigation button tooltip (defaults to <code>'Previous Month (Control+Left)'</code>)
     */
    prevText : 'Previous Month (Control+Left)',
    /**
     * @cfg {String} monthYearText
     * The header month selector tooltip (defaults to <code>'Choose a month (Control+Up/Down to move years)'</code>)
     */
    monthYearText : 'Choose a month (Control+Up/Down to move years)',
    /**
     * @cfg {Number} startDay
     * Day index at which the week should begin, 0-based (defaults to 0, which is Sunday)
     */
    startDay : 0,
    /**
     * @cfg {Boolean} showToday
     * False to hide the footer area containing the Today button and disable the keyboard handler for spacebar
     * that selects the current date (defaults to <code>true</code>).
     */
    showToday : true,
    /**
     * @cfg {Date} minDate
     * Minimum allowable date (JavaScript date object, defaults to null)
     */
    /**
     * @cfg {Date} maxDate
     * Maximum allowable date (JavaScript date object, defaults to null)
     */
    /**
     * @cfg {Array} disabledDays
     * An array of days to disable, 0-based. For example, [0, 6] disables Sunday and Saturday (defaults to null).
     */
    /**
     * @cfg {RegExp} disabledDatesRE
     * JavaScript regular expression used to disable a pattern of dates (defaults to null).  The {@link #disabledDates}
     * config will generate this regex internally, but if you specify disabledDatesRE it will take precedence over the
     * disabledDates value.
     */
    /**
     * @cfg {Array} disabledDates
     * An array of 'dates' to disable, as strings. These strings will be used to build a dynamic regular
     * expression so they are very powerful. Some examples:
     * <ul>
     * <li>['03/08/2003', '09/16/2003'] would disable those exact dates</li>
     * <li>['03/08', '09/16'] would disable those days for every year</li>
     * <li>['^03/08'] would only match the beginning (useful if you are using short years)</li>
     * <li>['03/../2006'] would disable every day in March 2006</li>
     * <li>['^03'] would disable every day in every March</li>
     * </ul>
     * Note that the format of the dates included in the array should exactly match the {@link #format} config.
     * In order to support regular expressions, if you are using a date format that has '.' in it, you will have to
     * escape the dot when restricting dates. For example: ['03\\.08\\.03'].
     */

    /**
     * @cfg {Boolean} disableAnim True to disable animations when showing the month picker. Defaults to <tt>false</tt>.
     */
    disableAnim: false,

    /**
     * @cfg {String} baseCls
     * The base CSS class to apply to this components element (defaults to <tt>'x-datepicker'</tt>).
     */
    baseCls: Ext.baseCSSPrefix + 'datepicker',

    /**
     * @cfg {String} selectedCls
     * The class to apply to the selected cell. Defaults to <tt>'x-datepicker-selected'</tt>
     */

    /**
     * @cfg {String} disabledCellCls
     * The class to apply to disabled cells. Defaults to <tt>'x-datepicker-disabled'</tt>
     */

    /**
     * @cfg {String} longDayFormat
     * The format for displaying a date in a longer format. Defaults to <tt>'F d, Y'</tt>
     */
    longDayFormat: 'F d, Y',

    /**
     * @cfg {Object} keyNavConfig Specifies optional custom key event handlers for the {@link Ext.util.KeyNav}
     * attached to this date picker. Must conform to the config format recognized by the {@link Ext.util.KeyNav}
     * constructor. Handlers specified in this object will replace default handlers of the same name.
     */

    /**
     * @cfg {Boolean} focusOnShow
     * True to automatically focus the picker on show. Defaults to <tt>false</tt>.
     */
    focusOnShow: false,

    // private
    // Set by other components to stop the picker focus being updated when the value changes.
    focusOnSelect: true,

    width: 178,

    // default value used to initialise each date in the DatePicker
    // (note: 12 noon was chosen because it steers well clear of all DST timezone changes)
    initHour: 12, // 24-hour format

    numDays: 42,

    // private, inherit docs
    initComponent : function() {
        var me = this,
            clearTime = Ext.Date.clearTime;

        me.selectedCls = me.baseCls + '-selected';
        me.disabledCellCls = me.baseCls + '-disabled';
        me.prevCls = me.baseCls + '-prevday';
        me.activeCls = me.baseCls + '-active';
        me.nextCls = me.baseCls + '-prevday';
        me.todayCls = me.baseCls + '-today';
        me.dayNames = me.dayNames.slice(me.startDay).concat(me.dayNames.slice(0, me.startDay));
        this.callParent();

        me.value = me.value ?
                 clearTime(me.value, true) : clearTime(new Date());

        me.addEvents(
            /**
             * @event select
             * Fires when a date is selected
             * @param {DatePicker} this DatePicker
             * @param {Date} date The selected date
             */
            'select'
        );

        me.initDisabledDays();
    },

    // private, inherit docs
    onRender : function(container, position){
        /*
         * days array for looping through 6 full weeks (6 weeks * 7 days)
         * Note that we explicitly force the size here so the template creates
         * all the appropriate cells.
         */

        var me = this,
            days = new Array(me.numDays),
            today = Ext.Date.format(new Date(), me.format),
            calendarTpl = Ext.create('Ext.XTemplate', me.calendarTpl);

        Ext.apply(me.renderData, {
            dayNames: me.dayNames,
            ariaTitle: me.ariaTitle,
            value: me.value,
            showToday: me.showToday,
            prevText: me.prevText,
            nextText: me.nextText,
            days: days
        });
        me.getTpl('renderTpl').longDayFormat = me.longDayFormat;

        me.addChildEls('calendarContainer', 'prevEl', 'nextEl', 'middleBtnEl', 'footerEl');

        this.callParent(arguments);
        me.el.unselectable();

        // The calendar is a BoundList with aen empty Store.
        // collectData returns the fields.
        calendarTpl.longDayFormat = me.longDayFormat;
        me.calendarView = Ext.create('Ext.view.BoundList', {
            store: new Ext.data.Store({fields:[]}),
            collectData: function() {
                return me.collectData();
            },
            renderTo: me.calendarContainer,
            tpl: calendarTpl,
            itemSelector: 'td',
            selectedItemCls: me.baseCls + '-selected'
        });

        me.monthBtn = Ext.create('Ext.button.Split', {
            ownerCt: me,
            text: '',
            tooltip: me.monthYearText,
            renderTo: me.middleBtnEl
        });
        //~ me.middleBtnEl.down('button').addCls(Ext.baseCSSPrefix + 'btn-arrow');


        me.todayBtn = Ext.create('Ext.button.Button', {
            renderTo: me.footerEl,
            text: Ext.String.format(me.todayText, today),
            tooltip: Ext.String.format(me.todayTip, today),
            handler: me.selectToday,
            scope: me
        });
    },

    // Collect a data object for use by the calendar View
    collectData : function() {
        var me = this;
        return {
            today: new Date(),
            daynames: me.dayNames.slice(me.startDay).concat(me.dayNames.slice(0, me.startDay)),
            days: Ext.AbstractView.prototype.apply(me, arguments)
        };
    },

// private, inherit docs
    initEvents: function(){
        var me = this;

        this.callParent();

        me.prevRepeater = Ext.create('Ext.util.ClickRepeater', me.prevEl, {
            handler: me.showPrevMonth,
            scope: me,
            preventDefault: true,
            stopDefault: true
        });

        me.nextRepeater = Ext.create('Ext.util.ClickRepeater', me.nextEl, {
            handler: me.showNextMonth,
            scope: me,
            preventDefault:true,
            stopDefault:true
        });

        me.keyNav = Ext.create('Ext.util.KeyNav', me.calendarView.el, Ext.apply({
            scope: me,
            'left' : function(e){
                if(e.ctrlKey){
                    me.showPrevMonth();
                }
            },

            'right' : function(e){
                if(e.ctrlKey){
                    me.showNextMonth();
                }
            },

            'up' : function(e){
                if(e.ctrlKey){
                    me.showNextYear();
                }
            },

            'down' : function(e){
                if(e.ctrlKey){
                    me.showPrevYear();
                }
            },
            'pageUp' : me.showNextMonth,
            'pageDown' : me.showPrevMonth,
            'enter' : function(e){
                e.stopPropagation();
                return true;
            }
        }, me.keyNavConfig));

        if(me.showToday){
            me.todayKeyListener = me.calendarView.el.addKeyListener(Ext.EventObject.SPACE, me.selectToday,  me);
        }
        me.mon(me.calendarView.el, 'mousewheel', me.handleMouseWheel, me);
        me.mon(me.monthBtn, 'click', me.showMonthPicker, me);
        me.mon(me.monthBtn, 'arrowclick', me.showMonthPicker, me);
        me.update(me.value);
    },

    /**
     * Setup the disabled dates regex based on config options
     * @private
     */
    initDisabledDays : function(){
        var me = this,
            dd = me.disabledDates,
            re = '(?:',
            len;

        if(!me.disabledDatesRE && dd){
                len = dd.length - 1;

            Ext.each(dd, function(d, i){
                re += Ext.isDate(d) ? '^' + Ext.String.escapeRegex(Ext.Date.dateFormat(d, me.format)) + '$' : dd[i];
                if(i != len){
                    re += '|';
                }
            }, me);
            me.disabledDatesRE = new RegExp(re + ')');
        }
    },

    /**
     * Replaces any existing disabled dates with new values and refreshes the DatePicker.
     * @param {Array/RegExp} disabledDates An array of date strings (see the {@link #disabledDates} config
     * for details on supported values), or a JavaScript regular expression used to disable a pattern of dates.
     * @return {Ext.picker.Date} this
     */
    setDisabledDates : function(dd){
        var me = this;

        if(Ext.isArray(dd)){
            me.disabledDates = dd;
            me.disabledDatesRE = null;
        }else{
            me.disabledDatesRE = dd;
        }
        me.initDisabledDays();
        me.update(me.value, true);
        return me;
    },

    /**
     * Replaces any existing disabled days (by index, 0-6) with new values and refreshes the DatePicker.
     * @param {Array} disabledDays An array of disabled day indexes. See the {@link #disabledDays} config
     * for details on supported values.
     * @return {Ext.picker.Date} this
     */
    setDisabledDays : function(dd){
        this.disabledDays = dd;
        return this.update(this.value, true);
    },

    /**
     * Replaces any existing {@link #minDate} with the new value and refreshes the DatePicker.
     * @param {Date} value The minimum date that can be selected
     * @return {Ext.picker.Date} this
     */
    setMinDate : function(dt){
        this.minDate = dt;
        return this.update(this.value, true);
    },

    /**
     * Replaces any existing {@link #maxDate} with the new value and refreshes the DatePicker.
     * @param {Date} value The maximum date that can be selected
     * @return {Ext.picker.Date} this
     */
    setMaxDate : function(dt){
        this.maxDate = dt;
        return this.update(this.value, true);
    },

    /**
     * Sets the value of the date field
     * @param {Date} value The date to set
     * @return {Ext.picker.Date} this
     */
    setValue : function(value){
        this.value = Ext.Date.clearTime(value, true);
        return this.update(this.value);
    },

    /**
     * Gets the current selected value of the date field
     * @return {Date} The selected date
     */
    getValue : function(){
        return this.value;
    },

    // private
    focus : function(){
        this.update(this.activeDate);
    },

    // private, inherit docs
    onEnable: function(){
        this.callParent();
        this.setDisabledStatus(false);
        this.update(this.activeDate);

    },

    // private, inherit docs
    onDisable : function(){
        this.callParent();
        this.setDisabledStatus(true);
    },

    /**
     * Set the disabled state of various internal components
     * @private
     * @param {Boolean} disabled
     */
    setDisabledStatus : function(disabled){
        var me = this;

        me.keyNav.setDisabled(disabled);
        me.prevRepeater.setDisabled(disabled);
        me.nextRepeater.setDisabled(disabled);
        if (me.showToday) {
            me.todayKeyListener.setDisabled(disabled);
            me.todayBtn.setDisabled(disabled);
        }
    },

    /**
     * Get the current active date.
     * @private
     * @return {Date} The active date
     */
    getActive: function(){
        return this.activeDate || this.value;
    },

    /**
     * Run any animation required to hide/show the month picker.
     * @private
     * @param {Boolean} isHide True if it's a hide operation
     */
    runAnimation: function(isHide){
        var options = {
            duration: 200
        };

        if (isHide) {
            this.monthPicker.el.slideOut('t', options);
        } else {
            this.monthPicker.el.slideIn('t', options);
        }
    },

    /**
     * Hides the month picker, if it's visible.
     * @return {Ext.picker.Date} this
     */
    hideMonthPicker : function(){
        var me = this,
            picker = me.monthPicker;

        if (picker) {
            if (me.disableAnim) {
                picker.hide();
            } else {
                this.runAnimation(true);
            }
        }
        return me;
    },

    /**
     * Show the month picker
     * @return {Ext.picker.Date} this
     */
    showMonthPicker : function(){
        var me = this,
            picker;

        if (me.rendered && !me.disabled) {
            picker = me.createMonthPicker();
            picker.setValue(me.getActive());
            picker.setSize(me.getSize());
            picker.setPosition(-1, -1);
            if (me.disableAnim) {
                picker.show();
            } else {
                me.runAnimation(false);
            }
        }
        return me;
    },

    /**
     * Create the month picker instance
     * @private
     * @return {Ext.picker.Month} picker
     */
    createMonthPicker: function(){
        var me = this,
            picker = me.monthPicker;

        if (!picker) {
            me.monthPicker = picker = Ext.create('Ext.picker.Month', {
                renderTo: me.el,
                floating: true,
                shadow: false,
                small: me.showToday === false,
                listeners: {
                    scope: me,
                    cancelclick: me.onCancelClick,
                    okclick: me.onOkClick,
                    yeardblclick: me.onOkClick,
                    monthdblclick: me.onOkClick
                }
            });
            if (!me.disableAnim) {
                // hide the element if we're animating to prevent an initial flicker
                picker.el.setStyle('display', 'none');
            }
            me.on('beforehide', me.hideMonthPicker, me);
        }
        return picker;
    },

    /**
     * Respond to an ok click on the month picker
     * @private
     */
    onOkClick: function(picker, value){
        var me = this,
            month = value[0],
            year = value[1],
            date = new Date(year, month, me.getActive().getDate());

        if (date.getMonth() !== month) {
            // 'fix' the JS rolling date conversion if needed
            date = new Date(year, month, 1).getLastDateOfMonth();
        }
        me.update(date);
        me.hideMonthPicker();
    },

    /**
     * Respond to a cancel click on the month picker
     * @private
     */
    onCancelClick: function(){
        this.hideMonthPicker();
    },

    /**
     * Show the previous month.
     * @return {Ext.picker.Date} this
     */
    showPrevMonth : function(e){
        return this.update(Ext.Date.add(this.activeDate, Ext.Date.MONTH, -1));
    },

    /**
     * Show the next month.
     * @return {Ext.picker.Date} this
     */
    showNextMonth : function(e){
        return this.update(Ext.Date.add(this.activeDate, Ext.Date.MONTH, 1));
    },

    /**
     * Show the previous year.
     * @return {Ext.picker.Date} this
     */
    showPrevYear : function(){
        this.update(Ext.Date.add(this.activeDate, Ext.Date.YEAR, -1));
    },

    /**
     * Show the next year.
     * @return {Ext.picker.Date} this
     */
    showNextYear : function(){
        this.update(Ext.Date.add(this.activeDate, Ext.Date.YEAR, 1));
    },

    /**
     * Respond to the mouse wheel event
     * @private
     * @param {Ext.EventObject} e
     */
    handleMouseWheel : function(e){
        e.stopEvent();
        if(!this.disabled){
            var delta = e.getWheelDelta();
            if(delta > 0){
                this.showPrevMonth();
            } else if(delta < 0){
                this.showNextMonth();
            }
        }
    },

    /**
     * Respond to a date being clicked in the picker
     * @private
     * @param {Ext.EventObject} e
     * @param {HTMLElement} t
     */
    handleDateClick : function(e, t){
        var me = this,
            handler = me.handler;

        e.stopEvent();
        if(!me.disabled && t.dateValue && !Ext.fly(t.parentNode).hasCls(me.disabledCellCls)){
            me.cancelFocus = me.focusOnSelect === false;
            me.setValue(new Date(t.dateValue));
            delete me.cancelFocus;
            me.fireEvent('select', me, me.value);
            if (handler) {
                handler.call(me.scope || me, me, me.value);
            }
            // event handling is turned off on hide
            // when we are using the picker in a field
            // therefore onSelect comes AFTER the select
            // event.
            me.onSelect();
        }
    },

    /**
     * Perform any post-select actions
     * @private
     */
    onSelect: function() {
        if (this.hideOnSelect) {
             this.hide();
         }
    },

    /**
     * Sets the current value to today.
     * @return {Ext.picker.Date} this
     */
    selectToday : function(){
        var me = this,
            btn = me.todayBtn,
            handler = me.handler;

        if(btn && !btn.disabled){
            me.setValue(Ext.Date.clearTime(new Date()));
            me.fireEvent('select', me, me.value);
            if (handler) {
                handler.call(me.scope || me, me, me.value);
            }
            me.onSelect();
        }
        return me;
    },

    /**
     * Update the selected cell
     * @private
     * @param {Date} date The new date
     * @param {Date} active The active date
     */
    selectedUpdate: function(date, active){
        var me = this,
            t = date.getTime(),
            cells = me.cells,
            cls = me.selectedCls;

        cells.removeCls(cls);
        cells.each(function(c){
            if (c.dom.firstChild.dateValue == t) {
                me.el.dom.setAttribute('aria-activedescendent', c.dom.id);
                c.addCls(cls);
                if(me.isVisible() && !me.cancelFocus){
                    Ext.fly(c.dom.firstChild).focus(50);
                }
                return false;
            }
        }, this);
    },

    /**
     * Update the contents of the picker for a new month
     * @private
     * @param {Date} date The new date
     * @param {Date} active The active date
     */
    fullUpdate: function(date, active){
        var me = this,
            cells = me.cells.elements,
            textNodes = me.textNodes,
            disabledCls = me.disabledCellCls,
            eDate = Ext.Date,
            i = 0,
            extraDays = 0,
            visible = me.isVisible(),
            sel = +eDate.clearTime(date, true),
            today = +eDate.clearTime(new Date()),
            min = me.minDate ? eDate.clearTime(me.minDate, true) : Number.NEGATIVE_INFINITY,
            max = me.maxDate ? eDate.clearTime(me.maxDate, true) : Number.POSITIVE_INFINITY,
            ddMatch = me.disabledDatesRE,
            ddText = me.disabledDatesText,
            ddays = me.disabledDays ? me.disabledDays.join('') : false,
            ddaysText = me.disabledDaysText,
            format = me.format,
            days = eDate.getDaysInMonth(date),
            firstOfMonth = eDate.getFirstDateOfMonth(date),
            startingPos = firstOfMonth.getDay() - me.startDay,
            previousMonth = eDate.add(date, eDate.MONTH, -1),
            longDayFormat = me.longDayFormat,
            prevStart,
            current,
            disableToday,
            tempDate,
            setCellClass,
            html,
            cls,
            formatValue,
            value;

        if (startingPos < 0) {
            startingPos += 7;
        }

        days += startingPos;
        prevStart = eDate.getDaysInMonth(previousMonth) - startingPos;
        current = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), prevStart, me.initHour);

        if (me.showToday) {
            tempDate = eDate.clearTime(new Date());
            disableToday = (tempDate < min || tempDate > max ||
                (ddMatch && format && ddMatch.test(eDate.dateFormat(tempDate, format))) ||
                (ddays && ddays.indexOf(tempDate.getDay()) != -1));

            if (!me.disabled) {
                me.todayBtn.setDisabled(disableToday);
                me.todayKeyListener.setDisabled(disableToday);
            }
        }

        setCellClass = function(cell){
            value = +eDate.clearTime(current, true);
            cell.title = eDate.format(current, longDayFormat);
            // store dateValue number as an expando
            cell.firstChild.dateValue = value;
            if(value == today){
                cell.className += ' ' + me.todayCls;
                cell.title = me.todayText;
            }
            if(value == sel){
                cell.className += ' ' + me.selectedCls;
                me.el.dom.setAttribute('aria-activedescendant', cell.id);
                if (visible && me.floating) {
                    Ext.fly(cell.firstChild).focus(50);
                }
            }
            // disabling
            if(value < min) {
                cell.className = disabledCls;
                cell.title = me.minText;
                return;
            }
            if(value > max) {
                cell.className = disabledCls;
                cell.title = me.maxText;
                return;
            }
            if(ddays){
                if(ddays.indexOf(current.getDay()) != -1){
                    cell.title = ddaysText;
                    cell.className = disabledCls;
                }
            }
            if(ddMatch && format){
                formatValue = eDate.dateFormat(current, format);
                if(ddMatch.test(formatValue)){
                    cell.title = ddText.replace('%0', formatValue);
                    cell.className = disabledCls;
                }
            }
        };

        for(; i < me.numDays; ++i) {
            if (i < startingPos) {
                html = (++prevStart);
                cls = me.prevCls;
            } else if (i >= days) {
                html = (++extraDays);
                cls = me.nextCls;
            } else {
                html = i - startingPos + 1;
                cls = me.activeCls;
            }
            textNodes[i].innerHTML = html;
            cells[i].className = cls;
            current.setDate(current.getDate() + 1);
            setCellClass(cells[i]);
        }

        me.monthBtn.setText(me.monthNames[date.getMonth()] + ' ' + date.getFullYear());
    },

    /**
     * Update the contents of the picker
     * @private
     * @param {Date} date The new date
     * @param {Boolean} forceRefresh True to force a full refresh
     */
    update : function(date, forceRefresh){
        var me = this,
            active = me.activeDate;

        if (me.rendered) {
            me.activeDate = date;
            if(!forceRefresh && active && me.el && active.getMonth() == date.getMonth() && active.getFullYear() == date.getFullYear()){
                me.selectedUpdate(date, active);
            } else {
                me.fullUpdate(date, active);
            }
        }
        return me;
    },

    // private, inherit docs
    beforeDestroy : function() {
        var me = this;

        if (me.rendered) {
            Ext.destroy(
                me.todayKeyListener,
                me.keyNav,
                me.monthPicker,
                me.monthBtn,
                me.nextRepeater,
                me.prevRepeater,
                me.todayBtn
            );
            delete me.textNodes;
            delete me.cells.elements;
        }
    },

    // private, inherit docs
    onShow: function() {
        this.callParent(arguments);
        if (this.focusOnShow) {
            this.focus();
        }
    }
},

// After dependencies have loaded:
function() {
    var proto = this.prototype;

    proto.monthNames = Ext.Date.monthNames;

    proto.dayNames = Ext.Date.dayNames;

    proto.format = Ext.Date.defaultFormat;
});
