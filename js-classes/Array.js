/**
 * @class Array
 *
 * In JavaScript, the `Array` property of the global object is a constructor for
 * array instances.
 *
 * An array is a JavaScript object. Note that you shouldn't use it as an
 * associative array, use {@link Object} instead.
 *
 * # Creating an Array
 *
 * The following example creates an array, msgArray, with a length of 0, then assigns values to
 * msgArray[0] and msgArray[99], changing the length of the array to 100.
 *
 *     var msgArray = new Array();
 *     msgArray[0] = "Hello";
 *     msgArray[99] = "world";
 *
 *     if (msgArray.length == 100)
 *     print("The length is 100.");
 *
 * # Creating a Two-dimensional Array
 *
 * The following creates chess board as a two dimensional array of strings. The first move is made by
 * copying the 'P' in 6,4 to 4,4. The position 4,4 is left blank.
 *
 *     var board =
 *     [ ['R','N','B','Q','K','B','N','R'],
 *     ['P','P','P','P','P','P','P','P'],
 *     [' ',' ',' ',' ',' ',' ',' ',' '],
 *     [' ',' ',' ',' ',' ',' ',' ',' '],
 *     [' ',' ',' ',' ',' ',' ',' ',' '],
 *     [' ',' ',' ',' ',' ',' ',' ',' '],
 *     ['p','p','p','p','p','p','p','p'],
 *     ['r','n','b','q','k','b','n','r']];
 *     print(board.join('\n') + '\n\n');
 *
 *     // Move King's Pawn forward 2
 *     board[4][4] = board[6][4];
 *     board[6][4] = ' ';
 *     print(board.join('\n'));
 *
 * Here is the output:
 *
 *     R,N,B,Q,K,B,N,R
 *     P,P,P,P,P,P,P,P
 *      , , , , , , ,
 *      , , , , , , ,
 *      , , , , , , ,
 *      , , , , , , ,
 *     p,p,p,p,p,p,p,p
 *     r,n,b,q,k,b,n,r
 *
 *     R,N,B,Q,K,B,N,R
 *     P,P,P,P,P,P,P,P
 *      , , , , , , ,
 *      , , , , , , ,
 *      , , , ,p, , ,
 *      , , , , , , ,
 *     p,p,p,p, ,p,p,p
 *     r,n,b,q,k,b,n,r
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
 * <div class="notice">
 * Documentation for this class comes from <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array">MDN</a>
 * and is available under <a href="http://creativecommons.org/licenses/by-sa/2.0/">Creative Commons: Attribution-Sharealike license</a>.
 * </div>
 *
 */

/**
 * @method constructor
 * Creates new Array object.
 *
 * @param {Number/Object...} items Either a number that specifies the length of array or any number of items
 * for the array.
 */

// Properties

/**
 * @property {Number} length
 * Reflects the number of elements in an array.
 *
 * The value of the `length` property is an integer with a positive sign and a value less than 2 to the 32
 * power (232).
 *
 * You can set the `length` property to truncate an array at any time. When you extend an array by changing
 * its `length` property, the number of actual elements does not increase; for example, if you set `length`
 * to 3 when it is currently 2, the array still contains only 2 elements.
 *
 * In the following example the array numbers is iterated through by looking at the `length` property to see
 * how many elements it has. Each value is then doubled.
 *
 *     var numbers = [1,2,3,4,5];
 *     for (var i = 0; i < numbers.length; i++) {
 *         numbers[i] *= 2;
 *     }
 *     // numbers is now [2,4,6,8,10];
 *
 * The following example shortens the array `statesUS` to a length of 50 if the current `length` is greater
 * than 50.
 *
 *     if (statesUS.length > 50) {
 *         statesUS.length=50
 *     }
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
 * @return {Object} The last element in the array
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
 * ### Adding elements to an array
 *
 * The following code creates the sports array containing two elements, then appends two elements
 * to it. After the code executes, sports contains 4 elements: "soccer", "baseball", "football"
 * and "swimming".
 *
 *     var sports = ["soccer", "baseball"];
 *     sports.push("football", "swimming");
 *
 * @param {Object...} elements The elements to add to the end of the array.
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
 *
 * The `shift` method removes the element at the zeroeth index and shifts the values at consecutive
 * indexes down, then returns the removed value.
 *
 * `shift` is intentionally generic; this method can be called or applied to objects resembling
 * arrays. Objects which do not contain a `length` property reflecting the last in a series of
 * consecutive, zero-based numerical properties may not behave in any meaningful manner.
 *
 * The following code displays the `myFish` array before and after removing its first element. It also
 * displays the removed element:
 *
 *     // assumes a println function is defined
 *     var myFish = ["angel", "clown", "mandarin", "surgeon"];
 *     println("myFish before: " + myFish);
 *     var shifted = myFish.shift();
 *     println("myFish after: " + myFish);
 *     println("Removed this element: " + shifted);
 *
 * This example displays the following:
 *
 *     myFish before: angel,clown,mandarin,surgeon
 *     myFish after: clown,mandarin,surgeon
 *     Removed this element: angel
 *
 * @return {Object} The first element of the array prior to shifting.
 */

