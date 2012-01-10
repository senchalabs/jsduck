var EsprimaWrapper = (function() {

    var typeMap = {
        "Numeric": 0,
        "String": 1,
        "Identifier": 2,
        "Boolean": 2,
        "Null": 2,
        "RegularExpression": 3,
        "Punctuator": 4,
        "Keyword": 5,
        "Block": 6
    };

    function exportTokens(tokens, full_input) {
        var valueMap = {};
        var valueCounter = 0;
        var type = [], value = [], linenr = [];
        var lastComIndex = 0;
        var lastComLineNr = 1;

        for (var i=0, len=tokens.length; i<len; i++) {
            var t = tokens[i];

            type[i] = typeMap[t.type];

            var v = t.value;
            if (t.type === "Block") {
                value[i] = "/*" + v + "*/";
                linenr[i] = (full_input.slice(lastComIndex, t.range[0]).match(/\n/g) || []).length + lastComLineNr;
                lastComIndex = t.range[0];
                lastComLineNr = linenr[i];
            }
            else {
                if (t.type === "String") {
                    v = v.replace(/^['"]|['"]$/g, "");
                }
                if (!Object.prototype.hasOwnProperty.call(valueMap, v)) {
                    valueMap[v] = valueCounter;
                    valueCounter++;
                }
                value[i] = valueMap[v];
                linenr[i] = 0;
            }
        }

        var valueArray = [];
        for (var v in valueMap) {
            if (Object.prototype.hasOwnProperty.call(valueMap, v)) {
                valueArray[valueMap[v]] = v;
            }
        }

        return {type: type, value: value, linenr: linenr, valueArray: valueArray};
    };

    function filterDocComments(comments) {
        var docs = [];
        for (var i=0, len=comments.length; i<len; i++) {
            var c = comments[i];
            if (c.type === "Block" && /^\*/.test(c.value)) {
                docs.push(c);
            }
        }
        return docs;
    }

    // Combines tokens and comments arrays into one array
    // while keeping them in correct order.
    function mergeTokens(tokens, comments) {
        var result = [];
        var c = 0, com = comments[c];
        var t = 0, tok = tokens[t];
        while (com || tok) {
            if (!com || tok && (tok.range[0] < com.range[0])) {
                result.push(tok);
                tok = tokens[++t];
            }
            else {
                result.push(com);
                com = comments[++c];
            }
        }
        return result;
    }

    function parse(js) {
        var program = esprima.parse(js, {tokens: true, comment: true});

        var tokens = program.tokens;
        var comments = filterDocComments(program.comments);

        // return exportTokens(tokens.concat(comments));
        return exportTokens(mergeTokens(tokens, comments), js);
    }

    return {parse: parse};

})();

