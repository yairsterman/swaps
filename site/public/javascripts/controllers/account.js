var acc = null;
swapsApp.controller('accountController', function($scope, $rootScope, $routeParams, $interval, $timeout, $document, $location, $uibModal, alertify, AccountService, MessageService, UsersService, $sce) {
    acc = $scope;
    $scope.activeTab = $routeParams.tab;
    $scope.homepage = false;
    $rootScope.searchPage = false;
    $scope.editing = false;
    $scope.send = {message : ''};
    $scope.swap = {};
    $scope.showSwapsTab = 'set';
    $scope.numOfFiles = 0;


    $scope.select = {};

    const SUCCESS = 'Changes saved successfully';

    if($rootScope.user && $rootScope.user._id) {
        init();
    }
    else{
        $timeout(function(){
            if(!($rootScope.user && $rootScope.user._id)){
                $location.url('/');
            }
        },1000);
    }

    $('input[name="datefilter"]').daterangepicker({
          autoApply: true,
          opens: 'center'
      });

    function init(){
        updateUser();
        setPhotoGalery();
    }

    var autocomplete;
    var address = {
      types: ['address']
    };

    var elementsReady = $interval(function() {
      if($scope.activeTab != 'edit'){
        $interval.cancel(elementsReady);
        return;
      }
      var input = $('input[name="birthday"]');
      if (input && $scope.edit) {
          $('input[name="birthday"]').daterangepicker({
              autoApply: true,
              opens: 'center',
              locale: {
                  format: 'MM/DD/YYYY'
              },
              singleDatePicker: true,
              showDropdowns: true,
              startDate: $scope.edit.birthday,

          });
          $('input[name="birthday"]').on('apply.daterangepicker', function(ev, picker) {
              $scope.edit.birthday = picker.startDate.format('MM/DD/YYYY');
          });
        $interval.cancel(elementsReady);
      }
    }, 100);

    $scope.$watch('activeTab', function(oldVal, newVal){
        // if($scope.activeTab == 'listing'){
        //     var elementsReady = $interval(function() {
        //         var input = $document[0].getElementById('address');
        //         if (input && $scope.edit) {
        //             autocomplete = new google.maps.places.Autocomplete(angular.element('#address')[0], {types: ['address']});
        //             autocomplete.addListener('place_changed', function() {
        //                 $scope.edit.address = autocomplete.getPlace().formatted_address;
        //                 $scope.$apply();
        //             });
        //             $interval.cancel(elementsReady);
        //         }
        //     }, 100);
        // }
        if($scope.activeTab == 'homes-i-like'){
            AccountService.getFavorites().then(function(data) {
                $scope.likedHomes = data;
            },function(err){
                showAlert(err, true);
            });
        }
    });

    $scope.go = function(path){
     	$location.url('/' + path);
   	}

   	$scope.saveChanges = function(){
        $scope.saving = true;
     	AccountService.editProfile($scope.edit).then(function(data){
            $scope.user = data;
            updateUser();
            showAlert(SUCCESS, false);
     	},function(err){
            showAlert('Error saving changes', true);
        })
        .finally(function(){
            $scope.saving = false;
        });
   	}

   	$scope.cancel = function(){
        $scope.editing = false;
     	$scope.edit = angular.copy($scope.user);
        $scope.apptInfo = $scope.edit.apptInfo?$scope.edit.apptInfo:{};
   	}

    $scope.editlisting = function(){
        $scope.saving = true;
        AccountService.editListing($scope.edit).then(function(data){
            $scope.user = data;
            updateUser();
            showAlert(SUCCESS, false);
        },function(err){
            showAlert('Error saving changes', true);
        })
        .finally(function(){
            $scope.saving = false;
        });;
    }

    $scope.cancelRequest = function(requestInfo){
        var decline = requestInfo.status == 0 && requestInfo.sentBy != $scope.user._id
        $scope.saving = true;
        $scope.modelInstance = $uibModal.open({
            animation: true,
            templateUrl: '../../directives/cancelSwap/cancel.html',
            size: 'sm',
            controller: 'cancelController',
            resolve: {
                decline: function () {
                    return decline;
                },
                requestInfo: function () {
                    return requestInfo;
                }
            },
            scope:$scope
        })
        $scope.modelInstance.closed.then(function(){
            updateUser();
        },function(){
            $scope.saving = false;
        });
    }
	
	function add_uploadButton(e, data){
        if(data.files[0].type.indexOf('image') === -1){
            showAlert('Wrong file type, only images are allowed', true);
            return;
        }
        console.log("add_uploadButton");
        $scope.saving = true;
		AccountService.getUploadToken().then(function( token ) {
            $scope.numOfFiles++;
            console.log("add_uploadButton $scope.numOfFiles: " + $scope.numOfFiles);
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
        console.log("calling  uploadCompleted");
		AccountService.uploadCompleted({url: data.result.url, public_id: data.result.public_id}).then(function( result ) {
			$scope.user = result;
            console.log("calling  uploadCompleted success");
            setPhotoGalery();
		},function(err){
            console.log("calling  uploadCompleted fail " +err);
            showAlert('Failed to upload photo, please try again later', true);
        })
        .finally(function(){
            $scope.numOfFiles--;
            console.log("$scope.numOfFiles: " +$scope.numOfFiles);
            if($scope.numOfFiles === 0){//uploaded all photos
                updateUser();
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
	
    function uploadPhotos(){
      console.log("change");
      console.log($("#my_file")[0].files.length);
      console.log(8 - $scope.user.photos.length);
       if($("#my_file")[0].files.length > 8 - $scope.user.photos.length); {
          alert("You can only have 8 images");
       }
    }

    $scope.deletePhoto = function(img, cb){
        if($scope.saving){
            return;
        }
        $scope.saving = true;
      var obj = {url: img.url, id: $scope.user._id};
      AccountService.deletePhoto(obj).then(function(data){
          $rootScope.user = data;
          $scope.user = $rootScope.user;
          $scope.saving = false;
          updateUser();
          showAlert('Photo Deleted', false);
          cb();
      },function(err){
          $scope.saving = false;
          showAlert('Error deleting photos', true);
      });
    }

    $scope.galeryClosed = function(){
      $rootScope.user = $scope.edit;
      $scope.user = $rootScope.user;
      setPhotoGalery();
    }

    $scope.openConversation = function(chat, $index){
        $scope.currentConversation = null;
        $scope.currentConversation = chat;
        $scope.currentConversationId = chat.id;
        $scope.conversationIsOpen = true;
        $scope.send.message = '';
        $scope.messageIndex = $index;
        $scope.currentConversationRequest = $scope.getRequest($scope.currentConversationId);
        $scope.requestSentByMe = $scope.currentConversationRequest?$scope.currentConversationRequest.sentBy == $scope.user._id:false;
        $scope.currentConversationStatus = $scope.currentConversationRequest?$scope.currentConversationRequest.status:-1;
        if(!$scope.currentConversation.read){
            MessageService.readMessage($scope.user, $scope.currentConversationId).then(function(data){
                if(!data.error){
                    $scope.currentConversation.read = true;
                    scrollMessagesToTop();
                }
            });
        }
        $scope.messageOpened = true;
        scrollMessagesToTop();
    }

    $scope.closeMessage = function(){
        $scope.messageOpened = false;
    }

    $scope.sendMessage = function(){
        var message = $scope.send.message;
        $scope.send.message = '';
        // var user = {_id:"590adf696da18fbca10e82be",image:"http://localhost:3000/images/static/profile3.jpg",firstName:"Wan Ung",lastName:"Kuen"};
        MessageService.sendMessage($scope.user, $scope.currentConversationId, message).then(function(data){
            if(!data.error){
                $rootScope.user = data.data;
                $scope.user = $rootScope.user;
                $scope.currentConversation.messages.push({message:message,id:$scope.user._id});
                scrollMessagesToTop();
            }
        });
    }

    $scope.setSwap = function(message){
        $scope.saving = true;
        UsersService.getProfile(message.id).then(function(data){
            $scope.profile = data.data;
            $scope.chooseDates = true;
            $scope.modelInstance = $uibModal.open({
                animation: true,
                templateUrl: '../../directives/request/request.html',
                size: 'sm',
                controller: 'requestController',
                scope: $scope
            });
            $scope.modelInstance.closed.then(function(){
                $scope.user = $rootScope.user;
                updateUser();
            },function(){
                $scope.saving = false;
            });
        })
    }

    $scope.$on('auth-return', function(event, args) {
        $scope.user = $rootScope.user;
        $scope.edit = angular.copy($scope.user);
        $scope.apptInfo = $scope.edit.apptInfo ? $scope.edit.apptInfo : {};
        init();
    });

    function setPhotoGalery(){
      $scope.images = [];
      for(var i =0; i < $scope.user.photos.length; i++){
        $scope.images.push({id:i, url:$scope.user.photos[i], deletable: true});
      }
    }

    $scope.confirmRequest = function(requestInfo){
        if($scope.saving){
            return;
        }
        $scope.saving = true;
        if(!requestInfo.userId){ //this means the confirm was sent from message
            requestInfo = $scope.getRequest(requestInfo.id);
            if(!requestInfo){
                $scope.saving = false;
                return;
            }
        }
        MessageService.confirmRequest(requestInfo.userId, requestInfo.departure, requestInfo.returnDate).then(function(data){
            $scope.user = data;
            updateUser();
        }
        ,function(err){
            showAlert(err, true);
            $scope.saving = false;
        });
    }

    $scope.requestIsPending = function(){
        for(i = 0; i < $scope.user.requests.length; i++){
            if($scope.user.requests[i].id == $scope.currentConversationId && $scope.user.requests[i].status == 0){
                return true;
            }
        }
        return false;
    }

    $scope.requestAwaitingConfirm = function(){
        for(i = 0; i < $scope.user.requests.length; i++){
            if($scope.user.requests[i].id == $scope.currentConversationId && $scope.user.requests[i].status == 1){
                return true;
            }
        }
        return false;
    };

    $scope.requestStatus = function(id){
        for(var i = 0; i < $scope.user.requests.length; i++){
            var request = $scope.user.requests[i];
            if(request.userId == id){
                return request.status;
            }
        }
        return -1;
    };

    $scope.getRequest = function(id){
        for(var i = 0; i < $scope.user.requests.length; i++){
            var request = $scope.user.requests[i];
            if(request.userId == id){
                return request;
            }
        }
        return null;
    };

    $scope.trustAsHtml = function(html) {
        return $sce.trustAsHtml(html);
    }

    function scrollMessagesToTop(){
        $timeout(function(){
            var objDiv = $('.conversation-messages');
            var scrollHeight = objDiv[0].scrollHeight;
            objDiv.animate({
                scrollTop: scrollHeight
            }, 300, function() {});
        }, 700);
    }

    function updateUser(){
        $rootScope.user = $scope.user;
        $scope.saving = false;
        $scope.edit = angular.copy($scope.user);
        $scope.apptInfo = $scope.edit.apptInfo ? $scope.edit.apptInfo : {};
        if($scope.currentConversationId){
            $scope.currentConversationRequest = $scope.getRequest($scope.currentConversationId);
            $scope.requestSentByMe = $scope.currentConversationRequest?$scope.currentConversationRequest.sentBy == $scope.user._id:false;
            $scope.currentConversationStatus = $scope.currentConversationRequest?$scope.currentConversationRequest.status:-1;
        }
        AccountService.getRequests().then(function(requests){
            $scope.requests = requests;
            $scope.requests.forEach(function(value){
                value.requestInfo = $scope.getRequest(value._id);
            });
        },function(err){
            showAlert('Error getting requests', true);
        });
    }

    function showAlert(msg, error){
        if(!error){
            alertify.success(msg);
        }
        else{
            alertify.error(msg);
        }
    }

});