/**
 * @method sort
 * Sorts the elements of an array.
 *
 * If `compareFunction` is not supplied, elements are sorted by converting them to strings and
 * comparing strings in lexicographic ("dictionary" or "telephone book," not numerical) order. For
 * example, "80" comes before "9" in lexicographic order, but in a numeric sort 9 comes before 80.
 *
 * If `compareFunction` is supplied, the array elements are sorted according to the return value of
 * the compare function. If a and b are two elements being compared, then:
 * If `compareFunction(a, b)` is less than 0, sort `a` to a lower index than `b`.
 * If `compareFunction(a, b)` returns 0, leave `a` and `b` unchanged with respect to each other, but
 * sorted with respect to all different elements. Note: the ECMAscript standard does not guarantee
 * this behaviour, and thus not all browsers respect this.
 * If `compareFunction(a, b)` is greater than 0, sort `b` to a lower index than `a`.
 * `compareFunction(a, b)` must always returns the same value when given a specific pair of elements a
 * and b as its two arguments. If inconsistent results are returned then the sort order is undefined
 *
 * So, the compare function has the following form:
 *
 *     function compare(a, b)
 *     {
 *         if (a is less than b by some ordering criterion)
 *             return -1;
 *         if (a is greater than b by the ordering criterion)
 *            return 1;
 *         // a must be equal to b
 *         return 0;
 *     }
 *
 * To compare numbers instead of strings, the compare function can simply subtract `b` from `a`:
 *
 *     function compareNumbers(a, b)
 *     {
 *     return a - b;
 *     }
 *
 * The sort() method can be conveniently used with closures:
 *
 *     var numbers = [4, 2, 5, 1, 3];
 *     numbers.sort(function(a, b) {
 *         return a - b;
 *     });
 *     print(numbers);
 *
 * @param {Function} compareFunction Specifies a function that defines the sort order. If omitted, the
 * array is sorted lexicographically (in dictionary order) according to the string conversion of each
 * element.
 * @return {Array} A reference to the array
 */

/**
 * @method splice
 * Adds and/or removes elements from an array.
 *
 * If you specify a different number of elements to insert than the number you're removing, the array
 * will have a different length at the end of the call.
 *
 *     // assumes a print function is defined
 *     var myFish = ["angel", "clown", "mandarin", "surgeon"];
 *     print("myFish: " + myFish);
 *
 *     var removed = myFish.splice(2, 0, "drum");
 *     print("After adding 1: " + myFish);
 *     print("removed is: " + removed);
 *
 *     removed = myFish.splice(3, 1);
 *     print("After removing 1: " + myFish);
 *     print("removed is: " + removed);
 *
 *     removed = myFish.splice(2, 1, "trumpet");
 *     print("After replacing 1: " + myFish);
 *     print("removed is: " + removed);
 *
 *     removed = myFish.splice(0, 2, "parrot", "anemone", "blue");
 *     print("After replacing 2: " + myFish);
 *     print("removed is: " + removed);
 *
 * This script displays:
 *
 *     myFish: angel,clown,mandarin,surgeon
 *     After adding 1: angel,clown,drum,mandarin,surgeon
 *     removed is:
 *     After removing 1: angel,clown,drum,surgeon
 *     removed is: mandarin
 *     After replacing 1: angel,clown,trumpet,surgeon
 *     removed is: drum
 *     After replacing 2: parrot,anemone,blue,trumpet,surgeon
 *     removed is: angel,clown
 *
 * @param {Number} index Index at which to start changing the array. If negative, will begin that
 * many elements from the end.
 * @param {Number} howMany An integer indicating the number of old array elements to remove. If
 * `howMany` is 0, no elements are removed. In this case, you should specify at least one new element.
 * If no `howMany` parameter is specified all elements after index are removed.
 * @param {Object...} elements The elements to add to the array. If you don't specify any
 * elements, `splice` simply removes elements from the array.
 * @return {Array} An array containing the removed elements. If only one element is removed, an array
 * of one element is returned..
 */

