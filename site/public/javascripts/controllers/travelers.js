var tr = null;
swapsApp.controller('travelersController', ['$scope', '$rootScope', '$location', '$routeParams', '$anchorScroll', '$mdSidenav',
    'UsersService', 'Utils', function($scope, $rootScope, $location, $routeParams, $anchorScroll, $mdSidenav, UsersService, Utils) {
    tr = $scope;
    $rootScope.homepage = false;
    $rootScope.searchPage = true;
    $scope.city = $routeParams.city;
    $scope.guests = $routeParams.guests;
    $scope.user = $rootScope.user;
    $scope.yourCity = $rootScope.userCity;
    $scope.search = {};
    $scope.filter = {};
    $scope.checkedAmenities =[];
    $scope.checkedRoomTypes =[];
    var filter = {};
    const PAGE_DIVIDOR = 10;
    $anchorScroll();


    if($location.search().dates && $location.search().dates != 'undefined'){
        $scope.filter.date = $location.search().dates;
    }
    if($location.search().guests){
        $scope.filter.guests = $location.search().guests;
    }
    $('#filterDates').daterangepicker({
        autoApply: true,
        clearBtn: true,
        opens: 'center',
        locale: {
            format: 'MMM DD'
        }
    });

    $scope.openDate = function(){
        $('#filterDates').on('apply.daterangepicker', function(ev, picker) {
            $scope.when = picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY');
        });
    }

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
            a.href = "http://swapshome.com:3000/#/" + marker.url; // change to actual url
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


    /* ----------------------------------------------------- */


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

    //  Counting pages by diving by PAGE_DIVIDOR search matches per page.
    //  Currently counting the dummy user array.
    $scope.dumPageCount = function(dumCount) {
        var counter = Math.ceil(dumCount.length / PAGE_DIVIDOR);
        var pageArr = [];
        for (var i = 1; i <= counter; ++i) {
            pageArr.push(i);
        }
        return pageArr;
    };

    //  Indicates whether the page number is greater than 10.
    //  Helps to determine if to show "1 2 3 4 5 6 7" or "1 2 ... 14 15 16 .. 31 32"
    $scope.isPageListShort = function(travArr) {
        return Math.ceil(travArr.length / PAGE_DIVIDOR) <= 10;
    };


    //  Returns false if the list's length is greater than "PAGE_DIVIDOR"
    //  This function generates a page list of the form:
    //  "1, 2, ..., currPage-1, currPage, currPage+1, ..., lastPage-1, lastPage"
    $scope.pageListToShow = function(currPage, pageList) {
        var retList = [];
        if (pageList.length <= 10) {
            for (var i = 0; i < pageList.length; ++i) {
                retList.push(pageList[i]);
            }
            $scope.pageList = retList;
            return retList;
        }
        if (currPage == 1 || currPage == 2) {
            retList = [1, 2, "..." , pageList[Math.floor(pageList.length / 2) - 1], pageList[Math.floor(pageList.length / 2)], pageList[Math.floor(pageList.length / 2) + 1],
                "...", pageList[pageList.length - 2], pageList[pageList.length - 1]];
        } else {
            retList = [1, 2, "..." , currPage - 1, currPage];
            if (currPage != pageList[pageList.length - 1] && currPage != pageList[pageList.length - 2])
                retList.push(currPage + 1);
            else {
                if (currPage == pageList[pageList.length - 2])
                    retList.push(currPage + 1);
                $scope.pageList = retList;
                return retList;
            }
            if (currPage != pageList[pageList.length - 3])
                retList.push("...", pageList[pageList.length - 2]);
            retList.push(pageList[pageList.length - 1]);

        }

        $scope.pageList = retList;
        return retList;
    };

    // Get the list page count by dividing to PAGE_DIVIDOR users per page
    $scope.pageCount = function(travelersList) {
        return Math.ceil(travelersList.length / PAGE_DIVIDOR);
    };

    $scope.pageIndicator = 0;       // Indicates on which page the client is
    $scope.pageList = [];           // Saves the page list
    $scope.userListToShow = [];     // The current "PAGE_DIVIDOR" users the client will see


    // Retrieve the first user page
    $scope.firstPage = function(travelersList) {
        retArr = [];
        for (var i = 0; i < PAGE_DIVIDOR; ++i) {
            retArr.push(travelersList[i]);
        }
        $scope.pageIndicator = 1;
        $scope.userListToShow = retArr;
        return retArr;
    };


    // The name is to avoid duplicates with Yair's code
    $scope.nextPage_damir = function(currPage, travelersList) {
        retArr = [];
        for (var i = currPage * PAGE_DIVIDOR; i < (currPage + 1) * PAGE_DIVIDOR && i < travelersList.length; ++i) {
            retArr.push(travelersList[i]);
        }
        ++$scope.pageIndicator;
        console.log("Page: " + $scope.pageIndicator + ", list: " + retArr);
        $scope.userListToShow = retArr;
        $scope.pageList = $scope.pageListToShow(currPage + 1, $scope.dumPageCount(travelersList));
        scrollToTop();
        return retArr;
    };

    // Previous page of user list
    $scope.prevPage_damir = function(currPage, travelersList) {
        retArr = [];
        for (var i = (currPage - 2) * PAGE_DIVIDOR; i < (currPage - 1) * PAGE_DIVIDOR; ++i) {
            retArr.push(travelersList[i]);
        }
        --$scope.pageIndicator;
        console.log("Page: " + $scope.pageIndicator + ", list: " + retArr);
        $scope.userListToShow = retArr;
        $scope.pageList = $scope.pageListToShow(currPage - 1, $scope.dumPageCount(travelersList));
        scrollToTop();
        return retArr;
    };

    // Jump to page "pageNum" of the list "travelerList"
    $scope.goToPage = function(pageNum, travelersList) {
        retArr = [];
        for (var i = (pageNum - 1) * PAGE_DIVIDOR; i < pageNum * PAGE_DIVIDOR && i < travelersList.length; ++i) {
            retArr.push(travelersList[i]);
        }
        $scope.pageIndicator = pageNum;
        $scope.userListToShow = retArr;
        $scope.pageList = $scope.pageListToShow(pageNum, $scope.dumPageCount(travelersList));
        scrollToTop();
    };

}]);
