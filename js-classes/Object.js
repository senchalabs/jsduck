/**
 * @class Object
 *
 * Creates an object wrapper.
 *
 * The Object constructor creates an object wrapper for the given value. If the value is null or
 * undefined, it will create and return an empty object, otherwise, it will return an object of a type
 * that corresponds to the given value.
 *
 * When called in a non-constructor context, Object behaves identically.
 *
 * # Using Object given undefined and null types
 *
 * The following examples store an empty Object object in o:
 *     var o = new Object();
 *
 *     var o = new Object(undefined);
 *
 *     var o = new Object(null);
 *
 * # Using Object to create Boolean objects
 *
 * The following examples store Boolean objects in o:
 *
 *     // equivalent to o = new Boolean(true);
 *     var o = new Object(true);
 *
 *     // equivalent to o = new Boolean(false);
 *     var o = new Object(Boolean());
 *
 * <div class="notice">
 * Documentation for this class comes from <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object">MDN</a>
 * and is available under <a href="http://creativecommons.org/licenses/by-sa/2.0/">Creative Commons: Attribution-Sharealike license</a>.
 * </div>
 */

/**
 * @method constructor
 * Creates new Object.
 * @param {Object} [value] The value to wrap.
 */

//Properties

/**
 * @property prototype
 * Allows the addition of properties to all objects of type Object.
 */

//Methods

/**
 * @method hasOwnProperty
 * Returns a boolean indicating whether an object contains the specified property as a direct property
 * of that object and not inherited through the prototype chain.
 *
 * Every object descended from `Object` inherits the `hasOwnProperty` method. This method can be used
 * to determine whether an object has the specified property as a direct property of that object;
 * unlike the `in` operator, this method does not check down the object's prototype chain.
 *
 * The following example determines whether the o object contains a property named prop:
 *
 *     o = new Object();
 *     o.prop = 'exists';
 *
 *     function changeO() {
 *         o.newprop = o.prop;
 *         delete o.prop;
 *     }
 *
 *     o.hasOwnProperty('prop');   //returns true
 *     changeO();
 *     o.hasOwnProperty('prop');   //returns false
 *
 * The following example differentiates between direct properties and properties inherited through the
 * prototype chain:
 *
 *     o = new Object();
 *     o.prop = 'exists';
 *     o.hasOwnProperty('prop');             // returns true
 *     o.hasOwnProperty('toString');         // returns false
 *     o.hasOwnProperty('hasOwnProperty');   // returns false
 *
 * The following example shows how to iterate over the properties of an object without executing on
 * inherit properties.
 *
 *     var buz = {
 *         fog: 'stack'
 *     };
 *
 *     for (var name in buz) {
 *         if (buz.hasOwnProperty(name)) {
 *             alert("this is fog (" + name + ") for sure. Value: " + buz[name]);
 *         }
 *         else {
 *             alert(name); // toString or something else
 *         }
 *     }
 *
 * @param {String} prop The name of the property to test.
 * @return {Boolean} Returns true if object contains specified property; else
 * returns false.
 */

/**
 * @method isPrototypeOf
 * Returns a boolean indication whether the specified object is in the prototype chain of the object
 * this method is called upon.
 *
 * `isPrototypeOf` allows you to check whether or not an object exists within another object's
 * prototype chain.
 *
 * For example, consider the following prototype chain:
 *
 *     function Fee() {
 *         // . . .
 *     }
 *
 *     function Fi() {
 *         // . . .
 *     }
 *     Fi.prototype = new Fee();
 *
 *     function Fo() {
 *         // . . .
 *     }
 *     Fo.prototype = new Fi();
 *
 *     function Fum() {
 *         // . . .
 *     }
 *     Fum.prototype = new Fo();
 *
 * Later on down the road, if you instantiate `Fum` and need to check if `Fi`'s prototype exists
 * within the `Fum` prototype chain, you could do this:
 *
 *     var fum = new Fum();
 *     . . .
 *
 *     if (Fi.prototype.isPrototypeOf(fum)) {
 *     // do something safe
 *     }
 *
 * This, along with the `instanceof` operator particularly comes in handy if you have code that can
 * only function when dealing with objects descended from a specific prototype chain, e.g., to
 * guarantee that certain methods or properties will be present on that object.
 *
 * @param {Object} prototype an object to be tested against each link in the prototype chain of the
 * *object* argument
 * @param {Object} object the object whose prototype chain will be searched
 * @return {Boolean} Returns true if object is a prototype and false if not.
 */

