(function(angular) {
	// 'use strict';

	angular
		.module('demoApp', [
			'ngSearchAndSelect'
		])
		.controller('DemoController', ['$scope', '$timeout', function($scope, $timeout) {
			$scope.title = 'Demo App for Search and Select component';
			$scope.options = [];
			$scope.isDisabled = false;
			$scope.lesson = {id: null, name: null};
			$timeout(function() {
				$scope.options = [
					{ id: 10, name: 'Physics' },
					{ id: 11, name: 'Chemistry' },
					{ id: 12, name: 'Math' },
					{ id: 13, name: 'English' },
					{ id: 14, name: 'Hindi' }
				];
			}, 3000);
			$scope.onChangeSelectSystem = function onChangeSelectSystem(systemTypeObj) {
				console.log('systemTypeObj > ', systemTypeObj); // eslint-disable-line
			}
		}]);
})(angular);