/**
 * @method unshift
 * Adds one or more elements to the front of an array and returns the new length of the array.
 *
 * The `unshift` method inserts the given values to the beginning of an array-like object.
 *
 * `unshift` is intentionally generic; this method can be called or applied to objects resembling
 * arrays. Objects which do not contain a `length` property reflecting the last in a series of
 * consecutive, zero-based numerical properties may not behave in any meaningful manner.
 *
 * The following code displays the myFish array before and after adding elements to it.
 *
 *     // assumes a println function exists
 *     myFish = ["angel", "clown"];
 *     println("myFish before: " + myFish);
 *     unshifted = myFish.unshift("drum", "lion");
 *     println("myFish after: " + myFish);
 *     println("New length: " + unshifted);
 *
 * This example displays the following:
 *
 *     myFish before: ["angel", "clown"]
 *     myFish after: ["drum", "lion", "angel", "clown"]
 *     New length: 4
 *
 * @param {Object...} elements The elements to add to the front of the array.
 * @return {Number} The array's new length.
 */

// Accessor methods. These methods do not modify the array and return some representation of the array.

/**
 * @method concat
 * Returns a new array comprised of this array joined with other array(s) and/or value(s).
 *
 * `concat` creates a new array consisting of the elements in the `this` object on which it is called,
 * followed in order by, for each argument, the elements of that argument (if the argument is an
 * array) or the argument itself (if the argument is not an array).
 *
 * `concat` does not alter `this` or any of the arrays provided as arguments but instead returns a
 * "one level deep" copy that contains copies of the same elements combined from the original arrays.
 * Elements of the original arrays are copied into the new array as follows:
 * Object references (and not the actual object): `concat` copies object references into the new
 * array. Both the original and new array refer to the same object. That is, if a referenced object is
 * modified, the changes are visible to both the new and original arrays.
 * Strings and numbers (not {@link String} and {@link Number} objects): `concat` copies the values of
 * strings and numbers into the new array.
 *
 * Any operation on the new array will have no effect on the original arrays, and vice versa.
 *
 * ### Concatenating two arrays
 *
 * The following code concatenates two arrays:
 *
 *     var alpha = ["a", "b", "c"];
 *     var numeric = [1, 2, 3];
 *
 *     // creates array ["a", "b", "c", 1, 2, 3]; alpha and numeric are unchanged
 *     var alphaNumeric = alpha.concat(numeric);
 *
 * ### Concatenating three arrays
 *
 * The following code concatenates three arrays:
 *
 *     var num1 = [1, 2, 3];
 *     var num2 = [4, 5, 6];
 *     var num3 = [7, 8, 9];
 *
 *     // creates array [1, 2, 3, 4, 5, 6, 7, 8, 9]; num1, num2, num3 are unchanged
 *     var nums = num1.concat(num2, num3);
 *
 * ### Concatenating values to an array
 *
 * The following code concatenates three values to an array:
 *
 *     var alpha = ['a', 'b', 'c'];
 *
 *     // creates array ["a", "b", "c", 1, 2, 3], leaving alpha unchanged
 *     var alphaNumeric = alpha.concat(1, [2, 3]);
 *
 * @param {Object...} values Arrays and/or values to concatenate to the resulting array.
 * @return {Array} New array.
 */

/**
 * @method join
 * Joins all elements of an array into a string.
 *
 * The string conversions of all array elements are joined into one string.
 *
 * The following example creates an array, `a`, with three elements, then joins the array three times:
 * using the default separator, then a comma and a space, and then a plus.
 *
 *     var a = new Array("Wind","Rain","Fire");
 *     var myVar1 = a.join();      // assigns "Wind,Rain,Fire" to myVar1
 *     var myVar2 = a.join(", ");  // assigns "Wind, Rain, Fire" to myVar2
 *     var myVar3 = a.join(" + "); // assigns "Wind + Rain + Fire" to myVar3
 *
 * @param {String} separator Specifies a string to separate each element of the array. The separator
 * is converted to a string if necessary. If omitted, the array elements are separated with a comma.
 * @return {String} A string of the array elements.
 */