/**
 * @method propertyIsEnumerable
 * Returns a boolean indicating if the internal ECMAScript DontEnum attribute is set.
 *
 * Every object has a `propertyIsEnumerable` method. This method can determine whether the specified
 * property in an object can be enumerated by a `for...in` loop, with the exception of properties
 * inherited through the prototype chain. If the object does not have the specified property, this
 * method returns false.
 *
 * The following example shows the use of `propertyIsEnumerable` on objects and arrays:
 *
 *     var o = {};
 *     var a = [];
 *     o.prop = 'is enumerable';
 *     a[0] = 'is enumerable';
 *
 *     o.propertyIsEnumerable('prop');   // returns true
 *     a.propertyIsEnumerable(0);        // returns true
 *
 * The following example demonstrates the enumerability of user-defined versus built-in properties:
 *
 *     var a = ['is enumerable'];
 *
 *     a.propertyIsEnumerable(0);          // returns true
 *     a.propertyIsEnumerable('length');   // returns false
 *
 *     Math.propertyIsEnumerable('random');   // returns false
 *     this.propertyIsEnumerable('Math');     // returns false
 *
 * Direct versus inherited properties
 *
 *     var a = [];
 *     a.propertyIsEnumerable('constructor');         // returns false
 *
 *     function firstConstructor()
 *     {
 *         this.property = 'is not enumerable';
 *     }
 *     firstConstructor.prototype.firstMethod = function () {};
 *
 *     function secondConstructor()
 *     {
 *         this.method = function method() { return 'is enumerable'; };
 *     }
 *
 *     secondConstructor.prototype = new firstConstructor;
 *     secondConstructor.prototype.constructor = secondConstructor;
 *
 *     var o = new secondConstructor();
 *     o.arbitraryProperty = 'is enumerable';
 *
 *     o.propertyIsEnumerable('arbitraryProperty');   // returns true
 *     o.propertyIsEnumerable('method');              // returns true
 *     o.propertyIsEnumerable('property');            // returns false
 *
 *     o.property = 'is enumerable';
 *
 *     o.propertyIsEnumerable('property');            // returns true
 *
 *     // These return false as they are on the prototype which
 *     // propertyIsEnumerable does not consider (even though the last two
 *     // are iteratable with for-in)
 *     o.propertyIsEnumerable('prototype'); // returns false (as of JS 1.8.1/FF3.6)
 *     o.propertyIsEnumerable('constructor'); // returns false
 *     o.propertyIsEnumerable('firstMethod'); // returns false
 *
 * @param {String} prop The name of the property to test.
 * @return {Boolean} If the object does not have the specified property, this
 * method returns false.
 */

/**
 * @method toLocaleString
 * Returns a string representing the object. This method is meant to be overridden by derived objects
 * for locale-specific purposes.
 *
 * `Object`'s `toLocaleString` returns the result of calling `toString`.
 *
 * This function is provided to give objects a generic `toLocaleString` method, even though not all
 * may use it. Currently, only `Array`, `Number`, and `Date` override `toLocaleString`.
 *
 * @return {String} Object represented as a string.
 */

