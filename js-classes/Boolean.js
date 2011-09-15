/**
 * @class Boolean
 *
 * The `Boolean` object is an object wrapper for a boolean value.
 *
 * The value passed as the first parameter is converted to a boolean value, if necessary. If value is
 * omitted or is 0, -0, null, false, `NaN`, undefined, or the empty string (""), the object has an
 * initial value of false. All other values, including any object or the string `"false"`, create an
 * object with an initial value of true.
 *
 * Do not confuse the primitive Boolean values true and false with the true and false values of the
 * Boolean object.
 *
 * Any object whose value is not `undefined` or `null`, including a Boolean object whose value is false,
 * evaluates to true when passed to a conditional statement. For example, the condition in the following
 * if statement evaluates to true:
 *
 *     x = new Boolean(false);
 *     if (x) {
 *         // . . . this code is executed
 *     }
 *
 * This behavior does not apply to Boolean primitives. For example, the condition in the following if
 * statement evaluates to `false`:
 *     x = false;
 *     if (x) {
 *         // . . . this code is not executed
 *     }
 *
 * Do not use a `Boolean` object to convert a non-boolean value to a boolean value. Instead, use Boolean
 * as a function to perform this task:
 *
 *     x = Boolean(expression);     // preferred
 *     x = new Boolean(expression); // don't use
 *
 * If you specify any object, including a Boolean object whose value is false, as the initial value of a
 * Boolean object, the new Boolean object has a value of true.
 *
 *     myFalse = new Boolean(false);   // initial value of false
 *     g = new Boolean(myFalse);       // initial value of true
 *     myString = new String("Hello"); // string object
 *     s = new Boolean(myString);      // initial value of true
 *
 * Do not use a Boolean object in place of a Boolean primitive.
 *
 * # Creating Boolean objects with an initial value of false
 *
 *     bNoParam = new Boolean();
 *     bZero = new Boolean(0);
 *     bNull = new Boolean(null);
 *     bEmptyString = new Boolean("");
 *     bfalse = new Boolean(false);
 *
 * # Creating Boolean objects with an initial value of true
 *
 *     btrue = new Boolean(true);
 *     btrueString = new Boolean("true");
 *     bfalseString = new Boolean("false");
 *     bSuLin = new Boolean("Su Lin");
 *
 * <div class="notice">
 * Documentation for this class comes from <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Boolean">MDN</a>
 * and is available under <a href="http://creativecommons.org/licenses/by-sa/2.0/">Creative Commons: Attribution-Sharealike license</a>.
 * </div>
 */

/**
 * @method constructor
 * Creates a new boolean object.
 * @param {Object} value Either a truthy or falsy value to create the corresponding Boolean object.
 */

//Methods

/**
 * @method toString
 * Returns a string of either "true" or "false" depending upon the value of the object.
 * Overrides the `Object.prototype.toString` method.
 *
 * The Boolean object overrides the `toString` method of the `Object` object; it does not inherit
 * `Object.toString`. For Boolean objects, the `toString` method returns a string representation of
 * the object.
 *
 * JavaScript calls the `toString` method automatically when a Boolean is to be represented as a text
 * value or when a Boolean is referred to in a string concatenation.
 *
 * For Boolean objects and values, the built-in `toString` method returns the string `"true"` or
 * `"false"` depending on the value of the boolean object. In the following code, `flag.toString`
 * returns `"true"`.
 *
 *     var flag = new Boolean(true)
 *     var myVar = flag.toString()
 *
 * @return {String} The boolean value represented as a string.
 */

/**
 * @method valueOf
 * Returns the primitive value of the `Boolean` object. Overrides the `Object.prototype.valueOf` method.
 *
 * The `valueOf` method of Boolean returns the primitive value of a Boolean object or literal Boolean
 * as a Boolean data type.
 *
 * This method is usually called internally by JavaScript and not explicitly in code.
 *
 *     x = new Boolean();
 *     myVar = x.valueOf()      //assigns false to myVar
 *
 * @return {Boolean} The primitive value.
 */