/**
 * @method slice
 * Extracts a section of an array and returns a new array.
 *
 * `slice` does not alter the original array, but returns a new "one level deep" copy that contains
 * copies of the elements sliced from the original array. Elements of the original array are copied
 * into the new array as follows:
 * *   For object references (and not the actual object), `slice` copies object references into the
 * new array. Both the original and new array refer to the same object. If a referenced object
 * changes, the changes are visible to both the new and original arrays.
 * *   For strings and numbers (not {@link String} and {@link Number} objects), `slice` copies strings
 * and numbers into the new array. Changes to the string or number in one array does not affect the
 * other array.
 *
 * If a new element is added to either array, the other array is not affected.
 *
 * ### Using slice
 *
 * In the following example, `slice` creates a new array, `newCar`, from `myCar`. Both include a
 * reference to the object `myHonda`. When the color of `myHonda` is changed to purple, both arrays
 * reflect the change.
 *
 *     // Using slice, create newCar from myCar.
 *     var myHonda = { color: "red", wheels: 4, engine: { cylinders: 4, size: 2.2 } };
 *     var myCar = [myHonda, 2, "cherry condition", "purchased 1997"];
 *     var newCar = myCar.slice(0, 2);
 *
 *     // Print the values of myCar, newCar, and the color of myHonda
 *     //  referenced from both arrays.
 *     print("myCar = " + myCar.toSource());
 *     print("newCar = " + newCar.toSource());
 *     print("myCar[0].color = " + myCar[0].color);
 *     print("newCar[0].color = " + newCar[0].color);
 *
 *     // Change the color of myHonda.
 *     myHonda.color = "purple";
 *     print("The new color of my Honda is " + myHonda.color);
 *
 *     // Print the color of myHonda referenced from both arrays.
 *     print("myCar[0].color = " + myCar[0].color);
 *     print("newCar[0].color = " + newCar[0].color);
 *
 * This script writes:
 *
 *     myCar = [{color:"red", wheels:4, engine:{cylinders:4, size:2.2}}, 2, "cherry condition",
 *     "purchased 1997"]
 *     newCar = [{color:"red", wheels:4, engine:{cylinders:4, size:2.2}}, 2]
 *     myCar[0].color = red
 *     newCar[0].color = red
 *     The new color of my Honda is purple
 *     myCar[0].color = purple
 *     newCar[0].color = purple
 *
 * @param {Number} begin Zero-based index at which to begin extraction.
 * As a negative index, `start` indicates an offset from the end of the sequence. `slice(-2)` extracts
 * the second-to-last element and the last element in the sequence
 * @param {Number} end Zero-based index at which to end extraction. `slice` extracts up to but not
 * including `end`.
 * `slice(1,4)` extracts the second element through the fourth element (elements indexed 1, 2, and 3).
 * As a negative index, end indicates an offset from the end of the sequence. `slice(2,-1)` extracts
 * the third element through the second-to-last element in the sequence.
 * If `end` is omitted, `slice` extracts to the end of the sequence.
 * @return {Array} Array from the new start position up to (but not including) the specified end position.
 */

/**
 * @method toString
 * Returns a string representing the array and its elements. Overrides the `Object.prototype.toString`
 * method.
 *
 * The {@link Array} object overrides the `toString` method of {@link Object}. For Array objects, the
 * `toString` method joins the array and returns one string containing each array element separated by
 * commas. For example, the following code creates an array and uses `toString` to convert the array
 * to a string.
 *
 *     var monthNames = new Array("Jan","Feb","Mar","Apr");
 *     myVar = monthNames.toString(); // assigns "Jan,Feb,Mar,Apr" to myVar
 *
 * JavaScript calls the `toString` method automatically when an array is to be represented as a text
 * value or when an array is referred to in a string concatenation.
 *
 * @return {String} The array as a string.
 */

// ECMAScript 5 methods

/**
 * @method isArray
 * @static
 * Returns true if an object is an array, false if it is not.
 *
 *     // all following calls return true
 *     Array.isArray([]);
 *     Array.isArray([1]);
 *     Array.isArray( new Array() );
 *     Array.isArray( Array.prototype ); // Little known fact: Array.prototype itself is an array.
 *
 *     // all following calls return false
 *     Array.isArray();
 *     Array.isArray({});
 *     Array.isArray(null);
 *     Array.isArray(undefined);
 *     Array.isArray(17);
 *     Array.isArray("Array");
 *     Array.isArray(true);
 *     Array.isArray(false);
 *     Array.isArray({ __proto__ : Array.prototype });
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Mixed} obj The object to be checked.
 * @return {Boolean} True when Array.
 */

