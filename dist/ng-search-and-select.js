(function (angular) {


  function SearchSelectController($scope, $sanitize, $document) {
		var $ctrl = this;
		var labelFromKeys;
		var inputHandler = new KeyInputHandler();
		var readyForKeyInput = true;

		$ctrl.$onInit = function() {
			labelFromKeys = $ctrl.labelFromKeys.split(' ');
			$ctrl.inputName = Date.now();
			$ctrl.icon = $ctrl.selectIcon;
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

		function checkAndSetSelected(i) {
			if ($ctrl.ngModel === null) {
				return;
			}

			if ($ctrl.ngModel.$modelValue && $ctrl.ngModel.$modelValue[$ctrl.idKey] === $ctrl.options[i][$ctrl.idKey]) {
				$ctrl.selectedIndex = i;
			}
		}

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

		function ssFocus() {
			$document.on('keydown', inputHandler.run);
			$document.on('keyup', function() {
				readyForKeyInput = true;
			});
			resetSearch();
			searchOptions();
		}

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

			function up() {
				if ($ctrl.keyboardFocusIndex === 0 || $ctrl.keyboardFocusIndex === null) {
					return;
				}
				$ctrl.keyboardFocusIndex -= 1;
				adjustScroll(false);
			}

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

			function enter(e) {
				if ($ctrl.keyboardFocusIndex === null) {
					return;
				}
				selectOption($ctrl.filteredOptions[$ctrl.keyboardFocusIndex]);
				e.target.blur();
				readyForKeyInput = true;
			}

			function escape(e) {
				e.target.blur();
				readyForKeyInput = true;
			}

			function adjustScroll(isDownKey) {
				var listId = 'option-list';
				var listItemId = 'option-list-item-' + $ctrl.keyboardFocusIndex;

				var nextListItemDirection = isDownKey ? 1 : -1;
				var nextListItemId = 'option-list-item-' + ($ctrl.keyboardFocusIndex + nextListItemDirection);

				var list = $document[0].getElementById(listId);
				var listItem = $document[0].getElementById(listItemId);
				var nextListItem = $document[0].getElementById(nextListItemId) || listItem;

				if (nextListItem.offsetTop >= list.offsetHeight + list.scrollTop) {
					list.scrollTop = nextListItem.offsetTop - list.offsetHeight + nextListItem.offsetHeight;
				}

				if (list.scrollTop > nextListItem.offsetTop) {
					list.scrollTop = nextListItem.offsetTop;
				}
			}
		}

		function buildDisplayHtml(substringOne, substringTwo, substringThree) {
			var boldSubstring = '<span class="search-bold">' + substringTwo + '</span>';
			return $sanitize(substringOne + boldSubstring + substringThree);
		}
  }
	SearchSelectController.$inject = ['$scope', '$sanitize', '$document'];


	angular.module('ngSearchAndSelect.config', [])
	.value('ngSearchAndSelect.config', {
		debug: true
	});

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
			selectIcon: '@',
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

if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
	module.exports = 'ngSearchAndSelect';
}

angular.module('ngSearchAndSelect.component').run(function() { angular.element(document).find('head').prepend('<style type="text/css">.search-select-container{position:relative;font-weight:400}.search-select-container .disabled{opacity:0.5}.search-select-container div,.search-select-container ul,.search-select-container li,.search-select-container i{display:block}.search-select-container .ss-input-container{position:relative}.search-select-container .ss-input-container .form-control{height:44px}.search-select-container .ss-input-container .icon-base{position:absolute;z-index:3;top:calc(45%);right:10px;font-size:28px;pointer-events:none}.search-select-container .results-container{width:100%;position:absolute;z-index:200;top:100%}.search-select-container .results-container .option-list{height:auto;width:100%;max-height:300px;padding:0px;margin:0px;color:inherit;background-color:white;border:1px solid #ccc;border-top:none;box-shadow:0px 1px 3px 0.5px #bbb;list-style:none;overflow:auto}.search-select-container .results-container .option-list .option-list-item{padding:5px 15px 5px 15px;cursor:pointer}.search-select-container .results-container .option-list .option-list-item.kb-focused{background-color:silver}.search-select-container .results-container .option-list .option-list-item:hover{background-color:#b8b8b8}.search-select-container .results-container .option-list .option-list-item .search-bold{font-weight:bold}</style>');});

angular.module('ngSearchAndSelect.component').run(['$templateCache', function($templateCache) {$templateCache.put('/ng-search-and-select/search-and-select.html','<div class="search-select-container" ng-class="{\'disabled\': $ctrl.disabled}">\n\t<div class="ss-input-container form-group" ng-class="{\'container-expanded\': $ctrl.isOptionSelected()}">\n\t\t<label class="control-label" ng-class="{\'cover-expanded\': $ctrl.isOptionSelected()}">\n\t\t\t{{ $ctrl.placeholderText }}\n\t\t</label>\n\n\t\t<input name="search_string{{ $ctrl.inputName }}" type="text" class="form-control" placeholder="{{ $ctrl.placeholderText }}" autocomplete="off" ng-class="{\'input-expanded\': $ctrl.isOptionSelected()}" ng-model="$ctrl.searchString" ng-focus="$ctrl.ssFocus()" ng-keyup="$ctrl.searchOptions()" ng-blur="$ctrl.ssBlur()" ng-disabled="$ctrl.disabled" ng-required="$ctrl.required">\n\t\t<i class="icon-base" ng-class="{\'icon-expanded\': $ctrl.isOptionSelected(), \'{{\n\t\t\t\t$ctrl.icon\n\t\t\t}}\': true}"></i>\n\t</div>\n\n\t<div class="results-container" ng-show="$ctrl.searching">\n\t\t<ul id="option-list" class="option-list" ng-show="$ctrl.filteredOptions.length > 0">\n\t\t\t<li id="option-list-item-{{ $index }}" class="option-list-item" ng-class="{\'kb-focused\': $ctrl.keyboardFocusIndex === $index}" ng-repeat="option in $ctrl.filteredOptions track by $index" ng-mousedown="$ctrl.selectOption(option)" ng-bind-html="option.ss_display_html"></li>\n\t\t</ul>\n\t</div>\n</div>\n');}]);