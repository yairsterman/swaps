var acc = null;
swapsApp.controller('accountController', function($scope, $rootScope, $routeParams, $interval, $timeout, $document, $location, AccountService, MessageService) {
    acc = $scope;
    $scope.user = $rootScope.user;
    $scope.activeTab = $routeParams.tab;
    $scope.edit = angular.copy($scope.user);
    $scope.apptInfo = $scope.edit.apptInfo?$scope.edit.apptInfo:{};
    $scope.editing = false;
    $scope.send = {message : ''};
    $scope.swap = {};

    if(!$scope.user._id){
      $location.url('/');
    }

    $('input[name="datefilter"]').daterangepicker({
          autoApply: true,
          opens: 'center'
      });


    setPhotoGalery();

    var autocomplete;
    var address = {
      types: ['address']
    };

    var geocoder =  new google.maps.Geocoder();

    var elementsReady = $interval(function() {
      if($scope.activeTab != 'edit'){
        $interval.cancel(elementsReady);
      }
      var input = $document[0].getElementById('address');
      if (input) {
        autocomplete = new google.maps.places.Autocomplete($document[0].getElementById('address'), address);
        var found = false;
        autocomplete.addListener('place_changed', function() {
          $scope.edit.address = autocomplete.getPlace().formatted_address;
          var components = autocomplete.getPlace().address_components;
          for(var i = 0; i < components.length; i++){
            if(!found && (components[i].types[0] == 'locality' || components[i].types[0] == "administrative_area_level_1")){
              $scope.edit.city = components[i].long_name;
              found = true;
              continue;
            }
            if(components[i].types[0] == 'country'){
              $scope.edit.country = components[i].long_name;
              continue;
            }
          }
          $scope.$apply();
        });
        $interval.cancel(elementsReady);
      }
    }, 100);


    $scope.go = function(path){
     	$location.url('/' + path);
   	}

   	$scope.saveChanges = function(){
     	AccountService.editProfile($scope.edit).then(function(data){
     		if(data.error){
     			console.log("error");
     		}
     		else{
     			$scope.user = data.data;
                $rootScope.user = $scope.user;
                $scope.editing = false;
                $scope.edit = angular.copy($scope.user);
     		}
     	});
   	}

    $scope.editProfile = function(){
      $scope.editing = true;
    }

   	$scope.cancel = function(){
        $scope.editing = false;
     	$scope.edit = angular.copy($scope.user);
        $scope.apptInfo = $scope.edit.apptInfo?$scope.edit.apptInfo:{};
   	}

    $scope.editlisting = function(){
      var edit = $scope.user;
      edit.apptInfo = $scope.apptInfo;
      AccountService.editListing(edit).then(function(data){
        if(data.error){
          console.log("error");
        }
        else{
          $scope.user = data.data;
          $rootScope.user = $scope.user;
          $scope.editing = false;
          $scope.edit = angular.copy($scope.user);
          $scope.apptInfo = $scope.edit.apptInfo?$scope.edit.apptInfo:{};
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

    $scope.openConversation = function(id){
      $scope.currentConversation = id;
      $scope.conversationIsOpen = true;
      $scope.send.message = '';
      var objDiv = document.getElementById(id);
      $timeout(function(){
        objDiv.scrollTop = objDiv.scrollHeight;
      }, 700);
    }

    $scope.sendMessage = function(id){
      var message = $scope.send.message;
      $scope.send.message = '';
     // var user = {_id:"590adf696da18fbca10e82be",image:"http://localhost:3000/images/static/profile3.jpg",firstName:"Wan Ung",lastName:"Kuen"};
      MessageService.sendMessage($scope.user, id, message).then(function(data){
        $rootScope.user = data.data;
        $scope.user = $rootScope.user;
        var objDiv = document.getElementById(id);
        $timeout(function(){
          objDiv.scrollTop = objDiv.scrollHeight;
        }, 700);
    });
    //   $rootScope.user = $scope.message;

    }

    $scope.swap = function(message){
        $scope.currentMessager = message;
        $('#requestModal').modal('show');
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
        MessageService.sendRequest($scope.user, $scope.currentMessager.id, request, dates).then(function(data){
            $rootScope.user = data.data;
            $scope.user = $rootScope.user;
            var objDiv = document.getElementById($scope.currentMessager.id);
            $timeout(function(){
              objDiv.scrollTop = objDiv.scrollHeight;
            }, 700);
        });
    }

    function setPhotoGalery(){
      $scope.images = [];
      for(var i =0; i < $scope.user.photos.length; i++){
        $scope.images.push({id:i, url:$scope.user.photos[i], deletable: true});
      }
    }

    $scope.confirmRequest = function(id){
        MessageService.confirmRequest($scope.user, id).then(function(data){
            $rootScope.user = data.data;
            $scope.user = $rootScope.user;
        });
    }

    $scope.requestIsPending = function(id){
        for(i = 0; i < $scope.user.requests.length; i++){
            if($scope.user.requests[i].id == id && $scope.user.requests[i].status == 'Pending'){
                return true;
            }
        }
        return false;
    }

    $scope.requestAwaitingConfirm = function(id){
        for(i = 0; i < $scope.user.requests.length; i++){
            if($scope.user.requests[i].id == id && $scope.user.requests[i].status == 'Confirm'){
                return true;
            }
        }
        return false;
    }


});