/**
 * @method indexOf
 * Returns the first index at which a given element can be found in the array, or -1 if it is not present.
 *
 * `indexOf` compares `searchElement` to elements of the Array using strict equality (the same method used
 * by the `===`, or triple-equals, operator).
 *
 *     var array = [2, 5, 9];
 *     var index = array.indexOf(2);
 *     // index is 0
 *     index = array.indexOf(7);
 *     // index is -1
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Mixed} searchElement Element to locate in the array.
 * @param {Number} [fromIndex] The index at which to begin the search. Defaults to 0, i.e. the whole array
 * will be searched. If the index is greater than or equal to the length of the array, -1 is returned, i.e.
 * the array will not be searched. If negative, it is taken as the offset from the end of the array. Note
 * that even when the index is negative, the array is still searched from front to back. If the calculated
 * index is less than 0, the whole array will be searched.
 * @return {Number} The index of element found or -1.
 */

/**
 * @method lastIndexOf
 * Returns the last index at which a given element can be found in the array, or -1 if it is not present.
 * The array is searched backwards, starting at `fromIndex`.
 *
 * `lastIndexOf` compares `searchElement` to elements of the Array using strict equality (the same method
 * used by the `===`, or triple-equals, operator).
 *
 *     var array = [2, 5, 9, 2];
 *     var index = array.lastIndexOf(2);
 *     // index is 3
 *     index = array.lastIndexOf(7);
 *     // index is -1
 *     index = array.lastIndexOf(2, 3);
 *     // index is 3
 *     index = array.lastIndexOf(2, 2);
 *     // index is 0
 *     index = array.lastIndexOf(2, -2);
 *     // index is 0
 *     index = array.lastIndexOf(2, -1);
 *     // index is 3
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Mixed} searchElement Element to locate in the array.
 * @param {Number} [fromIndex] The index at which to start searching backwards. Defaults to the array's
 * length, i.e. the whole array will be searched. If the index is greater than or equal to the length of
 * the array, the whole array will be searched. If negative, it is taken as the offset from the end of the
 * array. Note that even when the index is negative, the array is still searched from back to front. If
 * the calculated index is less than 0, -1 is returned, i.e. the array will not be searched.
 * @return {Number} The index of element found or -1.
 */

/**
 * @method forEach
 * Executes a provided function once per array element.
 *
 * `forEach` executes the provided function (`callback`) once for each element present in the array. `callback`
 * is invoked only for indexes of the array which have assigned values; it is not invoked for indexes which
 * have been deleted or which have never been assigned values.
 *
 * If a `thisArg` parameter is provided to `forEach`, it will be used as the `this` value for each `callback`
 * invocation as if `callback.call(thisArg, element, index, array)` was called. If `thisArg` is `undefined` or
 * `null`, the `this` value within the function depends on whether the function is in strict mode or not
 * (passed value if in strict mode, global object if in non-strict mode).
 *
 * The `range` of elements processed by `forEach` is set before the first invocation of `callback`. Elements
 * which are appended to the array after the call to `forEach` begins will not be visited by `callback`. If
 * existing elements of the array are changed, or deleted, their value as passed to callback will be the
 * value at the time `forEach` visits them; elements that are deleted are not visited.
 *
 * The following code logs a line for each element in an array:
 *
 *     function logArrayElements(element, index, array) {
 *         console.log("a[" + index + "] = " + element);
 *     }
 *     [2, 5, 9].forEach(logArrayElements);
 *     // logs:
 *     // a[0] = 2
 *     // a[1] = 5
 *     // a[2] = 9
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Function} callback Function to execute for each element.
 * @param {Mixed} callback.value The element value.
 * @param {Number} callback.index The element index.
 * @param {Array} callback.array The array being traversed.
 * @param {Object} [thisArg] Object to use as `this` when executing `callback`.
 */

