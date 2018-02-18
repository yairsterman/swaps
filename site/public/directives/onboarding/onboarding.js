swapsApp.controller('onboardingController', function($scope, $rootScope) {

    $scope.phase = 'address';
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
});
