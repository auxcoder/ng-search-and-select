(function (angular) {

	// Create all modules and define dependencies to make sure they exist
	// and are loaded in the correct order to satisfy dependency injection
	// before all nested files are concatenated by Gulp

  function SearchSelectController($scope, $sanitize, $document) {
		// todo: be able to define disable from expression parent
		var $ctrl = this;
		var labelFromKeys;
		var inputHandler = new KeyInputHandler();
		var readyForKeyInput = true;

		$ctrl.$onInit = function() {
			labelFromKeys = $ctrl.labelFromKeys.split(' ');
			$ctrl.inputName = Date.now();
			// how model values will appear in the view
			$ctrl.ngModel.$formatters.push(function(value) {
				if (angular.isDefined(value)) return value;
				return '';
			});
			// how view values will be saved in the model
			$ctrl.ngModel.$parsers.push(function(value) {
				// clean properties used internally
				// delete value.ss_display_html;
				// delete value.ss_display_name;
				// delete value.ss_index;
				return value;
			});
		};

		$ctrl.$onChanges = function(changesObj) {
			if (changesObj.hasOwnProperty('options')) {
				if (angular.isDefined(changesObj.options.currentValue) && !changesObj.options.isFirstChange()) {
					initSearchAndSelect();
				}
			}
		};

		$scope.$watch(function() { return $ctrl.ngModel.$viewValue; },
			function(n) {
				if (n && n.ss_display_name) {
					selectOption(n);
				}
			},
			true
		);

		$ctrl.filteredOptions = {};
		$ctrl.keyboardFocusIndex = null;
		$ctrl.searching = false;
		$ctrl.searchString = '';
		$ctrl.selectedIndex = null;

		$ctrl.isOptionSelected = isOptionSelected;
		$ctrl.searchOptions = searchOptions;
		$ctrl.selectOption = selectOption;
		$ctrl.ssBlur = ssBlur;
		$ctrl.ssFocus = ssFocus;

		function initSearchAndSelect() {
			if (angular.isUndefined($ctrl.ngModel)) {
				return;
			}

			$ctrl.disabled = angular.copy($ctrl.options.length === 0);

			validateParams();
			setParamDefaults();

			for (var i = 0; i < $ctrl.options.length; i++) {
				setOptionIndex(i);
				checkAndSetSelected(i);
				setOptionDisplayName(i);
			}

			$ctrl.filteredOptions = $ctrl.options;
			setSearchStringToOptionName();
		}

		function validateParams() {
			if (angular.isDefined($ctrl.idKey) && !$ctrl.options[0].hasOwnProperty($ctrl.idKey)) {
				throw 'Error: No option attribute matched with specified idKey: ' + $ctrl.idKey;
			}
		}

		function setParamDefaults() {
			if (angular.isUndefined($ctrl.idKey)) {
				$ctrl.idKey = 'id';
			}
		}

		function setOptionIndex(i) {
			$ctrl.options[i].ss_index = i;
		}

		// sets selected index if an option is already selected.
		function checkAndSetSelected(i) {
			if ($ctrl.ngModel === null) {
				return;
			}

			if ($ctrl.ngModel.$modelValue && $ctrl.ngModel.$modelValue[$ctrl.idKey] === $ctrl.options[i][$ctrl.idKey]) {
				$ctrl.selectedIndex = i;
			}
		}

		// sets the ss_display_name for an option based on the
		// keys specified in the labelFromKeys variable.
		function setOptionDisplayName(i) {
			var option = $ctrl.options[i];
			var ss_display_name = '';

			for (var j = 0; j < labelFromKeys.length; j++) {
				var key = labelFromKeys[j];
				if (angular.isDefined(option[key])) {
					ss_display_name += option[key] + ' ';
				}
			}

			if (ss_display_name === '') {
				throw 'Error: No option attribute matched with any key in labelFromKeys.';
			}

			ss_display_name = ss_display_name.slice(0, -1);
			$ctrl.options[i].ss_display_name = ss_display_name;
			$ctrl.options[i].ss_display_html = $sanitize(ss_display_name);
		}

		function selectOption(option) {
			$ctrl.selectedIndex = option.ss_index;
			$ctrl.ngModel.$setViewValue(option);
			triggerNgChange(option);
			setSearchStringToOptionName();
		}

		function triggerNgChange(value) {
			$ctrl.ngModel.$setViewValue(value);
		}

		function setSearchStringToOptionName() {
			$ctrl.searching = false;

			if ($ctrl.selectedIndex === null) {
				$ctrl.searchString = '';
				return;
			}

			if (angular.isUndefined($ctrl.options[$ctrl.selectedIndex])) {
				return;
			}
			$ctrl.searchString = $ctrl.options[$ctrl.selectedIndex].ss_display_name;
		}

		// enables arrow key detection and resets search.
		function ssFocus() {
			$document.on('keydown', inputHandler.run);
			$document.on('keyup', function() {
				readyForKeyInput = true;
			});
			resetSearch();
			searchOptions();
		}

		// Disables arrow key detection and sets the displayed input string.
		function ssBlur() {
			$ctrl.keyboardFocusIndex = null;
			angular.element(document).off('keydown', inputHandler.run);
			angular.element(document).off('keyup', function() {
				readyForKeyInput = true;
			});
			setSearchStringToOptionName();
		}

		function searchOptions() {
			if ($ctrl.searchString === '' || angular.isUndefined($ctrl.searchString)) {
				$ctrl.filteredOptions = $ctrl.options;
				return;
			}

			var result = [];
			var searchString = this.searchString.toLowerCase();

			for (var i = 0; i < $ctrl.options.length; i++) {
				var name = $ctrl.options[i].ss_display_name;
				var searchIndex = name.toLowerCase().indexOf(searchString);
				if (searchIndex !== -1) {
					var option = angular.copy($ctrl.options[i]);
					// splitting option display name in order to style the matched substring.
					var substringOne = option.ss_display_name.substring(0, searchIndex);
					var substringTwo = option.ss_display_name.substring(searchIndex, searchIndex + searchString.length);
					var substringThree = option.ss_display_name.substring(searchIndex + searchString.length);
					option.ss_display_html = buildDisplayHtml(substringOne, substringTwo, substringThree);
					result.push(option);
				}
			}

			$ctrl.filteredOptions = result;
		}

		function resetSearch() {
			$ctrl.searching = true;
			$ctrl.searchString = '';
		}

		function isOptionSelected() {
			return Boolean(angular.isObject($ctrl.ngModel.$viewValue) && Object.keys($ctrl.ngModel.$viewValue).length !== 0);
		}

		// An object for handling key inputs while focused on search-and-select.
		function KeyInputHandler() {
			this.run = function(e) {
				if (readyForKeyInput === false) {
					return;
				}
				var key = e.keyCode ? e.keyCode : e.which;
				readyForKeyInput = false;

				if (key === 38) {
					up();
				}
				if (key === 40) {
					down();
				}
				if (key === 13) {
					enter(e);
				}
				if (key === 27) {
					escape(e);
				}

				$scope.$apply();
			};

			// Move to previous option on up key press.
			function up() {
				if ($ctrl.keyboardFocusIndex === 0 || $ctrl.keyboardFocusIndex === null) {
					return;
				}
				$ctrl.keyboardFocusIndex -= 1;
				adjustScroll(false);
			}

			// Move to next option on down key press.
			function down() {
				if ($ctrl.keyboardFocusIndex === null) {
					$ctrl.keyboardFocusIndex = 0;
					adjustScroll(true);
					$scope.$apply();
					return;
				}

				if ($ctrl.keyboardFocusIndex >= $ctrl.filteredOptions.length - 1) {
					return;
				}

				$ctrl.keyboardFocusIndex += 1;
				adjustScroll(true);
			}

			// Close out search and select option on enter key press.
			function enter(e) {
				if ($ctrl.keyboardFocusIndex === null) {
					return;
				}
				selectOption($ctrl.filteredOptions[$ctrl.keyboardFocusIndex]);
				e.target.blur();
				readyForKeyInput = true;
			}

			// Close out search on escape key press.
			function escape(e) {
				e.target.blur();
				readyForKeyInput = true;
			}

			// Adjusts the scroll value of the list based on which listItem is currently focused.
			function adjustScroll(isDownKey) {
				var listId = 'option-list';
				var listItemId = 'option-list-item-' + $ctrl.keyboardFocusIndex;

				// Gets the "next" list item based on whether the down key or up key was pressed.
				var nextListItemDirection = isDownKey ? 1 : -1;
				var nextListItemId = 'option-list-item-' + ($ctrl.keyboardFocusIndex + nextListItemDirection);

				var list = $document[0].getElementById(listId);
				var listItem = $document[0].getElementById(listItemId);
				var nextListItem = $document[0].getElementById(nextListItemId) || listItem;

				// adjusts scroll value when the nextListItem is ~below~ the viewable window.
				if (nextListItem.offsetTop >= list.offsetHeight + list.scrollTop) {
					list.scrollTop = nextListItem.offsetTop - list.offsetHeight + nextListItem.offsetHeight;
				}

				// adjusts scroll value when the nextListItem is ~above~ the viewable window.
				if (list.scrollTop > nextListItem.offsetTop) {
					list.scrollTop = nextListItem.offsetTop;
				}
			}
		}

		// Takes the divided display name, wraps the matched substring in a bold-styled span,
		// and creates the displayHtml.
		function buildDisplayHtml(substringOne, substringTwo, substringThree) {
			var boldSubstring = '<span class="search-bold">' + substringTwo + '</span>';
			return $sanitize(substringOne + boldSubstring + substringThree);
		}
  }
	SearchSelectController.$inject = ['$scope', '$sanitize', '$document'];

  //////////////////////////////////////////////////////////////////////////////

	// Config
	angular.module('ngSearchAndSelect.config', [])
	.value('ngSearchAndSelect.config', {
		debug: true
	});

	// Modules
	angular.module('ngSearchAndSelect.component', [])
	.component('searchAndSelect', {
		require: {
			ngModel: 'ngModel',
		},
		bindings: {
			options: '<',
			disabled: '<?',
			required: '<?',
			idKey: '@',
			labelFromKeys: '@',
			placeholderText: '@',
			fontAwesomeIcon: '@',
		},
		templateUrl: '/ng-search-and-select/search-and-select.html',
		controller: SearchSelectController,
	});

	angular.module('ngSearchAndSelect',
		[
			'ngSearchAndSelect.config',
			'ngSearchAndSelect.component',
			'ngSanitize'
		]
	);
})(angular);
