/* jshint globalstrict: true */
/* global parse: false, register: false */
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
	}); // end

	it('binds bare functions to the scope', function() {
		var scope = {
			aFunction: function() {
				return this;
			}
		};

		var fn = parse('aFunction()');
		expect(fn(scope)).toBe(scope);
	}); // end

	it('binds bare function on locals to the locals', function() {
		var scope = {};
		var locals = {
			aFunction: function() {
				return this;
			}
		};

		var fn = parse('aFunction()');
		expect(fn(scope, locals)).toBe(locals);
	}); // end

	it('parses a simple attribute assigment', function() {
		var fn = parse('anAttribute = 42');
		var scope = {};
		fn(scope);
		expect(scope.anAttribute).toBe(42);
	}); // end

	it('can assign any primary expression', function() {
		var fn = parse('anAttribute = aFunction()');
		var scope = {
			aFunction: _.constant(42)
		};
		fn(scope);
		expect(scope.anAttribute).toBe(42);
	}); // end

	it('can assign a computed object property', function() {
		var fn = parse('anObject["anAttribute"] = 42');
		var scope = {
			anObject: {}
		};
		fn(scope);
		expect(scope.anObject.anAttribute).toBe(42);
	}); // end

	it('can assign a non-computed object property', function() {
		var fn = parse('anObject.anAttribute = 42');
		var scope = {
			anObject: {}
		};
		fn(scope);
		expect(scope.anObject.anAttribute).toBe(42);
	}); //end

	it('can assign a nested object property', function() {
		var fn = parse('anArray[0].anAttribute = 42');
		var scope = {
			anArray: [{}]
		};
		fn(scope);
		expect(scope.anArray[0].anAttribute).toBe(42);
	}); //end

	it('creates the objects in the assignment path that do not exist', function() {
		var fn = parse('name["nested"].property.path = 42');
		var scope = {};
		fn(scope);
		expect(scope.name.nested.property.path).toBe(42);
	}); //end

	it('does not allow caling the function constructor', function() {
		expect(function() {
			var fn = parse('aFunction.constructor("return window;")()');
			fn({
				aFunction: function() {}
			});
		}).toThrow();
	}); // end

	it('does not allow accessing __proto__', function() {
		expect(function() {
			var fn = parse('obj.__proto__');
			fn({
				obj: {}
			});
		}).toThrow();
	}); //end

	it('does not allow calling __defineGetter__', function() {
		expect(function() {
			var fn = parse('obj.__defineGetter__("evli",fn)');
			fn({
				obj: {},
				fn: function() {}
			});
		}).toThrow();
	}); //end

	it('does not allow calling __defineSetter__', function() {
		expect(function() {
			var fn = parse('obj.__defineSetter__("evli",fn)');
			fn({
				obj: {},
				fn: function() {}
			});
		}).toThrow();
	}); //end

	it('does not allow calling __lookupGetter__', function() {
		expect(function() {
			var fn = parse('obj.__lookupGetter__("evli")');
			fn({
				obj: {}
			});
		}).toThrow();
	}); //end

	it('does not allow calling __lookupSetter__', function() {
		expect(function() {
			var fn = parse('obj.__lookupSetter__("evli")');
			fn({
				obj: {}
			});
		}).toThrow();
	}); //end

	it('does not allow accessing window as computed property', function() {
		var fn = parse('anObject["wnd"]');
		expect(function() {
			fn({
				anObject: {
					wnd: window
				}
			});
		}).toThrow();
	}); // end

	it('does not allow accessing window as non-computed property', function() {
		var fn = parse('anObject.wnd');
		expect(function() {
			fn({
				anObject: {
					wnd: window
				}
			});
		}).toThrow();
	}); // end

	it('does not allow passing window as function argument', function() {
		var fn = parse('aFunction(wnd)');
		expect(function() {
			fn({
				aFunction: function() {},
				wnd: window
			});
		}).toThrow();
	}); // end

	it('does not allow calling methods on window', function() {
		var fn = parse('wnd.scrollTo(0)');
		expect(function() {
			fn({
				wnd: window
			});
		}).toThrow();
	});

	it('does not allow functions to return window', function() {
		var fn = parse('getWnd()');
		expect(function() {
			fn({
				getWnd: _.constant(window)
			});
		}).toThrow();
	});

	it('does not allow assigning window', function() {
		var fn = parse('wnd = anObject');
		expect(function() {
			fn({
				anObject: window
			});
		}).toThrow();
	});

	it('does not allow referencing window', function() {
		var fn = parse('wnd');
		expect(function() {
			fn({
				wnd: window
			});
		}).toThrow();
	});

	it('does not allow calling functions on DOM elements', function() {
		var fn = parse('el.setAttribute("evil", "true")');
		expect(function() {
			fn({
				el: document.documentElement
			});
		}).toThrow();
	});

	it('does not allow calling the aliased function constructor', function() {
		var fn = parse('fnConstructor("return window;")');
		expect(function() {
			fn({
				fnConstructor: (function() {}).constructor
			});
		}).toThrow();
	});

	it('does not allow calling functions on Object', function() {
		var fn = parse('obj.create({})');
		expect(function() {
			fn({
				obj: Object
			});
		}).toThrow();
	});

	it('does not allow calling call', function() {
		var fn = parse('fun.call(obj)');
		expect(function() {
			fn({
				fun: function() {},
				obj: {}
			});
		}).toThrow();
	});

	it('does not allow calling apply', function() {
		var fn = parse('fun.apply(obj)');
		expect(function() {
			fn({
				fun: function() {},
				obj: {}
			});
		}).toThrow();
	});

	it('parses a unary +', function() {
		expect(parse('+42')()).toBe(42);
		expect(parse('+a')({
			a: 42
		})).toBe(42);
	});

	it('replaces undefined with zero for unary +', function() {
		expect(parse('+a')({})).toBe(0);
	});

	it('parses a unary !', function() {
		expect(parse('!true')()).toBe(false);
		expect(parse('!42')()).toBe(false);
		expect(parse('!a')({
			a: false
		})).toBe(true);
		expect(parse('!!a')({
			a: false
		})).toBe(false);
	});

	it('parses a unary -', function() {
		expect(parse('-42')()).toBe(-42);
		expect(parse('-a')({
			a: -42
		})).toBe(42);
		expect(parse('--a')({
			a: -42
		})).toBe(-42);
		expect(parse('-a')({})).toBe(0);
	});

	it('parses a ! in a string', function() {
		expect(parse('"!"')()).toBe('!');
	});

	it('parses a multiplication', function() {
		expect(parse('21 * 2')()).toBe(42);
	});

	it('parses a division', function() {
		expect(parse('84 / 2')()).toBe(42);
	});

	it('parses a remainder', function() {
		expect(parse('85 % 43')()).toBe(42);
	});

	it('parses several multiplicatives', function() {
		expect(parse('36 * 2 % 5')()).toBe(2);
	});

	it('parses an addition', function() {
		expect(parse('20 + 22')()).toBe(42);
	});

	it('parses a subtraction', function() {
		expect(parse('42 - 22')()).toBe(20);
	});

	it('parses multiplicatives on a higher precedence than additives', function() {
		expect(parse('2 + 3 * 5')()).toBe(17);
		expect(parse('2 + 3 * 2 + 3')()).toBe(11);
	});

	it('substitutes undefined with zero in addition', function() {
		expect(parse('a + 22')()).toBe(22);
		expect(parse('42 + a')()).toBe(42);
	});

	it('substitutes undefined with zero in subtraction', function() {
		expect(parse('a - 22')()).toBe(-22);
		expect(parse('42 - a')()).toBe(42);
	});

	it('parses relational operators', function() {
		expect(parse('1 < 2')()).toBe(true);
		expect(parse('1 > 2')()).toBe(false);
		expect(parse('1 <= 2')()).toBe(true);
		expect(parse('2 <= 2')()).toBe(true);
		expect(parse('1 >= 2')()).toBe(false);
		expect(parse('2 >= 2')()).toBe(true);
	});

	it('parses equality operators', function() {
		expect(parse('42 == 42')()).toBe(true);
		expect(parse('42 == "42"')()).toBe(true);
		expect(parse('42 != 42')()).toBe(false);
		expect(parse('42 === 42')()).toBe(true);
		expect(parse('42 === "42"')()).toBe(false);
		expect(parse('42 !== 42')()).toBe(false);
	});

	it('parses relationals on a higher precedence than equality', function() {
		expect(parse('2 == "2" > 2 === "2"')()).toBe(false);
	});

	it('parses additives on a higher precedence than relationals', function() {
		expect(parse('2 + 3 < 6 - 2')()).toBe(false);
	});

	it('parses logical AND', function() {
		expect(parse('true && true')()).toBe(true);
		expect(parse('true && false')()).toBe(false);
	});

	it('parses logical OR', function() {
		expect(parse('true || true')()).toBe(true);
		expect(parse('true || false')()).toBe(true);
		expect(parse('fales || false')()).toBe(false);
	});

	it('parses multiple ANDs', function() {
		expect(parse('true && true && true')()).toBe(true);
		expect(parse('true && true && false')()).toBe(false);
	});

	it('parses multiple ORs', function() {
		expect(parse('true || true || true')()).toBe(true);
		expect(parse('true || true || false')()).toBe(true);
		expect(parse('false || false || true')()).toBe(true);
		expect(parse('false || false || false')()).toBe(false);
	});

	it('short-circuits AND', function() {
		var invoked;
		var scope = {
			fn: function() {
				invoked = true;
			}
		};
		parse('false && fn()')(scope);
		expect(invoked).toBeUndefined();
	});

	it('short-circuits OR', function() {
		var invoked;
		var scope = {
			fn: function() {
				invoked = true;
			}
		};
		parse('true || fn()')(scope);
		expect(invoked).toBeUndefined();
	});

	it('parses AND with a higher precedence than OR', function() {
		expect(parse('false && true || true')()).toBe(true);
	});

	it('parses OR with a lower precedence than equality', function() {
		expect(parse('1 === 2 || 2 === 2')()).toBeTruthy();
	});

	it('parses the ternary expression', function() {
		expect(parse('a === 42 ? true : false')({
			a: 42
		})).toBe(true);
		expect(parse('a === 42 ? true : false')({
			a: 43
		})).toBe(false);
	});

	it('parses OR with a higher precedence than ternary', function() {
		expect(parse('0 || 1 ? 0 || 2 : 0 || 3')()).toBe(2);
	});

	it('parses nested ternaries', function() {
		expect(
			parse('a === 42 ? b === 42 ? "a and b" : "a" : c === 42 ? "c" : "none"')({
				a: 44,
				b: 43,
				c: 42
			})).toEqual('c');
	});

	it('parses parentheses altering precedence order', function() {
		expect(parse('21 * (3 - 1)')()).toBe(42);
		expect(parse('false && (true || true)')()).toBe(false);
		expect(parse('-((a % 2) === 0 ? 1 : 2)')({
			a: 42
		})).toBe(-1);
	});

	it('parses several statements', function() {
		var fn = parse('a = 1; b = 2; c = 3');
		var scope = {};
		fn(scope);
		expect(scope).toEqual({
			a: 1,
			b: 2,
			c: 3
		});
	});

	it('returns the value of the last statement', function() {
		expect(parse('a = 1; b = 2; a + b')({})).toBe(3);
	});


}); // end describe parse