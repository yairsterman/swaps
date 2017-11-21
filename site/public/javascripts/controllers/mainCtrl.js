var he = null;
swapsApp.controller('mainController', function($scope, $rootScope, $location, Utils, UsersService, AccountService, $interval) {

    $scope.data = {};

    Utils.getData().then(function(data){
        $scope.data = data;
    });

});
