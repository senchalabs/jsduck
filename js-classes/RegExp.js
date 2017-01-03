/**
 * @class RegExp
 *
 * Creates a regular expression object for matching text according to a pattern.
 *
 * When using the constructor function, the normal string escape rules (preceding
 * special characters with \ when included in a string) are necessary. For
 * example, the following are equivalent:
 *
 *     var re = new RegExp("\\w+");
 *     var re = /\w+/;
 *
 * Notice that the parameters to the literal format do not use quotation marks to
 * indicate strings, while the parameters to the constructor function do use
 * quotation marks. So the following expressions create the same regular
 * expression:
 *
 *     /ab+c/i;
 *     new RegExp("ab+c", "i");
 *
 * # Special characters in regular expressions
 *
 * |     Character    | Meaning
 * |:-----------------|:--------------------------------------------------------------------------------------
 * | `\`              | For characters that are usually treated literally, indicates that the next character
 * |                  | is special and not to be interpreted literally.
 * |                  | For example, `/b/` matches the character 'b'. By placing a backslash in front of b, that
 * |                  | is by using `/\b/`, the character becomes special to mean match a word boundary.
 * |                  |
 * |                  | _or_
 * |                  |
 * |                  | For characters that are usually treated specially, indicates that the next character is
 * |                  | not special and should be interpreted literally.
 * |                  |
 * |                  | For example, `*` is a special character that means 0 or more occurrences of the preceding
 * |                  | character should be matched; for example, `/a*\/` means match 0 or more "a"s. To match *
 * |                  | literally, precede it with a backslash; for example, `/a\*\/` matches 'a*'.
 * |                  |
 * | `^`              | Matches beginning of input. If the multiline flag is set to true, also matches
 * |                  | immediately after a line break character.
 * |                  |
 * |                  | For example, `/^A/` does not match the 'A' in "an A", but does match the first 'A' in
 * |                  | "An A".
 * |                  |
 * | `$`              | Matches end of input. If the multiline flag is set to true, also matches immediately
 * |                  | before a line break character.
 * |                  |
 * |                  | For example, `/t$/` does not match the 't' in "eater", but does match it in "eat".
 * |                  |
 * | `*`              | Matches the preceding item 0 or more times.
 * |                  |
 * |                  | For example, `/bo*\/` matches 'boooo' in "A ghost booooed" and 'b' in "A bird warbled",
 * |                  | but nothing in "A goat grunted".
 * |                  |
 * | `+`              | Matches the preceding item 1 or more times. Equivalent to `{1,}`.
 * |                  |
 * |                  | For example, `/a+/` matches the 'a' in "candy" and all the a's in "caaaaaaandy".
 * |                  |
 * | `?`              | Matches the preceding item 0 or 1 time.
 * |                  |
 * |                  | For example, `/e?le?/` matches the 'el' in "angel" and the 'le' in "angle."
 * |                  |
 * |                  | If used immediately after any of the quantifiers `*`, `+`, `?`, or `{}`, makes the quantifier
 * |                  | non-greedy (matching the minimum number of times), as opposed to the default, which is
 * |                  | greedy (matching the maximum number of times).
 * |                  |
 * |                  | Also used in lookahead assertions, described under `(?=)`, `(?!)`, and `(?:)` in this table.
 * |                  |
 * | `.`              | (The decimal point) matches any single character except the newline characters: \n \r
 * |                  | \u2028 or \u2029. (`[\s\S]` can be used to match any character including new lines.)
 * |                  |
 * |                  | For example, `/.n/` matches 'an' and 'on' in "nay, an apple is on the tree", but not 'nay'.
 * |                  |
 * | `(x)`            | Matches `x` and remembers the match. These are called capturing parentheses.
 * |                  |
 * |                  | For example, `/(foo)/` matches and remembers 'foo' in "foo bar." The matched substring can
 * |                  | be recalled from the resulting array's elements `[1], ..., [n]` or from the predefined RegExp
 * |                  | object's properties `$1, ..., $9`.
 * |                  |
 * | `(?:x)`          | Matches `x` but does not remember the match. These are called non-capturing parentheses.
 * |                  | The matched substring can not be recalled from the resulting array's elements `[1], ..., [n]`
 * |                  | or from the predefined RegExp object's properties `$1, ..., $9`.
 * |                  |
 * | `x(?=y)`         | Matches `x` only if `x` is followed by `y`. For example, `/Jack(?=Sprat)/` matches 'Jack' only if
 * |                  | it is followed by 'Sprat'. `/Jack(?=Sprat|Frost)/` matches 'Jack' only if it is followed by
 * |                  | 'Sprat' or 'Frost'. However, neither 'Sprat' nor 'Frost' is part of the match results.
 * |                  |
 * | `x(?!y)`         | Matches `x` only if `x` is not followed by `y`. For example, `/\d+(?!\.)/` matches a number only
 * |                  | if it is not followed by a decimal point.
 * |                  |
 * |                  | `/\d+(?!\.)/.exec("3.141")` matches 141 but not 3.141.
 * |                  |
 * |<code>x&#124;y</code>| Matches either `x` or `y`.
 * |                  |
 * |                  | For example, `/green|red/` matches 'green' in "green apple" and 'red' in "red apple."
 * |                  |
 * | `{n}`            | Where `n` is a positive integer. Matches exactly n occurrences of the preceding item.
 * |                  |
 * |                  | For example, `/a{2}/` doesn't match the 'a' in "candy," but it matches all of the a's
 * |                  | in "caandy," and the first two a's in "caaandy."
 * |                  |
 * | `{n,}`           | Where `n` is a positive integer. Matches at least n occurrences of the preceding item.
 * |                  |
 * |                  | For example, `/a{2,}/` doesn't match the 'a' in "candy", but matches all of the a's in
 * |                  | "caandy" and in "caaaaaaandy."
 * |                  |
 * | `{n,m}`          | Where `n` and `m` are positive integers. Matches at least `n` and at most `m` occurrences of the
 * |                  | preceding item.
 * |                  |
 * |                  | For example, `/a{1,3}/` matches nothing in "cndy", the 'a' in "candy," the first two a's
 * |                  | in "caandy," and the first three a's in "caaaaaaandy". Notice that when matching
 * |                  | "caaaaaaandy", the match is "aaa", even though the original string had more a's in it.
 * |                  |
 * | `[xyz]`          | A character set. Matches any one of the enclosed characters. You can specify a range of
 * |                  | characters by using a hyphen.
 * |                  |
 * |                  | For example, `[abcd]` is the same as `[a-d]`. They match the 'b' in "brisket" and the 'c'
 * |                  | in "chop".
 * |                  |
 * | `[^xyz]`         | A negated or complemented character set. That is, it matches anything that is not
 * |                  | enclosed in the brackets. You can specify a range of characters by using a hyphen.
 * |                  |
 * |                  | For example, `[^abc]` is the same as `[^a-c]`. They initially match 'r' in "brisket" and
 * |                  | 'h' in "chop."
 * |                  |
 * | `[\b]`           | Matches a backspace. (Not to be confused with `\b`.)
 * |                  |
 * | `\b`             | Matches a word boundary, such as a space. (Not to be confused with `[\b]`.)
 * |                  |
 * |                  | For example, `/\bn\w/` matches the 'no' in "noonday"; `/\wy\b/` matches the 'ly' in
 * |                  | "possibly yesterday."
 * |                  |
 * | `\B`             | Matches a non-word boundary.
 * |                  |
 * |                  | For example, `/\w\Bn/` matches 'on' in "noonday", and `/y\B\w/` matches 'ye' in "possibly
 * |                  | yesterday."
 * |                  |
 * | `\cX`            | Where X is a letter from A - Z. Matches a control character in a string.
 * |                  |
 * |                  | For example, `/\cM/` matches control-M in a string.
 * |                  |
 * | `\d`             | Matches a digit character in the basic Latin alphabet. Equivalent to `[0-9]`.
 * |                  |
 * |                  | For example, `/\d/` or `/[0-9]/` matches '2' in "B2 is the suite number."
 * |                  |
 * | `\D`             | Matches any non-digit character in the basic Latin alphabet. Equivalent to `[^0-9]`.
 * |                  |
 * |                  | For example, `/\D/` or `/[^0-9]/` matches 'B' in "B2 is the suite number.
 * |                  |
 * | `\f`             | Matches a form-feed.
 * |                  |
 * | `\n`             | Matches a linefeed.
 * |                  |
 * | `\r`             | Matches a carriage return.
 * |                  |
 * | `\s`             | Matches a single white space character, including space, tab, form feed, line feed and
 * |                  | other unicode spaces. Equivalent to:
 * |                  |
 * |                  | `[\t\n\v\f\r \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]`
 * |                  |
 * |                  | For example, `/\s\w*\/` matches ' bar' in "foo bar."
 * |                  |
 * | `\S`             | Matches a single character other than white space. Equivalent to:
 * |                  |
 * |                  | `[^\t\n\v\f\r \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]`
 * |                  |
 * |                  | For example, `/\S\w*\/` matches 'foo' in "foo bar."
 * |                  |
 * | `\t`             | Matches a tab.
 * |                  |
 * | `\v`             | Matches a vertical tab.
 * |                  |
 * | `\w`             | Matches any alphanumeric character from the basic Latin alphabet, including the
 * |                  | underscore. Equivalent to `[A-Za-z0-9_]`.
 * |                  |
 * |                  | For example, `/\w/` matches 'a' in "apple," '5' in "$5.28," and '3' in "3D."
 * |                  |
 * | `\W`             | Matches any character that is not a word character from the basic Latin alphabet. Equivalent
 * |                  | to `[^A-Za-z0-9_]`.
 * |                  |
 * |                  | For example, `/\W/` or `/[^A-Za-z0-9_]/` matches '%' in "50%."
 * |                  |
 * | `\n`             | Where `n` is a positive integer. A back reference to the last substring matching the n
 * |                  | parenthetical in the regular expression (counting left parentheses).
 * |                  |
 * |                  | For example, `/apple(,)\sorange\1/` matches 'apple, orange,' in "apple, orange, cherry,
 * |                  | peach." A more complete example follows this table.
 * |                  |
 * | `\0`             | Matches a NULL character. Do not follow this with another digit.
 * |                  |
 * | `\xhh`           | Matches the character with the code `hh` (two hexadecimal digits)
 * |                  |
 * | `\uhhhh`         | Matches the character with the Unicode value `hhhh` (four hexadecimal digits)
 *
 * The literal notation provides compilation of the regular expression when the expression is evaluated. Use
 * literal notation when the regular expression will remain constant. For example, if you use literal notation
 * to construct a regular expression used in a loop, the regular expression won't be recompiled on each iteration.
 *
 * The constructor of the regular expression object, for example, new RegExp("ab+c"), provides runtime
 * compilation of the regular expression. Use the constructor function when you know the regular expression
 * pattern will be changing, or you don't know the pattern and are getting it from another source, such as user input.
 *
 * <div class="notice">
 * Documentation for this class comes from <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/RegExp">MDN</a>
 * and is available under <a href="http://creativecommons.org/licenses/by-sa/2.0/">Creative Commons: Attribution-Sharealike license</a>.
 * </div>
 */

