var pro = null;
swapsApp.controller('profileController', function($scope, $rootScope, $document, $routeParams, $window, $anchorScroll, $interval, MessageService, UsersService, $location, $uibModal, $timeout, $filter, AccountService) {
    pro = $scope;
    $scope.message = {};
    $scope.user = $rootScope.user;
    $scope.userCity = $rootScope.userCity;
    $rootScope.homepage = false;
    $scope.showMore = {
        aboutMe: {active:false},
        aboutHome: {active:false},
    }

    $scope.swap = {
        guests: 2,
        when:{}
    };
    $scope.canSendRequest = {};
    $scope.localeFormat = 'MMM DD';
    $scope.modelFormat = 'MM/DD/YYYY';

    $scope.mobileRequestOpen = false;

    $anchorScroll();

    $('.fb-messenger-icon').addClass('hide');

    $scope.go = function(path){
      $location.url('/' + path);
    }

    $scope.openRequest = function(){
        $scope.swap = {};
        $scope.modelInstance = $uibModal.open({
            animation: true,
            templateUrl: '../../directives/request/request.html',
            size: 'sm',
            windowClass: 'request-modal',
            controller: 'requestController',
            scope: $scope
        });
    }

    $scope.proposeSwap = function(){
        if($rootScope.user && $rootScope.user._id){
            MessageService.sendRequest($scope.profile._id, $scope.swap).then(function(){
                $scope.requestComplete = true;
                $scope.requestSent = true;
                $timeout(function(){
                    $scope.modelInstance.close();
                },4000);
            })
        }
        else{
            $scope.modelInstance.close();
            $scope.requestPending = true;
            var title = 'Log in so ' + $scope.profile.firstName + ' can see your proposal';
            $scope.openLogin(title);
        }
    }

    $scope.openLogin = function(title){
        $scope.title = title;
        $scope.modelInstance = $uibModal.open({
            animation: true,
            templateUrl: '../../directives/login/login.html',
            size: 'sm',
            controller: 'loginController',
            scope:$scope
        });
    }

    $scope.openMessage = function(){
        if(!$rootScope.user || !$rootScope.user._id){
            var title = 'You must log in to send message';
            $scope.openLogin(title);
        }
        else{
            $scope.modelInstance = $uibModal.open({
                animation: true,
                templateUrl: '../../pages/components/message.html',
                size: 'sm',
                controller: 'profileController',
                resolve: {
                    name: function () {
                        return $scope.profile.firstName;
                    }
                },
                scope:$scope
            });
        }
    }

    $scope.sendMessage = function(){
        if($scope.sending){
           return;
        }
        $scope.sending = true;
        var message = $scope.message.message;
        $scope.message.message = '';
        MessageService.sendMessage($rootScope.user, $scope.profile._id, message).then(function(data){
            $scope.messageSent = true;
            $rootScope.user = data.data;
            $scope.user = $rootScope.user;
            $scope.modelInstance.close();
        },function(){
            $scope.error = 'Message not sent';
        }).finally(function(){
            $scope.sending = false;
        });
    }

    function setPhotoGalery(){
      $scope.images = [];
      for(var i =0; i < $scope.profile.photos.length; i++){
        $scope.images.push({id:i, url:$scope.profile.photos[i], deletable: false});
      }
    }

    $scope.openGallery = function(){
      $scope.methods.open();
    };

    var fixmeTop;     // get initial position of the element

    $.fn.scrollBottom = function() {
        return $document.height() - this.scrollTop() - this.height();
    };

    function getAge(dateString) {
        var today = new Date();
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    if(!$rootScope.isMobile){
        $scope.mobileRequestOpen = true;
        var elementsReady = $interval(function() {
            // $('.circle-profile-pic').hide();
            var input = $('.fix-scroll');
            if (input && $scope.profile) {
                // fixmeTop = $('.fix-scroll').offset().top - 25;
                fixmeTop = $('.fix-scroll').offset().top + 20;
                var bottom = $(window).height() - fixmeTop - $('.fix-scroll').height();
                $(window).scroll(function() {                  // assign scroll event listener
                    var currentScroll = $(window).scrollBottom(); // get current position
                    if ($(this).scrollTop() >= fixmeTop ) {           // apply position: fixed if you
                        $('.profile-description').css({                      // scroll to that element or below it
                            position: 'fixed',
                            top: '0',
                            right: '0'
                        });
                    } else {                                    // apply position: static
                        $('.profile-description').css({                      // if you scroll above it
                            position: 'static'
                        });
                    }
                });
                $interval.cancel(elementsReady);
            }
        }, 100);
    }

    $scope.readMore = function(showMore, about) {
        showMore[about].active  = !showMore[about].active;
    };

    $scope.isCheckedAmenity = function(index){
        if($scope.profile && $scope.profile.apptInfo && $scope.profile.apptInfo.amenities){
            return $scope.profile.apptInfo.amenities.includes(index);
        }
        else{
            return false;
        }
    }

    $scope.$on('login-success', function(event, args) {
        $scope.user = $rootScope.user;
        setUserData();
        if($scope.requestPending){
            $scope.proposeSwap();
        }
    });

    $scope.$on('auth-return', function(event, args) {
        $scope.user = $rootScope.user;
        init();
    });

    $rootScope.$on('geolocation-complete', function(event, args) {
        if ($rootScope.userCity) {// reload datepicker when city is found
            $scope.userCity = $rootScope.userCity;
            $scope.ready = false;
            $timeout(function(){
                $scope.ready = true;
            },1000);
        }
    });

    $scope.isFavorite = function() {
        if($rootScope.user && $rootScope.user._id && $scope.profile && $scope.profile._id) {
            return $rootScope.user.favorites.includes($scope.profile._id);
        }
        return false;
    };

    $scope.addToFavorites = function() {
        if(!$rootScope.user._id){
            $scope.openLogin();
            return;
        }
        var favorite = $scope.profile._id;

        AccountService.addFavorite(favorite).then(function(data){
            $rootScope.user = data.user;
            $scope.user = $rootScope.user;
            if(data.isMatch && !$scope.requestSent){
                openMatch();
            }
        });
    };

    $scope.removeFromFavorites = function() {
        if(!$rootScope.user._id){
            $scope.openLogin();
            return;
        }
        var id = $scope.profile._id;
        AccountService.removeFavorite(id).then(function(data){
            $rootScope.user = data;
            $scope.user = $rootScope.user;
        });
    };

    $scope.isTravelingToCity = function(){
        var isTraveling = false;
        $scope.profile.travelingInformation.forEach(function(info){
            if((info.destination && info.destination.country == $scope.user.country) || !info.destination){
                isTraveling = true;
            }
        });
        return isTraveling;
    }
    
    function checkRequestSent(){
        AccountService.getRequests().then(function(requests){
            $scope.user.requests = requests;
            var requests = $scope.user.requests.filter(function (request) {
                return request.status != $scope.data.requestStatus.canceled;
            });
            requests = requests.map(function(request){
                return request.user1?request.user1._id:request.user2._id;
            });
            $scope.requestSent = requests.includes($scope.profile._id);
        },function(err){
            $scope.requestSent = false;
        });
    }

    function setMapRadius(){
        var mapOptions = {
            zoom: 14,
            center: {lat:parseFloat($scope.profile.location.lat), lng:parseFloat($scope.profile.location.long)},
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            scrollwheel: false
        };

        $scope.map = new google.maps.Map(document.getElementById('cityMap'), mapOptions);

        $scope.cityCircle = new google.maps.Circle({
            strokeColor: '#0E5D7C',
            strokeOpacity: 0.8,
            strokeWeight: 0.5,
            fillColor: '#0E5D7C',
            fillOpacity: 0.35,
            map: $scope.map,
            center: {lat:parseFloat($scope.profile.location.lat), lng:parseFloat($scope.profile.location.long)},
            radius: 500
        });

        var myoverlay = new google.maps.OverlayView();
        myoverlay.draw = function () {
            //this assigns an id to the markerlayer Pane, so it can be referenced by CSS
            this.getPanes().markerLayer.id='iconsLayer';
        };

        myoverlay.setMap($scope.map);
    }

    function setUpMarkers(){
        let thingsToDo = [];
        if(!$scope.user || !$scope.user._id){
            thingsToDo = [1,4,11,12,13];
        }
        else{
            thingsToDo = $scope.user.thingsToDo;
        }
        var service = new google.maps.places.PlacesService($scope.map);
        thingsToDo.forEach(function(value){
            var location = new google.maps.LatLng($scope.profile.location.lat, $scope.profile.location.long);
            var name = $scope.data.thingsToDo[value].name;
            var img = $scope.data.thingsToDo[value].img;
            var request = {
                location: location,
                radius: '1500',
                query: name,
                rankBy: google.maps.places.RankBy.PROMINENCE
            };
            service.textSearch(request, function (results, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    for (var i = 0; i < 3; i++) {
                        createMarker(results[i], img, name);
                    }
                }
            });
        });

    }

    var infoWindow = new google.maps.InfoWindow();
    var googleSearchMapUrl = 'https://www.google.com/maps/search/?api=1';

    var createMarker = function (info, img, query){

        var marker = new google.maps.Marker({
            map: $scope.map,
            position: info.geometry.location,
            // animation: google.maps.Animation.DROP,
            icon: {url:img, size:new google.maps.Size(35,35)},
            title: info.address,
            url: googleSearchMapUrl + '&query=' + query + '&query_place_id=' + info.place_id,
            optimized: false
        });

        marker.id = info.id;

        google.maps.event.addListener(marker, 'mouseover', function(event){
            marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
            infoWindow.setContent(info.name);
            infoWindow.open($scope.map, this);
        });

        google.maps.event.addListener(marker, 'mouseout', function(){
            marker.setZIndex(100);
            infoWindow.close($scope.map, marker);
        });

        google.maps.event.addListener(marker, 'click', function(){
            var a = document.createElement("a");
            a.id = "tempA";
            a.target = "_blank";
            a.href = marker.url;
            a.click();
        });

    }

    function init(){
        $scope.ready = false;
        UsersService.getProfile($routeParams.id).then(function(data){
            $scope.profile = data;
            $scope.age = getAge($scope.profile.birthday);
            setPhotoGalery();
            setMapRadius();
            if($scope.user && $scope.user._id){
                setUserData();
            }
            else{
                setUpMarkers();
                $scope.ready = true;
            }
        });
    }

    function setUserData(){
        $scope.ready = false;
        $scope.canSendRequest.status = false;
        setUpMarkers();
        checkRequestSent();
        $timeout(function(){
            $scope.ready = true;
        },1000);
    }

    function openMatch(){
        //need all th values for request and datepicker directives
        $scope.chooseDates = true;
        $scope.isMatch = true;
        $scope.data = $rootScope.data;
        $scope.swap = {};
        $scope.userCity = $rootScope.userCity;
        $scope.modelInstance = $uibModal.open({
            animation: true,
            templateUrl: '../../directives/request/request.html',
            size: 'sm',
            windowClass: 'request-modal',
            controller: 'requestController',
            scope: $scope
        });
    }

    init();

});
