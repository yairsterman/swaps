var tr = null;
swapsApp.controller('travelersController', ['$scope', '$rootScope', '$location', '$routeParams', '$anchorScroll', '$mdSidenav',
    'UsersService', 'Utils', function($scope, $rootScope, $location, $routeParams, $anchorScroll, $mdSidenav, UsersService, Utils) {
    tr = $scope;
    $rootScope.homepage = false;
    $rootScope.searchPage = true;
    $scope.city = $routeParams.city && $routeParams.city !== ''?$routeParams.city:'Anywhere';
    $scope.user = $rootScope.user;
    $scope.yourCity = $rootScope.userCity;
    $scope.search = {};
    $scope.filter = {};
    $scope.checkedAmenities =[];
    $scope.checkedRoomTypes =[];
    $scope.localeFormat = 'MMM DD';
    $scope.modelFormat = 'MM/DD/YYYY';
    var filter = {};
    $scope.pageSize = 10;
    $anchorScroll();

    $scope.filter.guests = parseInt($routeParams.guests);
    $scope.filter.when = $routeParams.dates != 'undefined'?$routeParams.dates:undefined;
    // if($location.search().dates && $location.search().dates != 'undefined'){
    //     $scope.filter.date = $location.search().dates;
    // }
    // if($location.search().guests){
    //     $scope.filter.guests = $location.search().guests;
    // }

    $scope.searchCity = function(){
    	$scope.city = $scope.search.city;
        $scope.go('travelers/' + $scope.city);
    }

    $scope.go = function(path){
        deleteMarkers();
        $scope.map = null;
        $rootScope.searchPage = false;
        $location.url('/' + path);
    }

    $scope.openFilters = function(){
         $mdSidenav('right').toggle();
         $scope.filtersOpen = !$scope.filtersOpen;
    }

    $scope.checkAmenity = function(index, event){
        event.preventDefault();
        event.stopPropagation();
        if($scope.isCheckedAmenity(index)){
            $scope.checkedAmenities.splice($scope.checkedAmenities.indexOf(index),1);
        }
        else{
            $scope.checkedAmenities.push(index);
        }
    }

    $scope.isCheckedAmenity = function(index){
        return $scope.checkedAmenities.includes(index);
    }

    $scope.checkRoomType = function(index, event){
        event.preventDefault();
        event.stopPropagation();
        if($scope.isCheckedRoomType(index)){
            $scope.checkedRoomTypes.splice($scope.checkedRoomTypes.indexOf(index),1);
        }
        else{
            $scope.checkedRoomTypes.push(index);
        }
    }

    $scope.isCheckedRoomType = function(index){
        return $scope.checkedRoomTypes.includes(index);
    }

    $scope.search = function(){
        $mdSidenav('right').toggle();
        deleteMarkers();
        getTravelers(0);
        filter = angular.copy($scope.filter);
    }

    $scope.clear = function(){
         $scope.filter = {};
         filter = {};
    }

    $scope.showAmeneties = function(){
        $scope.ameneties = !$scope.ameneties;
    }

    $scope.travelingCities = function(){
        return function( item ) {
            if($scope.city){
                if($scope.yourCity.toLowerCase().includes(item.dest.toLowerCase())){
                    return item;
                }
            }
            else{
                return item;
            }
        };
    }

    $scope.removeDates = function(){
        $scope.filter.when = undefined;
        $scope.filter.date = undefined;
    }

    $scope.nextPage = function(){
        scrollToTop();
        if($scope.page + 1 < $scope.totalPages){
            getTravelers($scope.page + 1);
        }
    }

    $scope.prevPage = function(){
        scrollToTop();
        if($scope.page + 1 > 1){
            getTravelers($scope.page - 1);
        }
    }

    $scope.getPage = function(page){
        scrollToTop();
        getTravelers(parseInt(page) - 1);
    }

    $scope.scaleImage = function(imageSrc){
        $("#travelerMarkerLayer>div>img[src='" + imageSrc + "']").css("border","1px solid rgba(13, 134, 234, 0.8)");
        $("#travelerMarkerLayer>div>img[src='" + imageSrc + "']").css("transform","scale(1.0)");
    }

    $scope.shrinkImage = function(imageSrc){
        $("#travelerMarkerLayer>div>img[src='" + imageSrc + "']").css("border","1px solid rgba(13, 134, 234, 0)");
        $("#travelerMarkerLayer>div>img[src='" + imageSrc + "']").css("transform","scale(0.75)");
    }

    function setMapOnAll(map) {
      for (var i = 0; i < $scope.markers.length; i++) {
        $scope.markers[i].setMap(map);
      }
    };

    // Removes the markers from the map, but keeps them in the array.
    function clearMarkers() {
      setMapOnAll(null);
    };

    // Deletes all markers in the array by removing references to them.
    function deleteMarkers() {
        clearMarkers();
        $scope.markers = [];
    };

    var geocoder =  new google.maps.Geocoder();

    $scope.markers = [];

    var infoWindow = new google.maps.InfoWindow();

    var createMarker = function (info){
      var shape ={coords:[17,17,18],type:'circle'};

        var marker = new google.maps.Marker({
            map: $scope.map,
            position: new google.maps.LatLng(info.lat, info.long),
            animation: google.maps.Animation.DROP,
            icon: {url:info.image, size:new google.maps.Size(50,50)},
            title: info.address,
            url: 'profile/'+info.id,
            optimized: false
        });

        marker.id = info.id;

        marker.content = '<div class="infoWindowContent">' + info.desc + '</div>';
        marker.photos = info.photos;

        google.maps.event.addListener(marker, 'mouseover', function(event){
            $scope.currentApptPhoto = marker.photos[0];
            scrollToProfile(marker.id);
        });

        google.maps.event.addListener(marker, 'mouseout', function(){
            $('#swappers').stop();
            infoWindow.close($scope.map, marker);
        });

        google.maps.event.addListener(marker, 'click', function(){
            $location.url('/' + marker.url);
            var a = document.createElement("a");
            a.id = "tempA"
            a.target = "_self";
            a.href = "https://swapshome.com/" + marker.url; // change to actual url
            a.click();
        });


        $scope.markers.push(marker);
    }


     var myoverlay = new google.maps.OverlayView();
      myoverlay.draw = function () {
        //this assigns an id to the markerlayer Pane, so it can be referenced by CSS
        this.getPanes().markerLayer.id='travelerMarkerLayer';
      };

    function init(){
        var zoom = 13;
        var center = $scope.city;
        if($scope.city == 'Anywhere'){
            zoom = 2;
            center = 'Madrid';
        }
        geocoder.geocode( {'address': center}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {

                var location = results[0].geometry.location;

                var mapOptions = {
                    zoom: zoom,
                    center: new google.maps.LatLng(location.lat(), location.lng()),
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    mapTypeControl: false,
                    scrollwheel: false
                };

                $scope.map = new google.maps.Map(document.getElementById('travelerMap'), mapOptions);
                deleteMarkers();
                myoverlay.setMap($scope.map);
                getTravelers(0);
                $(window).scroll(function() {
                    $('#swappers').stop();
                });
            }
        });
    }

    init();

    function scrollToProfile(id){
        $('#swappers').stop();
        var profile = document.getElementById(id);
        $('#swappers').animate({
            scrollTop: profile.offsetTop
        }, 1500, function(){

        });

    }
    function scrollToTop(){
        $('#swappers').animate({
            scrollTop: 0
        }, 1000, function(){

        });
    }

    function countPages(){
        $scope.totalPages = Math.ceil($scope.totalUsers / 10);
        $scope.pageNumbers = [];
        for (var i = 1; i <= $scope.totalPages; i++) {
            $scope.pageNumbers.push(i);
        }
    }

    function getTravelers(page){
        $scope.loading = true;
        deleteMarkers();
        $scope.filter.amenities = $scope.checkedAmenities;
        $scope.filter.room = $scope.checkedRoomTypes;
        UsersService.getUserByTravelingDest($rootScope.userCity, $scope.city, page, $scope.filter).then(function(data){
            $scope.currentPage = page + 1;
            var travelers = data.users;
            $scope.totalUsers = data.total;
            $scope.page = parseInt(data.page);
            angular.forEach(travelers, function(value, key) {
                var location = value.location;
                var image = value.image;
                var name = value.firstName;
                var id = value._id;
                var photos = value.photos;
                value.address = value.city;
                var marker = {
                  id : id,
                  desc : name,
                  photos: photos,
                  image : image,
                  lat : location.lat,
                  long : location.long
                };
                createMarker(marker);
          });
          $scope.travelers = travelers;
          countPages();
          $scope.loading = false;
        },function(){
            //error message
        });
    }

    $scope.$on('login-success', function(event, args) {
        $scope.user = $rootScope.user;
        $scope.yourCity = $rootScope.userCity;
        getTravelers(0);
	});


    $scope.carouselPrev = function (identifyier, event) {
        event.preventDefault();
        event.stopPropagation();
        $('#myCarousel' + identifyier).carousel('prev');
    };

    $scope.carouselNext = function (identifyier, event) {
        event.preventDefault();
        event.stopPropagation();
        $('#myCarousel' + identifyier).carousel('next');
    };


}]);
