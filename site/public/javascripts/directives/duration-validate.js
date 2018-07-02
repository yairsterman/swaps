swapsApp.directive('duration', function() {
	return {
		restrict: 'A',
		controller: 'homeController',
		require: 'ngModel',
		link: function(scope, elm, attr, ngModel) {
				ngModel.$validators.duration = function (modelValue, viewValue) {
					var duration =  viewValue.split('-');
					var min = Number(duration[0]);
					var max = Number(duration[1]);
					if(isNaN(min) || isNaN(max)) {
							return false
						}
						else if(min > max) {
							return false
						}
					return true;
				}
		}
	}
});
