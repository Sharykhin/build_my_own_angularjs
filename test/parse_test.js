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


}); // end describe parse