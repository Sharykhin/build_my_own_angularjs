/* jshint globalstrict: true */
/* global parse: false */
'use strict';

describe("parse", function() {

	it("can parse an integer", function() {
		var fn = parse('42');
		expect(fn).toBeDefined();
		expect(fn()).toBe(42);

	}); // end

	it("can parse a floating piont number", function() {
		var fn = parse('4.2');
		expect(fn()).toBe(4.2);

	}); // end

	it("can parse a foating point number without an integer part", function() {
		var fn = parse('.42');
		expect(fn()).toBe(0.42);
	}); // end

	it("can parse a number in scientific notation", function() {
		var fn = parse('42e3');
		expect(fn()).toBe(42000);
	}); // end

	it("can parse scientific notation with a float coefficient", function() {
		var fn = parse('.42e2');
		expect(fn()).toBe(42);
	}); // end

	it("can parse scientific notation with negative exponents", function() {
		var fn = parse('4200e-2');
		expect(fn()).toBe(42);
	}); // end

	it("can parse scientific notation with the + sign", function() {
		var fn = parse('.42e+2');
		expect(fn()).toBe(42);
	});

	it("can parse upper case scientific notation", function() {
		var fn = parse('.42E2');
		expect(fn()).toBe(42);
	}); // end

	it("will not parse invalid scientific notation", function() {
		expect(function() {
			parse('42e-');
		}).toThrow();
		expect(function() {
			parse('42e-a');
		}).toThrow();
	}); // end

	it("can parse a string in single quotes", function() {
		var fn = parse("'abc'");
		expect(fn()).toEqual('abc');
	}); // end

	it("can parse a string in double quotes", function() {
		var fn = parse('"abc"');
		expect(fn()).toEqual('abc');
	}); // end

	it("wil not parse a string with mismatching quotes", function() {
		expect(function() {
			parse('"abc\'');
		}).toThrow();
	}); // end

	it("can parse a string with single quotes inside", function() {
		var fn = parse("'a\\\'b'");
		expect(fn()).toEqual('a\'b');
	}); // end

	it("can parse a string with double quotes inside", function() {
		var fn = parse('"a\\\"b"');
		expect(fn()).toEqual('a\"b');
	}); // end

	it("will [arse a string with unicode escapes", function() {
		var fn = parse('"\\u00A0"');
		expect(fn()).toEqual('\u00A0');
	}); // end

	it("will not parse a string with invalid unicode escapes", function() {
		expect(function() {
			parse('"\\u00T0"');
		}).toThrow();
	}); // end

	it("will parse null", function() {
		var fn = parse('null');
		expect(fn()).toBe(null);
	}); // end

	it('will parse true', function() {
		var fn = parse('true');
		expect(fn()).toBe(true);
	}); // end

	it('will parse false', function() {
		var fn = parse('false');
		expect(fn()).toBe(false);
	}); // end

	it("ignores whitespace", function() {
		var fn = parse(' \n42 ');
		expect(fn()).toEqual(42);
	}); // end

	it("will parse an empty array", function() {
		var fn = parse('[]');
		expect(fn()).toEqual([]);
	}); // end

	it("will parse a non-empty array", function() {
		var fn = parse('[1, "two", [3], true]');
		expect(fn()).toEqual([1, 'two', [3], true]);
	}); // end

	it("will parse an array with trailing commas", function() {
		var fn = parse('[1, 2, 3, ]');
		expect(fn()).toEqual([1, 2, 3]);
	}); //end

	it("will parse an empty object", function() {
		var fn = parse('{}');
		expect(fn()).toEqual({});
	}); // end

	it("will parse a non-empty object", function() {
		var fn = parse('{"a key": 1, \'another-key\':2}');
		expect(fn()).toEqual({
			'a key': 1,
			'another-key': 2
		});
	}); // end

	it("will parse an object with identifier keys", function() {
		var fn = parse('{a:1, b: [2,3], c:{d:4}}');
		expect(fn()).toEqual({
			a: 1,
			b: [2, 3],
			c: {
				d: 4
			}
		});
	}); // end

	it('looks up an attribute from the scope', function() {
		var fn = parse('aKey');
		expect(fn({
			aKey: 42
		})).toBe(42);
		expect(fn({})).toBeUndefined();
	}); // end

	it("returns undefined when looking up attribute from undefined", function() {
		var fn = parse('aKey');
		expect(fn()).toBeUndefined();
	}); // end

	it("will parse this", function() {
		var fn = parse('this');
		var scope = {};
		expect(fn(scope)).toBe(scope);
		expect(fn()).toBeUndefined();
	}); // end

	it("looks up a 2-park identified path from the scope", function() {
		var fn = parse('aKey.anotherKey');
		expect(fn({
			aKey: {
				anotherKey: 42
			}
		})).toBe(42);
		expect(fn({
			aKey: {}
		})).toBeUndefined();
		expect(fn({})).toBeUndefined();
	}); // end

	it('looks up a member from an object', function() {
		var fn = parse('{aKey: 42}.aKey');
		expect(fn()).toBe(42);
	}); // end

	it("looks up a 4-part identifier path from the scope", function() {
		var fn = parse('aKey.secondKey.thirdKey.fourthKey');
		expect(fn({
			aKey: {
				secondKey: {
					thirdKey: {
						fourthKey: 42
					}
				}
			}
		})).toBe(42);
		expect(fn({
			aKey: {
				secondKey: {
					thirdKey: {}
				}
			}
		})).toBeUndefined();
		expect(fn({
			aKey: {}
		})).toBeUndefined();
		expect(fn()).toBeUndefined();
	}); // end

	it("uses locals instead of scope when there is a matching key", function() {
		var fn = parse('aKey');
		var scope = {
			aKey: 42
		};
		var locals = {
			aKey: 43
		};
		expect(fn(scope, locals)).toBe(43);
	}); // end

	it("does not use locals instead of scope when no matching key", function() {
		var fn = parse('aKey');
		var scope = {
			aKey: 42
		};
		var locals = {
			otherKey: 43
		};
		expect(fn(scope, locals)).toBe(42);
	}); // end

	it("uses locals instead if scope when the first part matches", function() {
		var fn = parse('akey.anotherKey');
		var scope = {
			aKey: {
				anotherKey: 42
			}
		};
		var locals = {
			aKey: {}
		};
		expect(fn(scope, locals)).toBeUndefined();
	}); // end

	it("parses a simple computed property access", function() {
		var fn = parse('aKey["anotherKey"]');
		expect(fn({
			aKey: {
				anotherKey: 42
			}
		})).toBe(42);
	}); // end

	it("parses a computed numeric array access", function() {
		var fn = parse('anArray[1]');
		expect(fn({
			anArray: [1, 2, 3]
		})).toBe(2);
	}); // end

	it("parses comuted access with another access as property", function() {
		var fn = parse('lock[keys["aKey"]]');
		expect(fn({
			keys: {
				aKey: 'theKey'
			},
			lock: {
				theKey: 42
			}
		})).toBe(42);
	}); // end

	it('parses a functon call', function() {
		var fn = parse('aFunction()');
		expect(fn({
			aFunction: function() {
				return 42;
			}
		})).toBe(42);
	}); // end

	it('parses a function call with a single number argument', function() {
		var fn = parse('aFunction(42)');
		expect(fn({
			aFunction: function(n) {
				return n;
			}
		})).toBe(42);
	}); // end

	if ('parses a function call with a single function call argument', function() {
			var fn = parse('aFunction(argFn())');
			expect(fn(({
				argFn: _.constant(42),
				aFunction: function(arg) {
					return arg;
				}
			}))).toBe(42);
		}); // end

	it('parses a function call with multiple arguments', function() {
		var fn = parse('aFunction(37, n, argFn())');
		expect(fn({
			n: 3,
			argFn: _.constant(2),
			aFunction: function(a1, a2, a3) {
				return a1 + a2 + a3;
			}
		})).toBe(42);
	}); // end

	it('cals methods accessed as computed properties', function() {
		var scope = {
			anObject: {
				aMember: 42,
				aFunction: function() {
					return this.aMember;
				}
			}
		};

		var fn = parse('anObject["aFunction"]()');
		expect(fn(scope)).toBe(42);
	}); // end

	it('calls methods accessed as non-computed properties', function() {
		var scope = {
			anObject: {
				aMember: 42,
				aFunction: function() {
					return this.aMember;
				}
			}
		};

		var fn = parse('anObject.aFunction()');
		expect(fn(scope)).toBe(42);
	});



}); // end describe parse