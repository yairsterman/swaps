swapsApp.directive('onboarding', function() {
    return {
        restrict: 'E',
        controller: onboardingController,
        scope: {

        },
        templateUrl: '../../directives/onboarding/onboarding.html'
    }
});

function onboardingController($scope){
    $scope.addItem = function(index, event){
        if($scope.readonly){
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        if(!$scope.model){
            $scope.model = [];
            $scope.model.push(index);
            return;
        }
        if($scope.isChecked(index)){
            $scope.model.splice($scope.model.indexOf(index),1);
        }
        else{
            $scope.model.push(index);
        }
    }

    $scope.isChecked = function(index){
        if($scope.model){
            return $scope.model.includes(index);
        }
        return false;
    }
}