/**
 * @class Function
 *
 * Every function in JavaScript is actually a `Function` object.
 *
 * `Function` objects created with the `Function` constructor are parsed when the
 * function is created. This is less efficient than declaring a function and
 * calling it within your code, because functions declared with the function
 * statement are parsed with the rest of the code.
 *
 * All arguments passed to the function are treated as the names of the
 * identifiers of the parameters in the function to be created, in the order in
 * which they are passed.
 *
 * Invoking the `Function` constructor as a function (without using the `new`
 * operator) has the same effect as invoking it as a constructor.
 *
 * # Specifying arguments with the `Function` constructor
 *
 * The following code creates a `Function` object that takes two arguments.
 *
 *     // Example can be run directly in your JavaScript console
 *
 *     // Create a function that takes two arguments and returns the sum of those
 *     arguments
 *     var adder = new Function("a", "b", "return a + b");
 *
 *     // Call the function
 *     adder(2, 6);
 *     // > 8
 *
 * The arguments "a" and "b" are formal argument names that are used in the
 * function body, "return a + b".
 *
 * <div class="notice">
 * Documentation for this class comes from <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function">MDN</a>
 * and is available under <a href="http://creativecommons.org/licenses/by-sa/2.0/">Creative Commons: Attribution-Sharealike license</a>.
 * </div>
 */

/**
 * @method constructor
 * Creates new Function object.
 *
 * @param {String...} args
 * Names to be used by the function as formal argument names. Each must be a
 * string that corresponds to a valid JavaScript identifier or a list of such
 * strings separated with a comma; for example "`x`", "`theValue`", or "`a,b`".
 * @param {String} functionBody
 * A string containing the JavaScript statements comprising the function
 * definition.
 */

// Properties

/**
 * @property {Number} length
 * Specifies the number of arguments expected by the function.
 */

//Methods