/**
 * @method toString
 * Returns a string representation of the object.
 *
 * Every object has a `toString()` method that is automatically called when the object is to be
 * represented as a text value or when an object is referred to in a manner in which a string is
 * expected. By default, the `toString()` method is inherited by every object descended from `Object`.
 * If this method is not overridden in a custom object, `toString()` returns "[object type]", where
 * `type` is the object type. The following code illustrates this:
 *
 *     var o = new Object();
 *     o.toString();           // returns [object Object]
 *
 * You can create a function to be called in place of the default `toString()` method. The
 * `toString()` method takes no arguments and should return a string. The `toString()` method you
 * create can be any value you want, but it will be most useful if it carries information about the
 * object.
 *
 * The following code defines the `Dog` object type and creates `theDog`, an object of type `Dog`:
 *
 *     function Dog(name,breed,color,sex) {
 *         this.name=name;
 *         this.breed=breed;
 *         this.color=color;
 *         this.sex=sex;
 *     }
 *
 *     theDog = new Dog("Gabby","Lab","chocolate","female");
 *
 * If you call the `toString()` method on this custom object, it returns the default value inherited
 * from `Object`:
 *
 *     theDog.toString(); //returns [object Object]
 *
 * The following code creates and assigns `dogToString()` to override the default `toString()` method.
 * This function generates a string containing the name, breed, color, and sex of the object, in the
 * form `"property = value;"`.
 *
 *     Dog.prototype.toString = function dogToString() {
 *         var ret = "Dog " + this.name + " is a " + this.sex + " " + this.color + " " + this.breed;
 *         return ret;
 *     }
 *
 * With the preceding code in place, any time theDog is used in a string context, JavaScript
 * automatically calls the `dogToString()` function, which returns the following string:
 *
 *     Dog Gabby is a female chocolate Lab
 *
 * `toString()` can be used with every object and allows you to get its class. To use the
 * `Object.prototype.toString()` with every object, you need to call `Function.prototype.call()` or
 * `Function.prototype.apply()` on it, passing the object you want to inspect as the first parameter
 * called `thisArg`.
 *
 *     var toString = Object.prototype.toString;
 *
 *     toString.call(new Date); // [object Date]
 *     toString.call(new String); // [object String]
 *     toString.call(Math); // [object Math]
 *
 * @return {String} Object represented as a string.
 */

/**
 * @method valueOf
 * Returns the primitive value of the specified object.
 *
 * JavaScript calls the `valueOf` method to convert an object to a primitive value. You rarely need to
 * invoke the `valueOf` method yourself; JavaScript automatically invokes it when encountering an
 * object where a primitive value is expected.
 *
 * By default, the `valueOf` method is inherited by every object descended from `Object`. Every built-
 * in core object overrides this method to return an appropriate value. If an object has no primitive
 * value, `valueOf` returns the object itself, which is displayed as:
 *
 *     [object Object]
 *
 * You can use `valueOf` within your own code to convert a built-in object into a primitive value.
 * When you create a custom object, you can override `Object.valueOf` to call a custom method instead
 * of the default `Object` method.
 *
 * You can create a function to be called in place of the default `valueOf` method. Your function must
 * take no arguments.
 *
 * Suppose you have an object type `myNumberType` and you want to create a `valueOf` method for it.
 * The following code assigns a user-defined function to the object's valueOf method:
 *
 *     myNumberType.prototype.valueOf = new Function(functionText)
 *
 * With the preceding code in place, any time an object of type `myNumberType` is used in a context
 * where it is to be represented as a primitive value, JavaScript automatically calls the function
 * defined in the preceding code.
 *
 * An object's `valueOf` method is usually invoked by JavaScript, but you can invoke it yourself as
 * follows:
 *
 *     myNumber.valueOf()
 *
 * Note: Objects in string contexts convert via the `toString` method, which is different from
 * `String` objects converting to string primitives using `valueOf`. All objects have a string
 * conversion, if only `"[object type]"`. But many objects do not convert to number, boolean, or
 * function.
 *
 * @return {Object} Returns value of the object or the object itself.
 */

//Properties

/**
 * @property constructor
 * Specifies the function that creates an object's prototype.
 *
 * Returns a reference to the Object function that created the instance's prototype. Note that the
 * value of this property is a reference to the function itself, not a string containing the
 * function's name, but it isn't read only (except for primitive Boolean, Number or String values: 1,
 * true, "read-only").
 *
 * All objects inherit a `constructor` property from their `prototype`:
 *
 *     o = new Object // or o = {} in JavaScript 1.2
 *     o.constructor == Object
 *     a = new Array // or a = [] in JavaScript 1.2
 *     a.constructor == Array
 *     n = new Number(3)
 *     n.constructor == Number
 *
 * Even though you cannot construct most HTML objects, you can do comparisons. For example,
 *
 *     document.constructor == Document
 *     document.form3.constructor == Form
 *
 * The following example creates a prototype, `Tree`, and an object of that type, theTree. The example then displays the `constructor` property for the object `theTree`.
 *
 *     function Tree(name) {
 *         this.name = name;
 *     }
 *     theTree = new Tree("Redwood");
 *     console.log("theTree.constructor is " + theTree.constructor);
 *
 * This example displays the following output:
 *
 *     theTree.constructor is function Tree(name) {
 *         this.name = name;
 *     }
 *
 * The following example shows how to modify constructor value of generic objects. Only true, 1 and
 * "test" variable constructors will not be changed. This example explains that is not always so safe
 * to believe in constructor function.
 *
 *     function Type(){};
 *     var	types = [
 * 	    new Array,	[],
 *	    new Boolean,	true,
 *	    new Date,
 *	    new Error,
 *	    new Function,	function(){},
 *	    Math,
 *	    new Number,	1,
 *	    new Object,	{},
 *	    new RegExp,	/(?:)/,
 *	    new String,	"test"
 *     ];
 *     for(var i = 0; i < types.length; i++){
 *         types[i].constructor = Type;
 *         types[i] = [types[i].constructor, types[i] instanceof Type, types[i].toString()];
 *     };
 *     alert(types.join("\n"));
 */

