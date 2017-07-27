var tr = null;
swapsApp.controller('travelersController', function($scope, $rootScope, $location, $routeParams,  $mdSidenav, UsersService) {
    tr = $scope;
    $scope.city = $routeParams.city;
    $scope.user = $rootScope.user;
    $scope.yourCity = $rootScope.userCity;
    $scope.search= {};
    $scope.filter = {};
    var filter = {};

    if($location.search().dates && $location.search().dates != 'undefined'){
        $scope.filter.date = $location.search().dates;
    }
    if($location.search().guests){
        $scope.filter.guests = $location.search().guests;
    }
    $('input[name="datefilter"]').daterangepicker({
          autoApply: true,
          opens: 'center'
      });

    $scope.searchCity = function(){
    	$scope.city = $scope.search.city;
        $scope.go('travelers/' + $scope.city);
    }

    $scope.go = function(path){
        deleteMarkers();
        $scope.map = null;
        $location.url('/' + path);
    }

    $scope.openFilters = function(){
         $mdSidenav('right').toggle();
         $scope.filtersOpen = !$scope.filtersOpen;
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

        google.maps.event.addListener(marker, 'mouseover', function(){
            $scope.currentApptPhoto = marker.photos[0];
            // infoWindow.setContent('<div class="map-photo" style="background-image:url('  + marker.photos[0] +')">' +'</div>' + marker.content);
            // infoWindow.open($scope.map, marker);
            scrollToProfile(marker.id);
        });

        google.maps.event.addListener(marker, 'mouseout', function(){
            infoWindow.close($scope.map, marker);
        });

        google.maps.event.addListener(marker, 'click', function(){
            $location.url('/' + marker.url);
            // var a = document.createElement("a");
            // a.id = "tempA"
            // a.target = "_self";
            // a.href = "http://localhost:3000/#/" + marker.url; // change to actual url
            // a.click();
        });


        $scope.markers.push(marker);
    }


     var myoverlay = new google.maps.OverlayView();
      myoverlay.draw = function () {
        //this assigns an id to the markerlayer Pane, so it can be referenced by CSS
        this.getPanes().markerLayer.id='travelerMarkerLayer';
      };

    function init(){
        var zoom = 12;
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
                }

                $scope.map = new google.maps.Map(document.getElementById('travelerMap'), mapOptions);
                deleteMarkers();
                myoverlay.setMap($scope.map);
            }
        });
    }

    init();
    getTravelers(0);

    function scrollToProfile(id){
        var profile = document.getElementById(id);
        $('#swappers').animate({
            scrollTop: profile.offsetTop
        }, 1000, function(){

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
        UsersService.getUserByTravelingDest($rootScope.userCity, $scope.city, page, $scope.filter).then(function(data){
            var travelers = data.data.users;
            $scope.totalUsers = data.data.total;
            $scope.page = parseInt(data.data.page);
            angular.forEach(travelers, function(value, key) {
                var location;
                var address = value.address;
                var image = value.image;
                var name = value.firstName;
                var id = value._id;
                var photos = value.photos;
                value.address = value.city;
                geocoder.geocode( { 'address': address}, function(results, status) {
                  if (status == google.maps.GeocoderStatus.OK) {
                    location = results[0].geometry.location;
                    var marker = {
                      id : id,
                      desc : name,
                      photos: photos,
                      image : image,
                      lat : location.lat().toFixed(3),
                      long : location.lng().toFixed(3)
                    };
                    createMarker(marker);
                  }
                });
          });
          $scope.travelers = travelers;
          countPages();
          $scope.loading = false;
        });
    }

    $scope.$on('login-success', function(event, args) {
        $scope.user = $rootScope.user;
        $scope.yourCity = $rootScope.userCity;
        getTravelers(0);
	});

});