/**
 * @method apply
 * Applies the method of another object in the context of a different object (the
 * calling object); arguments can be passed as an Array object.
 *
 * You can assign a different this object when calling an existing function. `this` refers to the
 * current object, the calling object. With `apply`, you can write a method once and then inherit it
 * in another object, without having to rewrite the method for the new object.
 *
 * `apply` is very similar to call, except for the type of arguments it supports. You can use an
 * arguments array instead of a named set of parameters. With apply, you can use an array literal, for
 * example, `fun.apply(this, ['eat', 'bananas'])`, or an Array object, for example, `fun.apply(this,
 * new Array('eat', 'bananas'))`.
 *
 * You can also use arguments for the `argsArray` parameter. `arguments` is a local variable of a
 * function. It can be used for all unspecified arguments of the called object. Thus, you do not have
 * to know the arguments of the called object when you use the `apply` method. You can use arguments
 * to pass all the arguments to the called object. The called object is then responsible for handling
 * the arguments.
 *
 * Since ECMAScript 5th Edition you can also use any kind of object which is array like, so in
 * practice this means it's going to have a property length and integer properties in the range
 * `[0...length)`. As an example you can now use a NodeList or a own custom object like `{'length': 2,
 * '0': 'eat', '1': 'bananas'}`.
 *
 * You can use `apply` to chain constructors for an object, similar to Java. In the following example,
 * the constructor for the `Product` object is defined with two parameters, `name` and `value`. Two
 * other functions `Food` and `Toy` invoke `Product` passing `this` and `arguments`. `Product`
 * initializes the properties `name` and `price`, both specialized functions define the category. In
 * this example, the `arguments` object is fully passed to the product constructor and corresponds to
 * the two defined parameters.
 *
 *     function Product(name, price) {
 *         this.name = name;
 *         this.price = price;
 *
 *         if (price < 0)
 *             throw RangeError('Cannot create product "' + name + '" with a negative price');
 *         return this;
 *     }
 *
 *     function Food(name, price) {
 *         Product.apply(this, arguments);
 *         this.category = 'food';
 *     }
 *     Food.prototype = new Product();
 *
 *     function Toy(name, price) {
 *         Product.apply(this, arguments);
 *         this.category = 'toy';
 *     }
 *     Toy.prototype = new Product();
 *
 *     var cheese = new Food('feta', 5);
 *     var fun = new Toy('robot', 40);
 *
 * Clever usage of `apply` allows you to use built-ins functions for some tasks that otherwise
 * probably would have been written by looping over the array values. As an example here we are going
 * to use Math.max/Math.min to find out the maximum/minimum value in an array.
 *
 *     //min/max number in an array
 *     var numbers = [5, 6, 2, 3, 7];
 *
 *     //using Math.min/Math.max apply
 *     var max = Math.max.apply(null, numbers); // This about equal to Math.max(numbers[0], ...) or
 *     // Math.max(5, 6, ..)
 *     var min = Math.min.apply(null, numbers);
 *
 *     //vs. simple loop based algorithm
 *     max = -Infinity, min = +Infinity;
 *
 *     for (var i = 0; i < numbers.length; i++) {
 *     if (numbers[i] > max)
 *         max = numbers[i];
 *     if (numbers[i] < min)
 *         min = numbers[i];
 *     }
 *
 * But beware: in using `apply` this way, you run the risk of exceeding the JavaScript engine's
 * argument length limit. The consequences of applying a function with too many arguments (think more
 * than tens of thousands of arguments) vary across engines, because the limit (indeed even the nature
 * of any excessively-large-stack behavior) is unspecified. Some engines will throw an exception. More
 * perniciously, others will arbitrarily limit the number of arguments actually passed to the applied
 * function. (To illustrate this latter case: if such an engine had a limit of four arguments [actual
 * limits are of course significantly higher], it would be as if the arguments 5, 6, 2, 3 had been
 * passed to apply in the examples above, rather than the full array.)  If your value array might grow
 * into the tens of thousands, use a hybrid strategy: apply your function to chunks of the array at a
 * time:
 *
 *     function minOfArray(arr)
 *     {
 *         var min = Infinity;
 *         var QUANTUM = 32768;
 *         for (var i = 0, len = arr.length; i < len; i += QUANTUM)
 *         {
 *             var submin = Math.min.apply(null, numbers.slice(i, Math.min(i + QUANTUM, len)));
 *             min = Math.min(submin, min);
 *         }
 *     return min;
 *     }
 *
 *     var min = minOfArray([5, 6, 2, 3, 7]);
 *
 * @param {Object} thisArg The value of this provided for the call to fun. Note that this may not be
 * the actual value seen by the method: if the method is a function in non-strict mode code, null and
 * undefined will be replaced with the global object, and primitive values will be boxed.
 * @param {Array} argsArray An array like object, specifying the arguments with which fun should be
 * called, or null or undefined if no arguments should be provided to the function.
 * @return {Object} Returns what the function returns.
 */

/**
 * @method call
 * Calls (executes) a method of another object in the context of a different
 * object (the calling object); arguments can be passed as they are.
 *
 * You can assign a different this object when calling an existing function. `this` refers to the
 * current object, the calling object.
 *
 * With `call`, you can write a method once and then inherit it in another object, without having to
 * rewrite the method for the new object.
 *
 * You can use call to chain constructors for an object, similar to Java. In the following example,
 * the constructor for the product object is defined with two parameters, name and value. Another
 * object, `prod_dept`, initializes its unique variable (`dept`) and calls the constructor for
 * `product` in its constructor to initialize the other variables.
 *
 *     function Product(name, price) {
 *         this.name = name;
 *         this.price = price;
 *
 *         if (price < 0)
 *             throw RangeError('Cannot create product "' + name + '" with a negative price');
 *         return this;
 *     }
 *
 *     function Food(name, price) {
 *         Product.call(this, name, price);
 *         this.category = 'food';
 *     }
 *     Food.prototype = new Product();
 *
 *     function Toy(name, price) {
 *         Product.call(this, name, price);
 *         this.category = 'toy';
 *     }
 *     Toy.prototype = new Product();
 *
 *     var cheese = new Food('feta', 5);
 *     var fun = new Toy('robot', 40);
 *
 * In this purely constructed example, we create anonymous function and use `call` to invoke it on
 * every object in an array. The main purpose of the anonymous function here is to add a print
 * function to every object, which is able to print the right index of the object in the array.
 * Passing the object as `this` value was not strictly necessary, but is done for explanatory purpose.
 *
 *     var animals = [
 *     {species: 'Lion', name: 'King'},
 *     {species: 'Whale', name: 'Fail'}
 *     ];
 *
 *     for (var i = 0; i < animals.length; i++) {
 *         (function (i) {
 *         this.print = function () {
 *             console.log('#' + i  + ' ' + this.species + ': ' + this.name);
 *         }
 *     }).call(animals[i], i);
 *     }
 *
 * @param {Object} thisArg The value of this provided for the call to `fun`.Note that this may not be
 * the actual value seen by the method: if the method is a function in non-strict mode code, `null`
 * and `undefined` will be replaced with the global object, and primitive values will be boxed.
 * @param {Object...} args Arguments for the object.
 * @return {Object} Returns what the function returns.
 */

