/**
 * Provides a lightweight HTML Editor component. Some toolbar features are not supported by Safari and will be
 * automatically hidden when needed. These are noted in the config options where appropriate.
 *
 * The editor's toolbar buttons have tooltips defined in the {@link #buttonTips} property, but they are not
 * enabled by default unless the global {@link Ext.tip.QuickTipManager} singleton is
 * {@link Ext.tip.QuickTipManager#init initialized}.
 *
 * An Editor is a sensitive component that can't be used in all spots standard fields can be used. Putting an
 * Editor within any element that has display set to 'none' can cause problems in Safari and Firefox due to their
 * default iframe reloading bugs.
 *
 * # Example usage
 *
 * Simple example rendered with default options:
 *
 *     @example
 *     Ext.tip.QuickTipManager.init();  // enable tooltips
 *     Ext.create('Ext.form.HtmlEditor', {
 *         width: 580,
 *         height: 250,
 *         renderTo: Ext.getBody()
 *     });
 *
 * Passed via xtype into a container and with custom options:
 *
 *     @example
 *     Ext.tip.QuickTipManager.init();  // enable tooltips
 *     new Ext.panel.Panel({
 *         title: 'HTML Editor',
 *         renderTo: Ext.getBody(),
 *         width: 550,
 *         height: 250,
 *         frame: true,
 *         layout: 'fit',
 *         items: {
 *             xtype: 'htmleditor',
 *             enableColors: false,
 *             enableAlignments: false
 *         }
 *     });
 *     
 * # Reflow issues
 * 
 * In some browsers, a layout reflow will cause the underlying editor iframe to be reset. This
 * is most commonly seen when using the editor in collapsed panels with animation. In these cases
 * it is best to avoid animation. More information can be found here: https://bugzilla.mozilla.org/show_bug.cgi?id=90268 
 */