// ECMAScript 5 methods

/**
 * @method create
 * @static
 * Creates a new object with the specified prototype object and properties.
 *
 * ## Classical inheritance with Object.create
 *
 * Below is an example of how to use `Object.create` to achieve
 * classical inheritance, this is for single inheritance, which is all
 * that Javascript supports.
 *
 *     //Shape - superclass
 *     function Shape() {
 *       this.x = 0;
 *       this.y = 0;
 *     }
 *
 *     Shape.prototype.move = function(x, y) {
 *         this.x += x;
 *         this.y += y;
 *         console.info("Shape moved.");
 *     };
 *
 *     // Rectangle - subclass
 *     function Rectangle() {
 *       Shape.call(this); //call super constructor.
 *     }
 *
 *     Rectangle.prototype = Object.create(Shape.prototype);
 *
 *     var rect = new Rectangle();
 *
 *     rect instanceof Rectangle //true.
 *     rect instanceof Shape //true.
 *
 *     rect.move(); //Outputs, "Shape moved."
 *
 * If you wish to inherit from multiple objects, then mixins are a possibility.
 *
 *     function MyClass() {
 *          SuperClass.call(this);
 *          OtherSuperClass.call(this);
 *     }
 *
 *     MyClass.prototype = Object.create(SuperClass.prototype); //inherit
 *     mixin(MyClass.prototype, OtherSuperClass.prototype); //mixin
 *
 *     MyClass.prototype.myMethod = function() {
 *          // do a thing
 *     };
 *
 * The mixin function would copy the functions from the superclass
 * prototype to the subclass prototype, the mixin function needs to be
 * supplied by the user.
 *
 * ## Using `propertiesObject` argument with Object.create
 *
 *     var o;
 *
 *     // create an object with null as prototype
 *     o = Object.create(null);
 *
 *
 *     o = {};
 *     // is equivalent to:
 *     o = Object.create(Object.prototype);
 *
 *
 *     // Example where we create an object with a couple of sample properties.
 *     // (Note that the second parameter maps keys to *property descriptors*.)
 *     o = Object.create(Object.prototype, {
 *       // foo is a regular "value property"
 *       foo: { writable:true, configurable:true, value: "hello" },
 *       // bar is a getter-and-setter (accessor) property
 *       bar: {
 *         configurable: false,
 *         get: function() { return 10 },
 *         set: function(value) { console.log("Setting `o.bar` to", value) }
 *     }})
 *
 *
 *     function Constructor(){}
 *     o = new Constructor();
 *     // is equivalent to:
 *     o = Object.create(Constructor.prototype);
 *     // Of course, if there is actual initialization code in the Constructor function, the Object.create cannot reflect it
 *
 *
 *     // create a new object whose prototype is a new, empty object
 *     // and a adding single property 'p', with value 42
 *     o = Object.create({}, { p: { value: 42 } })
 *
 *     // by default properties ARE NOT writable, enumerable or configurable:
 *     o.p = 24
 *     o.p
 *     //42
 *
 *     o.q = 12
 *     for (var prop in o) {
 *        console.log(prop)
 *     }
 *     //"q"
 *
 *     delete o.p
 *     //false
 *
 *     //to specify an ES3 property
 *     o2 = Object.create({}, { p: { value: 42, writable: true, enumerable: true, configurable: true } });
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Object} proto The object which should be the prototype of
 * the newly-created object.
 *
 * Throws a `TypeError` exception if the `proto` parameter isn't null or
 * an object.
 *
 * @param {Object} [propertiesObject] If specified and not undefined,
 * an object whose enumerable own properties (that is, those
 * properties defined upon itself and not enumerable properties along
 * its prototype chain) specify property descriptors to be added to
 * the newly-created object, with the corresponding property names.
 *
 * @return {Object} the newly created object.
 */

