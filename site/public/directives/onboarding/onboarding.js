swapsApp.controller('onboardingController', function($scope, $rootScope) {
    $scope.user = $rootScope.user;
    $scope.phase = 'home';

    $scope.close = function(){
        $scope.$dismiss();
    }

    $scope.next = function(){
        if($scope.phase == 'home'){
            $scope.phase = 'basic';
            return;
        }
        if($scope.phase == 'basic'){
            $scope.phase = 'photos';
            return;
        }
    }

    $scope.back = function(){
        if($scope.phase == 'basic'){
            $scope.phase = 'home';
            return;
        }
        if($scope.phase == 'photos'){
            $scope.phase = 'basic';
            return;
        }
    }


});
