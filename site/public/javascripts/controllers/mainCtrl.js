swapsApp.controller('mainController', function($scope, $rootScope, $location, Utils, $uibModal, UsersService, AccountService, $interval) {

    $scope.data = {};

    Utils.getData().then(function(data){
        $scope.data = data;
    });

    $scope.openLogin = function(signin){
        $scope.modelInstance = $uibModal.open({
            animation: true,
            templateUrl: '../../directives/login/login.html',
            size: 'sm',
            controller: 'loginController',
            resolve: {
                signin: function () {
                    return signin;
                }
            },
            scope:$scope
        });
    }

});