/**
 * @method defineProperty
 * @static
 *
 * Defines a new property directly on an object, or modifies an
 * existing property on an object, and returns the object.
 *
 * This method allows precise addition to or modification of a
 * property on an object. Normal property addition through assignment
 * creates properties which show up during property enumeration
 * (for...in loop or {@link Object#keys} method), whose values may be
 * changed, and which may be deleted. This method allows these extra
 * details to be changed from their defaults.
 *
 * Property descriptors present in objects come in two main flavors:
 * data descriptors and accessor descriptors. A data descriptor is a
 * property that has a value, which may or may not be writable. An
 * accessor descriptor is a property described by a getter-setter pair
 * of functions. A descriptor must be one of these two flavors; it
 * cannot be both.
 *
 * Both data and accessor descriptor is an object with the following
 * optional keys:
 *
 * - **configurable** True if and only if the type of this property
 *   descriptor may be changed and if the property may be deleted from
 *   the corresponding object. Defaults to false.
 *
 * - **enumerable** True if and only if this property shows up during
 *   enumeration of the properties on the corresponding
 *   object. Defaults to false.
 *
 * A data descriptor is an object with the following optional keys:
 *
 * - **value** The value associated with the property. Can be any
 *   valid JavaScript value (number, object, function, etc) Defaults
 *   to undefined.
 *
 * - **writable** True if and only if the value associated with the
 *   property may be changed with an assignment operator. Defaults to
 *   false.
 *
 * An accessor descriptor is an object with the following optional
 * keys:
 *
 * - **get** A function which serves as a getter for the property, or
 *   undefined if there is no getter. The function return will be used
 *   as the value of property. Defaults to undefined.
 *
 * - **set** A function which serves as a setter for the property, or
 *   undefined if there is no setter. The function will receive as
 *   only argument the new value being assigned to the
 *   property. Defaults to undefined.
 *
 * Bear in mind that these options are not necessarily own properties
 * so, if inherited, will be considered too. In order to ensure these
 * defaults are preserved you might freeze the Object.prototype
 * upfront, specify all options explicitly, or point to null as
 * __proto__ property.
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Object} obj The object on which to define the property.
 * @param {String} prop The name of the property to be defined or modified.
 * @param {Object} descriptor The descriptor for the property being
 * defined or modified.
 */

/**
 * @method defineProperties
 * @static
 *
 * Defines new or modifies existing properties directly on an object,
 * returning the object.
 *
 * In essence, it defines all properties corresponding to the
 * enumerable own properties of props on the object.
 *
 *     Object.defineProperties(obj, {
 *       "property1": {
 *         value: true,
 *         writable: true
 *       },
 *       "property2": {
 *         value: "Hello",
 *         writable: false
 *       }
 *       // etc. etc.
 *     });
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Object} obj The object on which to define or modify properties.
 * @param {Object} props An object whose own enumerable properties
 * constitute descriptors for the properties to be defined or
 * modified.
 */

/**
 * @method getOwnPropertyDescriptor
 * @static
 *
 * Returns a property descriptor for an own property (that is, one
 * directly present on an object, not present by dint of being along
 * an object's prototype chain) of a given object.
 *
 * This method permits examination of the precise description of a
 * property. A property in JavaScript consists of a string-valued name
 * and a property descriptor. Further information about property
 * descriptor types and their attributes can be found in
 * {@link Object#defineProperty}.
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Object} obj The object in which to look for the property.
 * @param {String} prop The name of the property whose description is
 * to be retrieved.
 *
 * A property descriptor is a record with some of the following
 * attributes:
 *
 * - **value** The value associated with the property (data
 *   descriptors only).
 *
 * - **writable** True if and only if the value associated with
 *   the property may be changed (data descriptors only).
 *
 * - **get** A function which serves as a getter for the property,
 *    or undefined if there is no getter (accessor descriptors only).
 *
 * - **set** A function which serves as a setter for the property,
 *   or undefined if there is no setter (accessor descriptors only).
 *
 * - **configurable** true if and only if the type of this property
 *   descriptor may be changed and if the property may be deleted
 *   from the corresponding object.
 *
 * - **enumerable** true if and only if this property shows up
 *   during enumeration of the properties on the corresponding object.
 *
 * @return {Mixed} Value of the property descriptor.
 */

