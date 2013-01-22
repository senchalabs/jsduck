/**
 * @class String
 *
 * `String` is a global object that may be used to construct String instances.
 *
 * String objects may be created by calling the constructor `new String()`. The `String` object wraps
 * JavaScript's string primitive data type with the methods described below. The global function
 * `String()` can also be called without new in front to create a primitive string. String literals in
 * JavaScript are primitive strings.
 *
 * Because JavaScript automatically converts between string primitives and String objects, you can call
 * any of the methods of the `String` object on a string primitive. JavaScript automatically converts the
 * string primitive to a temporary `String` object, calls the method, then discards the temporary String
 * object. For example, you can use the `String.length` property on a string primitive created from a
 * string literal:
 *
 *     s_obj = new String(s_prim = s_also_prim = "foo");
 *
 *     s_obj.length;       // 3
 *     s_prim.length;      // 3
 *     s_also_prim.length; // 3
 *     'foo'.length;       // 3
 *     "foo".length;       // 3
 *
 * (A string literal is denoted with single or double quotation marks.)
 *
 * String objects can be converted to primitive strings with the `valueOf` method.
 *
 * String primitives and String objects give different results when evaluated as JavaScript. Primitives
 * are treated as source code; String objects are treated as a character sequence object. For example:
 *
 *     s1 = "2 + 2";               // creates a string primitive
 *     s2 = new String("2 + 2");   // creates a String object
 *     eval(s1);                   // returns the number 4
 *     eval(s2);                   // returns the string "2 + 2"
 *     eval(s2.valueOf());         // returns the number 4
 *
 * # Character access
 *
 * There are two ways to access an individual character in a string. The first is the `charAt` method:
 *
 *     return 'cat'.charAt(1); // returns "a"
 *
 * The other way is to treat the string as an array, where each index corresponds to an individual
 * character:
 *
 *     return 'cat'[1]; // returns "a"
 *
 * The second way (treating the string as an array) is not part of ECMAScript 3. It is a JavaScript and
 * ECMAScript 5 feature.
 *
 * In both cases, attempting to set an individual character won't work. Trying to set a character
 * through `charAt` results in an error, while trying to set a character via indexing does not throw an
 * error, but the string itself is unchanged.
 *
 * # Comparing strings
 *
 * C developers have the `strcmp()` function for comparing strings. In JavaScript, you just use the less-
 * than and greater-than operators:
 *
 *     var a = "a";
 *     var b = "b";
 *     if (a < b) // true
 *         print(a + " is less than " + b);
 *     else if (a > b)
 *         print(a + " is greater than " + b);
 *     else
 *         print(a + " and " + b + " are equal.");
 *
 * A similar result can be achieved using the `localeCompare` method inherited by `String` instances.
 *
 * <div class="notice">
 * Documentation for this class comes from <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String">MDN</a>
 * and is available under <a href="http://creativecommons.org/licenses/by-sa/2.0/">Creative Commons: Attribution-Sharealike license</a>.
 * </div>
 */

/**
 * @method constructor
 * Creates new String object.
 * @param {Object} value The value to wrap into String object.
 */

//Methods

/**
 * @method fromCharCode
 * Returns a string created by using the specified sequence of Unicode values.
 *
 * This method returns a string and not a `String` object.
 *
 * Because `fromCharCode` is a static method of `String`, you always use it as `String.fromCharCode()`,
 * rather than as a method of a `String` object you created.
 *
 * Although most common Unicode values can be represented in a fixed width system/with one number (as
 * expected early on during JavaScript standardization) and `fromCharCode()` can be used to return a
 * single character for the most common values (i.e., UCS-2 values which are the subset of UTF-16 with
 * the most common characters), in order to deal with ALL legal Unicode values, `fromCharCode()` alone
 * is inadequate. Since the higher code point characters use two (lower value) "surrogate" numbers to
 * form a single character, `fromCharCode()` can be used to return such a pair and thus adequately
 * represent these higher valued characters.
 *
 * Be aware, therefore, that the following utility function to grab the accurate character even for
 * higher value code points, may be returning a value which is rendered as a single character, but
 * which has a string count of two (though usually the count will be one).
 *
 *     // String.fromCharCode() alone cannot get the character at such a high code point
 *     // The following, on the other hand, can return a 4-byte character as well as the
 *     //   usual 2-byte ones (i.e., it can return a single character which actually has
 *     //   a string length of 2 instead of 1!)
 *     alert(fixedFromCharCode(0x2F804)); // or 194564 in decimal
 *
 *     function fixedFromCharCode (codePt) {
 *         if (codePt > 0xFFFF) {
 *             codePt -= 0x10000;
 *             return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 +
 *             (codePt & 0x3FF));
 *         }
 *         else {
 *             return String.fromCharCode(codePt);
 *         }
 *     }
 *
 * The following example returns the string "ABC".
 *
 *     String.fromCharCode(65,66,67)
 *
 * @param {Number} num1, ..., numN A sequence of numbers that are Unicode values.
 * @return {String} String containing characters from encoding.
 */

//Properties

