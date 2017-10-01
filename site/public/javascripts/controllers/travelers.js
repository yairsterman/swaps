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

    // var address = value.address;
    // var image = value.image;
    // var name = value.firstName;
    // var id = value._id;
    // var photos = value.photos;
    $scope.d_travelers = [
        {
            address: "Blah1",
            image: "../images/tmp_trav_img/one.jpg",
            firstName: "name1",
            id: 1
        },
        {
            address: "Blah2",
            image: "../images/tmp_trav_img/two.jpg",
            firstName: "name2",
            id: 2
        },
        {
            address: "Blah3",
            image: "../images/tmp_trav_img/three.jpg",
            firstName: "name3",
            id: 3
        },
        {
            address: "Blah4",
            image: "../images/tmp_trav_img/four.jpg",
            firstName: "name4",
            id: 4
        },
        {
            address: "Blah5",
            image: "../images/tmp_trav_img/five.jpg",
            firstName: "name5",
            id: 5
        },
        {
            address: "Blah6",
            image: "../images/tmp_trav_img/six.jpg",
            firstName: "name6",
            id: 6
        },
        {
            address: "Blah7",
            image: "../images/tmp_trav_img/seven.jpg",
            firstName: "name7",
            id: 7
        },

    ];




    $scope.dum_trav = [{
        "_id" : "58f72f6594b427e59aec3916",
        "displayName" : "Ying Shen",
        "email" : "Ying.Shen@gmail.com",
        "facebookId" : "6257455234",
        "image" : "http://localhost:3000/images/static/profile6.jpg",
        "city" : "Beijing",
        "address" : "Si Ji Qing Pai Chu Suo （ Dong Ran Bei Jie ）, Haidian Qu, Beijing Shi, China, 100195",
        "traveling" : true,
        "travelingDest" : [
            "Tel Aviv",
            "Tel Aviv-Yafo"
        ],
        "comments" : [],
        "country" : "China",
        "photos" : [
            "http://localhost:3000/images/uploads/78df7785246f1661cc3a2c558d03aee9.jpg",
            "http://localhost:3000/images/uploads/fd8e8e04f48165544f8f57ef87e32c90.jpg"
        ],
        "gender" : "Male",
        "apptInfo" : {
            "description" : "A beautiful villa",
            "about" : "A new spacious villa, one floor. All commodities, jacuzzi and beautiful scenery. Ideal for families or friends. The villa is located in the exclusive residence area, offers easy access",
            "property" : "House",
            "room" : "Entire Place",
            "guests" : "6",
            "essentials" : true,
            "wifi" : true,
            "kitchen" : true,
            "heating" : true,
            "airconditioning" : true,
            "events" : true,
            "parking" : true,
            "kids" : true,
            "tv" : true,
            "smoking" : true,
            "pool" : true,
            "pets" : true,
            "bathroom" : true
        },
        "paymentInfo" : {},
        "swaps" : 1.0,
        "firstName" : "Ying",
        "lastName" : "Shen",
        "rating" : -1.0,
        "departure" : "",
        "returnDate" : "",
        "travelingInfo" : [
            {
                "id" : 786544,
                "dest" : "Tel Aviv-Yafo",
                "departure" : 1496696400000.0,
                "returnDate" : 1497301200000.0
            }
        ],
        "aboutMe" : "This is a short description of myself, my interests are music and art, and I like to travel",
        "ocupation" : "Optometrist"
    },
        {
            "_id" : "58f7841194b427e59aec391d",
            "displayName" : "Shenna C. Rainey",
            "email" : "j@gmail.com",
            "facebookId" : "3453c3434",
            "image" : "http://localhost:3000/images/static/profile10.jpg",
            "city" : "New York",
            "address" : "1872 3rd Ave, New York, NY 10029, USA",
            "traveling" : true,
            "travelingDest" : [
                "Tel Aviv"
            ],
            "comments" : [],
            "country" : "United States",
            "photos" : [
                "http://localhost:3000/images/uploads/75dcd309ad11226c1f05c8a398177534.jpg",
                "http://localhost:3000/images/uploads/e65309f1179166d3a4212a2fcb959cdd.jpg",
                "http://localhost:3000/images/uploads/96b068af1df67172edbf3e0f33350528.jpg"
            ],
            "gender" : "female",
            "apptInfo" : {
                "bathroom" : false,
                "pool" : false,
                "smoking" : false,
                "elevator" : false,
                "babies" : true,
                "wheelchair" : false,
                "heating" : true,
                "kithcen" : true,
                "pets" : true,
                "kids" : false,
                "about" : "The apartment is furnished for comfort. The kitchen has a Nespresso machine, oven, microwave, electric kettle, toaster and more, all of which are at your complete disposal. The living room has cable television for your entertainment and some magazines.",
                "dryer" : false,
                "washing" : false,
                "tv" : false,
                "visitors" : true,
                "airconditioning" : false,
                "wifi" : true,
                "essentials" : true,
                "description" : "Cozy double bedroom with balcony",
                "property" : "House",
                "room" : "Entire Place",
                "guests" : "2",
                "parking" : true,
                "events" : false,
                "kitchen" : true
            },
            "paymentInfo" : {},
            "swaps" : 1.0,
            "firstName" : "Shenna",
            "lastName" : "Rainey",
            "rating" : 4.0,
            "departure" : "",
            "returnDate" : "",
            "age" : 28.0,
            "aboutMe" : "This is a short description of myself, my interests are music and art, and I like to travel",
            "ocupation" : "Nurse",
            "travelingInfo" : [
                {
                    "id" : "48492",
                    "dest" : "Tel Aviv",
                    "departure" : 1494706400000.0,
                    "returnDate" : 1495006400000.0
                }
            ]
        },
        {
            "_id" : "58ff444b241286110c78e7fe",
            "firstName" : "Yair",
            "lastName" : "Sterman",
            "displayName" : "Yair Sterman",
            "gender" : "male",
            "age" : 27,
            "email" : "yair.sterman@gmail.com",
            "facebookId" : "10158639790345601",
            "image" : "https://scontent.ftlv2-1.fna.fbcdn.net/v/t1.0-1/p160x160/1977210_10154039364980601_336080314_n.jpg?oh=751e4aa872914c8429472a5b08775ff5&oe=5A8888F7",
            "country" : "Israel",
            "city" : "Tel Aviv-Yafo",
            "address" : "Maze St 45, Tel Aviv-Yafo, Israel",
            "swaps" : 0,
            "traveling" : true,
            "travelingDest" : [
                "Tel Aviv",
                "Paris",
                "Paris",
                "Berlin"
            ],
            "updated_at" : "2017-04-25T12:42:51.507Z",
            "photos" : [
                "http://localhost:3000/images/uploads/7bdfdcb1b69211e6b2a4d23d7b8e531c.jpg",
                "http://localhost:3000/images/uploads/e01f3636d2d4f990ef4d289443431c54.jpg",
                "http://localhost:3000/images/uploads/23b0e45ae36b2f374e64f16d8d888679.jpg",
                "http://localhost:3000/images/uploads/154d10b1af139a2fb2dc028ebfdc047b.jpg",
                "http://localhost:3000/images/uploads/f05ba7156f05eb0f9d65d2c338ed1812.jpg"
            ],
            "reviews" : [
                {
                    "userId" : "58f7846e94b427e59aec391e",
                    "name" : "David",
                    "country" : "USA",
                    "city" : "New York",
                    "image" : "http://localhost:3000/images/static/profile9.jpg",
                    "date" : "1274534124534",
                    "review" : "We had a great time in yair's; house, everything was just as expected. Yair also left our house in perfect condition and was a wonderful guest"
                },
                {
                    "userId" : "58f730d994b427e59aec3919",
                    "name" : "Noelle",
                    "country" : "South Africa",
                    "city" : "Johannesburg",
                    "image" : "http://localhost:3000/images/static/profile2.jpeg",
                    "date" : "1244534534534",
                    "review" : "My friends and I stayed at Yair's house and; it was amazing, he was very nice and answered any questions we had during are visit. my home was clean and neet when I retured and my roomates said they had a great time with yair. Thank You!"
                }
            ],
            "__v" : 0,
            "aboutMe" : "This is a short description of myself, my interests are music and art, and I like to travel",
            "ocupation" : "Software Developer",
            "apptInfo" : {
                "kitchen" : true,
                "events" : false,
                "parking" : true,
                "guests" : "4",
                "room" : "Entire Place",
                "property" : "House",
                "description" : "Beautiful, comfortable Appartment",
                "essentials" : true,
                "wifi" : true,
                "airconditioning" : true,
                "visitors" : true,
                "tv" : true,
                "washing" : true,
                "dryer" : false,
                "about" : "This beautiful house sits right on the blakumstah lake, with a wonderful view of the valley. The house is great for a quiet vacation and is suitable for families.",
                "kids" : true,
                "pets" : true,
                "kithcen" : true,
                "heating" : false,
                "wheelchair" : false,
                "babies" : false,
                "elevator" : false,
                "smoking" : false,
                "pool" : false,
                "bathroom" : false
            },
            "rating" : 5.0,
            "travelingDates" : {
                "departure" : "1374534124534",
                "returnDate" : "1374944124534"
            },
            "messages" : [
                {
                    "id" : "58f731c994b427e59aec391a",
                    "image" : "http://localhost:3000/images/static/profile3.jpg",
                    "name" : "Wan Ung Kuen",
                    "messages" : [
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1494173037541.0,
                            "read" : false,
                            "message" : ""
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1494173147709.0,
                            "read" : false,
                            "message" : "Hello Wan!"
                        },
                        {
                            "id" : "58f731c994b427e59aec391a",
                            "date" : 1494838899695.0,
                            "read" : false,
                            "message" : "Hello Yair, how are you?"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1494839087344.0,
                            "read" : false,
                            "message" : "Requested to swap on 05/09/2017 - 05/13/2017"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1494839322889.0,
                            "read" : false,
                            "isRequest" : true,
                            "message" : "Requested to swap on 05/08/2017 - 05/14/2017"
                        },
                        {
                            "id" : "58f731c994b427e59aec391a",
                            "date" : 1494841974829.0,
                            "read" : false,
                            "isRequest" : false,
                            "message" : "OK!"
                        },
                        {
                            "id" : "58f731c994b427e59aec391a",
                            "date" : 1494842162818.0,
                            "read" : false,
                            "isRequest" : false,
                            "message" : "let me see if thats a good time"
                        }
                    ]
                },
                {
                    "id" : "58f72fc894b427e59aec3917",
                    "image" : "http://localhost:3000/images/static/profile1.jpg",
                    "name" : "Terry undefined",
                    "messages" : [
                        {
                            "id" : "58f72fc894b427e59aec3917",
                            "date" : 1493848593056.0,
                            "read" : false,
                            "message" : "Hello yair,\nI am traveling to tel aviv next week and I am looking for a place to stay"
                        },
                        {
                            "id" : "58f72fc894b427e59aec3917",
                            "date" : 1493849012425.0,
                            "read" : false,
                            "message" : "Hello Terry undefined, that is a very unusual name.\nyou seem like someone I would swap apartments with."
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493849290832.0,
                            "read" : false,
                            "message" : "Sorry that last message was suppose to be sent by me, development malfunction..."
                        },
                        {
                            "id" : "58f72fc894b427e59aec3917",
                            "date" : 1493849402477.0,
                            "read" : false,
                            "message" : "Yes I understand, that happens sometimes.."
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493849546415.0,
                            "read" : false,
                            "message" : "anyway about the apartment I think it would be fine if we could swap next week while I'm in Toronto."
                        },
                        {
                            "id" : "58f72fc894b427e59aec3917",
                            "date" : 1493882654639.0,
                            "read" : false,
                            "message" : "Great! my roomates are going to be in the apartment so i'll give you their contact info for when you arrive"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493882867915.0,
                            "read" : false,
                            "message" : "that sounds good. i'll be in touch"
                        }
                    ]
                },
                {
                    "id" : "58f7324594b427e59aec391b",
                    "image" : "http://localhost:3000/images/static/profile5.jpg",
                    "name" : "Marisha Natarajan",
                    "messages" : [
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : "2017-05-02T16:17:55.039Z",
                            "read" : false,
                            "message" : "Hello marisha,\nI would like to swap apartments with you"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493751267205.0,
                            "read" : false,
                            "message" : "Sorry I've already found someone to swap with, maybe next time!\nGood luck!"
                        },
                        {
                            "id" : "58f7324594b427e59aec391b",
                            "date" : 1494843098072.0,
                            "read" : false,
                            "isRequest" : true,
                            "message" : "Requested to swap on 05/08/2017 - 05/13/2017"
                        }
                    ]
                },
                {
                    "id" : "58f7853994b427e59aec3920",
                    "image" : "http://localhost:3000/images/static/profile8.jpg",
                    "name" : "Joséphine Phaneuf",
                    "messages" : [
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "message" : "Hey Josiphine!\ni'd like to swap apartments with you next week, is that a good time for you?"
                        },
                        {
                            "id" : "58f7853994b427e59aec3920",
                            "message" : "Hi Yair,\nI looked at your apartment and it seems very nice. when will you be arriving in Paris?"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "message" : "I'll be in Paris by Monday night but I am leaving here a couple of days ealier so feel free to stay at my place."
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "message" : "Sorry, on Tuesday night"
                        },
                        {
                            "id" : "58f7853994b427e59aec3920",
                            "message" : "That will be great! I'll except your request"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493752125396.0,
                            "read" : false,
                            "message" : "thanks"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493807794085.0,
                            "read" : false,
                            "message" : null
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493882763762.0,
                            "read" : false,
                            "message" : "hey! I left my key in the electric box for you"
                        }
                    ]
                }
            ],
            "travelingInfo" : [
                {
                    "id" : 376478,
                    "dest" : "Tel Aviv",
                    "departure" : 1494536400000.0,
                    "returnDate" : 1494536400000.0
                },
                {
                    "id" : 827633,
                    "dest" : "Paris",
                    "departure" : 1501016400000.0,
                    "returnDate" : 1501362000000.0
                },
                {
                    "id" : 631006,
                    "dest" : "Berlin",
                    "departure" : 1498683600000.0,
                    "returnDate" : 1501707600000.0
                }
            ],
            "requests" : [
                {
                    "id" : "58f7324594b427e59aec391b",
                    "image" : "http://localhost:3000/images/static/profile5.jpg",
                    "name" : "Marisha Natarajan",
                    "city" : null,
                    "departure" : 1494190800000.0,
                    "returnDate" : 1494622800000.0,
                    "status" : "Confirm"
                },
                {
                    "id" : "58f731c994b427e59aec391a",
                    "image" : "http://localhost:3000/images/static/profile3.jpg",
                    "name" : "Wan Ung Kuen",
                    "city" : "Bangkok",
                    "departure" : 1494190800000.0,
                    "returnDate" : 1494709200000.0,
                    "status" : "Pending"
                },
                {
                    "id" : "58f731c994b427e59aec391a",
                    "image" : "http://localhost:3000/images/static/profile3.jpg",
                    "name" : "Wan Ung Kuen",
                    "city" : "Bangkok",
                    "departure" : 1494277200000.0,
                    "returnDate" : 1494622800000.0,
                    "status" : "Pending"
                }
            ]
        },
        {
            "_id" : "58f72f6594b427e59aec3916",
            "displayName" : "Ying Shen",
            "email" : "Ying.Shen@gmail.com",
            "facebookId" : "6257455234",
            "image" : "http://localhost:3000/images/static/profile6.jpg",
            "city" : "Beijing",
            "address" : "Si Ji Qing Pai Chu Suo （ Dong Ran Bei Jie ）, Haidian Qu, Beijing Shi, China, 100195",
            "traveling" : true,
            "travelingDest" : [
                "Tel Aviv",
                "Tel Aviv-Yafo"
            ],
            "comments" : [],
            "country" : "China",
            "photos" : [
                "http://localhost:3000/images/uploads/78df7785246f1661cc3a2c558d03aee9.jpg",
                "http://localhost:3000/images/uploads/fd8e8e04f48165544f8f57ef87e32c90.jpg"
            ],
            "gender" : "Male",
            "apptInfo" : {
                "description" : "A beautiful villa",
                "about" : "A new spacious villa, one floor. All commodities, jacuzzi and beautiful scenery. Ideal for families or friends. The villa is located in the exclusive residence area, offers easy access",
                "property" : "House",
                "room" : "Entire Place",
                "guests" : "6",
                "essentials" : true,
                "wifi" : true,
                "kitchen" : true,
                "heating" : true,
                "airconditioning" : true,
                "events" : true,
                "parking" : true,
                "kids" : true,
                "tv" : true,
                "smoking" : true,
                "pool" : true,
                "pets" : true,
                "bathroom" : true
            },
            "paymentInfo" : {},
            "swaps" : 1.0,
            "firstName" : "Ying",
            "lastName" : "Shen",
            "rating" : -1.0,
            "departure" : "",
            "returnDate" : "",
            "travelingInfo" : [
                {
                    "id" : 786544,
                    "dest" : "Tel Aviv-Yafo",
                    "departure" : 1496696400000.0,
                    "returnDate" : 1497301200000.0
                }
            ],
            "aboutMe" : "This is a short description of myself, my interests are music and art, and I like to travel",
            "ocupation" : "Optometrist"
        },
        {
            "_id" : "58f7841194b427e59aec391d",
            "displayName" : "Shenna C. Rainey",
            "email" : "j@gmail.com",
            "facebookId" : "3453c3434",
            "image" : "http://localhost:3000/images/static/profile10.jpg",
            "city" : "New York",
            "address" : "1872 3rd Ave, New York, NY 10029, USA",
            "traveling" : true,
            "travelingDest" : [
                "Tel Aviv"
            ],
            "comments" : [],
            "country" : "United States",
            "photos" : [
                "http://localhost:3000/images/uploads/75dcd309ad11226c1f05c8a398177534.jpg",
                "http://localhost:3000/images/uploads/e65309f1179166d3a4212a2fcb959cdd.jpg",
                "http://localhost:3000/images/uploads/96b068af1df67172edbf3e0f33350528.jpg"
            ],
            "gender" : "female",
            "apptInfo" : {
                "bathroom" : false,
                "pool" : false,
                "smoking" : false,
                "elevator" : false,
                "babies" : true,
                "wheelchair" : false,
                "heating" : true,
                "kithcen" : true,
                "pets" : true,
                "kids" : false,
                "about" : "The apartment is furnished for comfort. The kitchen has a Nespresso machine, oven, microwave, electric kettle, toaster and more, all of which are at your complete disposal. The living room has cable television for your entertainment and some magazines.",
                "dryer" : false,
                "washing" : false,
                "tv" : false,
                "visitors" : true,
                "airconditioning" : false,
                "wifi" : true,
                "essentials" : true,
                "description" : "Cozy double bedroom with balcony",
                "property" : "House",
                "room" : "Entire Place",
                "guests" : "2",
                "parking" : true,
                "events" : false,
                "kitchen" : true
            },
            "paymentInfo" : {},
            "swaps" : 1.0,
            "firstName" : "Shenna",
            "lastName" : "Rainey",
            "rating" : 4.0,
            "departure" : "",
            "returnDate" : "",
            "age" : 28.0,
            "aboutMe" : "This is a short description of myself, my interests are music and art, and I like to travel",
            "ocupation" : "Nurse",
            "travelingInfo" : [
                {
                    "id" : "48492",
                    "dest" : "Tel Aviv",
                    "departure" : 1494706400000.0,
                    "returnDate" : 1495006400000.0
                }
            ]
        },
        {
            "_id" : "58ff444b241286110c78e7fe",
            "firstName" : "Yair",
            "lastName" : "Sterman",
            "displayName" : "Yair Sterman",
            "gender" : "male",
            "age" : 27,
            "email" : "yair.sterman@gmail.com",
            "facebookId" : "10158639790345601",
            "image" : "https://scontent.ftlv2-1.fna.fbcdn.net/v/t1.0-1/p160x160/1977210_10154039364980601_336080314_n.jpg?oh=751e4aa872914c8429472a5b08775ff5&oe=5A8888F7",
            "country" : "Israel",
            "city" : "Tel Aviv-Yafo",
            "address" : "Maze St 45, Tel Aviv-Yafo, Israel",
            "swaps" : 0,
            "traveling" : true,
            "travelingDest" : [
                "Tel Aviv",
                "Paris",
                "Paris",
                "Berlin"
            ],
            "updated_at" : "2017-04-25T12:42:51.507Z",
            "photos" : [
                "http://localhost:3000/images/uploads/7bdfdcb1b69211e6b2a4d23d7b8e531c.jpg",
                "http://localhost:3000/images/uploads/e01f3636d2d4f990ef4d289443431c54.jpg",
                "http://localhost:3000/images/uploads/23b0e45ae36b2f374e64f16d8d888679.jpg",
                "http://localhost:3000/images/uploads/154d10b1af139a2fb2dc028ebfdc047b.jpg",
                "http://localhost:3000/images/uploads/f05ba7156f05eb0f9d65d2c338ed1812.jpg"
            ],
            "reviews" : [
                {
                    "userId" : "58f7846e94b427e59aec391e",
                    "name" : "David",
                    "country" : "USA",
                    "city" : "New York",
                    "image" : "http://localhost:3000/images/static/profile9.jpg",
                    "date" : "1274534124534",
                    "review" : "We had a great time in yair's; house, everything was just as expected. Yair also left our house in perfect condition and was a wonderful guest"
                },
                {
                    "userId" : "58f730d994b427e59aec3919",
                    "name" : "Noelle",
                    "country" : "South Africa",
                    "city" : "Johannesburg",
                    "image" : "http://localhost:3000/images/static/profile2.jpeg",
                    "date" : "1244534534534",
                    "review" : "My friends and I stayed at Yair's house and; it was amazing, he was very nice and answered any questions we had during are visit. my home was clean and neet when I retured and my roomates said they had a great time with yair. Thank You!"
                }
            ],
            "__v" : 0,
            "aboutMe" : "This is a short description of myself, my interests are music and art, and I like to travel",
            "ocupation" : "Software Developer",
            "apptInfo" : {
                "kitchen" : true,
                "events" : false,
                "parking" : true,
                "guests" : "4",
                "room" : "Entire Place",
                "property" : "House",
                "description" : "Beautiful, comfortable Appartment",
                "essentials" : true,
                "wifi" : true,
                "airconditioning" : true,
                "visitors" : true,
                "tv" : true,
                "washing" : true,
                "dryer" : false,
                "about" : "This beautiful house sits right on the blakumstah lake, with a wonderful view of the valley. The house is great for a quiet vacation and is suitable for families.",
                "kids" : true,
                "pets" : true,
                "kithcen" : true,
                "heating" : false,
                "wheelchair" : false,
                "babies" : false,
                "elevator" : false,
                "smoking" : false,
                "pool" : false,
                "bathroom" : false
            },
            "rating" : 5.0,
            "travelingDates" : {
                "departure" : "1374534124534",
                "returnDate" : "1374944124534"
            },
            "messages" : [
                {
                    "id" : "58f731c994b427e59aec391a",
                    "image" : "http://localhost:3000/images/static/profile3.jpg",
                    "name" : "Wan Ung Kuen",
                    "messages" : [
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1494173037541.0,
                            "read" : false,
                            "message" : ""
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1494173147709.0,
                            "read" : false,
                            "message" : "Hello Wan!"
                        },
                        {
                            "id" : "58f731c994b427e59aec391a",
                            "date" : 1494838899695.0,
                            "read" : false,
                            "message" : "Hello Yair, how are you?"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1494839087344.0,
                            "read" : false,
                            "message" : "Requested to swap on 05/09/2017 - 05/13/2017"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1494839322889.0,
                            "read" : false,
                            "isRequest" : true,
                            "message" : "Requested to swap on 05/08/2017 - 05/14/2017"
                        },
                        {
                            "id" : "58f731c994b427e59aec391a",
                            "date" : 1494841974829.0,
                            "read" : false,
                            "isRequest" : false,
                            "message" : "OK!"
                        },
                        {
                            "id" : "58f731c994b427e59aec391a",
                            "date" : 1494842162818.0,
                            "read" : false,
                            "isRequest" : false,
                            "message" : "let me see if thats a good time"
                        }
                    ]
                },
                {
                    "id" : "58f72fc894b427e59aec3917",
                    "image" : "http://localhost:3000/images/static/profile1.jpg",
                    "name" : "Terry undefined",
                    "messages" : [
                        {
                            "id" : "58f72fc894b427e59aec3917",
                            "date" : 1493848593056.0,
                            "read" : false,
                            "message" : "Hello yair,\nI am traveling to tel aviv next week and I am looking for a place to stay"
                        },
                        {
                            "id" : "58f72fc894b427e59aec3917",
                            "date" : 1493849012425.0,
                            "read" : false,
                            "message" : "Hello Terry undefined, that is a very unusual name.\nyou seem like someone I would swap apartments with."
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493849290832.0,
                            "read" : false,
                            "message" : "Sorry that last message was suppose to be sent by me, development malfunction..."
                        },
                        {
                            "id" : "58f72fc894b427e59aec3917",
                            "date" : 1493849402477.0,
                            "read" : false,
                            "message" : "Yes I understand, that happens sometimes.."
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493849546415.0,
                            "read" : false,
                            "message" : "anyway about the apartment I think it would be fine if we could swap next week while I'm in Toronto."
                        },
                        {
                            "id" : "58f72fc894b427e59aec3917",
                            "date" : 1493882654639.0,
                            "read" : false,
                            "message" : "Great! my roomates are going to be in the apartment so i'll give you their contact info for when you arrive"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493882867915.0,
                            "read" : false,
                            "message" : "that sounds good. i'll be in touch"
                        }
                    ]
                },
                {
                    "id" : "58f7324594b427e59aec391b",
                    "image" : "http://localhost:3000/images/static/profile5.jpg",
                    "name" : "Marisha Natarajan",
                    "messages" : [
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : "2017-05-02T16:17:55.039Z",
                            "read" : false,
                            "message" : "Hello marisha,\nI would like to swap apartments with you"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493751267205.0,
                            "read" : false,
                            "message" : "Sorry I've already found someone to swap with, maybe next time!\nGood luck!"
                        },
                        {
                            "id" : "58f7324594b427e59aec391b",
                            "date" : 1494843098072.0,
                            "read" : false,
                            "isRequest" : true,
                            "message" : "Requested to swap on 05/08/2017 - 05/13/2017"
                        }
                    ]
                },
                {
                    "id" : "58f7853994b427e59aec3920",
                    "image" : "http://localhost:3000/images/static/profile8.jpg",
                    "name" : "Joséphine Phaneuf",
                    "messages" : [
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "message" : "Hey Josiphine!\ni'd like to swap apartments with you next week, is that a good time for you?"
                        },
                        {
                            "id" : "58f7853994b427e59aec3920",
                            "message" : "Hi Yair,\nI looked at your apartment and it seems very nice. when will you be arriving in Paris?"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "message" : "I'll be in Paris by Monday night but I am leaving here a couple of days ealier so feel free to stay at my place."
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "message" : "Sorry, on Tuesday night"
                        },
                        {
                            "id" : "58f7853994b427e59aec3920",
                            "message" : "That will be great! I'll except your request"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493752125396.0,
                            "read" : false,
                            "message" : "thanks"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493807794085.0,
                            "read" : false,
                            "message" : null
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493882763762.0,
                            "read" : false,
                            "message" : "hey! I left my key in the electric box for you"
                        }
                    ]
                }
            ],
            "travelingInfo" : [
                {
                    "id" : 376478,
                    "dest" : "Tel Aviv",
                    "departure" : 1494536400000.0,
                    "returnDate" : 1494536400000.0
                },
                {
                    "id" : 827633,
                    "dest" : "Paris",
                    "departure" : 1501016400000.0,
                    "returnDate" : 1501362000000.0
                },
                {
                    "id" : 631006,
                    "dest" : "Berlin",
                    "departure" : 1498683600000.0,
                    "returnDate" : 1501707600000.0
                }
            ],
            "requests" : [
                {
                    "id" : "58f7324594b427e59aec391b",
                    "image" : "http://localhost:3000/images/static/profile5.jpg",
                    "name" : "Marisha Natarajan",
                    "city" : null,
                    "departure" : 1494190800000.0,
                    "returnDate" : 1494622800000.0,
                    "status" : "Confirm"
                },
                {
                    "id" : "58f731c994b427e59aec391a",
                    "image" : "http://localhost:3000/images/static/profile3.jpg",
                    "name" : "Wan Ung Kuen",
                    "city" : "Bangkok",
                    "departure" : 1494190800000.0,
                    "returnDate" : 1494709200000.0,
                    "status" : "Pending"
                },
                {
                    "id" : "58f731c994b427e59aec391a",
                    "image" : "http://localhost:3000/images/static/profile3.jpg",
                    "name" : "Wan Ung Kuen",
                    "city" : "Bangkok",
                    "departure" : 1494277200000.0,
                    "returnDate" : 1494622800000.0,
                    "status" : "Pending"
                }
            ]
        },
        {
            "_id" : "58f72f6594b427e59aec3916",
            "displayName" : "Ying Shen",
            "email" : "Ying.Shen@gmail.com",
            "facebookId" : "6257455234",
            "image" : "http://localhost:3000/images/static/profile6.jpg",
            "city" : "Beijing",
            "address" : "Si Ji Qing Pai Chu Suo （ Dong Ran Bei Jie ）, Haidian Qu, Beijing Shi, China, 100195",
            "traveling" : true,
            "travelingDest" : [
                "Tel Aviv",
                "Tel Aviv-Yafo"
            ],
            "comments" : [],
            "country" : "China",
            "photos" : [
                "http://localhost:3000/images/uploads/78df7785246f1661cc3a2c558d03aee9.jpg",
                "http://localhost:3000/images/uploads/fd8e8e04f48165544f8f57ef87e32c90.jpg"
            ],
            "gender" : "Male",
            "apptInfo" : {
                "description" : "A beautiful villa",
                "about" : "A new spacious villa, one floor. All commodities, jacuzzi and beautiful scenery. Ideal for families or friends. The villa is located in the exclusive residence area, offers easy access",
                "property" : "House",
                "room" : "Entire Place",
                "guests" : "6",
                "essentials" : true,
                "wifi" : true,
                "kitchen" : true,
                "heating" : true,
                "airconditioning" : true,
                "events" : true,
                "parking" : true,
                "kids" : true,
                "tv" : true,
                "smoking" : true,
                "pool" : true,
                "pets" : true,
                "bathroom" : true
            },
            "paymentInfo" : {},
            "swaps" : 1.0,
            "firstName" : "Ying",
            "lastName" : "Shen",
            "rating" : -1.0,
            "departure" : "",
            "returnDate" : "",
            "travelingInfo" : [
                {
                    "id" : 786544,
                    "dest" : "Tel Aviv-Yafo",
                    "departure" : 1496696400000.0,
                    "returnDate" : 1497301200000.0
                }
            ],
            "aboutMe" : "This is a short description of myself, my interests are music and art, and I like to travel",
            "ocupation" : "Optometrist"
        },
        {
            "_id" : "58f7841194b427e59aec391d",
            "displayName" : "Shenna C. Rainey",
            "email" : "j@gmail.com",
            "facebookId" : "3453c3434",
            "image" : "http://localhost:3000/images/static/profile10.jpg",
            "city" : "New York",
            "address" : "1872 3rd Ave, New York, NY 10029, USA",
            "traveling" : true,
            "travelingDest" : [
                "Tel Aviv"
            ],
            "comments" : [],
            "country" : "United States",
            "photos" : [
                "http://localhost:3000/images/uploads/75dcd309ad11226c1f05c8a398177534.jpg",
                "http://localhost:3000/images/uploads/e65309f1179166d3a4212a2fcb959cdd.jpg",
                "http://localhost:3000/images/uploads/96b068af1df67172edbf3e0f33350528.jpg"
            ],
            "gender" : "female",
            "apptInfo" : {
                "bathroom" : false,
                "pool" : false,
                "smoking" : false,
                "elevator" : false,
                "babies" : true,
                "wheelchair" : false,
                "heating" : true,
                "kithcen" : true,
                "pets" : true,
                "kids" : false,
                "about" : "The apartment is furnished for comfort. The kitchen has a Nespresso machine, oven, microwave, electric kettle, toaster and more, all of which are at your complete disposal. The living room has cable television for your entertainment and some magazines.",
                "dryer" : false,
                "washing" : false,
                "tv" : false,
                "visitors" : true,
                "airconditioning" : false,
                "wifi" : true,
                "essentials" : true,
                "description" : "Cozy double bedroom with balcony",
                "property" : "House",
                "room" : "Entire Place",
                "guests" : "2",
                "parking" : true,
                "events" : false,
                "kitchen" : true
            },
            "paymentInfo" : {},
            "swaps" : 1.0,
            "firstName" : "Shenna",
            "lastName" : "Rainey",
            "rating" : 4.0,
            "departure" : "",
            "returnDate" : "",
            "age" : 28.0,
            "aboutMe" : "This is a short description of myself, my interests are music and art, and I like to travel",
            "ocupation" : "Nurse",
            "travelingInfo" : [
                {
                    "id" : "48492",
                    "dest" : "Tel Aviv",
                    "departure" : 1494706400000.0,
                    "returnDate" : 1495006400000.0
                }
            ]
        },
        {
            "_id" : "58ff444b241286110c78e7fe",
            "firstName" : "Yair",
            "lastName" : "Sterman",
            "displayName" : "Yair Sterman",
            "gender" : "male",
            "age" : 27,
            "email" : "yair.sterman@gmail.com",
            "facebookId" : "10158639790345601",
            "image" : "https://scontent.ftlv2-1.fna.fbcdn.net/v/t1.0-1/p160x160/1977210_10154039364980601_336080314_n.jpg?oh=751e4aa872914c8429472a5b08775ff5&oe=5A8888F7",
            "country" : "Israel",
            "city" : "Tel Aviv-Yafo",
            "address" : "Maze St 45, Tel Aviv-Yafo, Israel",
            "swaps" : 0,
            "traveling" : true,
            "travelingDest" : [
                "Tel Aviv",
                "Paris",
                "Paris",
                "Berlin"
            ],
            "updated_at" : "2017-04-25T12:42:51.507Z",
            "photos" : [
                "http://localhost:3000/images/uploads/7bdfdcb1b69211e6b2a4d23d7b8e531c.jpg",
                "http://localhost:3000/images/uploads/e01f3636d2d4f990ef4d289443431c54.jpg",
                "http://localhost:3000/images/uploads/23b0e45ae36b2f374e64f16d8d888679.jpg",
                "http://localhost:3000/images/uploads/154d10b1af139a2fb2dc028ebfdc047b.jpg",
                "http://localhost:3000/images/uploads/f05ba7156f05eb0f9d65d2c338ed1812.jpg"
            ],
            "reviews" : [
                {
                    "userId" : "58f7846e94b427e59aec391e",
                    "name" : "David",
                    "country" : "USA",
                    "city" : "New York",
                    "image" : "http://localhost:3000/images/static/profile9.jpg",
                    "date" : "1274534124534",
                    "review" : "We had a great time in yair's; house, everything was just as expected. Yair also left our house in perfect condition and was a wonderful guest"
                },
                {
                    "userId" : "58f730d994b427e59aec3919",
                    "name" : "Noelle",
                    "country" : "South Africa",
                    "city" : "Johannesburg",
                    "image" : "http://localhost:3000/images/static/profile2.jpeg",
                    "date" : "1244534534534",
                    "review" : "My friends and I stayed at Yair's house and; it was amazing, he was very nice and answered any questions we had during are visit. my home was clean and neet when I retured and my roomates said they had a great time with yair. Thank You!"
                }
            ],
            "__v" : 0,
            "aboutMe" : "This is a short description of myself, my interests are music and art, and I like to travel",
            "ocupation" : "Software Developer",
            "apptInfo" : {
                "kitchen" : true,
                "events" : false,
                "parking" : true,
                "guests" : "4",
                "room" : "Entire Place",
                "property" : "House",
                "description" : "Beautiful, comfortable Appartment",
                "essentials" : true,
                "wifi" : true,
                "airconditioning" : true,
                "visitors" : true,
                "tv" : true,
                "washing" : true,
                "dryer" : false,
                "about" : "This beautiful house sits right on the blakumstah lake, with a wonderful view of the valley. The house is great for a quiet vacation and is suitable for families.",
                "kids" : true,
                "pets" : true,
                "kithcen" : true,
                "heating" : false,
                "wheelchair" : false,
                "babies" : false,
                "elevator" : false,
                "smoking" : false,
                "pool" : false,
                "bathroom" : false
            },
            "rating" : 5.0,
            "travelingDates" : {
                "departure" : "1374534124534",
                "returnDate" : "1374944124534"
            },
            "messages" : [
                {
                    "id" : "58f731c994b427e59aec391a",
                    "image" : "http://localhost:3000/images/static/profile3.jpg",
                    "name" : "Wan Ung Kuen",
                    "messages" : [
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1494173037541.0,
                            "read" : false,
                            "message" : ""
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1494173147709.0,
                            "read" : false,
                            "message" : "Hello Wan!"
                        },
                        {
                            "id" : "58f731c994b427e59aec391a",
                            "date" : 1494838899695.0,
                            "read" : false,
                            "message" : "Hello Yair, how are you?"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1494839087344.0,
                            "read" : false,
                            "message" : "Requested to swap on 05/09/2017 - 05/13/2017"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1494839322889.0,
                            "read" : false,
                            "isRequest" : true,
                            "message" : "Requested to swap on 05/08/2017 - 05/14/2017"
                        },
                        {
                            "id" : "58f731c994b427e59aec391a",
                            "date" : 1494841974829.0,
                            "read" : false,
                            "isRequest" : false,
                            "message" : "OK!"
                        },
                        {
                            "id" : "58f731c994b427e59aec391a",
                            "date" : 1494842162818.0,
                            "read" : false,
                            "isRequest" : false,
                            "message" : "let me see if thats a good time"
                        }
                    ]
                },
                {
                    "id" : "58f72fc894b427e59aec3917",
                    "image" : "http://localhost:3000/images/static/profile1.jpg",
                    "name" : "Terry undefined",
                    "messages" : [
                        {
                            "id" : "58f72fc894b427e59aec3917",
                            "date" : 1493848593056.0,
                            "read" : false,
                            "message" : "Hello yair,\nI am traveling to tel aviv next week and I am looking for a place to stay"
                        },
                        {
                            "id" : "58f72fc894b427e59aec3917",
                            "date" : 1493849012425.0,
                            "read" : false,
                            "message" : "Hello Terry undefined, that is a very unusual name.\nyou seem like someone I would swap apartments with."
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493849290832.0,
                            "read" : false,
                            "message" : "Sorry that last message was suppose to be sent by me, development malfunction..."
                        },
                        {
                            "id" : "58f72fc894b427e59aec3917",
                            "date" : 1493849402477.0,
                            "read" : false,
                            "message" : "Yes I understand, that happens sometimes.."
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493849546415.0,
                            "read" : false,
                            "message" : "anyway about the apartment I think it would be fine if we could swap next week while I'm in Toronto."
                        },
                        {
                            "id" : "58f72fc894b427e59aec3917",
                            "date" : 1493882654639.0,
                            "read" : false,
                            "message" : "Great! my roomates are going to be in the apartment so i'll give you their contact info for when you arrive"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493882867915.0,
                            "read" : false,
                            "message" : "that sounds good. i'll be in touch"
                        }
                    ]
                },
                {
                    "id" : "58f7324594b427e59aec391b",
                    "image" : "http://localhost:3000/images/static/profile5.jpg",
                    "name" : "Marisha Natarajan",
                    "messages" : [
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : "2017-05-02T16:17:55.039Z",
                            "read" : false,
                            "message" : "Hello marisha,\nI would like to swap apartments with you"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493751267205.0,
                            "read" : false,
                            "message" : "Sorry I've already found someone to swap with, maybe next time!\nGood luck!"
                        },
                        {
                            "id" : "58f7324594b427e59aec391b",
                            "date" : 1494843098072.0,
                            "read" : false,
                            "isRequest" : true,
                            "message" : "Requested to swap on 05/08/2017 - 05/13/2017"
                        }
                    ]
                },
                {
                    "id" : "58f7853994b427e59aec3920",
                    "image" : "http://localhost:3000/images/static/profile8.jpg",
                    "name" : "Joséphine Phaneuf",
                    "messages" : [
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "message" : "Hey Josiphine!\ni'd like to swap apartments with you next week, is that a good time for you?"
                        },
                        {
                            "id" : "58f7853994b427e59aec3920",
                            "message" : "Hi Yair,\nI looked at your apartment and it seems very nice. when will you be arriving in Paris?"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "message" : "I'll be in Paris by Monday night but I am leaving here a couple of days ealier so feel free to stay at my place."
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "message" : "Sorry, on Tuesday night"
                        },
                        {
                            "id" : "58f7853994b427e59aec3920",
                            "message" : "That will be great! I'll except your request"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493752125396.0,
                            "read" : false,
                            "message" : "thanks"
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493807794085.0,
                            "read" : false,
                            "message" : null
                        },
                        {
                            "id" : "58ff444b241286110c78e7fe",
                            "date" : 1493882763762.0,
                            "read" : false,
                            "message" : "hey! I left my key in the electric box for you"
                        }
                    ]
                }
            ],
            "travelingInfo" : [
                {
                    "id" : 376478,
                    "dest" : "Tel Aviv",
                    "departure" : 1494536400000.0,
                    "returnDate" : 1494536400000.0
                },
                {
                    "id" : 827633,
                    "dest" : "Paris",
                    "departure" : 1501016400000.0,
                    "returnDate" : 1501362000000.0
                },
                {
                    "id" : 631006,
                    "dest" : "Berlin",
                    "departure" : 1498683600000.0,
                    "returnDate" : 1501707600000.0
                }
            ],
            "requests" : [
                {
                    "id" : "58f7324594b427e59aec391b",
                    "image" : "http://localhost:3000/images/static/profile5.jpg",
                    "name" : "Marisha Natarajan",
                    "city" : null,
                    "departure" : 1494190800000.0,
                    "returnDate" : 1494622800000.0,
                    "status" : "Confirm"
                },
                {
                    "id" : "58f731c994b427e59aec391a",
                    "image" : "http://localhost:3000/images/static/profile3.jpg",
                    "name" : "Wan Ung Kuen",
                    "city" : "Bangkok",
                    "departure" : 1494190800000.0,
                    "returnDate" : 1494709200000.0,
                    "status" : "Pending"
                },
                {
                    "id" : "58f731c994b427e59aec391a",
                    "image" : "http://localhost:3000/images/static/profile3.jpg",
                    "name" : "Wan Ung Kuen",
                    "city" : "Bangkok",
                    "departure" : 1494277200000.0,
                    "returnDate" : 1494622800000.0,
                    "status" : "Pending"
                }
            ]
        }
    ];

});
