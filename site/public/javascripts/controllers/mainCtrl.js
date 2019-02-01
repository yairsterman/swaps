swapsApp.controller('mainController', function($scope, $rootScope, $location, Utils, $uibModal, $window, $timeout,UsersService, AccountService, $interval) {

    $rootScope.homepage = false;
    $rootScope.searchPage = false;
    $scope.data = $rootScope.data;

    $scope.$on('data-return', function(event, args) {
        $scope.data = $rootScope.data;
    });

    $scope.openLogin = function(signin){
        $scope.signin = signin;
        $scope.modelInstance = $uibModal.open({
            animation: true,
            templateUrl: '../../directives/login/login.html',
            size: 'sm',
            controller: 'loginController',
            scope:$scope
        });
    };

    $scope.openSwapDates = function (){
        if(!$scope.user || !$scope.user._id){
            $scope.openLogin();
            return;
        }
        $scope.popup = true;
        $scope.swaps = $scope.user.travelingInformation;
        $scope.modelInstance = $uibModal.open({
            animation: true,
            templateUrl: '../../directives/swaps/swaps.html',
            size: 'lg',
            controller: 'swapsController',
            scope: $scope
        });
    }

    $scope.showSecuritySection = function(){
        $scope.showSecurityDeposit = true;
        $timeout(function(){
            $("html").animate({scrollTop: $("#securityDeposit").offset().top}, "fast");
        },300)
    };

    $scope.showCreditsSection = function(){
        $scope.showSwapCredits = true;
        $timeout(function(){
            $("html").animate({scrollTop: $("#swapCredits").offset().top}, "fast");
        },300)
    };

    $rootScope.isMobile = (/android|webos|iphone|ipad|ipod|blackberry|windows phone/).test(navigator.userAgent.toLowerCase()) || $window.outerWidth < 641;

    $scope.go = function(path){
        $(window).unbind('scroll');
        $('.navbar').removeClass('sticky');
        $location.url('/' + path);
    }

    $scope.$on('auth-return', function(event, args) {
        $scope.user = $rootScope.user;
    });

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
        if(!$rootScope.user._id)
            return false;
        return $rootScope.user.photos.length > 0 && $rootScope.user.apptInfo.title && $rootScope.user.apptInfo.title !== '' &&
            $rootScope.user.address && $rootScope.user.address !== '' ;//&&
            // $scope.user.apptInfo.about && $scope.user.apptInfo.about !== '' &&
            // $scope.user.occupation && $scope.user.occupation !== '' &&
            // $scope.user.aboutMe && $scope.user.aboutMe !== '' &&
            // ($scope.user.deposit || $scope.user.deposit === 0);
    }

    $scope.round = function(x){
        return Math.floor(x);
    }

    $rootScope.profileComplete = $scope.profileComplete;

    if($location.url().indexOf('#swapCredits') != -1){
        $scope.showCreditsSection();
    }
    if($location.url().indexOf('#securityDeposit') != -1){
        $scope.showSecuritySection();
    }

});
