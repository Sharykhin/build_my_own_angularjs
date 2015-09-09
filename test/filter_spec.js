/* jshint globalstrict: true */
/* global filter: false, register: false */
'use strict';

describe('filter', function() {

	it('can be registered an obtained', function() {
		var myFilter = function() {};
		var myFilterFactory = function() {
			return myFilter;
		};

		register('my', myFilterFactory);
		expect(filter('my')).toBe(myFilter);
	}); // end

});