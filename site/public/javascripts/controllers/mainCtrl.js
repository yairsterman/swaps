var he = null;
swapsApp.controller('mainController', function($scope, $rootScope, $location, Utils, UsersService, AccountService, $interval) {

    $scope.data = {};

    Utils.getAmenities().then(function(data){
        $scope.data.amenities = data;
    });

    Utils.getPropertyType().then(function(data){
        $scope.data.roomTypes = data;
    });

    Utils.getThingsToDo().then(function(data){
        $scope.data.thingsToDo = data;
    });

    Utils.getGenders().then(function(data){
        $scope.data.genders = data;
    });

    Utils.getSecurityDeposit().then(function(data){
        $scope.data.deposits = data;
    });

});