Ext.define('Ext.form.field.HtmlEditor', {
    extend:'Ext.Component',
    mixins: {
        labelable: 'Ext.form.Labelable',
        field: 'Ext.form.field.Field'
    },
    alias: 'widget.htmleditor',
    alternateClassName: 'Ext.form.HtmlEditor',
    requires: [
        'Ext.tip.QuickTipManager',
        'Ext.picker.Color',
        'Ext.toolbar.Item',
        'Ext.toolbar.Toolbar',
        'Ext.util.Format',
        'Ext.layout.component.field.HtmlEditor'
    ],

    childEls: [
        'iframeEl', 'textareaEl'
    ],

    fieldSubTpl: [
        '{beforeTextAreaTpl}',
        '<textarea id="{cmpId}-textareaEl" name="{name}" tabIndex="-1" {inputAttrTpl}',
                 ' class="{textareaCls}" style="{size}" autocomplete="off">',
            '{[Ext.util.Format.htmlEncode(values.value)]}',
        '</textarea>',
        '{afterTextAreaTpl}',
        '{beforeIFrameTpl}',
        '<iframe id="{cmpId}-iframeEl" name="{iframeName}" frameBorder="0" {iframeAttrTpl}',
               ' style="overflow:auto;{size}" src="{iframeSrc}"></iframe>',
        '{afterIFrameTpl}',
        {
            disableFormats: true
        }
    ],

    subTplInsertions: [
        /**
         * @cfg {String/Array/Ext.XTemplate} beforeTextAreaTpl
         * An optional string or `XTemplate` configuration to insert in the field markup
         * before the textarea element. If an `XTemplate` is used, the component's
         * {@link Ext.form.field.Base#getSubTplData subTpl data} serves as the context.
         */
        'beforeTextAreaTpl',

        /**
         * @cfg {String/Array/Ext.XTemplate} afterTextAreaTpl
         * An optional string or `XTemplate` configuration to insert in the field markup
         * after the textarea element. If an `XTemplate` is used, the component's
         * {@link Ext.form.field.Base#getSubTplData subTpl data} serves as the context.
         */
        'afterTextAreaTpl',

        /**
         * @cfg {String/Array/Ext.XTemplate} beforeIFrameTpl
         * An optional string or `XTemplate` configuration to insert in the field markup
         * before the iframe element. If an `XTemplate` is used, the component's
         * {@link Ext.form.field.Base#getSubTplData subTpl data} serves as the context.
         */
        'beforeIFrameTpl',

        /**
         * @cfg {String/Array/Ext.XTemplate} afterIFrameTpl
         * An optional string or `XTemplate` configuration to insert in the field markup
         * after the iframe element. If an `XTemplate` is used, the component's
         * {@link Ext.form.field.Base#getSubTplData subTpl data} serves as the context.
         */
        'afterIFrameTpl',

        /**
         * @cfg {String/Array/Ext.XTemplate} iframeAttrTpl
         * An optional string or `XTemplate` configuration to insert in the field markup
         * inside the iframe element (as attributes). If an `XTemplate` is used, the component's
         * {@link Ext.form.field.Base#getSubTplData subTpl data} serves as the context.
         */
        'iframeAttrTpl',

        // inherited
        'inputAttrTpl'
    ],

    /**
     * @cfg {Boolean} enableFormat
     * Enable the bold, italic and underline buttons
     */
    enableFormat : true,
    /**
     * @cfg {Boolean} enableFontSize
     * Enable the increase/decrease font size buttons
     */
    enableFontSize : true,
    /**
     * @cfg {Boolean} enableColors
     * Enable the fore/highlight color buttons
     */
    enableColors : true,
    /**
     * @cfg {Boolean} enableAlignments
     * Enable the left, center, right alignment buttons
     */
    enableAlignments : true,
    /**
     * @cfg {Boolean} enableLists
     * Enable the bullet and numbered list buttons. Not available in Safari.
     */
    enableLists : true,
    /**
     * @cfg {Boolean} enableSourceEdit
     * Enable the switch to source edit button. Not available in Safari.
     */
    enableSourceEdit : true,
    /**
     * @cfg {Boolean} enableLinks
     * Enable the create link button. Not available in Safari.
     */
    enableLinks : true,
    /**
     * @cfg {Boolean} enableFont
     * Enable font selection. Not available in Safari.
     */
    enableFont : true,
    //<locale>
    /**
     * @cfg {String} createLinkText
     * The default text for the create link prompt
     */
    createLinkText : 'Please enter the URL for the link:',
    //</locale>
    /**
     * @cfg {String} [defaultLinkValue='http://']
     * The default value for the create link prompt
     */
    defaultLinkValue : 'http:/'+'/',
    /**
     * @cfg {String[]} fontFamilies
     * An array of available font families
     */
    fontFamilies : [
        'Arial',
        'Courier New',
        'Tahoma',
        'Times New Roman',
        'Verdana'
    ],
    defaultFont: 'tahoma',
    /**
     * @cfg {String} defaultValue
     * A default value to be put into the editor to resolve focus issues.
     *
     * Defaults to (Non-breaking space) in Opera and IE6,
     * (Zero-width space) in all other browsers.
     */
    defaultValue: (Ext.isOpera || Ext.isIE6) ? '&#160;' : '&#8203;',

    editorWrapCls: Ext.baseCSSPrefix + 'html-editor-wrap',

    componentLayout: 'htmleditor',

    // private properties
    initialized : false,
    activated : false,
    sourceEditMode : false,
    iframePad:3,
    hideMode:'offsets',

    afterBodyEl: '</div>',

    maskOnDisable: true,

    // private
    initComponent : function(){
        var me = this;

        me.addEvents(
            /**
             * @event initialize
             * Fires when the editor is fully initialized (including the iframe)
             * @param {Ext.form.field.HtmlEditor} this
             */
            'initialize',
            /**
             * @event activate
             * Fires when the editor is first receives the focus. Any insertion must wait until after this event.
             * @param {Ext.form.field.HtmlEditor} this
             */
            'activate',
             /**
             * @event beforesync
             * Fires before the textarea is updated with content from the editor iframe. Return false to cancel the
             * sync.
             * @param {Ext.form.field.HtmlEditor} this
             * @param {String} html
             */
            'beforesync',
             /**
             * @event beforepush
             * Fires before the iframe editor is updated with content from the textarea. Return false to cancel the
             * push.
             * @param {Ext.form.field.HtmlEditor} this
             * @param {String} html
             */
            'beforepush',
             /**
             * @event sync
             * Fires when the textarea is updated with content from the editor iframe.
             * @param {Ext.form.field.HtmlEditor} this
             * @param {String} html
             */
            'sync',
             /**
             * @event push
             * Fires when the iframe editor is updated with content from the textarea.
             * @param {Ext.form.field.HtmlEditor} this
             * @param {String} html
             */
            'push',
             /**
             * @event editmodechange
             * Fires when the editor switches edit modes
             * @param {Ext.form.field.HtmlEditor} this
             * @param {Boolean} sourceEdit True if source edit, false if standard editing.
             */
            'editmodechange'
        );

        me.callParent(arguments);
        me.createToolbar(me);

        // Init mixins
        me.initLabelable();
        me.initField();
    },

    /**
     * @private
     * Must define this function to allow the Layout base class to collect all descendant layouts to be run.
     */
    getRefItems: function() {
        return [ this.toolbar ];
    },

    /*
     * Called when the editor creates its toolbar. Override this method if you need to
     * add custom toolbar buttons.
     * @param {Ext.form.field.HtmlEditor} editor
     * @protected
     */
    createToolbar : function(editor){
        var me = this,
            items = [], i,
            tipsEnabled = Ext.tip.QuickTipManager && Ext.tip.QuickTipManager.isEnabled(),
            baseCSSPrefix = Ext.baseCSSPrefix,
            fontSelectItem, toolbar, undef;

        function btn(id, toggle, handler){
            return {
                itemId : id,
                cls : baseCSSPrefix + 'btn-icon',
                iconCls: baseCSSPrefix + 'edit-'+id,
                enableToggle:toggle !== false,
                scope: editor,
                handler:handler||editor.relayBtnCmd,
                clickEvent: 'mousedown',
                tooltip: tipsEnabled ? editor.buttonTips[id] || undef : undef,
                overflowText: editor.buttonTips[id].title || undef,
                tabIndex: -1
            };
        }


        if (me.enableFont && !Ext.isSafari2) {
            fontSelectItem = Ext.widget('component', {
                renderTpl: [
                    '<select id="{id}-selectEl" class="{cls}">',
                        '<tpl for="fonts">',
                            '<option value="{[values.toLowerCase()]}" style="font-family:{.}"<tpl if="values.toLowerCase()==parent.defaultFont"> selected</tpl>>{.}</option>',
                        '</tpl>',
                    '</select>'
                ],
                renderData: {
                    cls: baseCSSPrefix + 'font-select',
                    fonts: me.fontFamilies,
                    defaultFont: me.defaultFont
                },
                childEls: ['selectEl'],
                afterRender: function() {
                    me.fontSelect = this.selectEl;
                    Ext.Component.prototype.afterRender.apply(this, arguments);
                },
                onDisable: function() {
                    var selectEl = this.selectEl;
                    if (selectEl) {
                        selectEl.dom.disabled = true;
                    }
                    Ext.Component.prototype.onDisable.apply(this, arguments);
                },
                onEnable: function() {
                    var selectEl = this.selectEl;
                    if (selectEl) {
                        selectEl.dom.disabled = false;
                    }
                    Ext.Component.prototype.onEnable.apply(this, arguments);
                },
                listeners: {
                    change: function() {
                        me.relayCmd('fontname', me.fontSelect.dom.value);
                        me.deferFocus();
                    },
                    element: 'selectEl'
                }
            });

            items.push(
                fontSelectItem,
                '-'
            );
        }

        if (me.enableFormat) {
            items.push(
                btn('bold'),
                btn('italic'),
                btn('underline')
            );
        }

        if (me.enableFontSize) {
            items.push(
                '-',
                btn('increasefontsize', false, me.adjustFont),
                btn('decreasefontsize', false, me.adjustFont)
            );
        }

        if (me.enableColors) {
            items.push(
                '-', {
                    itemId: 'forecolor',
                    cls: baseCSSPrefix + 'btn-icon',
                    iconCls: baseCSSPrefix + 'edit-forecolor',
                    overflowText: editor.buttonTips.forecolor.title,
                    tooltip: tipsEnabled ? editor.buttonTips.forecolor || undef : undef,
                    tabIndex:-1,
                    menu : Ext.widget('menu', {
                        plain: true,
                        items: [{
                            xtype: 'colorpicker',
                            allowReselect: true,
                            focus: Ext.emptyFn,
                            value: '000000',
                            plain: true,
                            clickEvent: 'mousedown',
                            handler: function(cp, color) {
                                me.execCmd('forecolor', Ext.isWebKit || Ext.isIE ? '#'+color : color);
                                me.deferFocus();
                                this.up('menu').hide();
                            }
                        }]
                    })
                }, {
                    itemId: 'backcolor',
                    cls: baseCSSPrefix + 'btn-icon',
                    iconCls: baseCSSPrefix + 'edit-backcolor',
                    overflowText: editor.buttonTips.backcolor.title,
                    tooltip: tipsEnabled ? editor.buttonTips.backcolor || undef : undef,
                    tabIndex:-1,
                    menu : Ext.widget('menu', {
                        plain: true,
                        items: [{
                            xtype: 'colorpicker',
                            focus: Ext.emptyFn,
                            value: 'FFFFFF',
                            plain: true,
                            allowReselect: true,
                            clickEvent: 'mousedown',
                            handler: function(cp, color) {
                                if (Ext.isGecko) {
                                    me.execCmd('useCSS', false);
                                    me.execCmd('hilitecolor', color);
                                    me.execCmd('useCSS', true);
                                    me.deferFocus();
                                } else {
                                    me.execCmd(Ext.isOpera ? 'hilitecolor' : 'backcolor', Ext.isWebKit || Ext.isIE ? '#'+color : color);
                                    me.deferFocus();
                                }
                                this.up('menu').hide();
                            }
                        }]
                    })
                }
            );
        }

        if (me.enableAlignments) {
            items.push(
                '-',
                btn('justifyleft'),
                btn('justifycenter'),
                btn('justifyright')
            );
        }

        if (!Ext.isSafari2) {
            if (me.enableLinks) {
                items.push(
                    '-',
                    btn('createlink', false, me.createLink)
                );
            }

            if (me.enableLists) {
                items.push(
                    '-',
                    btn('insertorderedlist'),
                    btn('insertunorderedlist')
                );
            }
            if (me.enableSourceEdit) {
                items.push(
                    '-',
                    btn('sourceedit', true, function(btn){
                        me.toggleSourceEdit(!me.sourceEditMode);
                    })
                );
            }
        }
        
        // Everything starts disabled.
        for (i = 0; i < items.length; i++) {
            if (items[i].itemId !== 'sourceedit') {
                items[i].disabled = true;
            }
        }

        // build the toolbar
        // Automatically rendered in AbstractComponent.afterRender's renderChildren call
        toolbar = Ext.widget('toolbar', {
            id: me.id + '-toolbar',
            ownerCt: me,
            cls: Ext.baseCSSPrefix + 'html-editor-tb',
            enableOverflow: true,
            items: items,
            ownerLayout: me.getComponentLayout(),

            // stop form submits
            listeners: {
                click: function(e){
                    e.preventDefault();
                },
                element: 'el'
            }
        });

        me.toolbar = toolbar;
    },
    
    getMaskTarget: function(){
        return this.bodyEl;    
    },

    /**
     * Sets the read only state of this field.
     * @param {Boolean} readOnly Whether the field should be read only.
     */
    setReadOnly: function(readOnly) {
        var me = this,
            textareaEl = me.textareaEl,
            iframeEl = me.iframeEl,
            body;

        me.readOnly = readOnly;

        if (textareaEl) {
            textareaEl.dom.readOnly = readOnly;
        }

        if (me.initialized) {
            body = me.getEditorBody();
            if (Ext.isIE) {
                // Hide the iframe while setting contentEditable so it doesn't grab focus
                iframeEl.setDisplayed(false);
                body.contentEditable = !readOnly;
                iframeEl.setDisplayed(true);
            } else {
                me.setDesignMode(!readOnly);
            }
            if (body) {
                body.style.cursor = readOnly ? 'default' : 'text';
            }
            me.disableItems(readOnly);
        }
    },

    /**
     * Called when the editor initializes the iframe with HTML contents. Override this method if you
     * want to change the initialization markup of the iframe (e.g. to add stylesheets).
     *
     * **Note:** IE8-Standards has unwanted scroller behavior, so the default meta tag forces IE7 compatibility.
     * Also note that forcing IE7 mode works when the page is loaded normally, but if you are using IE's Web
     * Developer Tools to manually set the document mode, that will take precedence and override what this
     * code sets by default. This can be confusing when developing, but is not a user-facing issue.
     * @protected
     */
    getDocMarkup: function() {
        var me = this,
            h = me.iframeEl.getHeight() - me.iframePad * 2;
        return Ext.String.format('<html><head><style type="text/css">body{border:0;margin:0;padding:{0}px;height:{1}px;box-sizing: border-box; -moz-box-sizing: border-box; -webkit-box-sizing: border-box;cursor:text}</style></head><body></body></html>', me.iframePad, h);
    },

    // private
    getEditorBody: function() {
        var doc = this.getDoc();
        return doc.body || doc.documentElement;
    },

    // private
    getDoc: function() {
        return (!Ext.isIE && this.iframeEl.dom.contentDocument) || this.getWin().document;
    },

    // private
    getWin: function() {
        return Ext.isIE ? this.iframeEl.dom.contentWindow : window.frames[this.iframeEl.dom.name];
    },

    // Do the job of a container layout at this point even though we are not a Container.
    // TODO: Refactor as a Container.
    finishRenderChildren: function () {
        this.callParent();
        this.toolbar.finishRender();
    },

    // private
    onRender: function() {
        var me = this;

        me.callParent(arguments);

        // The input element is interrogated by the layout to extract height when labelAlign is 'top'
        // It must be set, and then switched between the iframe and the textarea
        me.inputEl = me.iframeEl;

        // Start polling for when the iframe document is ready to be manipulated
        me.monitorTask = Ext.TaskManager.start({
            run: me.checkDesignMode,
            scope: me,
            interval: 100
        });
    },

    initRenderTpl: function() {
        var me = this;
        if (!me.hasOwnProperty('renderTpl')) {
            me.renderTpl = me.getTpl('labelableRenderTpl');
        }
        return me.callParent();
    },

    initRenderData: function() {
        this.beforeSubTpl = '<div class="' + this.editorWrapCls + '">' + Ext.DomHelper.markup(this.toolbar.getRenderTree());
        return Ext.applyIf(this.callParent(), this.getLabelableRenderData());
    },

    getSubTplData: function() {
        return {
            $comp       : this,
            cmpId       : this.id,
            id          : this.getInputId(),
            textareaCls : Ext.baseCSSPrefix + 'hidden',
            value       : this.value,
            iframeName  : Ext.id(),
            iframeSrc   : Ext.SSL_SECURE_URL,
            size        : 'height:100px;width:100%'
        };
    },

    getSubTplMarkup: function() {
        return this.getTpl('fieldSubTpl').apply(this.getSubTplData());
    },

    initFrameDoc: function() {
        var me = this,
            doc, task;

        Ext.TaskManager.stop(me.monitorTask);

        doc = me.getDoc();
        me.win = me.getWin();

        doc.open();
        doc.write(me.getDocMarkup());
        doc.close();

        task = { // must defer to wait for browser to be ready
            run: function() {
                var doc = me.getDoc();
                if (doc.body || doc.readyState === 'complete') {
                    Ext.TaskManager.stop(task);
                    me.setDesignMode(true);
                    Ext.defer(me.initEditor, 10, me);
                }
            },
            interval : 10,
            duration:10000,
            scope: me
        };
        Ext.TaskManager.start(task);
    },

    checkDesignMode: function() {
        var me = this,
            doc = me.getDoc();
        if (doc && (!doc.editorInitialized || me.getDesignMode() !== 'on')) {
            me.initFrameDoc();
        }
    },

    /**
     * @private
     * Sets current design mode. To enable, mode can be true or 'on', off otherwise
     */
    setDesignMode: function(mode) {
        var me = this,
            doc = me.getDoc();
        if (doc) {
            if (me.readOnly) {
                mode = false;
            }
            doc.designMode = (/on|true/i).test(String(mode).toLowerCase()) ?'on':'off';
        }
    },

    // private
    getDesignMode: function() {
        var doc = this.getDoc();
        return !doc ? '' : String(doc.designMode).toLowerCase();
    },

    disableItems: function(disabled) {
        var items = this.getToolbar().items.items,
            i,
            iLen  = items.length,
            item;

        for (i = 0; i < iLen; i++) {
            item = items[i];

            if (item.getItemId() !== 'sourceedit') {
                item.setDisabled(disabled);
            }
        }
    },

    /**
     * Toggles the editor between standard and source edit mode.
     * @param {Boolean} [sourceEditMode] True for source edit, false for standard
     */
    toggleSourceEdit: function(sourceEditMode) {
        var me = this,
            iframe = me.iframeEl,
            textarea = me.textareaEl,
            hiddenCls = Ext.baseCSSPrefix + 'hidden',
            btn = me.getToolbar().getComponent('sourceedit');

        if (!Ext.isBoolean(sourceEditMode)) {
            sourceEditMode = !me.sourceEditMode;
        }
        me.sourceEditMode = sourceEditMode;

        if (btn.pressed !== sourceEditMode) {
            btn.toggle(sourceEditMode);
        }
        if (sourceEditMode) {
            me.disableItems(true);
            me.syncValue();
            iframe.addCls(hiddenCls);
            textarea.removeCls(hiddenCls);
            textarea.dom.removeAttribute('tabIndex');
            textarea.focus();
            me.inputEl = textarea;
        }
        else {
            if (me.initialized) {
                me.disableItems(me.readOnly);
            }
            me.pushValue();
            iframe.removeCls(hiddenCls);
            textarea.addCls(hiddenCls);
            textarea.dom.setAttribute('tabIndex', -1);
            me.deferFocus();
            me.inputEl = iframe;
        }
        me.fireEvent('editmodechange', me, sourceEditMode);
        me.updateLayout();
    },

    // private used internally
    createLink : function() {
        var url = prompt(this.createLinkText, this.defaultLinkValue);
        if (url && url !== 'http:/'+'/') {
            this.relayCmd('createlink', url);
        }
    },

    clearInvalid: Ext.emptyFn,

    // docs inherit from Field
    setValue: function(value) {
        var me = this,
            textarea = me.textareaEl;
        me.mixins.field.setValue.call(me, value);
        if (value === null || value === undefined) {
            value = '';
        }
        if (textarea) {
            textarea.dom.value = value;
        }
        me.pushValue();
        return this;
    },

    /**
     * If you need/want custom HTML cleanup, this is the method you should override.
     * @param {String} html The HTML to be cleaned
     * @return {String} The cleaned HTML
     * @protected
     */
    cleanHtml: function(html) {
        html = String(html);
        if (Ext.isWebKit) { // strip safari nonsense
            html = html.replace(/\sclass="(?:Apple-style-span|khtml-block-placeholder)"/gi, '');
        }

        /*
         * Neat little hack. Strips out all the non-digit characters from the default
         * value and compares it to the character code of the first character in the string
         * because it can cause encoding issues when posted to the server. We need the
         * parseInt here because charCodeAt will return a number.
         */
        if (html.charCodeAt(0) === parseInt(this.defaultValue.replace(/\D/g, ''), 10)) {
            html = html.substring(1);
        }
        return html;
    },

    /**
     * Syncs the contents of the editor iframe with the textarea.
     * @protected
     */
    syncValue : function(){
        var me = this,
            body, changed, html, bodyStyle, match;

        if (me.initialized) {
            body = me.getEditorBody();
            html = body.innerHTML;
            if (Ext.isWebKit) {
                bodyStyle = body.getAttribute('style'); // Safari puts text-align styles on the body element!
                match = bodyStyle.match(/text-align:(.*?);/i);
                if (match && match[1]) {
                    html = '<div style="' + match[0] + '">' + html + '</div>';
                }
            }
            html = me.cleanHtml(html);
            if (me.fireEvent('beforesync', me, html) !== false) {
                if (me.textareaEl.dom.value != html) {
                    me.textareaEl.dom.value = html;
                    changed = true;
                }

                me.fireEvent('sync', me, html);

                if (changed) {
                    // we have to guard this to avoid infinite recursion because getValue
                    // calls this method...
                    me.checkChange();
                }
            }
        }
    },

    //docs inherit from Field
    getValue : function() {
        var me = this,
            value;
        if (!me.sourceEditMode) {
            me.syncValue();
        }
        value = me.rendered ? me.textareaEl.dom.value : me.value;
        me.value = value;
        return value;
    },

    /**
     * Pushes the value of the textarea into the iframe editor.
     * @protected
     */
    pushValue: function() {
        var me = this,
            v;
        if(me.initialized){
            v = me.textareaEl.dom.value || '';
            if (!me.activated && v.length < 1) {
                v = me.defaultValue;
            }
            if (me.fireEvent('beforepush', me, v) !== false) {
                me.getEditorBody().innerHTML = v;
                if (Ext.isGecko) {
                    // Gecko hack, see: https://bugzilla.mozilla.org/show_bug.cgi?id=232791#c8
                    me.setDesignMode(false);  //toggle off first
                    me.setDesignMode(true);
                }
                me.fireEvent('push', me, v);
            }
        }
    },

    // private
    deferFocus : function(){
         this.focus(false, true);
    },

    getFocusEl: function() {
        var me = this,
            win = me.win;
        return win && !me.sourceEditMode ? win : me.textareaEl;
    },

    // private
    initEditor : function(){
        //Destroying the component during/before initEditor can cause issues.
        try {
            var me = this,
                dbody = me.getEditorBody(),
                ss = me.textareaEl.getStyles('font-size', 'font-family', 'background-image', 'background-repeat', 'background-color', 'color'),
                doc,
                fn;

            ss['background-attachment'] = 'fixed'; // w3c
            dbody.bgProperties = 'fixed'; // ie

            Ext.DomHelper.applyStyles(dbody, ss);

            doc = me.getDoc();

            if (doc) {
                try {
                    Ext.EventManager.removeAll(doc);
                } catch(e) {}
            }

            /*
             * We need to use createDelegate here, because when using buffer, the delayed task is added
             * as a property to the function. When the listener is removed, the task is deleted from the function.
             * Since onEditorEvent is shared on the prototype, if we have multiple html editors, the first time one of the editors
             * is destroyed, it causes the fn to be deleted from the prototype, which causes errors. Essentially, we're just anonymizing the function.
             */
            fn = Ext.Function.bind(me.onEditorEvent, me);
            Ext.EventManager.on(doc, {
                mousedown: fn,
                dblclick: fn,
                click: fn,
                keyup: fn,
                buffer:100
            });

            // These events need to be relayed from the inner document (where they stop
            // bubbling) up to the outer document. This has to be done at the DOM level so
            // the event reaches listeners on elements like the document body. The effected
            // mechanisms that depend on this bubbling behavior are listed to the right
            // of the event.
            fn = me.onRelayedEvent;
            Ext.EventManager.on(doc, {
                mousedown: fn, // menu dismisal (MenuManager) and Window onMouseDown (toFront)
                mousemove: fn, // window resize drag detection
                mouseup: fn,   // window resize termination
                click: fn,     // not sure, but just to be safe
                dblclick: fn,  // not sure again
                scope: me
            });

            if (Ext.isGecko) {
                Ext.EventManager.on(doc, 'keypress', me.applyCommand, me);
            }
            if (me.fixKeys) {
                Ext.EventManager.on(doc, 'keydown', me.fixKeys, me);
            }

            // We need to be sure we remove all our events from the iframe on unload or we're going to LEAK!
            Ext.EventManager.on(window, 'unload', me.beforeDestroy, me);
            doc.editorInitialized = true;

            me.initialized = true;
            me.pushValue();
            me.setReadOnly(me.readOnly);
            me.fireEvent('initialize', me);
        } catch(ex) {
            // ignore (why?)
        }
    },

    // private
    beforeDestroy : function(){
        var me = this,
            monitorTask = me.monitorTask,
            doc, prop;

        if (monitorTask) {
            Ext.TaskManager.stop(monitorTask);
        }
        if (me.rendered) {
            try {
                doc = me.getDoc();
                if (doc) {
                    // removeAll() doesn't currently know how to handle iframe document,
                    // so for now we have to wrap it in an Ext.Element using Ext.fly,
                    // or else IE6/7 will leak big time when the page is refreshed.
                    // TODO: this may not be needed once we find a more permanent fix.
                    // see EXTJSIV-5891.
                    Ext.EventManager.removeAll(Ext.fly(doc));
                    for (prop in doc) {
                        if (doc.hasOwnProperty && doc.hasOwnProperty(prop)) {
                            delete doc[prop];
                        }
                    }
                }
            } catch(e) {
                // ignore (why?)
            }
            Ext.destroyMembers(me, 'toolbar', 'iframeEl', 'textareaEl');
        }
        me.callParent();
    },

    // private
    onRelayedEvent: function (event) {
        // relay event from the iframe's document to the document that owns the iframe...

        var iframeEl = this.iframeEl,
            iframeXY = iframeEl.getXY(),
            eventXY = event.getXY();

        // the event from the inner document has XY relative to that document's origin,
        // so adjust it to use the origin of the iframe in the outer document:
        event.xy = [iframeXY[0] + eventXY[0], iframeXY[1] + eventXY[1]];

        event.injectEvent(iframeEl); // blame the iframe for the event...

        event.xy = eventXY; // restore the original XY (just for safety)
    },

    // private
    onFirstFocus : function(){
        var me = this,
            selection, range;
        me.activated = true;
        me.disableItems(me.readOnly);
        if (Ext.isGecko) { // prevent silly gecko errors
            me.win.focus();
            selection = me.win.getSelection();
            if (!selection.focusNode || selection.focusNode.nodeType !== 3) {
                range = selection.getRangeAt(0);
                range.selectNodeContents(me.getEditorBody());
                range.collapse(true);
                me.deferFocus();
            }
            try {
                me.execCmd('useCSS', true);
                me.execCmd('styleWithCSS', false);
            } catch(e) {
                // ignore (why?)
            }
        }
        me.fireEvent('activate', me);
    },

    // private
    adjustFont: function(btn) {
        var adjust = btn.getItemId() === 'increasefontsize' ? 1 : -1,
            size = this.getDoc().queryCommandValue('FontSize') || '2',
            isPxSize = Ext.isString(size) && size.indexOf('px') !== -1,
            isSafari;
        size = parseInt(size, 10);
        if (isPxSize) {
            // Safari 3 values
            // 1 = 10px, 2 = 13px, 3 = 16px, 4 = 18px, 5 = 24px, 6 = 32px
            if (size <= 10) {
                size = 1 + adjust;
            }
            else if (size <= 13) {
                size = 2 + adjust;
            }
            else if (size <= 16) {
                size = 3 + adjust;
            }
            else if (size <= 18) {
                size = 4 + adjust;
            }
            else if (size <= 24) {
                size = 5 + adjust;
            }
            else {
                size = 6 + adjust;
            }
            size = Ext.Number.constrain(size, 1, 6);
        } else {
            isSafari = Ext.isSafari;
            if (isSafari) { // safari
                adjust *= 2;
            }
            size = Math.max(1, size + adjust) + (isSafari ? 'px' : 0);
        }
        this.execCmd('FontSize', size);
    },

    // private
    onEditorEvent: function(e) {
        this.updateToolbar();
    },

    /**
     * Triggers a toolbar update by reading the markup state of the current selection in the editor.
     * @protected
     */
    updateToolbar: function() {
        var me = this,
            btns, doc, name, fontSelect;

        if (me.readOnly) {
            return;
        }

        if (!me.activated) {
            me.onFirstFocus();
            return;
        }

        btns = me.getToolbar().items.map;
        doc = me.getDoc();

        if (me.enableFont && !Ext.isSafari2) {
            name = (doc.queryCommandValue('FontName') || me.defaultFont).toLowerCase();
            fontSelect = me.fontSelect.dom;
            if (name !== fontSelect.value) {
                fontSelect.value = name;
            }
        }

        function updateButtons() {
            for (var i = 0, l = arguments.length, name; i < l; i++) {
                name = arguments[i];
                btns[name].toggle(doc.queryCommandState(name));
            }
        }
        if(me.enableFormat){
            updateButtons('bold', 'italic', 'underline');
        }
        if(me.enableAlignments){
            updateButtons('justifyleft', 'justifycenter', 'justifyright');
        }
        if(!Ext.isSafari2 && me.enableLists){
            updateButtons('insertorderedlist', 'insertunorderedlist');
        }

        Ext.menu.Manager.hideAll();

        me.syncValue();
    },

    // private
    relayBtnCmd: function(btn) {
        this.relayCmd(btn.getItemId());
    },

    /**
     * Executes a Midas editor command on the editor document and performs necessary focus and toolbar updates.
     * **This should only be called after the editor is initialized.**
     * @param {String} cmd The Midas command
     * @param {String/Boolean} [value=null] The value to pass to the command
     */
    relayCmd: function(cmd, value) {
        Ext.defer(function() {
            var me = this;
            me.focus();
            me.execCmd(cmd, value);
            me.updateToolbar();
        }, 10, this);
    },

    /**
     * Executes a Midas editor command directly on the editor document. For visual commands, you should use
     * {@link #relayCmd} instead. **This should only be called after the editor is initialized.**
     * @param {String} cmd The Midas command
     * @param {String/Boolean} [value=null] The value to pass to the command
     */
    execCmd : function(cmd, value){
        var me = this,
            doc = me.getDoc(),
            undef;
        doc.execCommand(cmd, false, value === undef ? null : value);
        me.syncValue();
    },

    // private
    applyCommand : function(e){
        if (e.ctrlKey) {
            var me = this,
                c = e.getCharCode(), cmd;
            if (c > 0) {
                c = String.fromCharCode(c);
                switch (c) {
                    case 'b':
                        cmd = 'bold';
                    break;
                    case 'i':
                        cmd = 'italic';
                    break;
                    case 'u':
                        cmd = 'underline';
                    break;
                }
                if (cmd) {
                    me.win.focus();
                    me.execCmd(cmd);
                    me.deferFocus();
                    e.preventDefault();
                }
            }
        }
    },

    /**
     * Inserts the passed text at the current cursor position.
     * Note: the editor must be initialized and activated to insert text.
     * @param {String} text
     */
    insertAtCursor : function(text){
        var me = this,
            range;

        if (me.activated) {
            me.win.focus();
            if (Ext.isIE) {
                range = me.getDoc().selection.createRange();
                if (range) {
                    range.pasteHTML(text);
                    me.syncValue();
                    me.deferFocus();
                }
            }else{
                me.execCmd('InsertHTML', text);
                me.deferFocus();
            }
        }
    },

    // private
    fixKeys: (function() { // load time branching for fastest keydown performance
        if (Ext.isIE) {
            return function(e){
                var me = this,
                    k = e.getKey(),
                    doc = me.getDoc(),
                    readOnly = me.readOnly,
                    range, target;

                if (k === e.TAB) {
                    e.stopEvent();
                    if (!readOnly) {
                        range = doc.selection.createRange();
                        if(range){
                            range.collapse(true);
                            range.pasteHTML('&#160;&#160;&#160;&#160;');
                            me.deferFocus();
                        }
                    }
                }
                else if (k === e.ENTER) {
                    if (!readOnly) {
                        range = doc.selection.createRange();
                        if (range) {
                            target = range.parentElement();
                            if(!target || target.tagName.toLowerCase() !== 'li'){
                                e.stopEvent();
                                range.pasteHTML('<br />');
                                range.collapse(false);
                                range.select();
                            }
                        }
                    }
                }
            };
        }

        if (Ext.isOpera) {
            return function(e){
                var me = this;
                if (e.getKey() === e.TAB) {
                    e.stopEvent();
                    if (!me.readOnly) {
                        me.win.focus();
                        me.execCmd('InsertHTML','&#160;&#160;&#160;&#160;');
                        me.deferFocus();
                    }
                }
            };
        }

        if (Ext.isWebKit) {
            return function(e){
                var me = this,
                    k = e.getKey(),
                    readOnly = me.readOnly;

                if (k === e.TAB) {
                    e.stopEvent();
                    if (!readOnly) {
                        me.execCmd('InsertText','\t');
                        me.deferFocus();
                    }
                }
                else if (k === e.ENTER) {
                    e.stopEvent();
                    if (!readOnly) {
                        me.execCmd('InsertHtml','<br /><br />');
                        me.deferFocus();
                    }
                }
            };
        }

        return null; // not needed, so null
    }()),

    /**
     * Returns the editor's toolbar. **This is only available after the editor has been rendered.**
     * @return {Ext.toolbar.Toolbar}
     */
    getToolbar : function(){
        return this.toolbar;
    },

    //<locale>
    /**
     * @property {Object} buttonTips
     * Object collection of toolbar tooltips for the buttons in the editor. The key is the command id associated with
     * that button and the value is a valid QuickTips object. For example:
     *
     *     {
     *         bold : {
     *             title: 'Bold (Ctrl+B)',
     *             text: 'Make the selected text bold.',
     *             cls: 'x-html-editor-tip'
     *         },
     *         italic : {
     *             title: 'Italic (Ctrl+I)',
     *             text: 'Make the selected text italic.',
     *             cls: 'x-html-editor-tip'
     *         },
     *         ...
     */
    buttonTips : {
        bold : {
            title: 'Bold (Ctrl+B)',
            text: 'Make the selected text bold.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        italic : {
            title: 'Italic (Ctrl+I)',
            text: 'Make the selected text italic.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        underline : {
            title: 'Underline (Ctrl+U)',
            text: 'Underline the selected text.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        increasefontsize : {
            title: 'Grow Text',
            text: 'Increase the font size.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        decreasefontsize : {
            title: 'Shrink Text',
            text: 'Decrease the font size.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        backcolor : {
            title: 'Text Highlight Color',
            text: 'Change the background color of the selected text.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        forecolor : {
            title: 'Font Color',
            text: 'Change the color of the selected text.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        justifyleft : {
            title: 'Align Text Left',
            text: 'Align text to the left.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        justifycenter : {
            title: 'Center Text',
            text: 'Center text in the editor.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        justifyright : {
            title: 'Align Text Right',
            text: 'Align text to the right.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        insertunorderedlist : {
            title: 'Bullet List',
            text: 'Start a bulleted list.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        insertorderedlist : {
            title: 'Numbered List',
            text: 'Start a numbered list.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        createlink : {
            title: 'Hyperlink',
            text: 'Make the selected text a hyperlink.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        sourceedit : {
            title: 'Source Edit',
            text: 'Switch to source editing mode.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        }
    }
    //</locale>

    // hide stuff that is not compatible
    /**
     * @event blur
     * @private
     */
    /**
     * @event focus
     * @private
     */
    /**
     * @event specialkey
     * @private
     */
    /**
     * @cfg {String} fieldCls
     * @private
     */
    /**
     * @cfg {String} focusCls
     * @private
     */
    /**
     * @cfg {String} autoCreate
     * @private
     */
    /**
     * @cfg {String} inputType
     * @private
     */
    /**
     * @cfg {String} invalidCls
     * @private
     */
    /**
     * @cfg {String} invalidText
     * @private
     */
    /**
     * @cfg {String} msgFx
     * @private
     */
    /**
     * @cfg {Boolean} allowDomMove
     * @private
     */
    /**
     * @cfg {String} applyTo
     * @private
     */
    /**
     * @cfg {String} readOnly
     * @private
     */
    /**
     * @cfg {String} tabIndex
     * @private
     */
    /**
     * @method validate
     * @private
     */
});
