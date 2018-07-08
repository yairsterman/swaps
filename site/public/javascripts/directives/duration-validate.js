swapsApp.directive('duration', function() {
	return {
		restrict: 'A',
		controller: 'homeController',
		require: 'ngModel',
		link: function(scope, elm, attr, ngModel) {
				ngModel.$validators.duration = function (modelValue, viewValue) {
					if(!viewValue){
						return false;
					}
					var duration =  viewValue.split('-');
					var min = Number(duration[0]);
					var max = Number(duration[1]);
					if(!isNaN(min) && typeof duration[1] == 'undefined'){
                    	if(min < 1 || min > 28){
                            return false;
                        }
						return true;
					}
					if(isNaN(min) || isNaN(max)) {
							return false;
						}
						else if(min > max) {
							return false;
						}
						else if(min < 1 || max > 28){
							return false;
						}
					return true;
				}
		}
	}
});
