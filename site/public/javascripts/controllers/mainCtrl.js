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

    $scope.link = function(link){
        switch(link){
            case 'facebook':
                $window.open('https://www.facebook.com/swapshome/' , '_blank');
                break;
            case 'instagram':
                $window.open('https://www.instagram.com/swaps.home/' , '_blank');
                break;
            case 'twitter':
                $window.open('https://twitter.com/Swaps_Home' , '_blank');
                break;
        }
    }

    $scope.profileComplete = function(){
        return false;
    }

});