/**
 * @property {Number} length
 * Reflects the length of the string.
 *
 * This property returns the number of code units in the string. UTF-16, the string format used by JavaScript, uses a single 16-bit
 * code unit to represent the most common characters, but needs to use two code units for less commonly-used characters, so it's
 * possible for the value returned by `length` to not match the actual number of characters in the string.
 *
 * For an empty string, `length` is 0.
 *
 *     var x = "Netscape";
 *     var empty = "";
 *
 *     console.log("Netspace is " + x.length + " code units long");
 *     console.log("The empty string is has a length of " + empty.length); // should be 0
 */

//Methods

/**
 * @method charAt
 * Returns the character at the specified index.
 *
 * Characters in a string are indexed from left to right. The index of the first character is 0, and
 * the index of the last character in a string called `stringName` is `stringName.length - 1`. If the
 * index you supply is out of range, JavaScript returns an empty string.
 *
 * The following example displays characters at different locations in the string "Brave new world":
 *
 *     var anyString="Brave new world";
 *
 *     document.writeln("The character at index 0 is '" + anyString.charAt(0) + "'");
 *     document.writeln("The character at index 1 is '" + anyString.charAt(1) + "'");
 *     document.writeln("The character at index 2 is '" + anyString.charAt(2) + "'");
 *     document.writeln("The character at index 3 is '" + anyString.charAt(3) + "'");
 *     document.writeln("The character at index 4 is '" + anyString.charAt(4) + "'");
 *     document.writeln("The character at index 999 is '" + anyString.charAt(999) + "'");
 *
 * These lines display the following:
 *
 *     The character at index 0 is 'B'
 *     The character at index 1 is 'r'
 *     The character at index 2 is 'a'
 *     The character at index 3 is 'v'
 *     The character at index 4 is 'e'
 *     The character at index 999 is ''
 *
 * The following provides a means of ensuring that going through a string loop always provides a whole
 * character, even if the string contains characters that are not in the Basic Multi-lingual Plane.
 *
 *     var str = 'A\uD87E\uDC04Z'; // We could also use a non-BMP character directly
 *     for (var i=0, chr; i < str.length; i++) {
 *         if ((chr = getWholeChar(str, i)) === false) {continue;} // Adapt this line at the top of
 * each loop, passing in the whole string and the current iteration and returning a variable to
 * represent the individual character
 *         alert(chr);
 *     }
 *
 *     function getWholeChar (str, i) {
 *         var code = str.charCodeAt(i);
 *
 *         if (isNaN(code)) {
 *         return ''; // Position not found
 *         }
 *         if (code < 0xD800 || code > 0xDFFF) {
 *             return str.charAt(i);
 *         }
 *         if (0xD800 <= code && code <= 0xDBFF) { // High surrogate (could change last hex to 0xDB7F
 * to treat high private surrogates as single characters)
 *         if (str.length <= (i+1))  {
 *             throw 'High surrogate without following low surrogate';
 *         }
 *         var next = str.charCodeAt(i+1);
 *         if (0xDC00 > next || next > 0xDFFF) {
 *             throw 'High surrogate without following low surrogate';
 *         }
 *         return str.charAt(i)+str.charAt(i+1);
 *     }
 *     // Low surrogate (0xDC00 <= code && code <= 0xDFFF)
 *     if (i === 0) {
 *         throw 'Low surrogate without preceding high surrogate';
 *     }
 *     var prev = str.charCodeAt(i-1);
 *     if (0xD800 > prev || prev > 0xDBFF) { // (could change last hex to 0xDB7F to treat high private
 * surrogates as single characters)
 *       throw 'Low surrogate without preceding high surrogate';
 *     }
 *     return false; // We can pass over low surrogates now as the second component in a pair which we
 * have already processed
 * }
 *
 * While the second example may be more frequently useful for those wishing to support non-BMP
 * characters (since the above does not require the caller to know where any non-BMP character might
 * appear), in the event that one _does_ wish, in choosing a character by index, to treat the surrogate
 * pairs within a string as the single characters they represent, one can use the following:
 *
 *     function fixedCharAt (str, idx) {
 *         var ret = '';
 *         str += '';
 *         var end = str.length;
 *
 *         var surrogatePairs = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
 *         while ((surrogatePairs.exec(str)) != null) {
 *             var li = surrogatePairs.lastIndex;
 *             if (li - 2 < idx) {
 *                 idx++;
 *             }
 *             else {
 *             break;
 *         }
 *     }
 *
 *     if (idx >= end || idx < 0) {
 *         return '';
 *     }
 *
 *     ret += str.charAt(idx);
 *
 *     if (/[\uD800-\uDBFF]/.test(ret) && /[\uDC00-\uDFFF]/.test(str.charAt(idx+1))) {
 *         ret += str.charAt(idx+1); // Go one further, since one of the "characters" is part of a
 * surrogate pair
 *     }
 *     return ret;
 *     }
 *
 * @param {Number} index An integer between 0 and 1 less than the length of the string.
 * @return {String} Individual character from string.
 */

