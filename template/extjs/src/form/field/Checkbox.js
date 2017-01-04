/**
 * @docauthor Robert Dougan <rob@sencha.com>
 *
 * Single checkbox field. Can be used as a direct replacement for traditional checkbox fields. Also serves as a
 * parent class for {@link Ext.form.field.Radio radio buttons}.
 *
 * # Labeling
 *
 * In addition to the {@link Ext.form.Labelable standard field labeling options}, checkboxes
 * may be given an optional {@link #boxLabel} which will be displayed immediately after checkbox. Also see
 * {@link Ext.form.CheckboxGroup} for a convenient method of grouping related checkboxes.
 *
 * # Values
 *
 * The main value of a checkbox is a boolean, indicating whether or not the checkbox is checked.
 * The following values will check the checkbox:
 *
 * - `true`
 * - `'true'`
 * - `'1'`
 * - `'on'`
 *
 * Any other value will uncheck the checkbox.
 *
 * In addition to the main boolean value, you may also specify a separate {@link #inputValue}. This will be
 * sent as the parameter value when the form is {@link Ext.form.Basic#submit submitted}. You will want to set
 * this value if you have multiple checkboxes with the same {@link #name}. If not specified, the value `on`
 * will be used.
 *
 * # Example usage
 *
 *     @example
 *     Ext.create('Ext.form.Panel', {
 *         bodyPadding: 10,
 *         width: 300,
 *         title: 'Pizza Order',
 *         items: [
 *             {
 *                 xtype: 'fieldcontainer',
 *                 fieldLabel: 'Toppings',
 *                 defaultType: 'checkboxfield',
 *                 items: [
 *                     {
 *                         boxLabel  : 'Anchovies',
 *                         name      : 'topping',
 *                         inputValue: '1',
 *                         id        : 'checkbox1'
 *                     }, {
 *                         boxLabel  : 'Artichoke Hearts',
 *                         name      : 'topping',
 *                         inputValue: '2',
 *                         checked   : true,
 *                         id        : 'checkbox2'
 *                     }, {
 *                         boxLabel  : 'Bacon',
 *                         name      : 'topping',
 *                         inputValue: '3',
 *                         id        : 'checkbox3'
 *                     }
 *                 ]
 *             }
 *         ],
 *         bbar: [
 *             {
 *                 text: 'Select Bacon',
 *                 handler: function() {
 *                     Ext.getCmp('checkbox3').setValue(true);
 *                 }
 *             },
 *             '-',
 *             {
 *                 text: 'Select All',
 *                 handler: function() {
 *                     Ext.getCmp('checkbox1').setValue(true);
 *                     Ext.getCmp('checkbox2').setValue(true);
 *                     Ext.getCmp('checkbox3').setValue(true);
 *                 }
 *             },
 *             {
 *                 text: 'Deselect All',
 *                 handler: function() {
 *                     Ext.getCmp('checkbox1').setValue(false);
 *                     Ext.getCmp('checkbox2').setValue(false);
 *                     Ext.getCmp('checkbox3').setValue(false);
 *                 }
 *             }
 *         ],
 *         renderTo: Ext.getBody()
 *     });
 */