/**
 * @method keys
 * @static
 *
 * Returns an array of a given object's own enumerable properties, in
 * the same order as that provided by a for-in loop (the difference
 * being that a for-in loop enumerates properties in the prototype
 * chain as well).
 *
 * Returns an array whose elements are strings corresponding to the
 * enumerable properties found directly upon object. The ordering of
 * the properties is the same as that given by looping over the
 * properties of the object manually.
 *
 *     var arr = ["a", "b", "c"];
 *     alert(Object.keys(arr)); // will alert "0,1,2"
 *
 *     // array like object
 *     var obj = { 0 : "a", 1 : "b", 2 : "c"};
 *     alert(Object.keys(obj)); // will alert "0,1,2"
 *
 *     // getFoo is property which isn't enumerable
 *     var my_obj = Object.create({}, { getFoo : { value : function () { return this.foo } } });
 *     my_obj.foo = 1;
 *
 *     alert(Object.keys(my_obj)); // will alert only foo
 *
 * If you want all properties, even the not enumerable, see
 * {@link Object#getOwnPropertyNames}.
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Object} obj The object whose enumerable own properties are
 * to be returned.
 * @return {String[]} Array of property names.
 */

/**
 * @method getOwnPropertyNames
 * @static
 *
 * Returns an array of all properties (enumerable or not) found
 * directly upon a given object.
 *
 * Rreturns an array whose elements are strings corresponding to the
 * enumerable and non-enumerable properties found directly upon
 * obj. The ordering of the enumerable properties in the array is
 * consistent with the ordering exposed by a for...in loop (or by
 * {@link Object#keys}) over the properties of the object. The
 * ordering of the non-enumerable properties in the array, and among
 * the enumerable properties, is not defined.
 *
 *     var arr = ["a", "b", "c"];
 *     print(Object.getOwnPropertyNames(arr).sort()); // prints "0,1,2,length"
 *
 *     // Array-like object
 *     var obj = { 0: "a", 1: "b", 2: "c"};
 *     print(Object.getOwnPropertyNames(obj).sort()); // prints "0,1,2"
 *
 *     // Printing property names and values using Array.forEach
 *     Object.getOwnPropertyNames(obj).forEach(function(val, idx, array) {
 *       print(val + " -> " + obj[val]);
 *     });
 *     // prints
 *     // 0 -> a
 *     // 1 -> b
 *     // 2 -> c
 *
 *     // non-enumerable property
 *     var my_obj = Object.create({}, { getFoo: { value: function() { return this.foo; }, enumerable: false } });
 *     my_obj.foo = 1;
 *
 *     print(Object.getOwnPropertyNames(my_obj).sort()); // prints "foo, getFoo"
 *
 * If you want only the enumerable properties, see {@link Object#keys}
 * or use a for...in loop (although note that this will return
 * enumerable properties not found directly upon that object but also
 * along the prototype chain for the object unless the latter is
 * filtered with {@link #hasOwnProperty}).
 *
 * Items on the prototype chain are not listed:
 *
 *     function ParentClass () {
 *     }
 *     ParentClass.prototype.inheritedMethod = function () {
 *     };
 *
 *     function ChildClass () {
 *       this.prop = 5;
 *       this.method = function () {};
 *     }
 *     ChildClass.prototype = new ParentClass;
 *     ChildClass.prototype.prototypeMethod = function () {
 *     };
 *
 *     alert(
 *       Object.getOwnPropertyNames(
 *         new ChildClass() // ["prop", "method"]
 *       )
 *     )
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Object} obj The object whose enumerable and non-enumerable
 * own properties are to be returned.
 * @return {String[]} Array of property names.
 */

/**
 * @method getPrototypeOf
 * @static
 *
 * Returns the prototype (i.e. the internal `[[Prototype]]`) of the
 * specified object.
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Object} object The object whose prototype is to be returned.
 * Throws a TypeError exception if this parameter isn't an Object.
 *
 * @return {Object} the prototype
 */

