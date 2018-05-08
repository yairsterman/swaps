var login = null;
swapsApp.controller('loginController', function($scope, signin, $rootScope, $window, $location, UsersService, $uibModal, MessageService, $timeout) {
    login = $scope;

    $scope.signin = signin;
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
            $scope.modelInstance.close();
            if(!$scope.profileComplete()) {
                $scope.modelInstance = $uibModal.open({
                    animation: true,
                    templateUrl: '../../directives/onboarding/onboarding.html',
                    size: 'md',
                    controller: 'onboardingController'
                });
            }
        });
    };

    $scope.profileComplete = function(){
        if(!$scope.user._id)
            return false;
        return $scope.user.photos.length >= 3 && $scope.user.apptInfo.title && $scope.user.apptInfo.title !== '' &&
            $scope.user.address && $scope.user.address !== '';
    };

    $scope.FBLogin = function(){
        window.popup = window.open('http://localhost:3000/auth/facebook', 'newwindow', 'width=640, height=400');
        // window.popup = window.open('https://swapshome.com/auth/facebook', 'newwindow', 'width=640, height=400');
    };

    //eran
    $scope.GoogleLogin = function(){
        window.popup = window.open('http://localhost:3000/auth/google', 'newwindow', 'width=640, height=400');
        // window.popup = window.open('https://swapshome.com/auth/facebook', 'newwindow', 'width=640, height=400');
    };
    //eran

    $scope.terms = function(){
        $window.open('https://swapshome.com/terms-and-conditions' , '_blank');
    };

    $scope.policy = function(){
        $window.open('https://swapshome.com/privacy-policy' , '_blank');
    };
});

