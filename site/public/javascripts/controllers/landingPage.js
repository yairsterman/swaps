var signup = null;
swapsApp.controller('landingController', function($scope, $rootScope, $location, Utils, $uibModal, $window, $timeout,UsersService, AccountService, $interval) {
    signup = $scope;
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
        $scope.error = false;
        switch($scope.phase) {
            case 'first':
                $scope.phase = 'where';
                break;
            case 'where':
                if(!$scope.search.where){
                    $scope.error = true;
                    return;
                }
                $timeout(function(){
                    $('.calendar').click();
                },100);
                $scope.phase = 'when';
                break;
            case 'when':
                if(!$scope.search.when){
                    $('.daterangepicker').addClass('error');
                    return;
                }
                $scope.search.alone = true;
                $scope.phase = 'who';
                break;
            case 'who':
                if(!$scope.search.alone && (!$scope.search.guests || $scope.search.guests < 1)){
                    $scope.error = true;
                    return;
                }
                $scope.search.flight = false;
                $scope.phase = 'flight';
                break;
            case 'flight':
                $scope.phase = 'almost-done';
                break;
            case 'almost-done':
                $scope.phase = 'sign-up';
                break;
            case 'sign-up':
                $scope.phase = 'credits';
                break;
            case 'credits':
                $scope.phase = 'details';
                break;
        }
    }

    $scope.findMatches = function(){
        saveProfileChanges();
    };

    $('.calendar').on('apply.daterangepicker', function(ev, picker) {
        $('.daterangepicker').removeClass('error');
    });

    $scope.unsetError = function(){
        $scope.error = false;
    }

    $scope.setCity = function(place){
        $scope.error = false;
        $scope.search.where = place;
    }

    $scope.$on('auth-return', function(event, args) {
        $scope.user = $rootScope.user;
    });

    $scope.$on('data-return', function(event, args) {
        $scope.data = $rootScope.data;
    });

    $scope.loginCallBack = function(){
        $scope.next();
        UsersService.getUser().then(function(data){
            $rootScope.user = data.data;
            $scope.user = $rootScope.user;
            $scope.loggedIn = true;
            if($location.search().referer){
                AccountService.setReferral($location.search().referer);
            }
            $rootScope.$broadcast('login-success');
        });
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

    $scope.FBLogin = function(){
        $location.search('login','facebook');
        // window.popup = window.open('http://localhost:3000/auth/facebook', 'newwindow', 'width=640, height=400');
        window.popup = window.open('https://swapshome.com/auth/facebook', 'newwindow', 'width=640, height=400');
    };

    $scope.GoogleLogin = function(){
        $location.search('login','gmail');
        // window.popup = window.open('http://localhost:3000/auth/google', 'newwindow', 'width=640, height=400');
        window.popup = window.open('https://swapshome.com/auth/google', 'newwindow', 'width=640, height=400');
    };

    $scope.terms = function(){
        $window.open('https://swapshome.com/terms-and-conditions' , '_blank');
    };

    $scope.policy = function(){
        $window.open('https://swapshome.com/privacy-policy' , '_blank');
    };

    $scope.setToFalse = function(variable){
        $scope[variable] = false;
    };

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


    function saveProfileChanges(){
        if(!($scope.user.address && $scope.user.address !== '' && $scope.user.apptInfo.title && $scope.user.apptInfo.title !== '' && $scope.user.apptInfo.guests && $scope.user.apptInfo.roomType !== undefined && $scope.user.apptInfo.guests > 0)){
            return;
        }
        $scope.searching = true;
        $scope.user.apptInfo.amenities = $scope.user.apptInfo.amenities.length>0?$scope.user.apptInfo.amenities:[0,1,4];
        AccountService.editListing($scope.user).then(function(data){
            $rootScope.user = data;
            $scope.user = $rootScope.user;
            $timeout(function(){
                $scope.go(`travelers/${$scope.search.where}?dates=${$scope.search.when}&guests=${($scope.search.alone?1:$scope.search.guests+1)}`)
            },8000)
        });
    }

});