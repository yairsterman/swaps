var tr = null;
swapsApp.controller('travelersController', ['$scope', '$rootScope', '$location', '$routeParams', '$anchorScroll', '$timeout', '$uibModal', '$mdSidenav',
    'UsersService', 'Utils', function($scope, $rootScope, $location, $routeParams, $anchorScroll, $timeout, $uibModal, $mdSidenav, UsersService, Utils) {
    tr = $scope;
    $rootScope.homepage = false;
    $rootScope.searchPage = true;
    $scope.city = $routeParams.city;
    $scope.user = $rootScope.user;
    $scope.yourCity = $rootScope.userCity;
    $scope.search = {};
    $scope.filter = {};
    $scope.checkedAmenities =[];
    $scope.checkedRoomTypes =[];
    $scope.localeFormat = 'MMM DD';
    $scope.modelFormat = 'MM/DD/YYYY';
    var filter = {};
    $scope.pageSize = 12;
    $scope.appliedFilters = false;
    $scope.showFilters = false;
    $anchorScroll();

    $scope.filter.guests = $routeParams.guests?parseInt($routeParams.guests):2;
    $scope.filter.when = $routeParams.dates != 'undefined'?$routeParams.dates:undefined;
    $scope.filter.rangeLabel = $routeParams.label;
    $scope.filter.startRange = $routeParams.startRange;
    $scope.filter.endRange = $routeParams.endRange;

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

    $scope.toggleFilters = function(){
        $scope.showFilters = !$scope.showFilters;
    }

    $scope.checkAmenity = function(index, event){
        if($scope.loading){
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        if($scope.isCheckedAmenity(index)){
            $scope.checkedAmenities.splice($scope.checkedAmenities.indexOf(index),1);
        }
        else{
            $scope.checkedAmenities.push(index);
        }
        $scope.getPage(1);
    }

    $scope.isCheckedAmenity = function(index){
        return $scope.checkedAmenities.includes(index);
    }

    $scope.checkRoomType = function(index, event){
        if($scope.loading){
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        if($scope.isCheckedRoomType(index)){
            $scope.checkedRoomTypes.splice($scope.checkedRoomTypes.indexOf(index),1);
        }
        else{
            $scope.checkedRoomTypes.push(index);
        }
        $scope.getPage(1);
    }

    $scope.isCheckedRoomType = function(index){
        return $scope.checkedRoomTypes.includes(index);
    }

    $scope.$watchGroup(['filter.rangeLabel','filter.when'], function(oldval, newval ){
        if(!$scope.filter.when){
            return;
        }
        var dates = $scope.filter.when.split('-');
        var date1 = (new Date(dates[0])).toLocaleDateString('en-us', {month: 'short', day: 'numeric'});
        var date2 = (new Date(dates[1])).toLocaleDateString('en-us', {month: 'short', day: 'numeric'});
        $scope.filter.date = date1 + ' - ' + date2;
        $timeout(function() {
            if($scope.filter.rangeLabel === 'Weekends') {
                $scope.filter.startRange = $scope.filter.startRange?$scope.filter.startRange:$scope.data.weekendStart[0].id.toString();
                $scope.filter.endRange = $scope.filter.endRange?$scope.filter.endRange:$scope.data.weekendEnd[1].id.toString();
            }
            else if($scope.filter.rangeLabel === 'Dates') {
                $scope.filter.startRange = $scope.filter.startRange?$scope.filter.startRange:$scope.data.flexibleDates[0].id.toString();
                $scope.filter.endRange = $scope.filter.endRange?$scope.filter.endRange:$scope.data.flexibleDates[0].id.toString();
            }
            else if($scope.filter.rangeLabel === 'Within Range'){
                $scope.filter.startRange = $scope.filter.startRange?$scope.filter.startRange:6;
                $scope.filter.endRange =  $scope.filter.endRange? $scope.filter.endRange:8;
                $scope.filter.duration = $scope.filter.startRange?$scope.filter.startRange+'-'+$scope.filter.endRange:'6-8';
            }
            $scope.getPage(1);
        },500);
    },true);

    $scope.changeRange = function () {
        if($scope.filter.duration) {
            var arr =  $scope.filter.duration.split('-');
            var min = Number(arr[0]);
            var max = Number(arr[1]);
            if(isNaN(min)){
                $scope.filter.startRange = 6;
                $scope.filter.endRange = 8;
                return;
            }
            if(min === max || isNaN(max)) {
                $scope.filter.duration = min+'';
                max = min;
            }
            if(min < 1){
                min = 1;
            }
            if(min > 58){
                min = 58;
            }
            if(max > 58){
                max = 58;
            }
            if(min > max){
                $scope.filter.startRange = max;
                $scope.filter.endRange = min;
                return;
            }
            $scope.filter.startRange = min;
            $scope.filter.endRange = max;
        }
        else {
            $scope.filter.startRange = 6;
            $scope.filter.endRange = 8;
        }
        $scope.getPage(1);

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
        $scope.filter.rangeLabel = undefined;
        $scope.filter.startRange = undefined;
        $scope.filter.endRange = undefined;
        $scope.getPage(1);
    }

    $scope.removeRoomTypes = function(){
        $scope.checkedRoomTypes = [];
        $scope.getPage(1);
    }

    $scope.removeFacilities = function(){
        $scope.checkedAmenities = [];
        $scope.getPage(1);
    }

    $scope.nextPage = function(){
        $anchorScroll();
        scrollToTop();
        if($scope.page + 1 < $scope.totalPages){
            getTravelers($scope.page + 1);
        }
    }

    $scope.prevPage = function(){
        $anchorScroll();
        scrollToTop();
        if($scope.page + 1 > 1){
            getTravelers($scope.page - 1);
        }
    }

    $scope.getPage = function(page){
        $anchorScroll();
        $('.travelers-dropdown.open').removeClass('open');
        scrollToTop();
        getTravelers(parseInt(page) - 1);
    }

    $scope.scaleImage = function(imageSrc){
        $("#travelerMarkerLayer>div>img[src='" + imageSrc + "']").css("border","1px solid rgba(13, 134, 234, 0.8)");
        $("#travelerMarkerLayer>div>img[src='" + imageSrc + "']").css("z-index","500 !important");
        $("#travelerMarkerLayer>div>img[src='" + imageSrc + "']").css("transform","scale(1.0)");
        $("#travelerMarkerLayer>div>img[src='" + imageSrc + "']").parent().css("z-index", google.maps.Marker.MAX_ZINDEX + 1);
    }

    $scope.shrinkImage = function(imageSrc){
        $("#travelerMarkerLayer>div>img[src='" + imageSrc + "']").css("border","1px solid rgba(13, 134, 234, 0)");
        $("#travelerMarkerLayer>div>img[src='" + imageSrc + "']").css("z-index","100 !important");
        $("#travelerMarkerLayer>div>img[src='" + imageSrc + "']").css("transform","scale(0.75)");
        $("#travelerMarkerLayer>div>img[src='" + imageSrc + "']").parent().css("z-index", google.maps.Marker.MAX_ZINDEX - 1);
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
            // animation: google.maps.Animation.DROP,
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
            marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
            scrollToProfile(marker.id);
        });

        google.maps.event.addListener(marker, 'mouseout', function(){
            $('#swappers').stop();
            marker.setZIndex(google.maps.Marker.MAX_ZINDEX - 1);
            infoWindow.close($scope.map, marker);
        });

        google.maps.event.addListener(marker, 'click', function(){
            // $location.url('/' + marker.url);
            var a = document.createElement("a");
            a.id = "tempA";
            a.target = "_blank";
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
        if(!$scope.city){
            zoom = 2;
            center = 'Madrid';
        }
        geocoder.geocode( {'address': center}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {

                var location = results[0].geometry.location;

                if(results[0].types.includes('country')){
                    zoom = 6;
                }

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
        $scope.totalPages = Math.ceil($scope.totalUsers / $scope.pageSize);
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
        $scope.filter.from = $scope.city;
        $scope.filter.page = page;
        UsersService.getUsers($scope.filter).then(function(data){
            $scope.currentPage = page + 1;
            var travelers = data.users;
            $scope.exactMatchesLength = data.exactMatchesLength;
            $scope.totalUsers = data.total;
            $scope.page = parseInt(data.page);
            $scope.exactMatchesLimit = ($scope.pageSize * ($scope.page + 1)) - $scope.exactMatchesLength <= $scope.pageSize?$scope.pageSize - (($scope.pageSize * ($scope.page + 1)) - $scope.exactMatchesLength):$scope.pageSize;
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
          if($scope.travelers.length === 0 && !$scope.failedCity && $scope.filter.amenities.length === 0 && $scope.filter.room.length === 0 && !$scope.appliedFilters){
              $scope.failedCity = $scope.city;
              if($rootScope.user && $rootScope.user._id){
                  $scope.loggedIn = true;
              }
              $scope.modelInstance = $uibModal.open({
                  animation: true,
                  templateUrl: '../../pages/popups/join-us.html',
                  size: 'md',
                  windowClass: 'request-modal',
                  scope: $scope
              });
              $scope.modelInstance.closed.then(function(value){
                  if(!$scope.signingin && !$rootScope.user){
                      $scope.modelInstance = $uibModal.open({
                          animation: true,
                          templateUrl: '../../pages/popups/leave-email.html',
                          size: 'md',
                          windowClass: 'request-modal',
                          scope: $scope
                      });
                  }
              });
              $scope.city = undefined;
              $scope.filter = {};
              $scope.appliedFilters = false;
              $scope.filter.guests = 1;
              getTravelers(page);
          }
          $scope.loading = false;
        },function(){
            //error message
        });
    }

    $scope.signin = function(){
        $scope.signingin = true;
    }

    $scope.sendEmail = function(){
        Utils.sendMailToInfo($scope.email, $scope.failedCity).then(function(){
            $scope.emailSent =true;
        });
    }

    $scope.$on('login-success', function(event, args) {
        $scope.user = $rootScope.user;
        $scope.yourCity = $rootScope.userCity;
        getTravelers(0);
	});

    $scope.$on('auth-return', function(event, args) {
        $scope.user = $rootScope.user;
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

    $scope.openHelpSearch = function(){
        if($scope.user || $scope.page > 0 || $scope.firedHelpSearch){
            return;
        }
        $scope.modelInstance = $uibModal.open({
            animation: true,
            templateUrl: '../../pages/popups/help-search.html',
            size: 'md',
            windowClass: 'request-modal',
            scope: $scope
        });
        $scope.firedHelpSearch = true;
    }


}]);