/**
 * @method preventExtensions
 * @static
 *
 * Prevents new properties from ever being added to an object
 * (i.e. prevents future extensions to the object).
 *
 * An object is extensible if new properties can be added to it.
 * `preventExtensions` marks an object as no longer extensible, so that
 * it will never have properties beyond the ones it had at the time it
 * was marked as non-extensible.  Note that the properties of a
 * non-extensible object, in general, may still be deleted. Attempting
 * to add new properties to a non-extensible object will fail, either
 * silently or by throwing a TypeError (most commonly, but not
 * exclusively, when in strict mode).
 *
 * It only prevents addition of own properties. Properties can still
 * be added to the object prototype.
 *
 * If there is a way to turn an extensible object to a non-extensible
 * one, there is no way to do the opposite in ECMAScript 5
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Object} obj The object which should be made non-extensible.
 */

/**
 * @method isExtensible
 * @static
 *
 * Determines if an object is extensible (whether it can have new
 * properties added to it).
 *
 * Objects are extensible by default: they can have new properties
 * added to them, and can be modified. An object can be marked as
 * non-extensible using {@link Object#preventExtensions},
 * {@link Object#seal}, or {@link Object#freeze}.
 *
 *     // New objects are extensible.
 *     var empty = {};
 *     assert(Object.isExtensible(empty) === true);
 *
 *     // ...but that can be changed.
 *     Object.preventExtensions(empty);
 *     assert(Object.isExtensible(empty) === false);
 *
 *     // Sealed objects are by definition non-extensible.
 *     var sealed = Object.seal({});
 *     assert(Object.isExtensible(sealed) === false);
 *
 *     // Frozen objects are also by definition non-extensible.
 *     var frozen = Object.freeze({});
 *     assert(Object.isExtensible(frozen) === false);
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Object} obj The object which should be checked.
 * @return {Boolean} True when object is extensible.
 */

/**
 * @method seal
 * @static
 *
 * Seals an object, preventing new properties from being added to it
 * and marking all existing properties as non-configurable. Values of
 * present properties can still be changed as long as they are
 * writable.
 *
 * By default, objects are extensible (new properties can be added to
 * them). Sealing an object prevents new properties from being added
 * and marks all existing properties as non-configurable. This has the
 * effect of making the set of properties on the object fixed and
 * immutable. Making all properties non-configurable also prevents
 * them from being converted from data properties to accessor
 * properties and vice versa, but it does not prevent the values of
 * data properties from being changed. Attempting to delete or add
 * properties to a sealed object, or to convert a data property to
 * accessor or vice versa, will fail, either silently or by throwing a
 * TypeError (most commonly, although not exclusively, when in strict
 * mode code).
 *
 * The prototype chain remains untouched.
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Object} obj The object which should be sealed.
 */

/**
 * @method isSealed
 * @static
 *
 * Determines if an object is sealed.
 *
 * An object is sealed if it is non-extensible and if all its
 * properties are non-configurable and therefore not removable (but
 * not necessarily non-writable).
 *
 *     // Objects aren't sealed by default.
 *     var empty = {};
 *     assert(Object.isSealed(empty) === false);
 *
 *     // If you make an empty object non-extensible, it is vacuously sealed.
 *     Object.preventExtensions(empty);
 *     assert(Object.isSealed(empty) === true);
 *
 *     // The same is not true of a non-empty object, unless its properties are all non-configurable.
 *     var hasProp = { fee: "fie foe fum" };
 *     Object.preventExtensions(hasProp);
 *     assert(Object.isSealed(hasProp) === false);
 *
 *     // But make them all non-configurable and the object becomes sealed.
 *     Object.defineProperty(hasProp, "fee", { configurable: false });
 *     assert(Object.isSealed(hasProp) === true);
 *
 *     // The easiest way to seal an object, of course, is Object.seal.
 *     var sealed = {};
 *     Object.seal(sealed);
 *     assert(Object.isSealed(sealed) === true);
 *
 *     // A sealed object is, by definition, non-extensible.
 *     assert(Object.isExtensible(sealed) === false);
 *
 *     // A sealed object might be frozen, but it doesn't have to be.
 *     assert(Object.isFrozen(sealed) === true); // all properties also non-writable
 *
 *     var s2 = Object.seal({ p: 3 });
 *     assert(Object.isFrozen(s2) === false); // "p" is still writable
 *
 *     var s3 = Object.seal({ get p() { return 0; } });
 *     assert(Object.isFrozen(s3) === true); // only configurability matters for accessor properties
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Object} obj The object which should be checked.
 * @return {Boolean} True if the object is sealed, otherwise false.
 */

