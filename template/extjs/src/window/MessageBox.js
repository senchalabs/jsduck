/**
 * Utility class for generating different styles of message boxes.  The singleton instance, Ext.MessageBox
 * alias `Ext.Msg` can also be used.
 *
 * Note that a MessageBox is asynchronous.  Unlike a regular JavaScript `alert` (which will halt
 * browser execution), showing a MessageBox will not cause the code to stop.  For this reason, if you have code
 * that should only run *after* some user feedback from the MessageBox, you must use a callback function
 * (see the `function` parameter for {@link #method-show} for more details).
 *
 * Basic alert
 *
 *     @example
 *     Ext.Msg.alert('Status', 'Changes saved successfully.');
 *
 * Prompt for user data and process the result using a callback
 *
 *     @example
 *     Ext.Msg.prompt('Name', 'Please enter your name:', function(btn, text){
 *         if (btn == 'ok'){
 *             // process text value and close...
 *         }
 *     });
 *
 * Show a dialog using config options
 *
 *     @example
 *     Ext.Msg.show({
 *          title:'Save Changes?',
 *          msg: 'You are closing a tab that has unsaved changes. Would you like to save your changes?',
 *          buttons: Ext.Msg.YESNOCANCEL,
 *          icon: Ext.Msg.QUESTION
 *     });
 */