/**
 * @method constructor
 * Creates new regular expression object.
 *
 * @param {String} pattern
 * The text of the regular expression.
 * @param {String} flags
 * If specified, flags can have any combination of the following values:
 *
 * - "g" - global match
 * - "i" - ignore case
 * - "m" - Treat beginning and end characters (^ and $) as working over multiple lines
 *   (i.e., match the beginning or end of _each_ line (delimited by \n or \r), not
 *   only the very beginning or end of the whole input string)
 */

//Methods

/**
 * @method exec
 * Executes a search for a match in its string parameter.
 *
 * If the match succeeds, the `exec` method returns an array and updates properties of the regular
 * expression object. The returned array has the matched text as the first item, and then one item for
 * each capturing parenthesis that matched containing the text that was captured.  If the match fails,
 * the `exec` method returns `null`.
 *
 * If you are executing a match simply to find true or false, use the `test` method or the `String
 * search` method.
 *
 * Consider the following example:
 *
 *     // Match one d followed by one or more b's followed by one d
 *     // Remember matched b's and the following d
 *     // Ignore case
 *     var re = /d(b+)(d)/ig;
 *     var result = re.exec("cdbBdbsbz");
 *
 * The following table shows the results for this script:
 *
 * | Object           | Property/Index | Description                                                          | Example
 * |:-----------------|:---------------|:---------------------------------------------------------------------|:---------------------
 * | `result`         |                | The content of myArray.                                              | `["dbBd", "bB", "d"]`
 * |                  | `index`        | The 0-based index of the match in the string                         | `1`
 * |                  | `input`        | The original string.                                                 | `cdbDdbsbz`
 * |                  | `[0]`          | The last matched characters.                                         | `dbBd`
 * |                  | `[1], ...[n]`  | The parenthesized substring matches, if any. The number of possible  | `[1] = bB`
 * |                  |                | parenthesized substrings is unlimited.                               | `[2] = d`
 * | `re`             | `lastIndex`    | The index at which to start the next match.                          | `5`
 * |                  | `ignoreCase`   | Indicates the "`i`" flag was used to ignore case.                    | `true`
 * |                  | `global`       | Indicates the "`g`" flag was used for a global match.                | `true`
 * |                  | `multiline`    | Indicates the "`m`" flag was used to search in strings across        | `false`
 * |                  |                | multiple lines.                                                      |
 * |                  | `source`       | The text of the pattern.                                             | d(b+)(d)
 *
 * If your regular expression uses the "`g`" flag, you can use the `exec` method multiple times to find
 * successive matches in the same string. When you do so, the search starts at the substring of `str`
 * specified by the regular expression's `lastIndex` property (`test` will also advance the `lastIndex`
 * property). For example, assume you have this script:
 *
 *     var myRe = /ab*\/g;
 *     var str = "abbcdefabh";
 *     var myArray;
 *     while ((myArray = myRe.exec(str)) != null)
 *     {
 *         var msg = "Found " + myArray[0] + ".  ";
 *         msg += "Next match starts at " + myRe.lastIndex;
 *     print(msg);
 *     }
 *
 * This script displays the following text:
 *
 *     Found abb. Next match starts at 3
 *     Found ab. Next match starts at 9
 *
 * You can also use `exec()` without creating a RegExp object:
 *
 *     var matches = /(hello \S+)/.exec('This is a hello world!');
 *     alert(matches[1]);
 *
 * This will display an alert containing 'hello world!';
 *
 * @param {String} str The string against which to match the regular expression.
 * @return {Array} Array of results or `NULL`.
 */

