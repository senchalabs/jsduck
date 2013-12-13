/**
 * The form for adding and editing comments.
 */
Ext.define('Docs.view.comments.Form', {
    extend: 'Ext.Component',
    alias: "widget.commentsForm",
    requires: ["Docs.Tip"],

    /**
     * @cfg {Object} user
     * Object describing currently logged in user.
     */
    /**
     * @cfg {Boolean} userSubscribed
     * True when user is subscribed to this thread.
     */
    /**
     * @cfg {String} content
     * The existing content that we're about to edit.
     * Setting this will start the form in editing-existing-comment mode.
     * Without this a form for adding new comment is created.
     */
    /**
     * @cfg {String} title
     * The title text to show above form.
     */

    tpl: [
         '<form class="commentForm <tpl if="!updateComment">newComment</tpl>">',
            '<tpl if="title">',
                '<p>{title}</p>',
            '</tpl>',
            '<textarea>{content}</textarea>',
            '<div class="com-meta">',
                '{[Docs.Comments.avatar(values.user.emailHash)]}',
                '<div class="form-author">Logged in as {user.userName}</div>',
                '<tpl if="!updateComment">',
                    '<label class="subscribe">',
                        'Email updates? <input type="checkbox" class="subscriptionCheckbox" <tpl if="userSubscribed">checked="checked"</tpl> />',
                        '<span class="sep"> | </span>',
                    '</label>',
                '</tpl>',
                '<a href="#" class="toggleCommentGuide">Show help &#8595;</a>',
                '<input type="submit" class="sub submitComment" value="{[values.updateComment ? "Update" : "Post"]} comment" />',
                '<tpl if="updateComment">',
                    ' or <a href="#" class="cancelUpdateComment">cancel</a>',
                '</tpl>',
            '</div>',
            '<div class="commentGuideTxt" style="display: none;">',
                '<ul>',
                    '<li>Use <strong><a href="http://daringfireball.net/projects/markdown/syntax" target="_blank">Markdown</a></strong>',
                    ' for formatting:</li>',
                '</ul>',
                '<div class="markdown preview">',
                    '<h4>Markdown</h4>',
                    '<pre>',
                        "**Bold**, _italic_\n",
                        "and `monospaced font`.\n",
                        "\n",
                        "    Indent with 4 spaces\n",
                        "    for a code block.\n",
                        "\n",
                        "1. numbered lists\n",
                        "2. are cool\n",
                        "\n",
                        "- bulleted lists\n",
                        "- make your point\n",
                        "\n",
                        "[External link](http//example.com)\n",
                        "\n",
                        "Leave a blank line\n",
                        "between paragraphs.\n",
                    '</pre>',
                '</div>',
                '<div class="markdown result">',
                    '<h4>Result</h4>',
                    '<strong>Bold</strong>, <em>italic</em> and<br/>',
                    '<code>monospaced font</code>.<br/>',
                    '<pre class="prettyprint">',
                    "Indent with 4 spaces\n",
                    "for a code block.",
                    '</pre>',
                    '<ol>',
                        '<li>numbered lists</li>',
                        '<li>are cool</li>',
                    '</ol>',
                    '<ul>',
                        '<li>bulleted lists</li>',
                        '<li>make your point</li>',
                    '</ul>',
                    '<a href="http://example.com">External link</a><br/>',
                    '<br/>',
                    'Leave a blank line between paragraphs.<br/><br/>',
                '</div>',
                '<ul>',
                    '<li>Use comments to:',
                    '<ul>',
                        '<li>Inform us about <strong>bugs in documentation.</strong></li>',
                        '<li>Give <strong>useful tips</strong> to other developers.</li>',
                        '<li><strong>Warn about bugs</strong> and problems that might bite.</li>',
                    '</ul>',
                    '</li>',
                    "<li>Don't post comments for:",
                    '<ul>',
                        '<li><strong>Questions about code or usage</strong>',
                        ' - use the <a href="http://www.sencha.com/forum" target="_blank">Sencha Forum</a>.</li>',
                        '<li><strong>SDK bugs</strong>',
                        ' - use the <a href="http://www.sencha.com/forum" target="_blank">Sencha Forum</a>.</li>',
                        '<li><strong>Docs App bugs</strong>',
                        ' - use the <a href="https://github.com/senchalabs/jsduck/issues" target="_blank">GitHub Issue tracker</a>.</li>',
                    '</ul></li>',
                    '<li>Comments may be edited or deleted at any time by a moderator.</li>',
                    '<li>Avatars can be managed at <a href="http://www.gravatar.com" target="_blank">Gravatar</a> (use your forum email address).</li>',
                    '<li>To write a reply use <strong><code>@username</code></strong> syntax &ndash; the user will get notified.</li>',
                '</ul>',
            '</div>',
        '</form>'
    ],

    initComponent: function() {
        this.data = {
            title: this.title,
            updateComment: (this.content !== undefined),
            content: this.content,
            userSubscribed: this.userSubscribed,
            user: this.user
        };

        this.callParent(arguments);
    },

    /**
     * Sets the text inside editor.
     * @param {String} value
     */
    setValue: function(value) {
        this.codeMirror.setValue(value);
    },

    afterRender: function() {
        this.callParent(arguments);

        this.makeCodeMirror(this.getEl().down('textarea').dom);
        this.bindEvents();
    },

    makeCodeMirror: function(textarea) {
        var firstTime = true;
        this.codeMirror = CodeMirror.fromTextArea(textarea, {
            mode: 'markdown',
            lineWrapping: true,
            indentUnit: 4,
            extraKeys: {
                "Tab": "indentMore",
                "Shift-Tab": "indentLess"
            },
            onFocus: Ext.Function.bind(function() {
                if (firstTime && this.codeMirror.getValue() === "") {
                    this.toggleGuide(true);
                }
                firstTime = false;
            }, this)
        });
    },

    bindEvents: function() {
        this.getEl().on("click", function() {
            this.toggleGuide();
        }, this, {preventDefault: true, delegate: "a.toggleCommentGuide"});

        this.getEl().on("click", function() {
            /**
             * @event cancel
             * Fired when editing canceled.
             */
            this.fireEvent("cancel");
        }, this, {preventDefault: true, delegate: "a.cancelUpdateComment"});

        this.getEl().on("click", function() {
            /**
             * @event submit
             * Fired when the "save" or "update" buttom pressed to finish editing.
             * @param {String} content The edited comment.
             */
            this.fireEvent("submit", this.codeMirror.getValue());
        }, this, {preventDefault: true, delegate: "input.submitComment"});

        this.getEl().on("click", function(event, el) {
            /**
             * @event subscriptionChange
             * Fired when the subscription checkbox ticked.
             * @param {Boolean} subscribe True to subscribe.
             * False to unsubscribe.
             */
            this.fireEvent("subscriptionChange", Ext.get(el).dom.checked);
        }, this, {delegate: "input.subscriptionCheckbox"});
    },

    toggleGuide: function(expand) {
        var guideText = this.getEl().down('.commentGuideTxt');
        guideText.setVisibilityMode(Ext.dom.Element.DISPLAY);
        var helpLink = this.getEl().down('.toggleCommentGuide');

        if (!guideText.isVisible() || expand === true) {
            guideText.show(true);
            helpLink.update("Hide help &#8593;");
        }
        else {
            guideText.hide(true);
            helpLink.update("Show help &#8595;");
        }
    },

    /**
     * Shows a notification near the checkbox to notify user about the
     * changes subscription status.
     * @param {Boolean} subscribed
     */
    showSubscriptionMessage: function(subscribed) {
        var el = this.getEl().down("input.subscriptionCheckbox");
        var msg = subscribed ?
            "Updates to this thread will be e-mailed to you" :
            "You have unsubscribed from this thread";
        Docs.Tip.show(msg, el, 'bottom');
    }

});