Ext.define('Ext.window.MessageBox', {
    extend: 'Ext.window.Window',

    requires: [
        'Ext.toolbar.Toolbar',
        'Ext.form.field.Text',
        'Ext.form.field.TextArea',
        'Ext.form.field.Display',
        'Ext.button.Button',
        'Ext.layout.container.Anchor',
        'Ext.layout.container.HBox',
        'Ext.ProgressBar'
    ],

    alias: 'widget.messagebox',

    /**
     * @property
     * Button config that displays a single OK button
     */
    OK : 1,
    /**
     * @property
     * Button config that displays a single Yes button
     */
    YES : 2,
    /**
     * @property
     * Button config that displays a single No button
     */
    NO : 4,
    /**
     * @property
     * Button config that displays a single Cancel button
     */
    CANCEL : 8,
    /**
     * @property
     * Button config that displays OK and Cancel buttons
     */
    OKCANCEL : 9,
    /**
     * @property
     * Button config that displays Yes and No buttons
     */
    YESNO : 6,
    /**
     * @property
     * Button config that displays Yes, No and Cancel buttons
     */
    YESNOCANCEL : 14,
    /**
     * @property
     * The CSS class that provides the INFO icon image
     */
    INFO : Ext.baseCSSPrefix + 'message-box-info',
    /**
     * @property
     * The CSS class that provides the WARNING icon image
     */
    WARNING : Ext.baseCSSPrefix + 'message-box-warning',
    /**
     * @property
     * The CSS class that provides the QUESTION icon image
     */
    QUESTION : Ext.baseCSSPrefix + 'message-box-question',
    /**
     * @property
     * The CSS class that provides the ERROR icon image
     */
    ERROR : Ext.baseCSSPrefix + 'message-box-error',

    // hide it by offsets. Windows are hidden on render by default.
    hideMode: 'offsets',
    closeAction: 'hide',
    resizable: false,
    title: '&#160;',

    width: 600,
    height: 500,
    minWidth: 250,
    maxWidth: 600,
    minHeight: 110,
    maxHeight: 500,
    constrain: true,

    cls: Ext.baseCSSPrefix + 'message-box',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    /**
     * @property
     * The default height in pixels of the message box's multiline textarea if displayed.
     */
    defaultTextHeight : 75,
    /**
     * @property
     * The minimum width in pixels of the message box if it is a progress-style dialog.  This is useful
     * for setting a different minimum width than text-only dialogs may need.
     */
    minProgressWidth : 250,
    /**
     * @property
     * The minimum width in pixels of the message box if it is a prompt dialog.  This is useful
     * for setting a different minimum width than text-only dialogs may need.
     */
    minPromptWidth: 250,
    //<locale type="object">
    /**
     * @property
     * An object containing the default button text strings that can be overriden for localized language support.
     * Supported properties are: ok, cancel, yes and no.  Generally you should include a locale-specific
     * resource file for handling language support across the framework.
     * Customize the default text like so:
     *
     *     Ext.window.MessageBox.buttonText.yes = "oui"; //french
     */
    buttonText: {
        ok: 'OK',
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel'
    },
    //</locale>

    buttonIds: [
        'ok', 'yes', 'no', 'cancel'
    ],

    //<locale type="object">
    titleText: {
        confirm: 'Confirm',
        prompt: 'Prompt',
        wait: 'Loading...',
        alert: 'Attention'
    },
    //</locale>

    iconHeight: 35,

    makeButton: function(btnIdx) {
        var btnId = this.buttonIds[btnIdx];
        return new Ext.button.Button({
            handler: this.btnCallback,
            itemId: btnId,
            scope: this,
            text: this.buttonText[btnId],
            minWidth: 75
        });
    },

    btnCallback: function(btn) {
        var me = this,
            value,
            field;

        if (me.cfg.prompt || me.cfg.multiline) {
            if (me.cfg.multiline) {
                field = me.textArea;
            } else {
                field = me.textField;
            }
            value = field.getValue();
            field.reset();
        }

        // Important not to have focus remain in the hidden Window; Interferes with DnD.
        btn.blur();
        me.hide();
        me.userCallback(btn.itemId, value, me.cfg);
    },

    hide: function() {
        var me = this;
        me.dd.endDrag();
        me.progressBar.reset();
        me.removeCls(me.cfg.cls);
        me.callParent(arguments);
    },

    initComponent: function() {
        var me = this,
            baseId = me.id,
            i, button,
            tbLayout;

        me.title = '&#160;';

        me.topContainer = new Ext.container.Container({
            layout: 'hbox',
            style: {
                padding: '10px',
                overflow: 'hidden'
            },
            items: [
                me.iconComponent = new Ext.Component({
                    cls: me.baseCls + '-icon',
                    width: 50,
                    height: me.iconHeight
                }),
                me.promptContainer = new Ext.container.Container({
                    flex: 1,
                    layout: {
                        type: 'anchor'
                    },
                    items: [
                        me.msg = new Ext.form.field.Display({
                            id: baseId + '-displayfield',
                            cls: me.baseCls + '-text'
                        }),
                        me.textField = new Ext.form.field.Text({
                            id: baseId + '-testfield',
                            anchor: '100%',
                            enableKeyEvents: true,
                            listeners: {
                                keydown: me.onPromptKey,
                                scope: me
                            }
                        }),
                        me.textArea = new Ext.form.field.TextArea({
                            id: baseId + '-textarea',
                            anchor: '100%',
                            height: 75
                        })
                    ]
                })
            ]
        });
        me.progressBar = new Ext.ProgressBar({
            id: baseId + '-progressbar',
            margins: '0 10 0 10'
        });

        me.items = [me.topContainer, me.progressBar];

        // Create the buttons based upon passed bitwise config
        me.msgButtons = [];
        for (i = 0; i < 4; i++) {
            button = me.makeButton(i);
            me.msgButtons[button.itemId] = button;
            me.msgButtons.push(button);
        }
        me.bottomTb = new Ext.toolbar.Toolbar({
            id: baseId + '-toolbar',
            ui: 'footer',
            dock: 'bottom',
            layout: {
                pack: 'center'
            },
            items: [
                me.msgButtons[0],
                me.msgButtons[1],
                me.msgButtons[2],
                me.msgButtons[3]
            ]
        });
        me.dockedItems = [me.bottomTb];

        // Get control at Toolbar's finishedLayout call and snag the contentWidth to contribute to our auto width calculation
        tbLayout = me.bottomTb.getLayout();
        tbLayout.finishedLayout = Ext.Function.createInterceptor(tbLayout.finishedLayout, function(ownerContext) {
            me.tbWidth = ownerContext.getProp('contentWidth');
        });
        me.on('close', me.onClose, me);

        me.callParent();
    },
    
    onClose: function(){
        var btn = this.header.child('[type=close]');
        // Give a temporary itemId so it can act like the cancel button
        btn.itemId = 'cancel';
        this.btnCallback(btn);
        delete btn.itemId;
    },

    onPromptKey: function(textField, e) {
        var me = this,
            blur;

        if (e.keyCode === Ext.EventObject.RETURN || e.keyCode === 10) {
            if (me.msgButtons.ok.isVisible()) {
                blur = true;
                me.msgButtons.ok.handler.call(me, me.msgButtons.ok);
            } else if (me.msgButtons.yes.isVisible()) {
                me.msgButtons.yes.handler.call(me, me.msgButtons.yes);
                blur = true;
            }

            if (blur) {
                me.textField.blur();
            }
        }
    },

    reconfigure: function(cfg) {
        var me = this,
            buttons = 0,
            hideToolbar = true,
            initialWidth = me.maxWidth,
            oldButtonText = me.buttonText,
            i;

        // Restore default buttonText before reconfiguring.
        me.updateButtonText();

        cfg = cfg || {};
        me.cfg = cfg;
        if (cfg.width) {
            initialWidth = cfg.width;
        }

        // Default to allowing the Window to take focus.
        delete me.defaultFocus;

        // clear any old animateTarget
        me.animateTarget = cfg.animateTarget || undefined;

        // Defaults to modal
        me.modal = cfg.modal !== false;

        // Show the title
        if (cfg.title) {
            me.setTitle(cfg.title||'&#160;');
        }

        // Extract button configs
        if (Ext.isObject(cfg.buttons)) {
            me.buttonText = cfg.buttons;
            buttons = 0;
        } else {
            me.buttonText = cfg.buttonText || me.buttonText;
            buttons = Ext.isNumber(cfg.buttons) ? cfg.buttons : 0;
        }

        // Apply custom-configured buttonText
        // Infer additional buttons from the specified property names in the buttonText object
        buttons = buttons | me.updateButtonText();

        // Restore buttonText. Next run of reconfigure will restore to prototype's buttonText
        me.buttonText = oldButtonText;

        // During the on render, or size resetting layouts, and in subsequent hiding and showing, we need to
        // suspend layouts, and flush at the end when the Window's children are at their final visibility.
        Ext.suspendLayouts();
        me.hidden = false;
        if (!me.rendered) {
            me.width = initialWidth;
            me.render(Ext.getBody());
        } else {
            me.setSize(initialWidth, me.maxHeight);
        }

        // Hide or show the close tool
        me.closable = cfg.closable && !cfg.wait;
        me.header.child('[type=close]').setVisible(cfg.closable !== false);

        // Hide or show the header
        if (!cfg.title && !me.closable) {
            me.header.hide();
        } else {
            me.header.show();
        }

        // Default to dynamic drag: drag the window, not a ghost
        me.liveDrag = !cfg.proxyDrag;

        // wrap the user callback
        me.userCallback = Ext.Function.bind(cfg.callback ||cfg.fn || Ext.emptyFn, cfg.scope || Ext.global);

        // Hide or show the icon Component
        me.setIcon(cfg.icon);

        // Hide or show the message area
        if (cfg.msg) {
            me.msg.setValue(cfg.msg);
            me.msg.show();
        } else {
            me.msg.hide();
        }

        // flush the layout here to pick up
        // height adjustments on the msg field
        Ext.resumeLayouts(true);
        Ext.suspendLayouts();

        // Hide or show the input field
        if (cfg.prompt || cfg.multiline) {
            me.multiline = cfg.multiline;
            if (cfg.multiline) {
                me.textArea.setValue(cfg.value);
                me.textArea.setHeight(cfg.defaultTextHeight || me.defaultTextHeight);
                me.textArea.show();
                me.textField.hide();
                me.defaultFocus = me.textArea;
            } else {
                me.textField.setValue(cfg.value);
                me.textArea.hide();
                me.textField.show();
                me.defaultFocus = me.textField;
            }
        } else {
            me.textArea.hide();
            me.textField.hide();
        }

        // Hide or show the progress bar
        if (cfg.progress || cfg.wait) {
            me.progressBar.show();
            me.updateProgress(0, cfg.progressText);
            if(cfg.wait === true){
                me.progressBar.wait(cfg.waitConfig);
            }
        } else {
            me.progressBar.hide();
        }

        // Hide or show buttons depending on flag value sent.
        for (i = 0; i < 4; i++) {
            if (buttons & Math.pow(2, i)) {

                // Default to focus on the first visible button if focus not already set
                if (!me.defaultFocus) {
                    me.defaultFocus = me.msgButtons[i];
                }
                me.msgButtons[i].show();
                hideToolbar = false;
            } else {
                me.msgButtons[i].hide();
            }
        }

        // Hide toolbar if no buttons to show
        if (hideToolbar) {
            me.bottomTb.hide();
        } else {
            me.bottomTb.show();
        }
        Ext.resumeLayouts(true);
    },

    /**
     * @private
     * Set button text according to current buttonText property object
     * @return {Number} The buttons bitwise flag based upon the button IDs specified in the buttonText property.
     */
    updateButtonText: function() {
        var me = this,
            buttonText = me.buttonText,
            buttons = 0,
            btnId,
            btn;

        for (btnId in buttonText) {
            if (buttonText.hasOwnProperty(btnId)) {
                btn = me.msgButtons[btnId];
                if (btn) {
                    if (me.cfg && me.cfg.buttonText) {
                        buttons = buttons | Math.pow(2, Ext.Array.indexOf(me.buttonIds, btnId));
                    }
                    if (btn.text != buttonText[btnId]) {
                        btn.setText(buttonText[btnId]);
                    }
                }
            }
        }
        return buttons;
    },

    /**
     * Displays a new message box, or reinitializes an existing message box, based on the config options passed in. All
     * display functions (e.g. prompt, alert, etc.) on MessageBox call this function internally, although those calls
     * are basic shortcuts and do not support all of the config options allowed here.
     *
     * Example usage:
     *
     *     Ext.Msg.show({
     *         title: 'Address',
     *         msg: 'Please enter your address:',
     *         width: 300,
     *         buttons: Ext.Msg.OKCANCEL,
     *         multiline: true,
     *         fn: saveAddress,
     *         animateTarget: 'addAddressBtn',
     *         icon: Ext.window.MessageBox.INFO
     *     });
     *
     * @param {Object} config The following config options are supported:
     *
     * @param {String/Ext.dom.Element} config.animateTarget
     * An id or Element from which the message box should animate as it opens and closes.
     *
     * @param {Number} [config.buttons=false]
     * A bitwise button specifier consisting of the sum of any of the following constants:
     *
     *  - Ext.MessageBox.OK
     *  - Ext.MessageBox.YES
     *  - Ext.MessageBox.NO
     *  - Ext.MessageBox.CANCEL
     *
     * Some common combinations have already been predefined:
     *
     *  - Ext.MessageBox.OKCANCEL
     *  - Ext.MessageBox.YESNO
     *  - Ext.MessageBox.YESNOCANCEL
     *
     * Or false to not show any buttons.
     *
     * This may also be specified as an object hash containing custom button text in the same format as the
     * {@link #buttonText} config. Button IDs present as property names will be made visible.
     *
     * @param {Boolean} config.closable
     * False to hide the top-right close button (defaults to true). Note that progress and wait dialogs will ignore this
     * property and always hide the close button as they can only be closed programmatically.
     *
     * @param {String} config.cls
     * A custom CSS class to apply to the message box's container element
     *
     * @param {Number} [config.defaultTextHeight=75]
     * The default height in pixels of the message box's multiline textarea if displayed.
     *
     * @param {Function} config.fn
     * A callback function which is called when the dialog is dismissed either by clicking on the configured buttons, or
     * on the dialog close button, or by pressing the return button to enter input.
     *
     * Progress and wait dialogs will ignore this option since they do not respond to user actions and can only be
     * closed programmatically, so any required function should be called by the same code after it closes the dialog.
     * Parameters passed:
     *
     *  @param {String} config.fn.buttonId The ID of the button pressed, one of:
     *
     * - ok
     * - yes
     * - no
     * - cancel
     *
     *  @param {String} config.fn.text Value of the input field if either `prompt` or `multiline` is true
     *  @param {Object} config.fn.opt The config object passed to show.
     *
     * @param {Object} config.buttonText
     * An object containing string properties which override the system-supplied button text values just for this
     * invocation. The property names are:
     *
     * - ok
     * - yes
     * - no
     * - cancel
     *
     * @param {Object} config.scope
     * The scope (`this` reference) in which the function will be executed.
     *
     * @param {String} config.icon
     * A CSS class that provides a background image to be used as the body icon for the dialog.
     * One can use a predefined icon class:
     *
     *  - Ext.MessageBox.INFO
     *  - Ext.MessageBox.WARNING
     *  - Ext.MessageBox.QUESTION
     *  - Ext.MessageBox.ERROR
     *
     * or use just any `'custom-class'`. Defaults to empty string.
     *
     * @param {String} config.iconCls
     * The standard {@link Ext.window.Window#iconCls} to add an optional header icon (defaults to '')
     *
     * @param {Number} config.maxWidth
     * The maximum width in pixels of the message box (defaults to 600)
     *
     * @param {Number} config.minWidth
     * The minimum width in pixels of the message box (defaults to 100)
     *
     * @param {Boolean} config.modal
     * False to allow user interaction with the page while the message box is displayed (defaults to true)
     *
     * @param {String} config.msg
     * A string that will replace the existing message box body text (defaults to the XHTML-compliant non-breaking space
     * character '&#160;')
     *
     * @param {Boolean} config.multiline
     * True to prompt the user to enter multi-line text (defaults to false)
     *
     * @param {Boolean} config.progress
     * True to display a progress bar (defaults to false)
     *
     * @param {String} config.progressText
     * The text to display inside the progress bar if progress = true (defaults to '')
     *
     * @param {Boolean} config.prompt
     * True to prompt the user to enter single-line text (defaults to false)
     *
     * @param {Boolean} config.proxyDrag
     * True to display a lightweight proxy while dragging (defaults to false)
     *
     * @param {String} config.title
     * The title text
     *
     * @param {String} config.value
     * The string value to set into the active textbox element if displayed
     *
     * @param {Boolean} config.wait
     * True to display a progress bar (defaults to false)
     *
     * @param {Object} config.waitConfig
     * A {@link Ext.ProgressBar#wait} config object (applies only if wait = true)
     *
     * @param {Number} config.width
     * The width of the dialog in pixels
     *
     * @return {Ext.window.MessageBox} this
     */
    show: function(cfg) {
        var me = this;

        me.reconfigure(cfg);
        me.addCls(cfg.cls);
        me.doAutoSize();

        // Set the flag, so that the parent show method performs the show procedure that we need.
        // ie: animation from animTarget, onShow processing and focusing.
        me.hidden = true;
        me.callParent();
        return me;
    },

    onShow: function() {
        this.callParent(arguments);
        this.center();
    },

    doAutoSize: function() {
        var me = this,
            headerVisible = me.header.rendered && me.header.isVisible(),
            footerVisible = me.bottomTb.rendered && me.bottomTb.isVisible(),
            width,
            height;

        if (!Ext.isDefined(me.frameWidth)) {
            me.frameWidth = me.el.getWidth() - me.body.getWidth();
        }

        // Allow per-invocation override of minWidth
        me.minWidth = me.cfg.minWidth || Ext.getClass(this).prototype.minWidth;

        // Width must be max of titleWidth, message+icon width, and total button width
        width = Math.max(
            headerVisible ? me.header.getMinWidth() : 0,                            // title width
            me.cfg.width || me.msg.getWidth() + me.iconComponent.getWidth() + 25,   // msg + icon width + topContainer's layout padding */
            (footerVisible ? me.tbWidth : 0)// total button width
        );

        height = (headerVisible ? me.header.getHeight() : 0) +
            me.topContainer.getHeight() +
            me.progressBar.getHeight() +
            (footerVisible ? me.bottomTb.getHeight() + me.bottomTb.el.getMargin('tb') : 0);

        me.setSize(width + me.frameWidth, height + me.frameWidth);
        return me;
    },

    updateText: function(text) {
        this.msg.setValue(text);
        return this.doAutoSize(true);
    },

    /**
     * Adds the specified icon to the dialog.  By default, the class 'x-messagebox-icon' is applied for default
     * styling, and the class passed in is expected to supply the background image url. Pass in empty string ('')
     * to clear any existing icon. This method must be called before the MessageBox is shown.
     * The following built-in icon classes are supported, but you can also pass in a custom class name:
     *
     *     Ext.window.MessageBox.INFO
     *     Ext.window.MessageBox.WARNING
     *     Ext.window.MessageBox.QUESTION
     *     Ext.window.MessageBox.ERROR
     *
     * @param {String} icon A CSS classname specifying the icon's background image url, or empty string to clear the icon
     * @return {Ext.window.MessageBox} this
     */
    setIcon : function(icon) {
        var me = this;
        me.iconComponent.removeCls(me.messageIconCls);
        if (icon) {
            me.iconComponent.show();
            me.iconComponent.addCls(Ext.baseCSSPrefix + 'dlg-icon');
            me.iconComponent.addCls(me.messageIconCls = icon);
        } else {
            me.iconComponent.removeCls(Ext.baseCSSPrefix + 'dlg-icon');
            me.iconComponent.hide();
        }
        return me;
    },

    /**
     * Updates a progress-style message box's text and progress bar. Only relevant on message boxes
     * initiated via {@link Ext.window.MessageBox#progress} or {@link Ext.window.MessageBox#wait},
     * or by calling {@link Ext.window.MessageBox#method-show} with progress: true.
     *
     * @param {Number} [value=0] Any number between 0 and 1 (e.g., .5)
     * @param {String} [progressText=''] The progress text to display inside the progress bar.
     * @param {String} [msg] The message box's body text is replaced with the specified string (defaults to undefined
     * so that any existing body text will not get overwritten by default unless a new value is passed in)
     * @return {Ext.window.MessageBox} this
     */
    updateProgress : function(value, progressText, msg){
        this.progressBar.updateProgress(value, progressText);
        if (msg){
            this.updateText(msg);
        }
        return this;
    },

    onEsc: function() {
        if (this.closable !== false) {
            this.callParent(arguments);
        }
    },

    /**
     * Displays a confirmation message box with Yes and No buttons (comparable to JavaScript's confirm).
     * If a callback function is passed it will be called after the user clicks either button,
     * and the id of the button that was clicked will be passed as the only parameter to the callback
     * (could also be the top-right close button, which will always report as "cancel").
     *
     * @param {String} title The title bar text
     * @param {String} msg The message box body text
     * @param {Function} [fn] The callback function invoked after the message box is closed.
     * See {@link #method-show} method for details.
     * @param {Object} [scope=window] The scope (`this` reference) in which the callback is executed.
     * @return {Ext.window.MessageBox} this
     */
    confirm: function(cfg, msg, fn, scope) {
        if (Ext.isString(cfg)) {
            cfg = {
                title: cfg,
                icon: this.QUESTION,
                msg: msg,
                buttons: this.YESNO,
                callback: fn,
                scope: scope
            };
        }
        return this.show(cfg);
    },

    /**
     * Displays a message box with OK and Cancel buttons prompting the user to enter some text (comparable to JavaScript's prompt).
     * The prompt can be a single-line or multi-line textbox.  If a callback function is passed it will be called after the user
     * clicks either button, and the id of the button that was clicked (could also be the top-right
     * close button, which will always report as "cancel") and the text that was entered will be passed as the two parameters to the callback.
     *
     * @param {String} title The title bar text
     * @param {String} msg The message box body text
     * @param {Function} [fn] The callback function invoked after the message box is closed.
     * See {@link #method-show} method for details.
     * @param {Object} [scope=window] The scope (`this` reference) in which the callback is executed.
     * @param {Boolean/Number} [multiline=false] True to create a multiline textbox using the defaultTextHeight
     * property, or the height in pixels to create the textbox/
     * @param {String} [value=''] Default value of the text input element
     * @return {Ext.window.MessageBox} this
     */
    prompt : function(cfg, msg, fn, scope, multiline, value){
        if (Ext.isString(cfg)) {
            cfg = {
                prompt: true,
                title: cfg,
                minWidth: this.minPromptWidth,
                msg: msg,
                buttons: this.OKCANCEL,
                callback: fn,
                scope: scope,
                multiline: multiline,
                value: value
            };
        }
        return this.show(cfg);
    },

    /**
     * Displays a message box with an infinitely auto-updating progress bar.  This can be used to block user
     * interaction while waiting for a long-running process to complete that does not have defined intervals.
     * You are responsible for closing the message box when the process is complete.
     *
     * @param {String} msg The message box body text
     * @param {String} [title] The title bar text
     * @param {Object} [config] A {@link Ext.ProgressBar#wait} config object
     * @return {Ext.window.MessageBox} this
     */
    wait : function(cfg, title, config){
        if (Ext.isString(cfg)) {
            cfg = {
                title : title,
                msg : cfg,
                closable: false,
                wait: true,
                modal: true,
                minWidth: this.minProgressWidth,
                waitConfig: config
            };
        }
        return this.show(cfg);
    },

    /**
     * Displays a standard read-only message box with an OK button (comparable to the basic JavaScript alert prompt).
     * If a callback function is passed it will be called after the user clicks the button, and the
     * id of the button that was clicked will be passed as the only parameter to the callback
     * (could also be the top-right close button, which will always report as "cancel").
     *
     * @param {String} title The title bar text
     * @param {String} msg The message box body text
     * @param {Function} [fn] The callback function invoked after the message box is closed.
     * See {@link #method-show} method for details.
     * @param {Object} [scope=window] The scope (<code>this</code> reference) in which the callback is executed.
     * @return {Ext.window.MessageBox} this
     */
    alert: function(cfg, msg, fn, scope) {
        if (Ext.isString(cfg)) {
            cfg = {
                title : cfg,
                msg : msg,
                buttons: this.OK,
                fn: fn,
                scope : scope,
                minWidth: this.minWidth
            };
        }
        return this.show(cfg);
    },

    /**
     * Displays a message box with a progress bar.
     *
     * You are responsible for updating the progress bar as needed via {@link Ext.window.MessageBox#updateProgress}
     * and closing the message box when the process is complete.
     *
     * @param {String} title The title bar text
     * @param {String} msg The message box body text
     * @param {String} [progressText=''] The text to display inside the progress bar
     * @return {Ext.window.MessageBox} this
     */
    progress : function(cfg, msg, progressText){
        if (Ext.isString(cfg)) {
            cfg = {
                title: cfg,
                msg: msg,
                progress: true,
                progressText: progressText
            };
        }
        return this.show(cfg);
    }
}, function() {
    /**
     * @class Ext.MessageBox
     * @alternateClassName Ext.Msg
     * @extends Ext.window.MessageBox
     * @singleton
     * Singleton instance of {@link Ext.window.MessageBox}.
     */
    Ext.MessageBox = Ext.Msg = new this();
});