/**
 * @method test
 * Tests for a match in its string parameter.
 *
 * When you want to know whether a pattern is found in a string use the test method (similar to the
 * `String.search` method); for more information (but slower execution) use the exec method (similar to
 * the `String.match` method). As with exec (or in combination with it), test called multiple times on
 * the same global regular expression instance will advance past the previous match.
 *
 * The following example prints a message which depends on the success of the test:
 *
 *     function testinput(re, str){
 *         if (re.test(str))
 *             midstring = " contains ";
 *         else
 *             midstring = " does not contain ";
 *         document.write (str + midstring + re.source);
 *     }
 *
 * @param {String} str The string against which to match the regular expression.
 * @return {Boolean} true if string contains any matches, otherwise returns false.
 */

/**
 * @method toString
 * Returns a string representing the specified object. Overrides the `Object.prototype.toString`
 * method.
 *
 * The RegExp object overrides the `toString` method of the `Object` object; it does not inherit
 * `Object.toString`. For RegExp objects, the `toString` method returns a string representation of the
 * regular expression.
 *
 * The following example displays the string value of a RegExp object:
 *
 *     myExp = new RegExp("a+b+c");
 *     alert(myExp.toString());       // displays "/a+b+c/"
 *
 * @return {String} Regular expression as a string.
 */

