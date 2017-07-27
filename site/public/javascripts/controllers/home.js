var ho = null;
swapsApp.controller('homeController', function($scope, $rootScope, $location, $window, $document,$timeout, $interval, UsersService) {
    ho = $scope;
    $scope.user = $rootScope.user;
    $scope.map = null;
    $scope.slideIndex = 0;

    // $scope.slides = [
    //   {id: '0', image:'/images/static/slide1.jpg'},
    //   {id: '1', image:'/images/static/slide2.jpg'}
    // ];
    $scope.slides = [
        '/images/static/slide3.jpg',
        '/images/static/slide4.jpg',
        '/images/static/slide5.jpg',
        '/images/static/slide1.jpg',
    ];
    $scope.mapBackground = $scope.slides[$scope.slideIndex];

   $scope.go = function(path){
       deleteMarkers();
       $scope.map = null;
       $interval.cancel($scope.showTravelers);
       $location.url('/' + path);
   }

    //Get the latitude and the longitude;
    function successFunction(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        codeLatLng(lat, lng);
    }

    function errorFunction(){
        alert("Geocoder failed");
    }


    //Angular App Module and Controller
    var geocoder =  new google.maps.Geocoder();

    var mapOptions = {
        zoom: 2,
        center: new google.maps.LatLng(18.0000, 5.0000),
        // mapTypeId: google.maps.MapTypeId.SATELLITE,
        disableDefaultUI: true,
        panControl: false,
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        overviewMapControl: false,
        scrollwheel: false,
        styles: [
            {
                "elementType": "labels",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
            },
          {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "administrative.land_parcel",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "administrative.land_parcel",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "administrative.neighborhood",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "landscape.natural",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#008500"
              },
              {
                "visibility": "on"
              }
            ]
          },
          {
            "featureType": "poi",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "labels.text",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "road",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "road",
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "transit",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "labels.text",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "color": "#12214c"
                }
            ]
        }
        ]
    }

    $scope.markers = [];
    deleteMarkers();
    $interval.cancel($scope.showTravelers);
    $scope.map = new google.maps.Map($document[0].getElementById('map'), mapOptions);


    $timeout(function(){
        $('#markerLayer>div>img').css("transform","scale(0)");
        deleteMarkers();
        getUsers();
        startInterval();
    },3000);

    var infoWindow = new google.maps.InfoWindow();

    var createMarker = function (info){
      var shape ={coords:[17,17,18],type:'circle'};

        var marker = new google.maps.Marker({
            map: $scope.map,
            position: new google.maps.LatLng(info.lat, info.long),
            // animation: google.maps.Animation.DROP,
            icon: {url:info.image, size:new google.maps.Size(30,30)},
            title: info.city,
            url: 'travelers/'+info.city,
            optimized: false
        });

        // marker.content = '<div class="infoWindowContent">' + info.desc + ' and 208 more </br>are traveling to Tel Aviv</div>';
        marker.content = info.desc;
        marker.amount = info.amount;

        google.maps.event.addListener(marker, 'mouseover', function(){
            // infoWindow.setContent('<div class="travelers">' + marker.title + '</div>' + marker.content);
            $interval.cancel($scope.showTravelers);
            // infoWindow.open($scope.map, marker);
            $scope.info = marker;
            $scope.$apply();
        });

        google.maps.event.addListener(marker, 'mouseout', function(){
            startInterval();
            // infoWindow.close($scope.map, marker);
        });

        google.maps.event.addListener(marker, 'click', function(){
          var a = document.createElement("a");
          $interval.cancel($scope.showTravelers);
          $location.url('/' + marker.url);
        //   a.id = "tempA";
        //   a.target = "_self";
        //   console.log(encodeURI("http://localhost:3000/#!/" + marker.url));
        //   a.href = "" + encodeURI("http://localhost:3000/#!/" + marker.url); // change to actual url
        //   a.click();
        });
        $scope.markers.push(marker);
    }


     var myoverlay = new google.maps.OverlayView();
      myoverlay.draw = function () {
        //this assigns an id to the markerlayer Pane, so it can be referenced by CSS
        this.getPanes().markerLayer.id='markerLayer';
      };
      myoverlay.setMap($scope.map);


    // Sets the map on all markers in the array.
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

    function codeLatLng(lat, lng) {
        var latlng = new google.maps.LatLng(lat, lng);
        geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    var flag = false;
                    //find country name
                    for (var i=0; i<results[0].address_components.length; i++) {
                        for (var b=0;b<results[0].address_components[i].types.length;b++) {
                            //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                            if (results[0].address_components[i].types[b] == 'locality' || results[0].address_components[i].types[b] == "administrative_area_level_1") {
                                //this is the object you are looking for
                                $scope.userCity = results[0].address_components[i].short_name;
                                flag = true;
                                break;
                            }
                        }
                        if(flag){
                            break;
                        }
                    }
                }
            }
        });
    }

    function getUsers(){
        UsersService.getUserByTravelingDest("Tel Aviv").then(function(data){
            var travelingTo = data.data;
            angular.forEach(travelingTo, function(value, key) {
              var location;
              var city = value.city;
              var image = value.image;
              var name = value.firstName;
              geocoder.geocode( { 'address': city}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                  location = results[0].geometry.location;
                  var marker = {
                    city : city,
                    desc : name,
                    image : image,
                    amount: Math.floor(Math.random() * 1000),
                    lat : location.lat(),
                    long : location.lng()
                  };
                  createMarker(marker);
                }
              });
            });
            $timeout(function(){
                $('#markerLayer>div>img').css("transform","scale(1)");
            },600);
        });
    };

    // $timeout(function(){
    //     $('#markerLayer>div>img').css("transform","scale(0)");
    //     deleteMarkers();
    //     getUsers();
    //     startInterval();
    // },2000);

    function startInterval(){
        $scope.showTravelers = $interval(function() {
          $('#markerLayer>div>img').css("transform","scale(0)");
          $timeout(function(){
              deleteMarkers();
              getUsers();
          },600);
          $scope.slideIndex++;
          if($scope.slideIndex == $scope.slides.length){
              $scope.slideIndex = 0;
          }
          $scope.mapBackground = $scope.slides[$scope.slideIndex];
      }, 10000);
  }

});