/**
 * @method charCodeAt
 * Returns a number indicating the Unicode value of the character at the given index.
 *
 * Unicode code points range from 0 to 1,114,111. The first 128 Unicode code points are a direct match
 * of the ASCII character encoding.
 *
 * Note that `charCodeAt` will always return a value that is less than 65,536. This is because the
 * higher code points are represented by a pair of (lower valued) "surrogate" pseudo-characters which
 * are used to comprise the real character. Because of this, in order to examine or reproduce the full
 * character for individual characters of value 65,536 and above, for such characters, it is necessary
 * to retrieve not only `charCodeAt(i)`, but also `charCodeAt(i+1)` (as if examining/reproducing a
 * string with two letters). See example 2 and 3 below.
 *
 * `charCodeAt` returns `NaN` if the given index is not greater than 0 or is greater than the length of
 * the string.
 *
 * Backward Compatibility with JavaScript 1.2
 *
 * The `charCodeAt` method returns a number indicating the ISO-Latin-1 codeset value of the character
 * at the given index. The ISO-Latin-1 codeset ranges from 0 to 255. The first 0 to 127 are a direct
 * match of the ASCII character set.
 *
 * Example 1: Using `charCodeAt`
 *
 * The following example returns 65, the Unicode value for A.
 *
 *    "ABC".charCodeAt(0) // returns 65
 *
 * Example 2: Fixing `charCodeAt` to handle non-Basic-Multilingual-Plane characters if their presence
 * earlier in the string is unknown
 *
 * This version might be used in for loops and the like when it is unknown whether non-BMP characters
 * exist before the specified index position.
 *
 *     function fixedCharCodeAt (str, idx) {
 *         // ex. fixedCharCodeAt ('\uD800\uDC00', 0); // 65536
 *         // ex. fixedCharCodeAt ('\uD800\uDC00', 1); // 65536
 *         idx = idx || 0;
 *         var code = str.charCodeAt(idx);
 *         var hi, low;
 *         if (0xD800 <= code && code <= 0xDBFF) { // High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single characters)
 *             hi = code;
 *             low = str.charCodeAt(idx+1);
 *             if (isNaN(low)) {
 *                 throw 'High surrogate not followed by low surrogate in fixedCharCodeAt()';
 *             }
 *             return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
 *         }
 *         if (0xDC00 <= code && code <= 0xDFFF) { // Low surrogate
 *         // We return false to allow loops to skip this iteration since should have already handled
 * high surrogate above in the previous iteration
 *             return false;
 *         }
 *         return code;
 *     }
 *
 * Example 3: Fixing `charCodeAt` to handle non-Basic-Multilingual-Plane characters if their presence
 * earlier in the string is known
 *
 *     function knownCharCodeAt (str, idx) {
 *         str += '';
 *         var code,
 *         end = str.length;
 *
 *         var surrogatePairs = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
 *         while ((surrogatePairs.exec(str)) != null) {
 *             var li = surrogatePairs.lastIndex;
 *             if (li - 2 < idx) {
 *                 idx++;
 *             }
 *             else {
 *                 break;
 *             }
 *         }
 *
 *         if (idx >= end || idx < 0) {
 *             return NaN;
 *         }
 *
 *         code = str.charCodeAt(idx);
 *
 *         var hi, low;
 *         if (0xD800 <= code && code <= 0xDBFF) {
 *             hi = code;
 *             low = str.charCodeAt(idx+1); // Go one further, since one of the "characters" is part of
 * a surrogate pair
 *             return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
 *         }
 *         return code;
 *     }
 *
 * @param {Number} index An integer greater than 0 and less than the length of the string; if it is
 * not a number, it defaults to 0.
 * @return {Number} Value between 0 and 65535.
 */

/**
 * @method concat
 * Combines the text of two strings and returns a new string.
 *
 * `concat` combines the text from one or more strings and returns a new string. Changes to the text in
 * one string do not affect the other string.
 *
 * The following example combines strings into a new string.
 *
 *     var hello = "Hello, ";
 *     console.log(hello.concat("Kevin", " have a nice day.")); // Hello, Kevin have a nice day.
 *
 * @param {String} string2...stringN
 * @return {String} Result of both strings.
 */