//Properties

// Note that several of the RegExp properties have both long and short (Perl-like) names.
// Both names always refer to the same value. Perl is the programming language from which
// JavaScript modeled its regular expressions.

/**
 * @property {Boolean} global
 * Whether to test the regular expression against all possible matches in a
 * string, or only against the first.
 *
 * `global` is a property of an individual regular expression object.
 *
 * The value of `global` is true if the "`g`" flag was used; otherwise, `false`. The "`g`" flag
 * indicates that the regular expression should be tested against all possible matches in a string.
 *
 * You cannot change this property directly.
 */

/**
 * @property {Boolean} ignoreCase
 * Whether to ignore case while attempting a match in a string.
 *
 * `ignoreCase` is a property of an individual regular expression object.
 *
 * The value of `ignoreCase` is true if the "`i`" flag was used; otherwise, false. The "`i`" flag indicates
 * that case should be ignored while attempting a match in a string.
 *
 * You cannot change this property directly.
 */

/**
 * @property {Number} lastIndex
 * The index at which to start the next match. A read/write integer property that specifies the index
 * at which to start the next match.
 *
 * `lastIndex` is a property of an individual regular expression object.
 *
 * This property is set only if the regular expression used the "`g`" flag to indicate a global search.
 * The following rules apply:
 *
 * -   If `lastIndex` is greater than the length of the string, `regexp.test` and `regexp.exec` fail,
 *     and `lastIndex` is set to 0.
 * -   If `lastIndex` is equal to the length of the string and if the regular expression matches the
 *     empty string, then the regular expression matches input starting at `lastIndex`.
 * -   If `lastIndex` is equal to the length of the string and if the regular expression does not match
 *     the empty string, then the regular expression mismatches input, and `lastIndex` is reset to 0.
 * -   Otherwise, `lastIndex` is set to the next position following the most recent match.
 *
 * For example, consider the following sequence of statements:
 *
 * -   `re = /(hi)?/g` Matches the empty string.
 * -   `re("hi")` Returns `["hi", "hi"]` with `lastIndex` equal to 2.
 * -   `re("hi")` Returns `[""]`, an empty array whose zeroth element is the match string. In this
 *     case, the empty string because `lastIndex` was 2 (and still is 2) and "`hi`" has length 2.
 */

/**
 * @property {Boolean} multiline
 * Whether or not to search in strings across multiple lines.
 *
 * `multiline` is a property of an individual regular expression object..
 *
 * The value of `multiline` is true if the "`m`" flag was used; otherwise, `false`. The "`m`" flag
 * indicates that a multiline input string should be treated as multiple lines. For example, if "`m`"
 * is used, "`^`" and "`$`" change from matching at only the start or end of the entire string to the
 * start or end of any line within the string.
 *
 * You cannot change this property directly.
 */

/**
 * @property {String} source
 * The text of the pattern.
 *
 * A read-only property that contains the text of the pattern, excluding the forward slashes.
 *
 * `source` is a property of an individual regular expression object.
 *
 * You cannot change this property directly.
 */