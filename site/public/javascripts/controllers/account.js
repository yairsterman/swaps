var acc = null;
swapsApp.controller('accountController', function($scope, $rootScope, $routeParams, $route, $window, $interval, $timeout, $document, $location, $uibModal, alertify, AccountService, MessageService, UsersService, $sce) {
    acc = $scope;
    $scope.activeTab = $routeParams.tab;
    $scope.messageId = $routeParams.id;
    $rootScope.homepage = false;
    $rootScope.searchPage = false;
    $scope.editing = false;
    $scope.send = {message : ''};
    $scope.swap = {};
    $scope.showSwapsTab = 'set';
    $scope.numOfFiles = 0;
    $scope.edit = {};

    $scope.messagePage = 1;
    $scope.messagePageStart = 0;
    $scope.messagePageSize = 8;
    $scope.messagePageEnd = 8;

    $scope.select = {};
    $scope.passwords = {};

    const DAY = 1000*60*60*24;
    $scope.day = DAY;

    const SUCCESS = 'Changes saved successfully';

    $scope.dragAnimation = $window.localStorage.getItem('dragAnimation');

    $('.fb-messenger-icon').addClass('hide');

    $('input[name="datefilter"]').daterangepicker({
          autoApply: true,
          opens: 'center'
      });

    var autocomplete;
    var address = {
      types: ['address']
    };


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
        $('.fb-messenger-icon').removeClass('hide');
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
        });
    }

    $scope.changePassword = function(form){
        $scope.error = false;
        $scope.success = false;
        if(form.$invalid){
            if(form.current.$invalid){
                $scope.currentInvalid = true;
            }
            if(form.new.$invalid){
                $scope.newInvalid = true;
            }
            if(form.confirm.$invalid){
                $scope.confirmInvalid = true;
            }
            $scope.error = 'Invalid fields';
            return;
        }
        if($scope.passwords.new !== $scope.passwords.confirm){
            $scope.error = "Passwords don't match";
            return;
        }
        $scope.saving = true;
        AccountService.changePassword($scope.passwords).then(function(data){
            $scope.user = data;
            $scope.passwords = {};
            $scope.error = false;
            updateUser();
            $scope.success = true;
        },function(err){
            $scope.error = err;
        })
        .finally(function(){
            $scope.saving = false;
        });
    }

    $scope.cancelRequest = function(requestInfo){
        var decline = requestInfo.status == 0 && requestInfo.user1;
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
            $scope.user = $rootScope.user;
            $scope.confirmation = false;
            scrollMessagesToTop();
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
			$scope.user = result;
            setPhotoGalery();
		},function(err){
            showAlert('Failed to upload photo, please try again later', true);
        })
        .finally(function(){
            $scope.numOfFiles--;
            if($scope.numOfFiles === 0){//uploaded all photos
                updateUser();
                showAlert('Photos Uploaded Successfully', false);
                $scope.saving = false;
                $scope.imageProgress = 0;
            }
        });
	}

	function uploadFail(err, data){
        $scope.numOfFiles--;
        if($scope.numOfFiles === 0){//uploaded all photos
            $scope.saving = false;
            $scope.imageProgress = 0;
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
        $('.cloudinary-fileupload').bind('fileuploadprogressall', function(e, data) {
            $scope.imageProgress = Math.round((data.loaded * 100.0) / data.total) / $scope.numOfFiles;
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
	
    function uploadPhotos(){
      console.log("change");
      console.log($("#my_file")[0].files.length);
      console.log(8 - $scope.user.photos.length);
       if($("#my_file")[0].files.length > 8 - $scope.user.photos.length); {
          alert("You can only have 8 images");
       }
    }

    // $scope.showDragAnimation = function(){
    //     if($scope.user.photos.length > 1){
    //         $window.localStorage.setItem('dragAnimation',true);
    //
    //         $timeout(function(){
    //             $scope.dragAnimation = true;
    //         }, 3500);
    //     }
    // }

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

    $scope.goToMessages = function(id){
        $location.path('account/messages/'+id);
    }

    $scope.openConversation = function(conversation){
        $scope.conversationIsOpen = true;
        var id = conversation.id;
        $scope.loading = true;
        UsersService.getProfile(id).then(function(data){
            $scope.profile = data;
            $scope.currentConversation = null;
            $scope.currentConversationId = id;
            $scope.currentConversation = conversation;
            $scope.send.message = '';
            $scope.currentConversationRequest = $scope.getRequest($scope.currentConversationId);
            $scope.requestSentByMe = $scope.currentConversationRequest?!!$scope.currentConversationRequest.user2:false;
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
        },function(){
            $scope.conversationIsOpen = false;
        }).finally(function(){
            $scope.loading = false;
        });
    };

    $scope.findMessage = function(id){
        var foundMessage = null;
        $scope.user.messages.every(function(message){
            if(message.id == id){
                foundMessage = message;
                return false;
            }
            return true;
        });
        return foundMessage;
    }

    $scope.closeMessage = function(){
        $scope.conversationIsOpen = false;
        $location.path('account/messages');
    }

    $scope.sendMessage = function(){
        var message = $scope.send.message;
        $scope.send.message = '';
        MessageService.sendMessage($scope.user, $scope.currentConversationId, message).then(function(data){
            if(!data.error){
                $rootScope.user = data.data;
                $scope.user = $rootScope.user;
                $scope.currentConversation = $scope.findMessage($scope.currentConversationId);
                scrollMessagesToTop();
            }
        });
    }

    $scope.setSwap = function(id){
        if($scope.saving ){
           return;
        }
        $scope.saving = true;
        $scope.swap = {};
        $scope.requestComplete = false;
        $scope.modelInstance = $uibModal.open({
            animation: true,
            templateUrl: '../../directives/request/request.html',
            size: 'sm',
            windowClass: 'request-modal',
            controller: 'requestController',
            scope: $scope
        });
        $scope.modelInstance.closed.then(function(){
            $scope.saving = false;
        },function(){
            $scope.saving = false;
        });
    }

    $scope.proposeSwap = function(){
        $scope.requestComplete = false;
        MessageService.sendRequest($scope.profile._id, $scope.swap).then(function(data){
            $rootScope.user = data;
            $scope.user = $rootScope.user;
            $scope.requestComplete = true;
            $scope.requestSent = true;
            $scope.processing = false;
            scrollMessagesToTop();
            updateUser();
            $timeout(function(){
                $scope.modelInstance.close();
            },4000);
        },function(err){
            $scope.requestComplete = true;
            $scope.processing = false;
            $scope.completeText = 'Request Failed';
            $scope.requestError = err.message;
        })
    }

    $scope.$on('auth-return', function(event, args) {
        $scope.user = $rootScope.user;
        $scope.edit = angular.copy($scope.user);
        $scope.apptInfo = $scope.edit.apptInfo ? $scope.edit.apptInfo : {};
        init();
    });

    $scope.$watchCollection('images', function(newVal ,oldVal){
        if(!$scope.saving && oldVal && newVal && oldVal !== newVal){
            var oldVal = oldVal.map(function(image){
                return image.url;
            });
            var newVal = newVal.map(function(image){
                return image.url;
            });
            if(oldVal != newVal){
                $scope.saving = true;
                var photos = $scope.images.map(function(image){
                    return image.url;
                });
                AccountService.reorderPhotos(photos).then(function(data){
                    $rootScope.user = data;
                    $scope.user = $rootScope.user;
                    updateUser();
                })
            }
        }
    });

    function setPhotoGalery(){
      $scope.images = [];
      for(var i =0; i < $scope.user.photos.length; i++){
        $scope.images.push({id:i, url:$scope.user.photos[i], deletable: true});
      }
    }

    $scope.confirmRequest = function(event ,id){
        event.stopPropagation();
        if($scope.saving){
            return;
        }
        $scope.saving = true;
        var request = $scope.getRequest(id);
        if(!request){
            showAlert('Could not get request', true);
            return;
        }
        $scope.swap.from = request.checkin;
        $scope.swap.to = request.checkout;
        $scope.request = request;
        $scope.requestId = request._id;
        $scope.chooseDates = false;
        $scope.confirmation = true;
        $scope.modelInstance = $uibModal.open({
            animation: true,
            templateUrl: '../../directives/request/request.html',
            size: 'sm',
            windowClass: 'request-modal',
            controller: 'requestController',
            scope: $scope
        });
        $scope.modelInstance.closed.then(function(){
            $scope.user = $rootScope.user;
            updateUser();
        },function(){
            $scope.saving = false;
        });
    }

    $scope.requestStatus = function(id){
        if(!$scope.requests){
            return -1;
        }
        var requests = $scope.requests.filter(function(request){
            if(request.user1){ //user was the request recipient
                return request.user1._id == id;
            }
            else{ //user was the request sender
                return request.user2._id == id;
            }
        });
        if(requests[0]){
            return requests[0].status;
        }
        return -1;
    };

    $scope.getRequest = function(id){
        if(!$scope.requests){
            return null;
        }
        var requests = $scope.requests.filter(function(request){
            if(request.user1){ //user was the request recipient
                return request.user1._id == id;
            }
            else{ //user was the request sender
                return request.user2._id == id;
            }
        });
        if(requests[0]){
            return requests[0];
        }
        return null;
    };

    $scope.approveRequest = function(event, id){
        event.stopPropagation();
        if($scope.saving){
            return;
        }
        $scope.saving = true;
        var request = $scope.getRequest(id);
        if(!request){
            showAlert('Could not get request', true);
            return;
        }
        $scope.swap.from = request.proposition.checkin;
        $scope.swap.to = request.proposition.checkout;
        $scope.saving = false;
        $scope.requestId = request._id;
        $scope.chooseDates = true;
        $scope.accepting = request;
        $scope.modelInstance = $uibModal.open({
            animation: true,
            templateUrl: '../../directives/request/request.html',
            size: 'sm',
            windowClass: 'request-modal',
            controller: 'requestController',
            scope: $scope
        });
        $scope.modelInstance.closed.then(function(){
            $scope.user = $rootScope.user;
            scrollMessagesToTop();
            updateUser();
        },function(){
            $scope.saving = false;
        });
    }

    $scope.getCreditsAmount = function(request){
        var paymentPerNight = request.user1?request.oneWay?0:$scope.data.roomType[request.roomType1].cost:$scope.data.roomType[request.roomType2].cost;
        var gainPerNight = request.user1?$scope.data.roomType[request.roomType2].gain:request.oneWay?0:$scope.data.roomType[request.roomType1].gain;
        var totalPayment = (paymentPerNight - gainPerNight) * request.nights;
        var res = {};
        res.totalPayment = Math.abs(totalPayment);
        res.gained = totalPayment < 0;
        res.notCharged = totalPayment == 0;
        return res;
    };``

    $scope.getPage = function(page){
        $scope.messagePageStart = (page - 1) * $scope.messagePageSize;
        // $scope.messagePage = page;
        $scope.messagePageEnd = ($scope.messagePageSize * page);
    }

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
        $scope.focusPlan=false;
        $scope.edit = angular.copy($scope.user);
        $scope.requests = $scope.user.requests;
        $scope.messagesLength = $scope.user.messages.length;
        $scope.apptInfo = $scope.edit.apptInfo ? $scope.edit.apptInfo : {};
        if($scope.currentConversationId){
            $scope.currentConversation = $scope.findMessage($scope.currentConversationId);
            $scope.currentConversationRequest = $scope.getRequest($scope.currentConversationId);
            $scope.requestSentByMe = $scope.currentConversationRequest?!!$scope.currentConversationRequest.user2:false;
            $scope.currentConversationStatus = $scope.currentConversationRequest?$scope.currentConversationRequest.status:-1;
        }
    }

    function showAlert(msg, error){
        if(!error){
            alertify.success(msg);
        }
        else{
            alertify.error(msg);
        }
    }

    $scope.orderByDate = function(conversation){
        return -(conversation.messages[conversation.messages.length -1].date);
    }

    function init(){
        updateUser();
        setPhotoGalery();
        if($scope.activeTab == 'listing' && $routeParams.plan){
            var plan = parseInt($routeParams.plan);
            $scope.edit.deposit = plan;
            $scope.focusPlan = true;
        }
        if($scope.activeTab == 'listing' && !$rootScope.isMobile && $scope.user.photos.length > 1){
            $timeout(function(){
                $window.localStorage.setItem('dragAnimation',true);
                $scope.dragAnimation = true;
            }, 5500);
        }
        if($scope.activeTab == 'messages' && $scope.messageId){
            var message = $scope.findMessage($scope.messageId);
            $scope.openConversation(message);
        }
    }

    if($rootScope.user && $rootScope.user._id) {
        $scope.user = $rootScope.user;
        init();
    }
    else{
        AccountService.getUser().then(function(user){
            $scope.user = user;
            init();
        }, function(){
            if(!($rootScope.user && $rootScope.user._id)){
                $scope.openLogin();
                $location.url('/');
            }
        });
    }

});