/**
 * @method indexOf
 * Returns the index within the calling `String` object of the first occurrence of the specified value,
 * or -1 if not found.
 *
 * Characters in a string are indexed from left to right. The index of the first character is 0, and the index of the last character
 * of a string called `stringName` is `stringName.length - 1`.
 *
 *     "Blue Whale".indexOf("Blue")    // returns 0
 *     "Blue Whale".indexOf("Blute")   // returns -1
 *     "Blue Whale".indexOf("Whale",0) // returns 5
 *     "Blue Whale".indexOf("Whale",5) // returns 5
 *     "Blue Whale".indexOf("",9)      // returns 9
 *     "Blue Whale".indexOf("",10)     // returns 10
 *     "Blue Whale".indexOf("",11)     // returns 10
 *
 * The `indexOf` method is case sensitive. For example, the following expression returns -1:
 *
 *     "Blue Whale".indexOf("blue")
 *
 * Note that '0' doesn't evaluate to true and '-1' doesn't evaluate to false. Therefore, when checking if a specific string exists
 * within another string the correct way to check would be:
 *
 *     "Blue Whale".indexOf("Blue") != -1 // true
 *     "Blue Whale".indexOf("Bloe") != -1 // false
 *
 * The following example uses indexOf and lastIndexOf to locate values in the string "Brave new world".
 *
 *     var anyString="Brave new world"
 *
 *     document.write("<P>The index of the first w from the beginning is " + anyString.indexOf("w"))          // Displays 8
 *     document.write("<P>The index of the first w from the end is " + anyString.lastIndexOf("w"))      // Displays 10
 *     document.write("<P>The index of 'new' from the beginning is " + anyString.indexOf("new"))        // Displays 6
 *     document.write("<P>The index of 'new' from the end is " + anyString.lastIndexOf("new"))    // Displays 6
 *
 * The following example defines two string variables. The variables contain the same string except that the second string contains
 * uppercase letters. The first `writeln` method displays 19. But because the `indexOf` method is case sensitive, the string
 * "cheddar" is not found in `myCapString`, so the second `writeln` method displays -1.
 *
 *     myString="brie, pepper jack, cheddar"
 *     myCapString="Brie, Pepper Jack, Cheddar"
 *     document.writeln('myString.indexOf("cheddar") is ' + myString.indexOf("cheddar"))
 *     document.writeln('<P>myCapString.indexOf("cheddar") is ' + myCapString.indexOf("cheddar"))
 *
 * The following example sets count to the number of occurrences of the letter x in the string str:
 *
 *     count = 0;
 *     pos = str.indexOf("x");
 *     while ( pos != -1 ) {
 *         count++;
 *         pos = str.indexOf("x",pos+1);
 *     }
 *
 * @param {String} searchValue A string representing the value to search for.
 * @param {Number} fromIndex The location within the calling string to start the search from. It can be any integer between 0 and
 * the length of the string. The default value is 0.
 * @return {Number} Position of specified value or -1 if not found.
 */

/**
 * @method lastIndexOf
 * Returns the index within the calling String object of the last occurrence of
 * the specified value, or -1 if not found. The calling string is searched
 * backward, starting at fromIndex.
 *
 * Characters in a string are indexed from left to right. The index of the first character is 0, and the index of the last character
 * is `stringName.length - 1`.
 *
 *     "canal".lastIndexOf("a")   // returns 3
 *     "canal".lastIndexOf("a",2) // returns 1
 *     "canal".lastIndexOf("a",0) // returns -1
 *     "canal".lastIndexOf("x")   // returns -1
 *
 * The `lastIndexOf` method is case sensitive. For example, the following expression returns -1:
 *
 *     "Blue Whale, Killer Whale".lastIndexOf("blue")
 *
 * The following example uses `indexOf` and `lastIndexOf` to locate values in the string "`Brave new world`".
 *
 *     var anyString="Brave new world"
 *
 *     // Displays 8
 *     document.write("<P>The index of the first w from the beginning is " +
 *     anyString.indexOf("w"))
 *     // Displays 10
 *     document.write("<P>The index of the first w from the end is " +
 *     anyString.lastIndexOf("w"))
 *     // Displays 6
 *     document.write("<P>The index of 'new' from the beginning is " +
 *     anyString.indexOf("new"))
 *     // Displays 6
 *     document.write("<P>The index of 'new' from the end is " +
 *     anyString.lastIndexOf("new"))
 *
 * @param {String} searchValue A string representing the value to search for.
 * @param {Number} fromIndex The location within the calling string to start the search from, indexed from left to right. It can
 * be any integer between 0 and the length of the string. The default value is the length of the string.
 * @return {Number}
 */

/**
 * @method localeCompare
 * Returns a number indicating whether a reference string comes before or after or is the same as the
 * given string in sort order.
 *
 * Returns a number indicating whether a reference string comes before or after or is the same as the
 * given string in sort order. Returns -1 if the string occurs earlier in a sort than `compareString`,
 * returns 1 if the string occurs afterwards in such a sort, and returns 0 if they occur at the same
 * level.
 *
 * The following example demonstrates the different potential results for a string occurring before,
 * after, or at the same level as another:
 *
 *     alert('a'.localeCompare('b')); // -1
 *     alert('b'.localeCompare('a')); // 1
 *     alert('b'.localeCompare('b')); // 0
 *
 * @param {String} compareString The string against which the referring string is comparing.
 * @return {Number} Returns -1 if the string occurs earlier in a sort than
 * compareString, returns 1 if the string occurs afterwards in such a sort, and
 * returns 0 if they occur at the same level.
 */

