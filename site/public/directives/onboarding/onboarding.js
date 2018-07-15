swapsApp.controller('onboardingController', function($scope, $rootScope, $location, $sce,AccountService, alertify) {
    $scope.user = $rootScope.user;
    $scope.numOfFiles = 0;
    $scope.community = {};

    if(Object.keys($location.search()).length == 0) {
        $scope.absUrl = $location.path()+ '?';
    }
    else{
        $scope.absUrl = $location.absUrl() + '&';
    }

    $scope.getInitialPhase = function(){
        var initialPhase = 'onSignup';
        $scope.phase = 'onSignup';
        if($scope.isPhaseComplete() == 0){
            return;
        }
        //find the first phase that is not fully complete
        $scope.phase = 'photos';
        $scope.fillCircle();
        if($scope.isPhaseComplete() < 3){
            initialPhase = 'photos';
        }
        $scope.phase = 'basic';
        $scope.fillCircle();
        if($scope.isPhaseComplete() < 3){
            initialPhase = 'basic';
        }
        // $scope.phase = 'home';
        // $scope.fillCircle();
        // if($scope.isPhaseComplete() < 3){
        //     $scope.user.apptInfo.amenities = $scope.user.apptInfo.amenities.length>0?$scope.user.apptInfo.amenities:[0,1,4];
        //     initialPhase = 'home';
        // }
        $scope.phase = 'about';
        $scope.fillCircle();
        if($scope.isPhaseComplete() < 3){
            $scope.user.apptInfo.amenities = $scope.user.apptInfo.amenities.length>0?$scope.user.apptInfo.amenities:[0,1,4];
            initialPhase = 'about';
        }
        $scope.phase = initialPhase;
        $location.search('phase',initialPhase);
        getInitialFocus();
    }

    $scope.closeModel = function(){
        if($rootScope.externalLogin){
            $rootScope.externalLogin = false;
            $location.url('/travelers');
        }
        $scope.$dismiss();
    }

    $scope.sendCommunityCode = function(){
        if($scope.community.code && $scope.community.code != ''){
            AccountService.setCommunity($scope.community.code).then(function(data){
                $rootScope.user = data;
                $scope.user = $rootScope.user;
                $scope.next();
            },function(err){
                alertify.error(err);
            })
        }
        else{
            alertify.error('You must enter a valid code');
        }
    }

    $scope.next = function(){
        if($scope.phase == 'onSignup'){
            $scope.phase = 'about';
            $location.search('phase',$scope.phase);
            return;
        }
        saveChanges();
        $scope.fillCircle();
        if($rootScope.profileComplete()){
            $scope.finish();
        }
        if($scope.phase == 'about'){
            $scope.user.apptInfo.amenities = $scope.user.apptInfo.amenities.length>0?$scope.user.apptInfo.amenities:[0,1,4];
            $scope.phase = 'basic';
            $location.search('phase',$scope.phase);
            return;
        }
        // if($scope.phase == 'home'){
        //     $scope.user.apptInfo.amenities = $scope.user.apptInfo.amenities.length>0?$scope.user.apptInfo.amenities:[0,1,4];
        //     $scope.phase = 'basic';
        //     return;
        // }
        if($scope.phase == 'basic'){
            $scope.phase = 'photos';
            $location.search('phase',$scope.phase);
            return;
        }
    }

    $scope.back = function(){
        // if($scope.phase == 'home'){
        //     $scope.phase = 'about';
        //     return;
        // }
        if($scope.phase == 'basic'){
            $scope.phase = 'about';
            return;
        }
        if($scope.phase == 'photos'){
            $scope.phase = 'basic';
            return;
        }
        if($scope.phase == 'completedOnboarding'){
            $scope.getInitialPhase();
            return;
        }
    }

    $scope.finish = function(){
        $scope.fillCircle();
        $scope.phase = 'completedOnboarding' ;
        $location.search('phase','done');
        if($rootScope.profileComplete()){
            $location.search('phase','complete');
            $scope.noBack = true;
        }
    }

    $scope.fillCircle = function(){
        var complete = 0;
        if($scope.phase == 'about'){
            complete = $scope.isPhaseComplete();
            $scope.aboutCircle = getFill(complete);
        }
        // if($scope.phase == 'home'){
        //     complete = $scope.isPhaseComplete();
        //     $scope.homeCircle = getFill(complete);
        // }
        if($scope.phase == 'basic'){
            complete = $scope.isPhaseComplete();
            $scope.basicCircle = getFill(complete);
        }
        if($scope.phase == 'photos'){
            complete = $scope.isPhaseComplete();
            $scope.photosCircle = getFill(complete);
        }
    };

    function getFill(complete){
        return complete == 1?'first':complete==2?'second':complete>=3?'done':'';
    }

    function getInitialFocus(){
        if($scope.phase == 'about'){
            $scope.user.address && $scope.user.address != ''?$scope.user.apptInfo.title && $scope.user.apptInfo.title != ''?$scope.user.apptInfo.about && $scope.user.apptInfo.about?$scope.isInFocus = 'about':$scope.isInFocus = 'title':$scope.isInFocus = false: null;
        }
        // if($scope.phase == 'home'){
        //     $scope.user.occupation && $scope.user.occupation != ''?$scope.user.aboutMe && $scope.user.aboutMe != ''?$scope.isInFocus = 'aboutMe':$scope.isInFocus = false: null;
        // }
    }

    // returns how much of the phase is complete 1,2, or 3
    $scope.isPhaseComplete = function(){
        var complete = 0;
        if($scope.phase == 'onSignup'){
            if(!$scope.user.occupation && !$scope.user.aboutMe
                && !$scope.user.address && !$scope.user.apptInfo.title
                && $scope.user.photos.length == 0 && $scope.user.apptInfo.amenities.length == 0)
                return 0;
            else return 1;
        }
        if($scope.phase == 'about'){
            $scope.user.address && $scope.user.address != ''?complete++:null;
            $scope.user.apptInfo.title && $scope.user.apptInfo.title != ''?complete++:null;
            complete++
            // $scope.user.occupation && $scope.user.occupation != ''?complete++:null;
            // $scope.user.aboutMe && $scope.user.aboutMe != ''?complete=complete+2:null;
        }
       //  if($scope.phase == 'home'){
       //      $scope.user.address && $scope.user.address != ''?complete++:null;
       //      $scope.user.apptInfo.title && $scope.user.apptInfo.title != ''?complete++:null;
       //      $scope.user.apptInfo.about && $scope.user.apptInfo.about != ''?complete++:null;
       // }
        if($scope.phase == 'basic'){
            complete = $scope.user.apptInfo.amenities.length > 0?3:2;
        }
        if($scope.phase == 'photos'){
            complete = $scope.user.photos.length > 0?3:0;
        }
        return complete;
    };

    $scope.getInitialPhase();
    $scope.fillCircle();

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
                $scope.fillCircle();
                $scope.saving = false;
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
        $('input.cloudinary-fileupload[name=file]').fileupload({
            add: add_uploadButton,
            change: change_uploadbutton,
            done: fileuploaddone_uploadbutton,
            fail: uploadFail,
            maxFileSize: 20000000,                        // 20MB is an example value
            loadImageMaxFileSize: 20000000,               // default is 10MB
            acceptFileTypes: /(\.|\/)(jpe?g|png)$/i
        });
        // $('input.cloudinary-fileupload[type=file]').bind('fileuploaddone', fileuploaddone_uploadbutton);
        // $('input.cloudinary-fileupload[type=file]').bind('fileuploadfail', uploadFail);cloudinaryprogressall
        $('.cloudinary-fileupload').bind('fileuploadprogressall', function(e, data) {
            $scope.imageProgress = Math.round((data.loaded * 100.0) / data.total);
            $scope.$apply();
        });
    }

    function add_profileUploadButton(e, data){
        if(data.files[0].type.indexOf('image') === -1){
            showAlert('Wrong file type, only images are allowed', true);
            return;
        }
        $scope.saving = true;
        AccountService.getProfileUploadToken().then(function( token ) {
            $scope.numOfFiles++;
            data.formData = token;
            data.paramName = 'file';
            data.submit();
        },function(){
            $scope.saving = false;
        });
    }

    function doneUploadingProfilePhoto(e, data){
        AccountService.profileUploadCompleted({url: data.result.url, public_id: data.result.public_id}).then(function( result ) {
            $rootScope.user = result;
            $scope.user = $rootScope.user;
        },function(err){
            showAlert('Failed to upload photo, please try again later', true);
        })
        .finally(function(){
            $scope.numOfFiles--;
            if($scope.numOfFiles === 0){//uploaded all photos
                showAlert('Photo Uploaded Successfully', false);
                $scope.saving = false;
            }
        });
    }

    $scope.initUploadProfileButton =function(){

        $.cloudinary.config({ cloud_name: 'swaps', secure: true});
        $('input.cloudinary-fileupload[name=profile]').fileupload({
            add: add_profileUploadButton,
            done: doneUploadingProfilePhoto,
            fail: uploadFail,
            maxFileSize: 20000000,                        // 20MB is an example value
            loadImageMaxFileSize: 20000000,               // default is 10MB
            acceptFileTypes: /(\.|\/)(jpe?g|png)$/i
        });
        // $('input.cloudinary-fileupload[type=file]').bind('fileuploaddone', fileuploaddone_uploadbutton);
        // $('input.cloudinary-fileupload[type=file]').bind('fileuploadfail', uploadFail);

    }

    function showAlert(msg, error){
        if(!error){
            alertify.success(msg);
        }
        else{
            alertify.error(msg);
        }
    }

    function saveChanges(){
        if($scope.phase == 'about'){
            if($scope.user.apptInfo.title || $scope.user.address){
                saveListingChanges();
            }
            saveProfileChanges();
        }
        else{
            saveListingChanges();
        }
    }

    function saveListingChanges(){
        AccountService.editListing($scope.user).then(function(data){
            $rootScope.user = data;
            $scope.user = $rootScope.user;
        },function(err){
            showAlert('Error saving changes', true);
        });
    }

    function saveProfileChanges(){
        AccountService.editProfile($scope.user).then(function(data){
            $rootScope.user = data;
            $scope.user = $rootScope.user;
            $scope.user.apptInfo.amenities = $scope.user.apptInfo.amenities.length>0?$scope.user.apptInfo.amenities:[0,1,4];
        },function(err){
            showAlert('Error saving changes', true);
        });
    }

    $scope.go = function(path){
        $scope.closeModel();
        $location.url('/' + path);
    }

    if($scope.user.occupation){
        $scope.isInFocus = 'aboutMe';
    }
    if($scope.user.occupation && $scope.user.aboutMe && $scope.user.address){
        if($scope.user.apptInfo.title){
            $scope.isInFocus = 'aboutMyHome';
        }
        else{
            $scope.isInFocus = 'title';
        }
    }

    $scope.loseFocus = function(){
        $scope.isInFocus = false;
    }

});
