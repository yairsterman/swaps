var acc = null;
swapsApp.controller('accountController', function($scope, $rootScope, $routeParams, $interval, $timeout, $document, $location, AccountService, MessageService) {
    acc = $scope;
    $scope.activeTab = $routeParams.tab;
    $scope.homepage = false;
    $scope.editing = false;
    $scope.send = {message : ''};
    $scope.swap = {};
    $scope.showSwapsTab = 'set';

    $scope.select = {};

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
        if($scope.activeTab == 'listing'){
            var elementsReady = $interval(function() {
                var input = $document[0].getElementById('address');
                if (input && $scope.edit) {
                    autocomplete = new google.maps.places.Autocomplete($document[0].getElementById('address'), {types: ['address']});
                    autocomplete.addListener('place_changed', function() {
                        $scope.edit.address = autocomplete.getPlace().formatted_address;
                        $scope.$apply();
                    });
                    $interval.cancel(elementsReady);
                }
            }, 100);
        }
    });

    $scope.go = function(path){
     	$location.url('/' + path);
   	}

   	$scope.saveChanges = function(){
        $scope.saving = true;
     	AccountService.editProfile($scope.edit).then(function(data){
     		if(data.data.error){
     			console.log("error");
                $scope.saving = true;
     		}
     		else{
                $scope.user = data.data;
                updateUser();
     		}
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
            if(!data || (data && data.error)){
                console.log("error");
                $scope.saving = false;
            }
            else{
                $scope.user = data.data;
                updateUser();
            }
        });
    }

    $scope.cancelRequest = function(requestInfo){
        $scope.saving = true;
        MessageService.cancelRequest(requestInfo.userId, requestInfo.departure, requestInfo.returnDate).then(function(data){
            if(!data || (data && data.error)){
                console.log("error");
            }
            else{
                updateUser();
            }
        });
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
      var obj = {url: img.url, id: $scope.user._id};
      AccountService.deletePhoto(obj).then(function(data){
        if(data.error){
          console.log("error");
        }
        else{
          $scope.edit = data.data;
          cb();
        }
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
        scrollMessagesToTop();
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
        $scope.currentMessager = message;
        // $('#requestModal').modal('show');
        $('#paymentModal').modal('show');
        $('input[name="datefilter"]').daterangepicker({
            autoApply: true,
            opens: 'center',
            minDate: "05/08/2017",
            maxDate: "05/14/2017",
            startDate: "05/08/2017",
            endDate: "05/14/2017"
        });
    }
    $scope.sendRequest = function(){
        var request = '##!REQUEST!##';
        var dates = $scope.swap.dates
        console.log($scope.swap.dates);
        $scope.swap.dates = null;
        // var user = {_id:"58f7324594b427e59aec391b",image:"http://localhost:3000/images/static/profile5.jpg",firstName:"Marisha",lastName:"Natarajan"};
        MessageService.sendRequest($scope.user, $scope.currentConversationId, request, dates).then(function(data){
            $rootScope.user = data.data;
            $scope.user = $rootScope.user;
            scrollMessagesToTop();
        });
    };

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
        MessageService.confirmRequest(requestInfo.userId, requestInfo.departure, requestInfo.returnDate).then(function(data){
            if(data.data.error){
                console.log("error");
                $scope.saving = true;
            }
            else{
                $scope.user = data.data;
                updateUser();
            }
        }
        ,function(err){
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

    function scrollMessagesToTop(){
        $('.message-area').css({transform: "translate(0)"});
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
        AccountService.getRequests().then(function(requests){
            $scope.requests = requests;
            $scope.requests.forEach(function(value){
                value.requestInfo = $scope.getRequest(value._id);
            });
        });
    }



    $scope.likedHomes = null;

    $scope.getFavorites = function() {
        if ($scope.likedHomes != null)
            return $scope.likedHomes;

        AccountService.getFavorites().then(function(data) {
            $scope.likedHomes = data.favorites;
            return data.favorites;
        });
    };


    // $scope.getFavorites();

    $scope.homesILikeClick = function() {
        $scope.likedHomes = $scope.getFavorites();
        console.log($scope.likedHomes);
        $scope.go('account/homes-i-like');
    }

});
