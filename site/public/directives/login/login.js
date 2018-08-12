var login = null;
swapsApp.controller('loginController', function($scope, $routeParams, $rootScope, $window, $location, UsersService, $uibModal, AccountService, MessageService, $timeout) {
    login = $scope;
    $rootScope.externalLogin = $routeParams.external;
    if($rootScope.externalLogin){
        $scope.signin = $rootScope.externalLogin;
    }
    $scope.innerHeight = $window.innerHeight;

    // $scope.signin = signin;
    $scope.title = $scope.signin?'Join Swaps':'Log In';
    $scope.subTitle = $scope.signin?'In just a few steps you could find your next Swap':'';
    $scope.credentials = {};
    $scope.passwordType = 'password';
    $scope.eyeIcon = 'fa-eye';

    $scope.close = function(){
        $scope.modelInstance.close();
    };

    $scope.goToSignin = function(){
        $scope.signin = true;
        $scope.isEmailLogin = false;
        $scope.title = 'Join Swaps';
        $scope.subTitle = 'In just a few steps you could find your next Swap';
    };

    $scope.loginCallBack = function(){
        UsersService.getUser().then(function(data){
            $rootScope.user = data.data;
            $rootScope.$broadcast('login-success');
            $scope.loggedIn = true;
            if(!$scope.externalLogin)
                $scope.modelInstance.close();
            else{
                if($location.search().referer){
                    AccountService.setReferral($location.search().referer);
                }
            }
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
        $location.search('login','facebook');
        window.popup = window.open('http://localhost:3000/auth/facebook', 'newwindow', 'width=640, height=400');
        // window.popup = window.open('https://swapshome.com/auth/facebook', 'newwindow', 'width=640, height=400');
    };

    $scope.GoogleLogin = function(){
        $location.search('login','gmail');
        window.popup = window.open('http://localhost:3000/auth/google', 'newwindow', 'width=640, height=400');
        // window.popup = window.open('https://swapshome.com/auth/google', 'newwindow', 'width=640, height=400');
     };

    $scope.EmailLogin = function(form){
        $scope.error = false;
        $scope.passwordsMismatch = false;
        if(form.$invalid){
            if(form.firstName && form.firstName.$invalid){
                $scope.firstNameInvalid = true;
            }
            if(form.lastName && form.lastName.$invalid){
                $scope.lastNameInvalid = true;
            }
            if(form.email.$invalid){
                $scope.emailInvalid = true;
            }
            if(form.password.$invalid){
                $scope.passwordInvalid = true;
                if(!$scope.signin){
                    $scope.error = "Wrong password";
                }
            }
            if($scope.signin && $scope.credentials.password !== $scope.credentials.confirmPassword){
                $scope.confirmPasswordInvalid = true;
                $scope.passwordsMismatch = true;
            }
            return;
        }
        if($scope.signin && $scope.credentials.password !== $scope.credentials.confirmPassword){
            $scope.confirmPasswordInvalid = true;
            $scope.passwordsMismatch = true;
            return;
        }
        AccountService.emailSignup($scope.credentials).then(function(userId){
            $location.search('login','email');
            $scope.loginCallBack();
        },function(err){
            $scope.error = err;
        })
    };

    $scope.goToEmailLogin = function(){
        $scope.credentials = {};
        $scope.isEmailLogin = true;
    };

    $scope.showPassword = function(){
        if($scope.passwordType == 'password'){
            $scope.passwordType = 'text'
            $scope.eyeIcon = 'fa-eye-slash';
        }
        else{
            $scope.passwordType = 'password'
            $scope.eyeIcon = 'fa-eye';
        }
    }
    
    $scope.forgotPassword = function(form){
        $scope.error = false;
        $scope.passwordsMismatch = false;
        if(form.$invalid){
            if(form.email.$invalid){
                $scope.forgotEmailInvalid = true;
            }
            $scope.error = 'Please enter a valid email';
            return;
        }
        AccountService.forgotPassword($scope.credentials.email).then(function(res){
            $scope.forgotMailSent = true;
        },function(err){
            $scope.error = err;
        })
    };

    $scope.goToForgot = function(){
        $scope.forgotMailSent = false;
        $scope.forgotEmailInvalid = false;
        $scope.error = false;
        $scope.forgot = true;
    };

    $scope.backForgot = function(){
        $scope.error = false;
        $scope.forgot = false;
    };

    $scope.backToSocial = function(){
        $scope.isEmailLogin = false;
    };

    $scope.setToFalse = function(variable){
        $scope[variable] = false;
    };

    $scope.terms = function(){
        $window.open('https://swapshome.com/terms-and-conditions' , '_blank');
    };

    $scope.policy = function(){
        $window.open('https://swapshome.com/privacy-policy' , '_blank');
    };
});

