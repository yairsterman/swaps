var login = null;
swapsApp.controller('loginController', function($scope, $routeParams, $rootScope, $window, $location, UsersService, $uibModal, MessageService, $timeout) {
    login = $scope;
    $rootScope.externalLogin = $routeParams.external;
    $scope.innerHeight = $window.innerHeight;

    // $scope.signin = signin;
    $scope.title = $scope.signin?'Join Swaps':'Log In';
    $scope.subTitle = $scope.signin?'In just a few steps you could find your next Swap':'';

    $scope.close = function(){
        $scope.modelInstance.close();
    };

    $scope.goToSignin = function(){
        $scope.signin = true;
        $scope.title = 'Join Swaps';
        $scope.subTitle = 'In just a few steps you could find your next Swap';
    };

    $scope.loginCallBack = function(userId){
        UsersService.getUser(userId).then(function(data){
            $rootScope.user = data.data;
            $rootScope.$broadcast('login-success');
            $scope.loggedIn = true;
            if(!$scope.externalLogin)
                $scope.modelInstance.close();
            if(!$rootScope.profileComplete()) {
                $scope.modelInstance = $uibModal.open({
                    animation: !$scope.externalLogin,
                    templateUrl: '../../directives/onboarding/onboarding.html',
                    size: 'lg',
                    controller: 'onboardingController'
                }).closed.then(function(){
                    if($rootScope.externalLogin){
                        $rootScope.externalLogin = false;
                        $location.url('/');

                    }
                });
            }
            else{
                if($rootScope.externalLogin){
                    $rootScope.externalLogin = false;
                    $location.url('/');
                }
            }
        });
    };

    $scope.FBLogin = function(){
        window.popup = window.open('http://localhost:3000/auth/facebook', 'newwindow', 'width=640, height=400');
        // window.popup = window.open('https://swapshome.com/auth/facebook', 'newwindow', 'width=640, height=400');
    };

    $scope.GoogleLogin = function(){
        window.popup = window.open('http://localhost:3000/auth/google', 'newwindow', 'width=640, height=400');
        // window.popup = window.open('https://swapshome.com/auth/google', 'newwindow', 'width=640, height=400');
    };

    $scope.terms = function(){
        $window.open('https://swapshome.com/terms-and-conditions' , '_blank');
    };

    $scope.policy = function(){
        $window.open('https://swapshome.com/privacy-policy' , '_blank');
    };
});

