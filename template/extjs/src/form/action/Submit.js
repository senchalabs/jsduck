/**
 * A class which handles submission of data from {@link Ext.form.Basic Form}s and processes the returned response.
 *
 * Instances of this class are only created by a {@link Ext.form.Basic Form} when
 * {@link Ext.form.Basic#submit submit}ting.
 *
 * # Response Packet Criteria
 *
 * A response packet may contain:
 *
 *   - **`success`** property : Boolean - required.
 *
 *   - **`errors`** property : Object - optional, contains error messages for invalid fields.
 *
 * # JSON Packets
 *
 * By default, response packets are assumed to be JSON, so a typical response packet may look like this:
 *
 *     {
 *         success: false,
 *         errors: {
 *             clientCode: "Client not found",
 *             portOfLoading: "This field must not be null"
 *         }
 *     }
 *
 * Other data may be placed into the response for processing by the {@link Ext.form.Basic}'s callback or event handler
 * methods. The object decoded from this JSON is available in the {@link Ext.form.action.Action#result result} property.
 *
 * Alternatively, if an {@link Ext.form.Basic#errorReader errorReader} is specified as an
 * {@link Ext.data.reader.Xml XmlReader}:
 *
 *     errorReader: new Ext.data.reader.Xml({
 *             record : 'field',
 *             success: '@success'
 *         }, [
 *             'id', 'msg'
 *         ]
 *     )
 *
 * then the results may be sent back in XML format:
 *
 *     <?xml version="1.0" encoding="UTF-8"?>
 *     <message success="false">
 *     <errors>
 *         <field>
 *             <id>clientCode</id>
 *             <msg><![CDATA[Code not found. <br /><i>This is a test validation message from the server </i>]]></msg>
 *         </field>
 *         <field>
 *             <id>portOfLoading</id>
 *             <msg><![CDATA[Port not found. <br /><i>This is a test validation message from the server </i>]]></msg>
 *         </field>
 *     </errors>
 *     </message>
 *
 * Other elements may be placed into the response XML for processing by the {@link Ext.form.Basic}'s callback or event
 * handler methods. The XML document is available in the {@link Ext.form.Basic#errorReader errorReader}'s
 * {@link Ext.data.reader.Xml#xmlData xmlData} property.
 */
Ext.define('Ext.form.action.Submit', {
    extend:'Ext.form.action.Action',
    alternateClassName: 'Ext.form.Action.Submit',
    alias: 'formaction.submit',

    type: 'submit',

    /**
     * @cfg {Boolean} [clientValidation=true]
     * Determines whether a Form's fields are validated in a final call to {@link Ext.form.Basic#isValid isValid} prior
     * to submission. Pass false in the Form's submit options to prevent this.
     */

    // inherit docs
    run : function(){
        var form = this.form;
        if (this.clientValidation === false || form.isValid()) {
            this.doSubmit();
        } else {
            // client validation failed
            this.failureType = Ext.form.action.Action.CLIENT_INVALID;
            form.afterAction(this, false);
        }
    },

    /**
     * @private
     * Performs the submit of the form data.
     */
    doSubmit: function() {
        var formEl,
            ajaxOptions = Ext.apply(this.createCallback(), {
                url: this.getUrl(),
                method: this.getMethod(),
                headers: this.headers
            });

        // For uploads we need to create an actual form that contains the file upload fields,
        // and pass that to the ajax call so it can do its iframe-based submit method.
        if (this.form.hasUpload()) {
            formEl = ajaxOptions.form = this.buildForm();
            ajaxOptions.isUpload = true;
        } else {
            ajaxOptions.params = this.getParams();
        }

        Ext.Ajax.request(ajaxOptions);

        if (formEl) {
            Ext.removeNode(formEl);
        }
    },

    /**
     * @private
     * Builds the full set of parameters from the field values plus any additional configured params.
     */
    getParams: function() {
        var nope = false,
            configParams = this.callParent(),
            fieldParams = this.form.getValues(nope, nope, this.submitEmptyText !== nope);
        return Ext.apply({}, fieldParams, configParams);
    },

    /**
     * @private
     * Builds a form element containing fields corresponding to all the parameters to be
     * submitted (everything returned by {@link #getParams}.
     *
     * NOTE: the form element is automatically added to the DOM, so any code that uses
     * it must remove it from the DOM after finishing with it.
     *
     * @return {HTMLElement}
     */
    buildForm: function() {
        var fieldsSpec = [],
            formSpec,
            formEl,
            basicForm = this.form,
            params = this.getParams(),
            uploadFields = [],
            fields = basicForm.getFields().items,
            f,
            fLen   = fields.length,
            field, key, value, v, vLen,
            u, uLen;

        for (f = 0; f < fLen; f++) {
            field = fields[f];

            if (field.isFileUpload()) {
                uploadFields.push(field);
            }
        }

        function addField(name, val) {
            fieldsSpec.push({
                tag: 'input',
                type: 'hidden',
                name: name,
                value: Ext.String.htmlEncode(val)
            });
        }

        for (key in params) {
            if (params.hasOwnProperty(key)) {
                value = params[key];

                if (Ext.isArray(value)) {
                    vLen = value.length;
                    for (v = 0; v < vLen; v++) {
                        addField(key, value[v]);
                    }
                } else {
                    addField(key, value);
                }
            }
        }

        formSpec = {
            tag: 'form',
            action: this.getUrl(),
            method: this.getMethod(),
            target: this.target || '_self',
            style: 'display:none',
            cn: fieldsSpec
        };

        // Set the proper encoding for file uploads
        if (uploadFields.length) {
            formSpec.encoding = formSpec.enctype = 'multipart/form-data';
        }

        // Create the form
        formEl = Ext.DomHelper.append(Ext.getBody(), formSpec);

        // Special handling for file upload fields: since browser security measures prevent setting
        // their values programatically, and prevent carrying their selected values over when cloning,
        // we have to move the actual field instances out of their components and into the form.
        uLen = uploadFields.length;

        for (u = 0; u < uLen; u++) {
            field = uploadFields[u];
            if (field.rendered) { // can only have a selected file value after being rendered
                formEl.appendChild(field.extractFileInput());
            }
        }

        return formEl;
    },



    /**
     * @private
     */
    onSuccess: function(response) {
        var form = this.form,
            success = true,
            result = this.processResponse(response);
        if (result !== true && !result.success) {
            if (result.errors) {
                form.markInvalid(result.errors);
            }
            this.failureType = Ext.form.action.Action.SERVER_INVALID;
            success = false;
        }
        form.afterAction(this, success);
    },

    /**
     * @private
     */
    handleResponse: function(response) {
        var form = this.form,
            errorReader = form.errorReader,
            rs, errors, i, len, records;
        if (errorReader) {
            rs = errorReader.read(response);
            records = rs.records;
            errors = [];
            if (records) {
                for(i = 0, len = records.length; i < len; i++) {
                    errors[i] = records[i].data;
                }
            }
            if (errors.length < 1) {
                errors = null;
            }
            return {
                success : rs.success,
                errors : errors
            };
        }
        return Ext.decode(response.responseText);
    }
});