/**
 * @method every
 * Tests whether all elements in the array pass the test implemented
 * by the provided function.
 *
 * `every` executes the provided `callback` function once for each element
 * present in the array until it finds one where `callback` returns a
 * false value. If such an element is found, the `every` method
 * immediately returns false. Otherwise, if `callback` returned a true
 * value for all elements, `every` will return true. `callback` is invoked
 * only for indexes of the array which have assigned values; it is not
 * invoked for indexes which have been deleted or which have never
 * been assigned values.
 *
 * If a `thisObject` parameter is provided to `every`, it will be used as
 * the `this` for each invocation of the callback. If it is not
 * provided, or is `null`, the global object associated with callback is
 * used instead.
 *
 * `every` does not mutate the array on which it is called.
 *
 * The range of elements processed by `every` is set before the first
 * invocation of callback. Elements which are appended to the array
 * after the call to every begins will not be visited by `callback`. If
 * existing elements of the array are changed, their value as passed
 * to `callback` will be the value at the time `every` visits them;
 * elements that are deleted are not visited.
 *
 * `every` acts like the "for all" quantifier in mathematics. In
 * particular, for an empty array, it returns true. (It is vacuously
 * true that all elements of the empty set satisfy any given
 * condition.)
 *
 * The following example tests whether all elements in the array are
 * bigger than 10.
 *
 *     function isBigEnough(element, index, array) {
 *       return (element >= 10);
 *     }
 *     var passed = [12, 5, 8, 130, 44].every(isBigEnough);
 *     // passed is false
 *     passed = [12, 54, 18, 130, 44].every(isBigEnough);
 *     // passed is true
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Function} callback Function to test for each element.
 * @param {Mixed} callback.value The element value.
 * @param {Number} callback.index The element index.
 * @param {Array} callback.array The array being traversed.
 * @param {Boolean} callback.return Should return true when element passes the test.
 * @param {Object} [thisObject] Object to use as `this` when executing `callback`.
 * @return {Boolean} True when all elements pass the test.
 */

/**
 * @method some
 * Tests whether some element in the array passes the test implemented
 * by the provided function.
 *
 * `some` executes the `callback` function once for each element
 * present in the array until it finds one where `callback` returns a
 * true value. If such an element is found, some immediately returns
 * true. Otherwise, some returns false. `callback` is invoked only for
 * indexes of the array which have assigned values; it is not invoked
 * for indexes which have been deleted or which have never been
 * assigned values.
 *
 * If a `thisObject` parameter is provided to some, it will be used as
 * the `this` for each invocation of the `callback`. If it is not
 * provided, or is `null`, the global object associated with callback is
 * used instead.
 *
 * `some` does not mutate the array on which it is called.
 *
 * The range of elements processed by `some` is set before the first
 * invocation of callback. Elements that are appended to the array
 * after the call to some begins will not be visited by `callback`. If
 * an existing, unvisited element of the array is changed by `callback`,
 * its value passed to the visiting callback will be the value at the
 * time that `some` visits that element's index; elements that are
 * deleted are not visited.
 *
 * The following example tests whether some element in the array is
 * bigger than 10.
 *
 *     function isBigEnough(element, index, array) {
 *       return (element >= 10);
 *     }
 *     var passed = [2, 5, 8, 1, 4].some(isBigEnough);
 *     // passed is false
 *     passed = [12, 5, 8, 1, 4].some(isBigEnough);
 *     // passed is true
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Function} callback Function to test for each element.
 * @param {Mixed} callback.value The element value.
 * @param {Number} callback.index The element index.
 * @param {Array} callback.array The array being traversed.
 * @param {Boolean} callback.return Should return true when element passes the test.
 * @param {Object} [thisObject] Object to use as `this` when executing `callback`.
 * @return {Boolean} True when at least one element passes the test.
 */

/**
 * @method filter
 * Creates a new array with all elements that pass the test
 * implemented by the provided function.
 *
 * `filter` calls a provided `callback` function once for each element in
 * an array, and constructs a new array of all the values for which
 * `callback` returns a true value. `callback` is invoked only for indexes
 * of the array which have assigned values; it is not invoked for
 * indexes which have been deleted or which have never been assigned
 * values. Array elements which do not pass the `callback` test are
 * simply skipped, and are not included in the new array.
 *
 * If a `thisObject` parameter is provided to `filter`, it will be
 * used as the `this` for each invocation of the `callback`. If it is not
 * provided, or is `null`, the global object associated with callback is
 * used instead.
 *
 * `filter` does not mutate the array on which it is called.
 *
 * The range of elements processed by `filter` is set before the first
 * invocation of `callback`. Elements which are appended to the array
 * after the call to `filter` begins will not be visited by `callback`. If
 * existing elements of the array are changed, or deleted, their value
 * as passed to `callback` will be the value at the time `filter` visits
 * them; elements that are deleted are not visited.
 *
 * The following example uses filter to create a filtered array that
 * has all elements with values less than 10 removed.
 *
 *     function isBigEnough(element, index, array) {
 *       return (element >= 10);
 *     }
 *     var filtered = [12, 5, 8, 130, 44].filter(isBigEnough);
 *     // filtered is [12, 130, 44]
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Function} callback Function to test for each element.
 * @param {Mixed} callback.value The element value.
 * @param {Number} callback.index The element index.
 * @param {Array} callback.array The array being traversed.
 * @param {Boolean} callback.return Should return true when element passes the test.
 * @param {Object} [thisObject] Object to use as `this` when executing `callback`.
 * @return {Array} Array of elements that passed the test.
 */

