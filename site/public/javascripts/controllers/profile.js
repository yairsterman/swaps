var pro = null;
swapsApp.controller('profileController', function($scope, $rootScope, $document, $routeParams, $window, $anchorScroll, $interval, MessageService, UsersService, $location, $uibModal, $filter, AccountService) {
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
    $scope.localeFormat = 'MM/DD/YYYY';
    $scope.modelFormat = 'MMMM DD, YYYY';

    $anchorScroll();

    $scope.go = function(path){
      $location.url('/' + path);
    }

    $scope.openRequest = function(){
        if(!$rootScope.user._id){
            $scope.openLogin();
        }
        else{
            $scope.modelInstance = $uibModal.open({
                animation: true,
                templateUrl: '../../directives/request/request.html',
                size: 'sm',
                controller: 'requestController',
                scope: $scope
            });
        }
    }

    $scope.openLogin = function(signin){
        $scope.modelInstance = $uibModal.open({
            animation: true,
            templateUrl: '../../directives/login/login.html',
            size: 'sm',
            controller: 'loginController',
            resolve: {
                signin: function () {
                    return signin;
                }
            },
            scope:$scope
        });
    }

    $scope.sendMessage = function(){
        var message = $scope.message.message;
        $scope.message.message = '';
        MessageService.sendMessage($rootScope.user, $scope.profile._id, message).then(function(data){
            $scope.messageSent = true;
            $rootScope.user = data.data;
            $scope.user = $rootScope.user;
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
    });

    $scope.$on('auth-return', function(event, args) {
        $scope.user = $rootScope.user;
        setUserData();
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
            $rootScope.user = data;
            $scope.user = $rootScope.user;
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
    
    function checkRequestSent() {
        var requests = $scope.user.requests.filter(function (request) {
            return request.status != $scope.data.requestStatus.canceled;
        });
        requests = requests.map(function(request){
            return request.userId;
        });
        $scope.requestSent = requests.includes($scope.profile._id);
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

    }

    function setUpMarkers(){
        var service = new google.maps.places.PlacesService($scope.map);
        $scope.user.thingsToDo.forEach(function(value){
            var location = new google.maps.LatLng($scope.profile.location.lat, $scope.profile.location.long);
            var name = $scope.data.thingsToDo[value].name;
            var img = $scope.data.thingsToDo[value].img;
            var request = {
                location: location,
                radius: '1500',
                query: name,
                rankBy: google.maps.places.RankBy.DISTANCE
            };
            service.textSearch(request, function (results, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    for (var i = 0; i < 4; i++) {
                        createMarker(results[i], img);
                    }
                }
            });
        });

    }

    var infoWindow = new google.maps.InfoWindow();

    var createMarker = function (info, img){

        var marker = new google.maps.Marker({
            map: $scope.map,
            position: info.geometry.location,
            animation: google.maps.Animation.DROP,
            icon: {url:img, size:new google.maps.Size(50,50)},
            title: info.address,
            optimized: false
        });

        marker.id = info.id;

        // marker.content = '<img src=' + info.photos[0].getUrl() + '></img>' + '<div>' + info.name + '</div>';

        google.maps.event.addListener(marker, 'mouseover', function(event){
            infoWindow.setContent(info.name);
            infoWindow.open($scope.map, this);
        });

        google.maps.event.addListener(marker, 'mouseout', function(){
            infoWindow.close($scope.map, marker);
        });

    }

    function init(){
        $scope.ready = false;
        UsersService.getProfile($routeParams.id).then(function(data){
            $scope.profile = data.data;
            $scope.age = getAge($scope.profile.birthday);
            setPhotoGalery();
            setMapRadius();
            if($scope.user && $scope.user._id){
                setUserData();
            }
            else{
                $scope.ready = true;
            }
        });
    }

    function setUserData(){
        $scope.ready = false;
        $scope.canSendRequest.status = false;
        setUpMarkers();
        checkRequestSent();
        $scope.ready = true;
    }

    init();

});