/**
 * @method match
 * Used to match a regular expression against a string.
 *
 * If the regular expression does not include the `g` flag, returns the same result as `regexp.exec(string)`.
 *
 * If the regular expression includes the `g` flag, the method returns an Array containing all matches. If there were no matches,
 * the method returns `null`.
 *
 * The returned {@link Array} has an extra `input` property, which contains the regexp that generated it as a result. In addition,
 * it has an `index` property, which represents the zero-based index of the match in the string.
 *
 * In the following example, `match` is used to find "Chapter" followed by 1 or more numeric characters followed by a decimal point
 * and numeric character 0 or more times. The regular expression includes the `i` flag so that case will be ignored.
 *
 *     str = "For more information, see Chapter 3.4.5.1";
 *     re = /(chapter \d+(\.\d)*)/i;
 *     found = str.match(re);
 *     document.write(found);
 *
 * This returns the array containing Chapter 3.4.5.1,Chapter 3.4.5.1,.1
 *
 * "`Chapter 3.4.5.1`" is the first match and the first value remembered from `(Chapter \d+(\.\d)*)`.
 *
 * "`.1`" is the second value remembered from `(\.\d)`.
 *
 * The following example demonstrates the use of the global and ignore case flags with `match`. All letters A through E and a
 * through e are returned, each its own element in the array
 *
 *     var str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
 *     var regexp = /[A-E]/gi;
 *     var matches_array = str.match(regexp);
 *     document.write(matches_array);
 *
 * `matches_array` now equals `['A', 'B', 'C', 'D', 'E', 'a', 'b', 'c', 'd', 'e']`.
 *
 * @param {RegExp} regexp A {@link RegExp} object. If a non-RegExp object `obj` is passed, it is
 * implicitly converted to a RegExp by using `new RegExp(obj)`.
 * @return {Array} Contains results of the match (if any).
 */

/**
 * @method replace
 * Used to find a match between a regular expression and a string, and to replace the matched substring
 * with a new substring.
 *
 * This method does not change the `String` object it is called on. It simply returns a new string.
 *
 * To perform a global search and replace, either include the `g` flag in the regular expression or if
 * the first parameter is a string, include `g` in the flags parameter.
 *
 * The replacement string can include the following special replacement patterns:
 *
 * | Pattern       | Inserts
 * |:--------------|:--------------------------------------------------------------------------------------
 * | `$$`          | Inserts a `$`.
 * | `$&`          | Inserts the matched substring.
 * | `$``          | Inserts the portion of the string that precedes the matched substring.
 * | `$'`          | Inserts the portion of the string that follows the matched substring.
 * | `$n` or `$nn` | Where `n` or `nn` are decimal digits, inserts the _n_th parenthesized submatch string, provided the first
 * |               | argument was a `RegExp` object.
 *
 * You can specify a function as the second parameter. In this case, the function will be invoked after the match has been
 * performed. The function's result (return value) will be used as the replacement string. (Note: the above-mentioned special
 * replacement patterns do not apply in this case.) Note that the function will be invoked multiple times for each full match to be
 * replaced if the regular expression in the first parameter is global.
 *
 * The arguments to the function are as follows:
 *
 * | Possible Name | Supplied Value
 * |:--------------|:--------------------------------------------------------------------------------------
 * | `str`         | The matched substring. (Corresponds to `$&` above.)
 * | `p1, p2, ...` | The _n_th parenthesized submatch string, provided the first argument to replace was a `RegExp` object.
 * |               | (Correspond to $1, $2, etc. above.)
 * | `offset`      | The offset of the matched substring within the total string being examined. (For example, if the total string
 * |               | was "`abcd`", and the matched substring was "`bc`", then this argument will be 1.)
 * | `s`           | The total string being examined.
 *
 * (The exact number of arguments will depend on whether the first argument was a `RegExp` object and, if so, how many parenthesized
 * submatches it specifies.)
 *
 * The following example will set `newString` to "`XXzzzz - XX , zzzz`":
 *
 *     function replacer(str, p1, p2, offset, s)
 *     {
 *         return str + " - " + p1 + " , " + p2;
 *     }
 *     var newString = "XXzzzz".replace(/(X*)(z*)/, replacer);
 *
 * In the following example, the regular expression includes the global and ignore case flags which permits replace to replace each
 * occurrence of 'apples' in the string with 'oranges'.
 *
 *     var re = /apples/gi;
 *     var str = "Apples are round, and apples are juicy.";
 *     var newstr = str.replace(re, "oranges");
 *     print(newstr);
 *
 * In this version, a string is used as the first parameter and the global and ignore case flags are specified in the flags
 * parameter.
 *
 *     var str = "Apples are round, and apples are juicy.";
 *     var newstr = str.replace("apples", "oranges", "gi");
 *     print(newstr);
 *
 * Both of these examples print "oranges are round, and oranges are juicy."
 *
 * In the following example, the regular expression is defined in replace and includes the ignore case flag.
 *
 *     var str = "Twas the night before Xmas...";
 *     var newstr = str.replace(/xmas/i, "Christmas");
 *     print(newstr);
 *
 * This prints "Twas the night before Christmas..."
 *
 * The following script switches the words in the string. For the replacement text, the script uses the $1 and $2 replacement
 * patterns.
 *
 *     var re = /(\w+)\s(\w+)/;
 *     var str = "John Smith";
 *     var newstr = str.replace(re, "$2, $1");
 *     print(newstr);
 *
 * This prints "Smith, John".
 *
 * In this example, all occurrences of capital letters in the string are converted to lower case, and a hyphen is inserted just
 * before the match location. The important thing here is that additional operations are needed on the matched item before it is
 * given back as a replacement.
 *
 * The replacement function accepts the matched snippet as its parameter, and uses it to transform the case and concatenate the
 * hyphen before returning.
 *
 *     function styleHyphenFormat(propertyName)
 *     {
 *         function upperToHyphenLower(match)
 *         {
 *             return '-' + match.toLowerCase();
 *         }
 *         return propertyName.replace(/[A-Z]/, upperToHyphenLower);
 *     }
 *
 * Given `styleHyphenFormat('borderTop')`, this returns 'border-top'.
 *
 * Because we want to further transform the _result_ of the match before the final substitution is made, we must use a function.
 * This forces the evaluation of the match prior to the `toLowerCase()` method. If we had tried to do this using the match without a
 *  function, the `toLowerCase()` would have no effect.
 *
 *     var newString = propertyName.replace(/[A-Z]/, '-' + '$&'.toLowerCase());  // won't work
 *
 * This is because `'$&'.toLowerCase()` would be evaluated first as a string literal (resulting in the same `'$&'`) before using the
 * characters as a pattern.
 *
 * The following example replaces a Fahrenheit degree with its equivalent Celsius degree. The Fahrenheit degree should be a number
 * ending with F. The function returns the Celsius number ending with C. For example, if the input number is 212F, the function
 *  returns 100C. If the number is 0F, the function returns -17.77777777777778C.
 *
 * The regular expression `test` checks for any number that ends with F. The number of Fahrenheit degree is accessible to the
 * function through its second parameter, `p1`. The function sets the Celsius number based on the Fahrenheit degree passed in a
 * string to the `f2c` function. `f2c` then returns the Celsius number. This function approximates Perl's `s///e` flag.
 *
 *     function f2c(x)
 *     {
 *         function convert(str, p1, offset, s)
 *         {
 *             return ((p1-32) * 5/9) + "C";
 *         }
 *         var s = String(x);
 *         var test = /(\d+(?:\.\d*)?)F\b/g;
 *         return s.replace(test, convert);
 *     }
 *
 * @param {String/RegExp} pattern Either a string or regular expression pattern to search for.
 *
 * @param {String/Function} replacement Either string or function:
 *
 * - The String to replace the `pattern` with. Number of special replacement patterns are supported;
 *   see the "Specifying a string as a parameter" section above.
 * - A function to be invoked to create the replacement.
 *   The arguments supplied to this function are described in the "Specifying a function as a parameter"
 *   section above.
 *
 * @return {String} String of matched replaced items.
 */

