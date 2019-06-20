(function(angular) {
	'use strict';

	angular
		.module('demoApp', [
			'ngSearchAndSelect'
		])
		.controller('DemoController', function($scope) {
			$scope.options = [
				{ name:'Physics', id:70 },
				{ name:'Chemistry', id:80 },
				{ name:'Math', id:65 },
				{ name:'English', id:75 },
				{ name:'Hindi', id:67 }
			];
		});
})(angular);