/**
 * @method map
 * Creates a new array with the results of calling a provided function
 * on every element in this array.
 *
 * `map` calls a provided `callback` function once for each element in
 * an array, in order, and constructs a new array from the
 * results. `callback` is invoked only for indexes of the array which
 * have assigned values; it is not invoked for indexes which have been
 * deleted or which have never been assigned values.
 *
 * If a `thisArg` parameter is provided to map, it will be used as the
 * `this` for each invocation of the `callback`. If it is not provided, or
 * is `null`, the global object associated with callback is used
 * instead.
 *
 * `map` does not mutate the array on which it is called.
 *
 * The range of elements processed by `map` is set before the first
 * invocation of `callback`. Elements which are appended to the array
 * after the call to `map` begins will not be visited by `callback`. If
 * existing elements of the array are changed, or deleted, their value
 * as passed to `callback` will be the value at the time `map` visits
 * them; elements that are deleted are not visited.
 *
 * The following code creates an array of "plural" forms of nouns from
 * an array of their singular forms.
 *
 *     function fuzzyPlural(single) {
 *       var result = single.replace(/o/g, 'e');
 *       if( single === 'kangaroo'){
 *         result += 'se';
 *       }
 *       return result;
 *     }
 *
 *     var words = ["foot", "goose", "moose", "kangaroo"];
 *     console.log(words.map(fuzzyPlural));
 *
 *     // ["feet", "geese", "meese", "kangareese"]
 *
 * The following code takes an array of numbers and creates a new
 * array containing the square roots of the numbers in the first
 * array.
 *
 *     var numbers = [1, 4, 9];
 *     var roots = numbers.map(Math.sqrt);
 *     // roots is now [1, 2, 3], numbers is still [1, 4, 9]
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Function} callback Function that produces an element of the new Array
 * from an element of the current one.
 * @param {Mixed} callback.value The element value.
 * @param {Number} callback.index The element index.
 * @param {Array} callback.array The array being traversed.
 * @param {Boolean} callback.return Should return true when element passes the test.
 * @param {Object} [thisObject] Object to use as `this` when executing `callback`.
 * @return {Array} Array of the return values of `callback` function.
 */

