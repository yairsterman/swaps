swapsApp.controller('onboardingController', function($scope, $rootScope) {

    $scope.phase = 'address';

    $scope.close = function(){
        $scope.$dismiss();
    }

    $scope.next = function(){
        if($scope.phase == 'address'){
            $scope.phase = 'home';
            return;
        }
        if($scope.phase == 'home'){
            $scope.phase = 'photos';
            return;
        }
    }


});
