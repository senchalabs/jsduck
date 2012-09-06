var marked = require('marked');
var sanitizer = require('sanitizer');

/**
 * Performs formatting of comments.
 * @singleton
 */
var Formatter = {
    /**
     * Converts Markdown-formatted comment text into HTML.
     *
     * @param {String} content Markdown-formatted text
     * @return {String} HTML
     */
    format: function(content) {
        var markdowned;
        try {
            markdowned = marked(content);
        } catch(e) {
            markdowned = content;
        }

        // Strip dangerous markup, but allow links to all URL-s
        var sanitized_output = sanitizer.sanitize(markdowned, function(str) {
            return str;
        });

        // IE does not support &apos;
        return sanitized_output.replace(/&apos;/g, '&#39;');
    }
};

module.exports = Formatter;
