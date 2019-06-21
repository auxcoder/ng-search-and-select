'use strict';

describe('', function() {

	var module;
	var dependencies;
	dependencies = [];

	var hasModule = function(module) {
	return dependencies.indexOf(module) >= 0;
	};

	beforeEach(function() {
		// Get module
		module = angular.module('ngSearchAndSelect');
		dependencies = module.requires;
	});

	it('should load config module', function() {
		expect(hasModule('ngSearchAndSelect.config')).to.be.ok;
	});

	it('should load filters module', function() {
		expect(hasModule('ngSearchAndSelect.component')).to.be.ok;
	});
});