/**
 * @method search
 * Executes the search for a match between a regular expression and a specified string.
 *
 * If successful, search returns the index of the regular expression inside the string. Otherwise, it
 * returns -1.
 *
 * When you want to know whether a pattern is found in a string use search (similar to the regular
 * expression `test` method); for more information (but slower execution) use `match` (similar to the
 * regular expression `exec` method).
 *
 * The following example prints a message which depends on the success of the test.
 *
 *     function testinput(re, str){
 *         if (str.search(re) != -1)
 *             midstring = " contains ";
 *         else
 *             midstring = " does not contain ";
 *         document.write (str + midstring + re);
 *     }
 *
 * @param {RegExp} regexp A regular expression object. If a non-RegExp object obj is passed, it is
 * implicitly converted to a RegExp by using `new RegExp(obj)`.
 * @return {Number} If successful, search returns the index of the regular
 * expression inside the string. Otherwise, it returns -1.
 */

/**
 * @method slice
 * Extracts a section of a string and returns a new string.
 *
 * `slice` extracts the text from one string and returns a new string. Changes to the text in one
 * string do not affect the other string.
 *
 * `slice` extracts up to but not including `endSlice`. `string.slice(1,4)` extracts the second
 * character through the fourth character (characters indexed 1, 2, and 3).
 *
 * As a negative index, `endSlice` indicates an offset from the end of the string. `string.slice(2,-1)`
 * extracts the third character through the second to last character in the string.
 *
 * The following example uses slice to create a new string.
 *
 *     // assumes a print function is defined
 *     var str1 = "The morning is upon us.";
 *     var str2 = str1.slice(4, -2);
 *     print(str2);
 *
 * This writes:
 *
 *     morning is upon u
 *
 * @param {Number} beginSlice The zero-based index at which to begin extraction.
 * @param {Number} endSlice The zero-based index at which to end extraction. If omitted, `slice`
 * extracts to the end of the string.
 * @return {String} All characters from specified start up to (but excluding)
 * end.
 */

