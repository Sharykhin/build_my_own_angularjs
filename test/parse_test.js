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


}); // end describe parse