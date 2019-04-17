swapsApp.controller('landingController', function($scope, $rootScope, $location, Utils, $uibModal, $window, $timeout,UsersService, AccountService, $interval) {

    $rootScope.homepage = false;
    $rootScope.searchPage = false;
    $scope.data = $rootScope.data;
    $rootScope.externalLogin = true;
    $scope.innerHeight = $window.innerHeight;
    $scope.phase = 'first';

    $scope.places = ['Anywhere!', 'Berlin', 'New York', 'Amsterdam', 'Tel Aviv'];

    $scope.search = {};

    $scope.localeFormat = 'MMM DD';
    $scope.modelFormat = 'MM/DD/YYYY';

    $scope.go = function(path){
        $rootScope.externalLogin = false;
        $location.url('/' + path);
    }

    $scope.next = function(){
        switch($scope.phase) {
            case 'first':
                $scope.phase = 'where';
                break;
            case 'where':
                $scope.phase = 'when';
                break;
            case 'when':
                $scope.phase = 'who';
                break;
        }
    }

    $scope.setCity = function(place){
        $scope.search.where = place;
    }

    $scope.$on('auth-return', function(event, args) {
        $scope.user = $rootScope.user;
    });

    $scope.$on('data-return', function(event, args) {
        $scope.data = $rootScope.data;
    });

    $scope.profileComplete = function(){
        if(!$rootScope.user._id)
            return false;
        return $rootScope.user.photos.length > 0 && $rootScope.user.apptInfo.title && $rootScope.user.apptInfo.title !== '' &&
            $rootScope.user.address && $rootScope.user.address !== '' ;//&&
        // $scope.user.apptInfo.about && $scope.user.apptInfo.about !== '' &&
        // $scope.user.occupation && $scope.user.occupation !== '' &&
        // $scope.user.aboutMe && $scope.user.aboutMe !== '' &&
        // ($scope.user.deposit || $scope.user.deposit === 0);
    }


});