/**
 * @method freeze
 * @static
 *
 * Freezes an object: that is, prevents new properties from being
 * added to it; prevents existing properties from being removed; and
 * prevents existing properties, or their enumerability,
 * configurability, or writability, from being changed. In essence the
 * object is made effectively immutable. The method returns the object
 * being frozen.
 *
 * Nothing can be added to or removed from the properties set of a
 * frozen object. Any attempt to do so will fail, either silently or
 * by throwing a TypeError exception (most commonly, but not
 * exclusively, when in strict mode).
 *
 * Values cannot be changed for data properties. Accessor properties
 * (getters and setters) work the same (and still give the illusion
 * that you are changing the value). Note that values that are objects
 * can still be modified, unless they are also frozen.
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Object} obj The object to freeze.
 */

/**
 * @method isFrozen
 * @static
 *
 * Determines if an object is frozen.
 *
 * An object is frozen if and only if it is not extensible, all its
 * properties are non-configurable, and all its data properties (that
 * is, properties which are not accessor properties with getter or
 * setter components) are non-writable.
 *
 *     // A new object is extensible, so it is not frozen.
 *     assert(Object.isFrozen({}) === false);
 *
 *     // An empty object which is not extensible is vacuously frozen.
 *     var vacuouslyFrozen = Object.preventExtensions({});
 *     assert(Object.isFrozen(vacuouslyFrozen) === true);
 *
 *     // A new object with one property is also extensible, ergo not frozen.
 *     var oneProp = { p: 42 };
 *     assert(Object.isFrozen(oneProp) === false);
 *
 *     // Preventing extensions to the object still doesn't make it frozen,
 *     // because the property is still configurable (and writable).
 *     Object.preventExtensions(oneProp);
 *     assert(Object.isFrozen(oneProp) === false);
 *
 *     // ...but then deleting that property makes the object vacuously frozen.
 *     delete oneProp.p;
 *     assert(Object.isFrozen(oneProp) === true);
 *
 *     // A non-extensible object with a non-writable but still configurable property is not frozen.
 *     var nonWritable = { e: "plep" };
 *     Object.preventExtensions(nonWritable);
 *     Object.defineProperty(nonWritable, "e", { writable: false }); // make non-writable
 *     assert(Object.isFrozen(nonWritable) === false);
 *
 *     // Changing that property to non-configurable then makes the object frozen.
 *     Object.defineProperty(nonWritable, "e", { configurable: false }); // make non-configurable
 *     assert(Object.isFrozen(nonWritable) === true);
 *
 *     // A non-extensible object with a non-configurable but still writable property also isn't frozen.
 *     var nonConfigurable = { release: "the kraken!" };
 *     Object.preventExtensions(nonConfigurable);
 *     Object.defineProperty(nonConfigurable, "release", { configurable: false });
 *     assert(Object.isFrozen(nonConfigurable) === false);
 *
 *     // Changing that property to non-writable then makes the object frozen.
 *     Object.defineProperty(nonConfigurable, "release", { writable: false });
 *     assert(Object.isFrozen(nonConfigurable) === true);
 *
 *     // A non-extensible object with a configurable accessor property isn't frozen.
 *     var accessor = { get food() { return "yum"; } };
 *     Object.preventExtensions(accessor);
 *     assert(Object.isFrozen(accessor) === false);
 *
 *     // ...but make that property non-configurable and it becomes frozen.
 *     Object.defineProperty(accessor, "food", { configurable: false });
 *     assert(Object.isFrozen(accessor) === true);
 *
 *     // But the easiest way for an object to be frozen is if Object.freeze has been called on it.
 *     var frozen = { 1: 81 };
 *     assert(Object.isFrozen(frozen) === false);
 *     Object.freeze(frozen);
 *     assert(Object.isFrozen(frozen) === true);
 *
 *     // By definition, a frozen object is non-extensible.
 *     assert(Object.isExtensible(frozen) === false);
 *
 *     // Also by definition, a frozen object is sealed.
 *     assert(Object.isSealed(frozen) === true);
 *
 * **NOTE:** This method is part of the ECMAScript 5 standard.
 *
 * @param {Object} obj The object which should be checked.
 * @return {Boolean} True if the object is frozen, otherwise false.
 */