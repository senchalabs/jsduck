describe("Formatter#format", function() {
    var Formatter = require("./formatter");

    function format(text) {
        return Formatter.format(text).trim();
    }

    it("turns markdown into HTML", function() {
        expect(format("Hello **world**!")).toEqual("<p>Hello <strong>world</strong>!</p>");
    });

    it("allows simple HTML", function() {
        expect(format("Hello <b>world</b>!")).toEqual("<p>Hello <b>world</b>!</p>");
    });

    it("removes scripts", function() {
        expect(format("Hello <script src='/blah.js'></script>")).toEqual("<p>Hello </p>");
    });

    it("allows links to outside URL-s", function() {
        expect(format("[blah](http://example.com)")).toEqual('<p><a href="http://example.com">blah</a></p>');
    });

    it("turns apostrophes into &#39;", function() {
        expect(format("Let's rock!")).toEqual('<p>Let&#39;s rock!</p>');
    });

    it("turns URL-s into links", function() {
        expect(format("http://example.com")).toEqual('<p><a href="http://example.com">http://example.com</a></p>');
    });

});
