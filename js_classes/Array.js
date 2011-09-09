/**
 * @class Array
 *
 * In JavaScript, the Array property of the global object is a constructor for
 * array instances.
 *
 * An array is a JavaScript object. Note that you shouldn't use it as an
 * associative array, use {@link Object} instead.
 *
 * # Accessing array elements
 *
 * Array elements are nothing less than object properties, so they are accessed as such.
 *
 *     var myArray = new Array("Wind", "Rain", "Fire");
 *     myArray[0]; // "Wind"
 *     myArray[1]; // "Rain"
 *     // etc.
 *     myArray.length; // 3
 *
 *     // Even if indices are properties, the following notation throws a syntax error
 *     myArray.2;
 *
 *     // It should be noted that in JavaScript, object property names are strings. Consequently,
 *     myArray[0] === myArray["0"];
 *     myArray[1] === myArray["1"];
 *     // etc.
 *
 *     // However, this should be considered carefully
 *     myArray[02]; // "Fire". The number 02 is converted as the "2" string
 *     myArray["02"]; // undefined. There is no property named "02"
 *
 * # Relationship between length and numerical properties
 *
 * An array's length property and numerical properties are connected. Here is some
 * code explaining how this relationship works.
 *
 *     var a = [];
 *
 *     a[0] = 'a';
 *     console.log(a[0]); // 'a'
 *     console.log(a.length); // 1
 *
 *     a[1] = 32;
 *     console.log(a[1]); // 32
 *     console.log(a.length); // 2
 *
 *     a[13] = 12345;
 *     console.log(a[13]); // 12345
 *     console.log(a.length); // 14
 *
 *     a.length = 10;
 *     console.log(a[13]); // undefined, when reducing the length elements after length+1 are removed
 *     console.log(a.length); // 10
 *
 * # Creating an array using the result of a match
 *
 * The result of a match between a regular expression and a string can create an array.
 * This array has properties and elements that provide information about the match. An
 * array is the return value of RegExp.exec, String.match, and String.replace. To help
 * explain these properties and elements, look at the following example and then refer
 * to the table below:
 *
 *     // Match one d followed by one or more b's followed by one d
 *     // Remember matched b's and the following d
 *     // Ignore case
 *
 *     var myRe = /d(b+)(d)/i;
 *     var myArray = myRe.exec("cdbBdbsbz");
 *
 * The properties and elements returned from this match are as follows:
 *
 *
 * | Property/Element | Description                                                                           | Example
 * |:-----------------|:--------------------------------------------------------------------------------------|:-------------------
 * | `input`          | A read-only property that reflects the original string against which the              | cdbBdbsbz
 * |                  | regular expression was matched.                                                       |
 * | `index`          | A read-only property that is the zero-based index of the match in the string.         | 1
 * | `[0]`            | A read-only element that specifies the last matched characters.                       | dbBd
 * | `[1], ...[n]`    | Read-only elements that specify the parenthesized substring matches, if included in   | [1]: bB [2]: d
 * |                  | the regular expression. The number of possible parenthesized substrings is unlimited. |
 *
 */

// Properties

/**
 * @property constructor
 * Specifies the function that creates an object's prototype.
 */

/**
 * @property length
 * Reflects the number of elements in an array.
 */

// Mutator methods. These methods modify the array:

/**
 * @method pop
 * The pop method removes the last element from an array and returns that value to the caller.
 *
 * `pop` is intentionally generic; this method can be called or applied to objects resembling
 * arrays. Objects which do not contain a length property reflecting the last in a series of
 * consecutive, zero-based numerical properties may not behave in any meaningful manner.
 *
 *     var myFish = ["angel", "clown", "mandarin", "surgeon"];
 *     var popped = myFish.pop();
 *     alert(popped); // Alerts 'surgeon'
 *
 * @return {Mixed} The last element in the array
 */

/**
 * @method push
 * Adds one or more elements to the end of an array and returns the new length of the array.
 *
 * `push` is intentionally generic. This method can be called or applied to objects resembling
 * arrays. The push method relies on a length property to determine where to start inserting
 * the given values. If the length property cannot be converted into a number, the index used
 * is 0. This includes the possibility of length being nonexistent, in which case length will
 * also be created.
 *
 * The only native, array-like objects are strings, although they are not suitable in
 * applications of this method, as strings are immutable.
 *
 * ## Adding elements to an array
 *
 * The following code creates the sports array containing two elements, then appends two elements
 * to it. After the code executes, sports contains 4 elements: "soccer", "baseball", "football"
 * and "swimming".
 *
 *     var sports = ["soccer", "baseball"];
 *     sports.push("football", "swimming");
 *
 * @param {Mixed} element1,...,elementN The elements to add to the end of the array.
 * @return {Number} The new length property of the object upon which the method was called.
 */

/**
 * @method reverse
 * Reverses the order of the elements of an array -- the first becomes the last, and the
 * last becomes the first.
 *
 * The reverse method transposes the elements of the calling array object in place, mutating the
 * array, and returning a reference to the array.
 *
 * The following example creates an array myArray, containing three elements, then reverses the array.
 *
 *     var myArray = ["one", "two", "three"];
 *     myArray.reverse();
 *
 * This code changes myArray so that:
 *
 *  - myArray[0] is "three"
 *  - myArray[1] is "two"
 *  - myArray[2] is "one"
 *
 * @return {Array} A reference to the array
 */

/**
 * @method shift
 * Removes the first element from an array and returns that element.
 */

/**
 * @method sort
 * Sorts the elements of an array.
 */

/**
 * @method splice
 * Adds and/or removes elements from an array.
 */

/**
 * @method unshift
 * Adds one or more elements to the front of an array and returns the new length of the array.
 */

// Accessor methods. These methods do not modify the array and return some representation of the array.

/**
 * @method concat
 * Returns a new array comprised of this array joined with other array(s) and/or value(s).
 */

/**
 * @method join
 * Joins all elements of an array into a string.
 */

/**
 * @method slice
 * Extracts a section of an array and returns a new array.
 */

/**
 * @method toString
 * Returns a string representing the array and its elements. Overrides the Object.prototype.toString method.
 */