Ext.define('Ext.form.field.Checkbox', {
    extend: 'Ext.form.field.Base',
    alias: ['widget.checkboxfield', 'widget.checkbox'],
    alternateClassName: 'Ext.form.Checkbox',
    requires: ['Ext.XTemplate', 'Ext.form.CheckboxManager' ],

    componentLayout: 'field',

    childEls: [
        /**
         * @property {Ext.Element} boxLabelEl
         * A reference to the label element created for the {@link #boxLabel}. Only present if the component has been
         * rendered and has a boxLabel configured.
         */
        'boxLabelEl'
    ],

    // note: {id} here is really {inputId}, but {cmpId} is available
    fieldSubTpl: [
        '<tpl if="boxLabel && boxLabelAlign == \'before\'">',
            '{beforeBoxLabelTpl}',
            '<label id="{cmpId}-boxLabelEl" {boxLabelAttrTpl} class="{boxLabelCls} {boxLabelCls}-{boxLabelAlign}" for="{id}">',
                '{beforeBoxLabelTextTpl}',
                '{boxLabel}',
                '{afterBoxLabelTextTpl}',
            '</label>',
            '{afterBoxLabelTpl}',
        '</tpl>',
        // Creates not an actual checkbox, but a button which is given aria role="checkbox" (If ARIA is required) and
        // styled with a custom checkbox image. This allows greater control and consistency in
        // styling, and using a button allows it to gain focus and handle keyboard nav properly.
        '<input type="button" id="{id}" {inputAttrTpl}',
            '<tpl if="tabIdx"> tabIndex="{tabIdx}"</tpl>',
            '<tpl if="disabled"> disabled="disabled"</tpl>',
            '<tpl if="fieldStyle"> style="{fieldStyle}"</tpl>',
            ' class="{fieldCls} {typeCls}" autocomplete="off" hidefocus="true" />',
        '<tpl if="boxLabel && boxLabelAlign == \'after\'">',
            '{beforeBoxLabelTpl}',
            '<label id="{cmpId}-boxLabelEl" {boxLabelAttrTpl} class="{boxLabelCls} {boxLabelCls}-{boxLabelAlign}" for="{id}">',
                '{beforeBoxLabelTextTpl}',
                '{boxLabel}',
                '{afterBoxLabelTextTpl}',
            '</label>',
            '{afterBoxLabelTpl}',
        '</tpl>',
        {
            disableFormats: true,
            compiled: true
        }
    ],

    subTplInsertions: [
        /**
         * @cfg {String/Array/Ext.XTemplate} beforeBoxLabelTpl
         * An optional string or `XTemplate` configuration to insert in the field markup
         * before the box label element. If an `XTemplate` is used, the component's
         * {@link Ext.form.field.Base#getSubTplData subTpl data} serves as the context.
         */
        'beforeBoxLabelTpl',

        /**
         * @cfg {String/Array/Ext.XTemplate} afterBoxLabelTpl
         * An optional string or `XTemplate` configuration to insert in the field markup
         * after the box label element. If an `XTemplate` is used, the component's
         * {@link Ext.form.field.Base#getSubTplData subTpl data} serves as the context.
         */
        'afterBoxLabelTpl',

        /**
         * @cfg {String/Array/Ext.XTemplate} beforeBoxLabelTextTpl
         * An optional string or `XTemplate` configuration to insert in the field markup
         * before the box label text. If an `XTemplate` is used, the component's
         * {@link Ext.form.field.Base#getSubTplData subTpl data} serves as the context.
         */
        'beforeBoxLabelTextTpl',

        /**
         * @cfg {String/Array/Ext.XTemplate} afterBoxLabelTextTpl
         * An optional string or `XTemplate` configuration to insert in the field markup
         * after the box label text. If an `XTemplate` is used, the component's
         * {@link Ext.form.field.Base#getSubTplData subTpl data} serves as the context.
         */
        'afterBoxLabelTextTpl',

        /**
         * @cfg {String/Array/Ext.XTemplate} boxLabelAttrTpl
         * An optional string or `XTemplate` configuration to insert in the field markup
         * inside the box label element (as attributes). If an `XTemplate` is used, the component's
         * {@link Ext.form.field.Base#getSubTplData subTpl data} serves as the context.
         */
        'boxLabelAttrTpl',

        // inherited
        'inputAttrTpl'
    ],

    /*
     * @property {Boolean} isCheckbox
     * `true` in this class to identify an object as an instantiated Checkbox, or subclass thereof.
     */
    isCheckbox: true,

    /**
     * @cfg {String} [focusCls='x-form-cb-focus']
     * The CSS class to use when the checkbox receives focus
     */
    focusCls: 'form-cb-focus',

    /**
     * @cfg {String} [fieldCls='x-form-field']
     * The default CSS class for the checkbox
     */

    /**
     * @cfg {String} [fieldBodyCls='x-form-cb-wrap']
     * An extra CSS class to be applied to the body content element in addition to {@link #fieldBodyCls}.
     * .
     */
    fieldBodyCls: Ext.baseCSSPrefix + 'form-cb-wrap',

    /**
     * @cfg {Boolean} checked
     * true if the checkbox should render initially checked
     */
    checked: false,

    /**
     * @cfg {String} [checkedCls='x-form-cb-checked']
     * The CSS class added to the component's main element when it is in the checked state.
     */
    checkedCls: Ext.baseCSSPrefix + 'form-cb-checked',

    /**
     * @cfg {String} boxLabel
     * An optional text label that will appear next to the checkbox. Whether it appears before or after the checkbox is
     * determined by the {@link #boxLabelAlign} config.
     */

    /**
     * @cfg {String} [boxLabelCls='x-form-cb-label']
     * The CSS class to be applied to the {@link #boxLabel} element
     */
    boxLabelCls: Ext.baseCSSPrefix + 'form-cb-label',

    /**
     * @cfg {String} boxLabelAlign
     * The position relative to the checkbox where the {@link #boxLabel} should appear. Recognized values are 'before'
     * and 'after'.
     */
    boxLabelAlign: 'after',

    /**
     * @cfg {String} inputValue
     * The value that should go into the generated input element's value attribute and should be used as the parameter
     * value when submitting as part of a form.
     */
    inputValue: 'on',

    /**
     * @cfg {String} uncheckedValue
     * If configured, this will be submitted as the checkbox's value during form submit if the checkbox is unchecked. By
     * default this is undefined, which results in nothing being submitted for the checkbox field when the form is
     * submitted (the default behavior of HTML checkboxes).
     */

    /**
     * @cfg {Function} handler
     * A function called when the {@link #checked} value changes (can be used instead of handling the {@link #change
     * change event}).
     * @cfg {Ext.form.field.Checkbox} handler.checkbox The Checkbox being toggled.
     * @cfg {Boolean} handler.checked The new checked state of the checkbox.
     */

    /**
     * @cfg {Object} scope
     * An object to use as the scope ('this' reference) of the {@link #handler} function.
     *
     * Defaults to this Checkbox.
     */

    // private overrides
    checkChangeEvents: [],
    inputType: 'checkbox',

    // private
    onRe: /^on$/i,

    initComponent: function() {
        this.callParent(arguments);
        this.getManager().add(this);
    },

    initValue: function() {
        var me = this,
            checked = !!me.checked;

        /**
         * @property {Object} originalValue
         * The original value of the field as configured in the {@link #checked} configuration, or as loaded by the last
         * form load operation if the form's {@link Ext.form.Basic#trackResetOnLoad trackResetOnLoad} setting is `true`.
         */
        me.originalValue = me.lastValue = checked;

        // Set the initial checked state
        me.setValue(checked);
    },

    getElConfig: function() {
        var me = this;

        // Add the checked class if this begins checked
        if (me.isChecked(me.rawValue, me.inputValue)) {
            me.addCls(me.checkedCls);
        }
        return me.callParent();
    },

    getFieldStyle: function() {
        return Ext.isObject(this.fieldStyle) ? Ext.DomHelper.generateStyles(this.fieldStyle) : this.fieldStyle ||'';
    },

    getSubTplData: function() {
        var me = this;
        return Ext.apply(me.callParent(), {
            disabled      : me.readOnly || me.disabled,
            boxLabel      : me.boxLabel,
            boxLabelCls   : me.boxLabelCls,
            boxLabelAlign : me.boxLabelAlign
        });
    },

    initEvents: function() {
        var me = this;
        me.callParent();
        me.mon(me.inputEl, 'click', me.onBoxClick, me);
    },

    /**
     * @private Handle click on the checkbox button
     */
    onBoxClick: function(e) {
        var me = this;
        if (!me.disabled && !me.readOnly) {
            this.setValue(!this.checked);
        }
    },

    /**
     * Returns the checked state of the checkbox.
     * @return {Boolean} True if checked, else false
     */
    getRawValue: function() {
        return this.checked;
    },

    /**
     * Returns the checked state of the checkbox.
     * @return {Boolean} True if checked, else false
     */
    getValue: function() {
        return this.checked;
    },

    /**
     * Returns the submit value for the checkbox which can be used when submitting forms.
     * @return {String} If checked the {@link #inputValue} is returned; otherwise the {@link #uncheckedValue}
     * (or null if the latter is not configured).
     */
    getSubmitValue: function() {
        var unchecked = this.uncheckedValue,
            uncheckedVal = Ext.isDefined(unchecked) ? unchecked : null;
        return this.checked ? this.inputValue : uncheckedVal;
    },

    isChecked: function(rawValue, inputValue) {
        return (rawValue === true || rawValue === 'true' || rawValue === '1' || rawValue === 1 ||
                      (((Ext.isString(rawValue) || Ext.isNumber(rawValue)) && inputValue) ? rawValue == inputValue : this.onRe.test(rawValue)));
    },

    /**
     * Sets the checked state of the checkbox.
     *
     * @param {Boolean/String/Number} value The following values will check the checkbox:
     * `true, 'true', '1', 1, or 'on'`, as well as a String that matches the {@link #inputValue}.
     * Any other value will uncheck the checkbox.
     * @return {Boolean} the new checked state of the checkbox
     */
    setRawValue: function(value) {
        var me = this,
            inputEl = me.inputEl,
            checked = me.isChecked(value, me.inputValue);

        if (inputEl) {
            me[checked ? 'addCls' : 'removeCls'](me.checkedCls);
        }

        me.checked = me.rawValue = checked;
        return checked;
    },

    /**
     * Sets the checked state of the checkbox, and invokes change detection.
     * @param {Boolean/String} checked The following values will check the checkbox: `true, 'true', '1', or 'on'`, as
     * well as a String that matches the {@link #inputValue}. Any other value will uncheck the checkbox.
     * @return {Ext.form.field.Checkbox} this
     */
    setValue: function(checked) {
        var me = this,
            boxes, i, len, box;

        // If an array of strings is passed, find all checkboxes in the group with the same name as this
        // one and check all those whose inputValue is in the array, unchecking all the others. This is to
        // facilitate setting values from Ext.form.Basic#setValues, but is not publicly documented as we
        // don't want users depending on this behavior.
        if (Ext.isArray(checked)) {
            boxes = me.getManager().getByName(me.name, me.getFormId()).items;
            len = boxes.length;

            for (i = 0; i < len; ++i) {
                box = boxes[i];
                box.setValue(Ext.Array.contains(checked, box.inputValue));
            }
        } else {
            me.callParent(arguments);
        }

        return me;
    },

    // private
    valueToRaw: function(value) {
        // No extra conversion for checkboxes
        return value;
    },

    /**
     * @private
     * Called when the checkbox's checked state changes. Invokes the {@link #handler} callback
     * function if specified.
     */
    onChange: function(newVal, oldVal) {
        var me = this,
            handler = me.handler;
        if (handler) {
            handler.call(me.scope || me, me, newVal);
        }
        me.callParent(arguments);
    },
    
    resetOriginalValue: function(/* private */ fromBoxInGroup){
        var me = this,
            boxes,
            box,
            len,
            i;
            
        // If we're resetting the value of a field in a group, also reset the others.
        if (!fromBoxInGroup) {
            boxes = me.getManager().getByName(me.name, me.getFormId()).items;
            len  = boxes.length;
            
            for (i = 0; i < len; ++i) {
                box = boxes[i];
                if (box !== me) {
                    boxes[i].resetOriginalValue(true);
                }
            }
        }
        me.callParent();
    },

    // inherit docs
    beforeDestroy: function(){
        this.callParent();
        this.getManager().removeAtKey(this.id);
    },

    // inherit docs
    getManager: function() {
        return Ext.form.CheckboxManager;
    },

    onEnable: function() {
        var me = this,
            inputEl = me.inputEl;
        me.callParent();
        if (inputEl) {
            // Can still be disabled if the field is readOnly
            inputEl.dom.disabled = me.readOnly;
        }
    },

    setReadOnly: function(readOnly) {
        var me = this,
            inputEl = me.inputEl;
        if (inputEl) {
            // Set the button to disabled when readonly
            inputEl.dom.disabled = !!readOnly || me.disabled;
        }
        me.callParent(arguments);
    },

    getFormId: function(){
        var me = this,
            form;

        if (!me.formId) {
            form = me.up('form');
            if (form) {
                me.formId = form.id;
            }
        }
        return me.formId;
    }
});
