/**
 * The subclasses of this class provide actions to perform upon {@link Ext.form.Basic Form}s.
 *
 * Instances of this class are only created by a {@link Ext.form.Basic Form} when the Form needs to perform an action
 * such as submit or load. The Configuration options listed for this class are set through the Form's action methods:
 * {@link Ext.form.Basic#submit submit}, {@link Ext.form.Basic#load load} and {@link Ext.form.Basic#doAction doAction}
 *
 * The instance of Action which performed the action is passed to the success and failure callbacks of the Form's action
 * methods ({@link Ext.form.Basic#submit submit}, {@link Ext.form.Basic#load load} and
 * {@link Ext.form.Basic#doAction doAction}), and to the {@link Ext.form.Basic#actioncomplete actioncomplete} and
 * {@link Ext.form.Basic#actionfailed actionfailed} event handlers.
 */
Ext.define('Ext.form.action.Action', {
    alternateClassName: 'Ext.form.Action',

    /**
     * @cfg {Ext.form.Basic} form
     * The {@link Ext.form.Basic BasicForm} instance that is invoking this Action. Required.
     */

    /**
     * @cfg {String} url
     * The URL that the Action is to invoke. Will default to the {@link Ext.form.Basic#url url} configured on the
     * {@link #form}.
     */

    /**
     * @cfg {Boolean} reset
     * When set to **true**, causes the Form to be {@link Ext.form.Basic#reset reset} on Action success. If specified,
     * this happens before the {@link #success} callback is called and before the Form's
     * {@link Ext.form.Basic#actioncomplete actioncomplete} event fires.
     */

    /**
     * @cfg {String} method
     * The HTTP method to use to access the requested URL.
     * Defaults to the {@link Ext.form.Basic#method BasicForm's method}, or 'POST' if not specified.
     */

    /**
     * @cfg {Object/String} params
     * Extra parameter values to pass. These are added to the Form's {@link Ext.form.Basic#baseParams} and passed to the
     * specified URL along with the Form's input fields.
     *
     * Parameters are encoded as standard HTTP parameters using {@link Ext#urlEncode Ext.Object.toQueryString}.
     */

    /**
     * @cfg {Object} headers
     * Extra headers to be sent in the AJAX request for submit and load actions.
     * See {@link Ext.data.proxy.Ajax#headers}.
     */

    /**
     * @cfg {Number} timeout
     * The number of seconds to wait for a server response before failing with the {@link #failureType} as
     * {@link Ext.form.action.Action#CONNECT_FAILURE}. If not specified, defaults to the configured
     * {@link Ext.form.Basic#timeout timeout} of the {@link #form}.
     */

    /**
     * @cfg {Function} success
     * The function to call when a valid success return packet is received.
     * @cfg {Ext.form.Basic} success.form The form that requested the action
     * @cfg {Ext.form.action.Action} success.action The Action class. The {@link #result} property of this object may
     * be examined to perform custom postprocessing.
     */

    /**
     * @cfg {Function} failure
     * The function to call when a failure packet was received, or when an error ocurred in the Ajax communication.
     * @cfg {Ext.form.Basic} failure.form The form that requested the action
     * @cfg {Ext.form.action.Action} failure.action The Action class. If an Ajax error ocurred, the failure type will
     * be in {@link #failureType}. The {@link #result} property of this object may be examined to perform custom
     * postprocessing.
     */

    /**
     * @cfg {Object} scope
     * The scope in which to call the configured #success and #failure callback functions
     * (the `this` reference for the callback functions).
     */

    /**
     * @cfg {String} waitMsg
     * The message to be displayed by a call to {@link Ext.window.MessageBox#wait} during the time the action is being
     * processed.
     */

    /**
     * @cfg {String} waitTitle
     * The title to be displayed by a call to {@link Ext.window.MessageBox#wait} during the time the action is being
     * processed.
     */

    /**
     * @cfg {Boolean} submitEmptyText
     * If set to true, the emptyText value will be sent with the form when it is submitted.
     */
    submitEmptyText : true,

    /**
     * @property {String} type
     * The type of action this Action instance performs. Currently only "submit" and "load" are supported.
     */

    /**
     * @property {String} failureType
     * The type of failure detected will be one of these:
     * {@link #CLIENT_INVALID}, {@link #SERVER_INVALID}, {@link #CONNECT_FAILURE}, or {@link #LOAD_FAILURE}.
     *
     * Usage:
     *
     *     var fp = new Ext.form.Panel({
     *     ...
     *     buttons: [{
     *         text: 'Save',
     *         formBind: true,
     *         handler: function(){
     *             if(fp.getForm().isValid()){
     *                 fp.getForm().submit({
     *                     url: 'form-submit.php',
     *                     waitMsg: 'Submitting your data...',
     *                     success: function(form, action){
     *                         // server responded with success = true
     *                         var result = action.{@link #result};
     *                     },
     *                     failure: function(form, action){
     *                         if (action.{@link #failureType} === Ext.form.action.Action.CONNECT_FAILURE) {
     *                             Ext.Msg.alert('Error',
     *                                 'Status:'+action.{@link #response}.status+': '+
     *                                 action.{@link #response}.statusText);
     *                         }
     *                         if (action.failureType === Ext.form.action.Action.SERVER_INVALID){
     *                             // server responded with success = false
     *                             Ext.Msg.alert('Invalid', action.{@link #result}.errormsg);
     *                         }
     *                     }
     *                 });
     *             }
     *         }
     *     },{
     *         text: 'Reset',
     *         handler: function(){
     *             fp.getForm().reset();
     *         }
     *     }]
     */

    /**
     * @property {Object} response
     * The raw XMLHttpRequest object used to perform the action.
     */

    /**
     * @property {Object} result
     * The decoded response object containing a boolean `success` property and other, action-specific properties.
     */

    /**
     * Creates new Action.
     * @param {Object} [config] Config object.
     */
    constructor: function(config) {
        if (config) {
            Ext.apply(this, config);
        }

        // Normalize the params option to an Object
        var params = config.params;
        if (Ext.isString(params)) {
            this.params = Ext.Object.fromQueryString(params);
        }
    },

    /**
     * @method
     * Invokes this action using the current configuration.
     */
    run: Ext.emptyFn,

    /**
     * @private
     * @method onSuccess
     * Callback method that gets invoked when the action completes successfully. Must be implemented by subclasses.
     * @param {Object} response
     */

    /**
     * @private
     * @method handleResponse
     * Handles the raw response and builds a result object from it. Must be implemented by subclasses.
     * @param {Object} response
     */

    /**
     * @private
     * Handles a failure response.
     * @param {Object} response
     */
    onFailure : function(response){
        this.response = response;
        this.failureType = Ext.form.action.Action.CONNECT_FAILURE;
        this.form.afterAction(this, false);
    },

    /**
     * @private
     * Validates that a response contains either responseText or responseXML and invokes
     * {@link #handleResponse} to build the result object.
     * @param {Object} response The raw response object.
     * @return {Object/Boolean} The result object as built by handleResponse, or `true` if
     * the response had empty responseText and responseXML.
     */
    processResponse : function(response){
        this.response = response;
        if (!response.responseText && !response.responseXML) {
            return true;
        }
        return (this.result = this.handleResponse(response));
    },

    /**
     * @private
     * Build the URL for the AJAX request. Used by the standard AJAX submit and load actions.
     * @return {String} The URL.
     */
    getUrl: function() {
        return this.url || this.form.url;
    },

    /**
     * @private
     * Determine the HTTP method to be used for the request.
     * @return {String} The HTTP method
     */
    getMethod: function() {
        return (this.method || this.form.method || 'POST').toUpperCase();
    },

    /**
     * @private
     * Get the set of parameters specified in the BasicForm's baseParams and/or the params option.
     * Items in params override items of the same name in baseParams.
     * @return {Object} the full set of parameters
     */
    getParams: function() {
        return Ext.apply({}, this.params, this.form.baseParams);
    },

    /**
     * @private
     * Creates a callback object.
     */
    createCallback: function() {
        var me = this,
            undef,
            form = me.form;
        return {
            success: me.onSuccess,
            failure: me.onFailure,
            scope: me,
            timeout: (this.timeout * 1000) || (form.timeout * 1000),
            upload: form.fileUpload ? me.onSuccess : undef
        };
    },

    statics: {
        /**
         * @property
         * Failure type returned when client side validation of the Form fails thus aborting a submit action. Client
         * side validation is performed unless {@link Ext.form.action.Submit#clientValidation} is explicitly set to
         * false.
         * @static
         */
        CLIENT_INVALID: 'client',

        /**
         * @property
         * Failure type returned when server side processing fails and the {@link #result}'s `success` property is set to
         * false.
         *
         * In the case of a form submission, field-specific error messages may be returned in the {@link #result}'s
         * errors property.
         * @static
         */
        SERVER_INVALID: 'server',

        /**
         * @property
         * Failure type returned when a communication error happens when attempting to send a request to the remote
         * server. The {@link #response} may be examined to provide further information.
         * @static
         */
        CONNECT_FAILURE: 'connect',

        /**
         * @property
         * Failure type returned when the response's `success` property is set to false, or no field values are returned
         * in the response's data property.
         * @static
         */
        LOAD_FAILURE: 'load'


    }
});