/**
 * @method split
 * Splits a `String` object into an array of strings by separating the string into substrings.
 *
 * The `split` method returns the new array.
 *
 * When found, `separator` is removed from the string and the substrings are returned in an array. If
 * `separator` is omitted, the array contains one element consisting of the entire string.
 *
 * If `separator` is a regular expression that contains capturing parentheses, then each time separator
 * is matched the results (including any undefined results) of the capturing parentheses are spliced
 * into the output array. However, not all browsers support this capability.
 *
 * Note: When the string is empty, `split` returns an array containing one empty string, rather than an
 * empty array.
 *
 * The following example defines a function that splits a string into an array of strings using the
 * specified separator. After splitting the string, the function displays messages indicating the
 * original string (before the split), the separator used, the number of elements in the array, and the
 * individual array elements.
 *
 *     function splitString(stringToSplit,separator)
 *     {
 *         var arrayOfStrings = stringToSplit.split(separator);
 *         print('The original string is: "' + stringToSplit + '"');
 *         print('The separator is: "' + separator + '"');
 *         print("The array has " + arrayOfStrings.length + " elements: ");
 *
 *         for (var i=0; i < arrayOfStrings.length; i++)
 *             print(arrayOfStrings[i] + " / ");
 *     }
 *
 *     var tempestString = "Oh brave new world that has such people in it.";
 *     var monthString = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec";
 *
 *     var space = " ";
 *     var comma = ",";
 *
 *     splitString(tempestString, space);
 *     splitString(tempestString);
 *     splitString(monthString, comma);
 *
 * This example produces the following output:
 *
 *     The original string is: "Oh brave new world that has such people in it."
 *     The separator is: " "
 *     The array has 10 elements: Oh / brave / new / world / that / has / such / people / in / it. /
 *
 *     The original string is: "Oh brave new world that has such people in it."
 *     The separator is: "undefined"
 *     The array has 1 elements: Oh brave new world that has such people in it. /
 *
 * The original string is: "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec"
 * The separator is: ","
 * The array has 12 elements: Jan / Feb / Mar / Apr / May / Jun / Jul / Aug / Sep / Oct / Nov / Dec /
 *
 * In the following example, `split` looks for 0 or more spaces followed by a semicolon followed by 0
 * or more spaces and, when found, removes the spaces from the string. nameList is the array returned
 * as a result of split.
 *
 *     var names = "Harry Trump ;Fred Barney; Helen Rigby ; Bill Abel ;Chris Hand ";
 *     print(names);
 *     var re = /\s*;\s*\/;
 *     var nameList = names.split(re);
 *     print(nameList);
 *
 * This prints two lines; the first line prints the original string, and the second line prints the
 * resulting array.
 *
 *     Harry Trump ;Fred Barney; Helen Rigby ; Bill Abel ;Chris Hand
 *     Harry Trump,Fred Barney,Helen Rigby,Bill Abel,Chris Hand
 *
 * In the following example, split looks for 0 or more spaces in a string and returns the first 3
 * splits that it finds.
 *
 *     var myString = "Hello World. How are you doing?";
 *     var splits = myString.split(" ", 3);
 *     print(splits);
 *
 * This script displays the following:
 *
 *     Hello,World.,How
 *
 * If `separator` contains capturing parentheses, matched results are returned in the array.
 *
 *     var myString = "Hello 1 word. Sentence number 2.";
 *     var splits = myString.split(/(\d)/);
 *     print(splits);
 *
 * This script displays the following:
 *
 *     Hello ,1, word. Sentence number ,2, .
 *
 * @param {String} seperator Specifies the character to use for separating the string. The separator is treated as a string or a
 * regular expression. If separator is omitted, the array returned contains one element consisting of the entire string.
 * @param {Number} limit Integer specifying a limit on the number of splits to be found.  The split method still splits on every
 * match of separator, but it truncates the returned array to at most limit elements.
 * @return {Array} Substrings are returned in an array.
 */

/**
 * @method substr
 * Returns the characters in a string beginning at the specified location through the specified number
 * of characters.
 *
 * `start` is a character index. The index of the first character is 0, and the index of the last
 * character is 1 less than the length of the string. `substr` begins extracting characters at start
 * and collects length characters (unless it reaches the end of the string first, in which case it will
 * return fewer).
 *
 * If `start` is positive and is greater than or equal to the length of the string, `substr` returns an
 * empty string.
 *
 * If `start` is negative, `substr` uses it as a character index from the end of the string. If start
 * is negative and abs(start) is larger than the length of the string, `substr` uses 0 as the start
 * index. Note: the described handling of negative values of the start argument is not supported by
 * Microsoft JScript.
 *
 * If length is 0 or negative, `substr` returns an empty string. If length is omitted, `substr`
 * extracts characters to the end of the string.
 *
 * Consider the following script:
 *
 *     // assumes a print function is defined
 *     var str = "abcdefghij";
 *     print("(1,2): "    + str.substr(1,2));
 *     print("(-3,2): "   + str.substr(-3,2));
 *     print("(-3): "     + str.substr(-3));
 *     print("(1): "      + str.substr(1));
 *     print("(-20, 2): " + str.substr(-20,2));
 *     print("(20, 2): "  + str.substr(20,2));
 *
 * This script displays:
 *
 *     (1,2): bc
 *     (-3,2): hi
 *     (-3): hij
 *     (1): bcdefghij
 *     (-20, 2): ab
 *     (20, 2):
 *
 * @param {Number} start Location at which to begin extracting characters.
 * @param {Number} length The number of characters to extract.
 * @return {String} Modified string.
 */