/**
 * @method toString
 * Returns a string representing the source code of the function. Overrides the
 * `Object.toString` method.
 *
 * The {@link Function} object overrides the `toString` method of the Object object; it does
 * not inherit Object.toString. For `Function` objects, the `toString` method returns a string
 * representation of the object.
 *
 * JavaScript calls the `toString` method automatically when a `Function` is to be represented as a
 * text value or when a Function is referred to in a string concatenation.
 *
 * For `Function` objects, the built-in `toString` method decompiles the function back into the
 * JavaScript source that defines the function. This string includes the `function` keyword, the
 * argument list, curly braces, and function body.
 *
 * @return {String} The function as a string.
 */

// ECMAScript 5 methods

/**
 * @method bind
 *
 * Creates a new function that, when called, has its `this` keyword set
 * to the provided value, with a given sequence of arguments preceding
 * any provided when the new function was called.
 *
 * The `bind()` function creates a new function (a bound function) with
 * the same function body (internal Call attribute in ECMAScript 5
 * terms) as the function it is being called on (the bound function's
 * target function) with the `this` value bound to the first argument of
 * `bind()`, which cannot be overridden. `bind()` also accepts leading
 * default arguments to provide to the target function when the bound
 * function is called. A bound function may also be constructed using
 * the new operator: doing so acts as though the target function had
 * instead been constructed. The provided `this` value is ignored, while
 * prepended arguments are provided to the emulated function.
 *
 * ## Creating a bound function
 *
 * The simplest use of `bind()` is to make a function that, no matter
 * how it is called, is called with a particular `this` value. A common
 * mistake for new JavaScript programmers is to extract a method from
 * an object, then to later call that function and expect it to use
 * the original object as its `this` (e.g. by using that method in
 * callback-based code). Without special care, however, the original
 * object is usually lost. Creating a bound function from the
 * function, using the original object, neatly solves `this` problem:
 *
 *     var x = 9;
 *     var module = {
 *       x: 81,
 *       getX: function() { return this.x; }
 *     };
 *
 *     module.getX(); // 81
 *
 *     var getX = module.getX;
 *     getX(); // 9, because in this case, "this" refers to the global object
 *
 *     // create a new function with 'this' bound to module
 *     var boundGetX = getX.bind(module);
 *     boundGetX(); // 81
 *
 * ## Partial functions
 *
 * The next simplest use of `bind()` is to make a function with
 * pre-specified initial arguments. These arguments (if any) follow
 * the provided this value and are then inserted at the start of the
 * arguments passed to the target function, followed by the arguments
 * passed to the bound function, whenever the bound function is
 * called.
 *
 *     function list() {
 *       return Array.prototype.slice.call(arguments);
 *     }
 *
 *     var list1 = list(1, 2, 3); // [1, 2, 3]
 *
 *     //  Create a function with a preset leading argument
 *     var leadingZeroList = list.bind(undefined, 37);
 *
 *     var list2 = leadingZeroList(); // [37]
 *     var list3 = leadingZeroList(1, 2, 3); // [37, 1, 2, 3]
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Object} thisArg The value to be passed as the `this`
 * parameter to the target function when the bound function is
 * called. The value is ignored if the bound function is constructed
 * using the new operator.
 *
 * @param {Mixed...} [args] Arguments to prepend to arguments provided
 * to the bound function when invoking the target function.
 *
 * @return {Function} The bound function.
 */