/**
 * @method reduce
 * Applies a function against an accumulator and each value of the
 * array (from left-to-right) as to reduce it to a single value.
 *
 * `reduce` executes the `callback` function once for each element
 * present in the array, excluding holes in the array.
 *
 * The first time the `callback` is called, `previousValue` and
 * `currentValue` can be one of two values. If `initialValue` is
 * provided in the call to `reduce`, then `previousValue` will be equal to
 * `initialValue` and `currentValue` will be equal to the first value in
 * the array. If no `initialValue` was provided, then `previousValue` will
 * be equal to the first value in the array and `currentValue` will be
 * equal to the second.
 *
 * Suppose the following use of reduce occurred:
 *
 *     [0,1,2,3,4].reduce(function(previousValue, currentValue, index, array){
 *       return previousValue + currentValue;
 *     });
 *
 * The callback would be invoked four times, with the arguments and
 * return values in each call being as follows:
 *
 * |             | previousValue | currentValue | index | array       | return value
 * |:------------|:--------------|:-------------|:------|:------------|:------------
 * | first call  | 0             | 1            | 1     | [0,1,2,3,4] | 1
 * | second call | 1             | 2            | 2     | [0,1,2,3,4] | 3
 * | third call  | 3             | 3            | 3     | [0,1,2,3,4] | 6
 * | fourth call | 6             | 4            | 4     | [0,1,2,3,4] | 10
 *
 * The value returned by `reduce` would be that of the last callback
 * invocation (10).
 *
 * If you were to provide an initial value as the second argument to
 * reduce, the result would look like this:
 *
 *     [0,1,2,3,4].reduce(function(previousValue, currentValue, index, array){
 *       return previousValue + currentValue;
 *     }, 10);
 *
 * |             | previousValue | currentValue | index | array       | return value
 * |:------------|:--------------|:-------------|:------|:------------|:------------
 * | first call  | 10            | 0            | 0     | [0,1,2,3,4] | 10
 * | second call | 10            | 1            | 1     | [0,1,2,3,4] | 11
 * | third call  | 11            | 2            | 2     | [0,1,2,3,4] | 13
 * | fourth call | 13            | 3            | 3     | [0,1,2,3,4] | 16
 * | fifth call  | 16            | 4            | 4     | [0,1,2,3,4] | 20
 *
 * The value returned by `reduce` this time would be, of course, 20.
 *
 * Example: Sum up all values within an array:
 *
 *     var total = [0, 1, 2, 3].reduce(function(a, b) {
 *         return a + b;
 *     });
 *     // total == 6
 *
 * Example: Flatten an array of arrays:
 *
 *     var flattened = [[0, 1], [2, 3], [4, 5]].reduce(function(a, b) {
 *         return a.concat(b);
 *     });
 *     // flattened is [0, 1, 2, 3, 4, 5]
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Function} callback Function to execute on each value in the array.
 * @param {Mixed} callback.previousValue The value previously returned in the last
 * invocation of the `callback`, or `initialValue`, if supplied.
 * @param {Mixed} callback.currentValue The current element being processed in the array.
 * @param {Number} callback.index The index of the current element being processed in the array.
 * @param {Array} callback.array The array `reduce` was called upon.
 * @param {Mixed} [initialValue] Object to use as the first argument to the first call
 * of the `callback`.
 * @return {Mixed} The value returned by final invocation of the `callback`.
 */

/**
 * @method reduceRight
 * Applies a function simultaneously against two values of the array
 * (from right-to-left) as to reduce it to a single value.
 *
 * `reduceRight` executes the `callback` function once for each
 * element present in the array, excluding holes in the array.
 *
 * The first time the `callback` is called, `previousValue` and
 * `currentValue` can be one of two values. If `initialValue` is
 * provided in the call to `reduceRight`, then `previousValue` will be equal to
 * `initialValue` and `currentValue` will be equal to the last value in
 * the array. If no `initialValue` was provided, then `previousValue` will
 * be equal to the last value in the array and `currentValue` will be
 * equal to the second-to-last value.
 *
 * Some example run-throughs of the function would look like this:
 *
 *     [0, 1, 2, 3, 4].reduceRight(function(previousValue, currentValue, index, array) {
 *         return previousValue + currentValue;
 *     });
 *
 *     // First call
 *     previousValue = 4, currentValue = 3, index = 3
 *
 *     // Second call
 *     previousValue = 7, currentValue = 2, index = 2
 *
 *     // Third call
 *     previousValue = 9, currentValue = 1, index = 1
 *
 *     // Fourth call
 *     previousValue = 10, currentValue = 0, index = 0
 *
 *     // array is always the object [0,1,2,3,4] upon which reduceRight was called
 *
 *     // Return Value: 10
 *
 * And if you were to provide an initialValue, the result would look like this:
 *
 *     [0, 1, 2, 3, 4].reduceRight(function(previousValue, currentValue, index, array) {
 *         return previousValue + currentValue;
 *     }, 10);
 *
 *     // First call
 *     previousValue = 10, currentValue = 4, index = 4
 *
 *     // Second call
 *     previousValue = 14, currentValue = 3, index = 3
 *
 *     // Third call
 *     previousValue = 17, currentValue = 2, index = 2
 *
 *     // Fourth call
 *     previousValue = 19, currentValue = 1, index = 1
 *
 *     // Fifth call
 *     previousValue = 20, currentValue = 0, index = 0
 *
 *     // array is always the object [0,1,2,3,4] upon which reduceRight was called
 *
 *     // Return Value: 20
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Function} callback Function to execute on each value in the array.
 * @param {Mixed} callback.previousValue The value previously returned in the last
 * invocation of the `callback`, or `initialValue`, if supplied.
 * @param {Mixed} callback.currentValue The current element being processed in the array.
 * @param {Number} callback.index The index of the current element being processed in the array.
 * @param {Array} callback.array The array `reduceRight` was called upon.
 * @param {Mixed} [initialValue] Object to use as the first argument to the first call
 * of the `callback`.
 * @return {Mixed} The value returned by final invocation of the `callback`.
 */