/**
 * @method substring
 * Returns the characters in a string between two indexes into the string.
 *
 * substring extracts characters from indexA up to but not including indexB. In particular:
 * *   If `indexA` equals `indexB`, `substring` returns an empty string.
 * *   If `indexB` is omitted, substring extracts characters to the end of the string.
 * *   If either argument is less than 0 or is `NaN`, it is treated as if it were 0.
 * *   If either argument is greater than `stringName.length`, it is treated as if it were
 * `stringName.length`.
 *
 * If `indexA` is larger than `indexB`, then the effect of substring is as if the two arguments were
 * swapped; for example, `str.substring(1, 0) == str.substring(0, 1)`.
 *
 * The following example uses substring to display characters from the string "Sencha":
 *
 *     // assumes a print function is defined
 *     var anyString = "Sencha";
 *
 *     // Displays "Sen"
 *     print(anyString.substring(0,3));
 *     print(anyString.substring(3,0));
 *
 *     // Displays "cha"
 *     print(anyString.substring(3,6));
 *     print(anyString.substring(6,3));
 *
 *     // Displays "Sencha"
 *     print(anyString.substring(0,6));
 *     print(anyString.substring(0,10));
 *
 * The following example replaces a substring within a string. It will replace both individual
 * characters and `substrings`. The function call at the end of the example changes the string "Brave
 * New World" into "Brave New Web".
 *
 *     function replaceString(oldS, newS, fullS) {
 *         // Replaces oldS with newS in the string fullS
 *         for (var i = 0; i < fullS.length; i++) {
 *             if (fullS.substring(i, i + oldS.length) == oldS) {
 *                 fullS = fullS.substring(0, i) + newS + fullS.substring(i + oldS.length,
 * fullS.length);
 *             }
 *         }
 *         return fullS;
 *     }
 *
 *     replaceString("World", "Web", "Brave New World");
 *
 * @param {Number} indexA An integer between 0 and one less than the length of the string.
 * @param {Number} indexB (optional) An integer between 0 and the length of the string.
 * @return {String} Returns the characters in a string between two indexes into the string.
 */

/**
 * @method toLocaleLowerCase
 * The characters within a string are converted to lower case while respecting the current locale. For
 * most languages, this will return the same as `toLowerCase`.
 *
 * The `toLocaleLowerCase` method returns the value of the string converted to lower case according to
 * any locale-specific case mappings. `toLocaleLowerCase` does not affect the value of the string
 * itself. In most cases, this will produce the same result as `toLowerCase()`, but for some locales,
 * such as Turkish, whose case mappings do not follow the default case mappings in Unicode, there may
 * be a different result.
 *
 * The following example displays the string "sencha":
 *
 *     var upperText="SENCHA";
 *     document.write(upperText.toLocaleLowerCase());
 *
 * @return {String} Returns value of the string in lowercase.
 */

/**
 * @method toLocaleUpperCase
 * The characters within a string are converted to upper case while respecting the current locale. For
 * most languages, this will return the same as `toUpperCase`.
 *
 * The `toLocaleUpperCase` method returns the value of the string converted to upper case according to
 * any locale-specific case mappings. `toLocaleUpperCase` does not affect the value of the string
 * itself. In most cases, this will produce the same result as `toUpperCase()`, but for some locales,
 * such as Turkish, whose case mappings do not follow the default case mappings in Unicode, there may
 * be a different result.
 *
 * The following example displays the string "SENCHA":
 *
 *     var lowerText="sencha";
 *     document.write(lowerText.toLocaleUpperCase());
 *
 * @return {String} Returns value of the string in uppercase.
 */

/**
 * @method toLowerCase
 * Returns the calling string value converted to lower case.
 *
 * The `toLowerCase` method returns the value of the string converted to lowercase. `toLowerCase` does
 * not affect the value of the string itself.
 *
 * The following example displays the lowercase string "sencha":
 *
 *     var upperText="SENCHA";
 *     document.write(upperText.toLowerCase());
 *
 * @return {String} Returns value of the string in lowercase.
 */

/**
 * @method toString
 * Returns a string representing the specified object. Overrides the `Object.toString` method.
 *
 * The `String` object overrides the `toString` method of the `Object` object; it does not inherit
 * `Object.toString`. For `String` objects, the `toString` method returns a string representation of
 * the object.
 *
 * The following example displays the string value of a String object:
 *
 *     x = new String("Hello world");
 *     alert(x.toString())      // Displays "Hello world"
 *
 * @return {String} A string representation of the object.
 */

/**
 * @method toUpperCase
 * Returns the calling string value converted to uppercase.
 *
 * The `toUpperCase` method returns the value of the string converted to uppercase. `toUpperCase` does
 * not affect the value of the string itself.
 *
 * The following example displays the string "SENCHA":

 *     var lowerText="sencha";
 *     document.write(lowerText.toUpperCase());
 *
 * @return {String} Returns value of the string in uppercase.
 */

/**
 * @method valueOf
 * Returns the primitive value of the specified object. Overrides the `Object.valueOf` method.
 *
 * The `valueOf` method of String returns the primitive value of a `String` object as a string data
 * type. This value is equivalent to `String.toString`.
 *
 * This method is usually called internally by JavaScript and not explicitly in code.
 *
 *     x = new String("Hello world");
 *     alert(x.valueOf())          // Displays "Hello world"
 *
 * @return {String} Returns value of string.
 */

// ECMAScript 5 methods

/**
 * @method trim
 * Removes whitespace from both ends of the string.
 *
 * Does not affect the value of the string itself.
 *
 * The following example displays the lowercase string `"foo"`:
 *
 *     var orig = "   foo  ";
 *     alert(orig.trim());
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @return {String} A string stripped of whitespace on both ends.
 */
