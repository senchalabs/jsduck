describe("ReplyDetector#detect", function() {
    var ReplyDetector = require("../lib/reply_detector");

    // helpers
    function objWrap(username) {
        return {username: username};
    }
    function objUnwrap(user) {
        return user.username;
    }

    function detect(comment, users) {
        return ReplyDetector.detect(comment, users.map(objWrap)).map(objUnwrap);
    }

    // no replies

    it("finds no replies if no users given", function() {
        expect(detect("@rene: Blah", [])).toEqual([]);
    });

    it("finds no replies if text contains no '@' char at all", function() {
        expect(detect("Some text... blah blah...", ["mary", "john"])).toEqual([]);
    });

    it("finds no replies if @mentions don't match up with users", function() {
        expect(detect("@fred: blah blah...", ["mary", "john"])).toEqual([]);
    });

    it("finds no replies if @mentions don't exactly match up with users", function() {
        expect(detect("@johnny: blah blah...", ["mary", "john"])).toEqual([]);
    });

    // single reply

    it("finds a reply to john when text begins with @john", function() {
        expect(detect("@john Thanks.", ["mary", "john", "nige"])).toEqual(["john"]);
    });

    it("finds a reply to john when text begins with @john:", function() {
        expect(detect("@john: Thanks.", ["mary", "john", "nige"])).toEqual(["john"]);
    });

    it("finds a reply to john when text begins with **@john:**", function() {
        expect(detect("**@john:** Thanks.", ["mary", "john", "nige"])).toEqual(["john"]);
    });

    it("finds a reply to john when text begins with @John", function() {
        expect(detect("@John Thanks.", ["mary", "john", "nige"])).toEqual(["john"]);
    });

    it("finds a reply to john when text contains @john", function() {
        expect(detect("Hello @john, Thanks.", ["mary", "john", "nige"])).toEqual(["john"]);
    });

    it("finds a reply to john when text ends with @john", function() {
        expect(detect("Thanks @john", ["mary", "john", "nige"])).toEqual(["john"]);
    });

    it("finds a reply to 15john8 when text contains @15john8", function() {
        expect(detect("Hello @15john8, Thanks.", ["john", "15john8", "15"])).toEqual(["15john8"]);
    });

    it("finds a reply to foo*bar when text contains @foo*bar", function() {
        expect(detect("Hello @foo*bar, Thanks.", ["nick", "foo*bar", "john"])).toEqual(["foo*bar"]);
    });

    it("finds a reply to susan.dada when text contains @susan.dada", function() {
        expect(detect("Hello @susan.dada, Thanks.", ["susan", "susan.dada", "dada"])).toEqual(["susan.dada"]);
    });

    it("finds a reply to John Lennon when text contains @John Lennon:", function() {
        expect(detect("To @John Lennon: Don't know", ["Susan", "John Lennon"])).toEqual(["John Lennon"]);
    });

    it("Finds a reply to John when text contains @John and we have users 'John' and 'John Lennon' ", function() {
        expect(detect("@John: WTF!", ["John Lennon", "John"])).toEqual(["John"]);
    });

    // multiple replies

    it("finds a reply to both john & mary when lines in text begin with @john and @mary", function() {
        expect(detect("@john Agree.\n@mary Thanks.", ["john", "nige", "mary"])).toEqual(["john", "mary"]);
    });

    it("finds a reply to both john & mary when text contains @john and @mary", function() {
        expect(detect("**@john, @mary:** I agree!", ["john", "nige", "mary"])).toEqual(["john", "mary"]);
    });

    // duplicate replies

    it("finds a single reply to john when @john mentioned multiple times", function() {
        expect(detect("@john:Thanks.\n@john: and be good.", ["ronald", "john", "mary"])).toEqual(["john"]);
    });


});
