swapsApp.controller('mainController', function($scope, $rootScope, $location, Utils, $uibModal, $window, UsersService, AccountService, $interval) {

    $rootScope.homepage = false;
    $rootScope.searchPage = false;
    $scope.data = {};

    Utils.getData().then(function(data){
        $scope.data = data;
        $rootScope.data = data;
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

    $rootScope.isMobile = (/android|webos|iphone|ipad|ipod|blackberry|windows phone/).test(navigator.userAgent.toLowerCase()) || $window.outerWidth < 641;

    $scope.go = function(path){
        $(window).unbind('scroll');
        $location.url('/' + path);
    }

});
