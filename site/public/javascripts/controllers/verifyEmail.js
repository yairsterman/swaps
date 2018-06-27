swapsApp.controller('verifyEmailController', function($scope, $routeParams, $rootScope, $location, AccountService) {

    $scope.token = $routeParams.token;

    AccountService.verifyEmail($scope.token).then(function(res){
        if(res.verified){
            $scope.title = 'Email verified';
        }
        else{
            $scope.title = 'Email not verified';
        }
    },function(msg){
        $scope.title = msg;
    });

});