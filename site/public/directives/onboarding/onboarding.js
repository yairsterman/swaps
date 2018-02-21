swapsApp.controller('onboardingController', function($scope, $rootScope, $location, AccountService, alertify) {
    $scope.user = $rootScope.user;
    $scope.phase = !$scope.user.apptInfo.title || $scope.user.apptInfo.title == '' ||  !$scope.user.address ||  $scope.user.address == ''?'home':'photos';
    $scope.numOfFiles = 0;
    $scope.close = function(){
        $scope.$dismiss();
    }

    $scope.next = function(){
        saveChanges();
        if($scope.phase == 'home'){
            $scope.phase = 'basic';
            return;
        }
        if($scope.phase == 'basic'){
            $scope.phase = 'photos';
            return;
        }
    }

    $scope.back = function(){
        if($scope.phase == 'basic'){
            $scope.phase = 'home';
            return;
        }
        if($scope.phase == 'photos'){
            $scope.phase = 'basic';
            return;
        }
    }

    function add_uploadButton(e, data){
        if(data.files[0].type.indexOf('image') === -1){
            showAlert('Wrong file type, only images are allowed', true);
            return;
        }
        $scope.saving = true;
        AccountService.getUploadToken().then(function( token ) {
            $scope.numOfFiles++;
            data.formData = token;
            data.submit();
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
        $('input.cloudinary-fileupload[type=file]').fileupload({
            add: add_uploadButton,
            change: change_uploadbutton,
            done: fileuploaddone_uploadbutton,
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
        AccountService.editListing($scope.user).then(function(data){
            $rootScope.user = data;
            $scope.user = $rootScope.user;
        },function(err){
            showAlert('Error saving changes', true);
        });
    }

    $scope.go = function(path){
        $location.url('/' + path);
        $scope.$dismiss();
    }

});
