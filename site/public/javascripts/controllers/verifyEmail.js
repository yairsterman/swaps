swapsApp.controller('verifyEmailController', function($scope, $routeParams, $rootScope, $location, AccountService) {

    $scope.token = $routeParams.token;

    $scope.init = function(){

        AccountService.verifyEmail($scope.slug).then(function(res){
            $scope.title = res;
        },function(err){
            $scope.error = 'No post found'
        });
    }

});