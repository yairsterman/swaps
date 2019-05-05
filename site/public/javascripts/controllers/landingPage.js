var signup = null;
swapsApp.controller('landingController', function($scope, $rootScope, $routeParams, $location, Utils, $uibModal, $window, $timeout,UsersService, AccountService, alertify) {
    signup = $scope;
    $rootScope.homepage = false;
    $rootScope.searchPage = false;
    $scope.data = $rootScope.data;
    $rootScope.externalLogin = true;
    $scope.innerHeight = $window.innerHeight;
    $scope.communityCode = $routeParams.community;
    $scope.referer = $routeParams.referer;
    $scope.type = $routeParams.type;
    $scope.currentPhase = 1;
    $scope.numOfFiles = 0;
    $scope.phases = [
        {id: 0, section: ''},
        {id: 1, section: 'first'},
        {id: 2, section: 'where'},
        {id: 3, section: 'when'},
        {id: 4, section: 'who'},
        {id: 5, section: 'flight'},
        {id: 6, section: 'almost-done'},
        {id: 7, section: 'sign-up'},
        {id: 8, section: 'credits'},
        {id: 9, section: 'details'},
    ];
    if($scope.type === '2'){
        $scope.phases = [
            {id: 0, section: ''},
            {id: 1, section: 'first'},
            {id: 2, section: 'pre-login'},
            {id: 3, section: 'sign-up'},
            {id: 4, section: 'credits'},
            {id: 5, section: 'where'},
            {id: 6, section: 'when'},
            {id: 7, section: 'who'},
            {id: 8, section: 'flight'},
            {id: 9, section: 'details'},
        ];
    }
    if($scope.type === '3'){
        $scope.phases= [
            {id: 0, section: ''},
            {id: 1, section: 'first'},
            {id: 2, section: 'where'},
            {id: 3, section: 'when'},
            {id: 4, section: 'who'},
            {id: 5, section: 'flight'},
            {id: 6, section: 'almost-done'},
            {id: 7, section: 'sign-up'},
            {id: 8, section: 'credits'},
            {id: 9, section: 'details'},
            {id: 10, section: 'basics'},
            {id: 11, section: 'photo'},
        ];
    }
    $scope.phase = $scope.phases[$scope.currentPhase].section;

    $scope.places = ['Anywhere!', 'Berlin', 'New York', 'Amsterdam', 'Tel Aviv', 'London'];

    $scope.search = {
        guests: 1
    };
    $scope.credentials = {};

    $scope.localeFormat = 'MMM DD';
    $scope.modelFormat = 'MM/DD/YYYY';

    $scope.init = function(){
        $('.fb-messenger-icon').addClass('hide');

        $('.calendar').on('apply.daterangepicker', function(ev, picker) {
            $('.daterangepicker').removeClass('error');
        });

        if($routeParams.phase){
            $location.url(`/signup/${$scope.type}${($scope.communityCode?'/'+$scope.communityCode:'')}`);
        }

        angular.element($window).bind('resize', function(){

            $scope.innerHeight = $window.innerHeight;

            // manuall $digest required as resize event
            // is outside of angular
            $scope.$digest();
        });
    };

    $scope.$on('$routeUpdate', function($event, next, current) {
        if($routeParams.phase){
            if($rootScope.user && $rootScope.user._id &&
                ($scope.phases[$scope.currentPhase].section === 'sign-in' || $scope.phases[$scope.currentPhase].section === 'credits') &&
                $scope.currentPhase > parseInt($routeParams.phase)){
                $scope.currentPhase = $scope.type === '2'?1:6;
            }
            else{
                $scope.currentPhase = parseInt($routeParams.phase);
            }
            $scope.phase = $scope.phases[$scope.currentPhase].section;
        }
    });

    $scope.go = function(path){
        $rootScope.externalLogin = false;
        $('.fb-messenger-icon').removeClass('hide');
        $location.url('/' + path);
    }

    $scope.next = function(){
        $scope.error = false;
        switch($scope.phase) {
            case 'where':
                if(!$scope.search.where){
                    $scope.error = true;
                    return;
                }
                $timeout(function(){
                    $('.calendar').click();
                },100);
                break;
            case 'when':
                if(!$scope.search.when){
                    $('.daterangepicker').addClass('error');
                    return;
                }
                $scope.search.alone = true;
                break;
            case 'who':
                if(!$scope.search.alone && (!$scope.search.guests || $scope.search.guests < 1)){
                    $scope.error = true;
                    return;
                }
                $scope.search.flight = false;
                break;
            case 'almost-done':
            case 'pre-login':
                if($rootScope.user && $rootScope.user._id){
                    $scope.currentPhase += 2;
                }
                break;
        }
        $scope.currentPhase++;
        $location.url(`/signup/${$scope.type}${($scope.communityCode?'/'+$scope.communityCode:'')}?phase=${$scope.currentPhase}`);
    };

    $scope.findMatches = function(){
        $scope.phase = '';
        saveProfileChanges();
    };

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
            if($scope.communityCode && !$scope.user.community){
                AccountService.setCommunity($scope.communityCode).then(function(data){
                    $rootScope.user = data;
                    $scope.user = $rootScope.user;
                    if(!$scope.user.apptInfo.amenities.length || $scope.user.apptInfo.amenities.length === 0){
                        $scope.user.apptInfo.amenities = [0,1,4];
                    }
                },function(err){
                })
            }
            $scope.loggedIn = true;
            if($scope.referer){
                AccountService.setReferral($scope.referer);
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

    function showAlert(msg, error){
        if(!error){
            alertify.success(msg);
        }
        else{
            alertify.error(msg);
        }
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
                $rootScope.showInviteFriends = true;
                $scope.go(`travelers${($scope.search.where === 'Anywhere!'?'':'/'+$scope.search.where)}?dates=${$scope.search.when}&guests=${($scope.search.alone?1:$scope.search.guests+1)}`)
            },2000)
        });
    }

    function add_uploadButton(e, data){
        $scope.uploadStarted = false;
        $scope.imageProgress = 0;
        if(data.files[0].type.indexOf('image') === -1){
            showAlert('Wrong file type, only images are allowed', true);
            return;
        }
        $scope.saving = true;
        AccountService.getUploadToken().then(function( token ) {
            $scope.numOfFiles++;
            data.formData = token;
            data.submit();
            $scope.uploadStarted = true;
        },function(){
            $scope.saving = false;
        });
    }

    function change_uploadbutton(e, data){
        if(data.files.length > 8 - $scope.user.photos.length) {
            showAlert('You can only have 8 images', true);
            return false;
        }
    }

    function fileuploaddone_uploadbutton(e, data){
        AccountService.uploadCompleted({url: data.result.url, public_id: data.result.public_id}).then(function( result ) {
            $rootScope.user = result;
            $scope.user = $rootScope.user;
        },function(err){
            showAlert('Failed to upload photo, please try again later', true);
        })
        .finally(function(){
            $scope.numOfFiles--;
            if($scope.numOfFiles === 0){//uploaded all photos
                showAlert('Photos Uploaded Successfully', false);
                $scope.saving = false;
                $scope.uploadStarted = false;
            }
        });
    }

    function uploadFail(err, data){
        $scope.numOfFiles--;
        if($scope.numOfFiles === 0){//uploaded all photos
            $scope.saving = false;
            $scope.$apply();
        }
        showAlert('Could not upload photo', true);
    }

    $scope.initUploadButton =function(){

        $.cloudinary.config({ cloud_name: 'swaps', secure: true});
        $('.cloudinary-fileupload').fileupload({
            add: add_uploadButton,
            change: change_uploadbutton,
            done: fileuploaddone_uploadbutton,
            fail: uploadFail,
            maxFileSize: 20000000,                        // 20MB is an example value
            loadImageMaxFileSize: 20000000,               // default is 10MB
            acceptFileTypes: /(\.|\/)(jpe?g|png)$/i
        });
        $('.cloudinary-fileupload').bind('fileuploadprogressall', function(e, data) {
            $scope.imageProgress = Math.round((data.loaded * 100.0) / data.total);
            $scope.$apply();
        });
    }

});