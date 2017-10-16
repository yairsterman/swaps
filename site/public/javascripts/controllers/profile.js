var pro = null;
swapsApp.controller('profileController', function($scope, $rootScope, $routeParams, $window, $anchorScroll, $interval, MessageService, UsersService, $location) {
    pro = $scope;
    $scope.message = {};
    $scope.user = $rootScope.user;

    $anchorScroll();

    UsersService.getProfile($routeParams.id).then(function(data){
    	$scope.profile = data.data;
    	setPhotoGalery();
    });

    $scope.go = function(path){
      $location.url('/' + path);
    }

    $scope.openRequest = function(){
        if(!$scope.user._id){
            $('#loginModal').modal('show');
        }
        else{
            $('#requestModal').modal('show');
        }
    }

    $scope.sendMessage = function(){
        var message = $scope.message.message;
        $scope.message.message = '';
        MessageService.sendMessage($rootScope.user, $scope.profile._id, message).then(function(data){
            $scope.messageSent = true;
            $('#requestModal').modal('hide');
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


    function setDates(){
        for (var i = 0; i < $scope.profile.travelingInfo.length; i++) {
            var startDate = new Date($scope.profile.travelingInfo[i].departure);
            var endDate = new Date($scope.profile.travelingInfo[i].returnDate);
            $('#datefilter' + i).daterangepicker({
                autoApply: true,
                opens: 'center',
                startDate: startDate,
                endDate: endDate,
                minDate: startDate,
                maxDate: endDate,
                singleDatePicker: true,
                opens: "left",
                drops: "up"
            });
            $('#datefilter' + i).on('showCalendar.daterangepicker', function(ev, picker) {
                $('.available').css({
                    backgroundColor: '#008500',
                    cursor: 'not-allowed',
                    color: '#fff'
                });
                $('.next').css({
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: 'rgba(0,0,0,0.87)'
                });
                $('.prev').css({
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: 'rgba(0,0,0,0.87)'
                });
                $('.disabled').css({
                    textDecoration: 'none'
                });
            });
        }
    }

    var vw = (document.documentElement.clientWidth/100);
    var fixmeTop;     // get initial position of the element

    var elementsReady = $interval(function() {
        var input = $('.fix-scroll');
        var dates = document.getElementById('datefilter0');
        if (input && dates && $scope.profile) {
            setDates();
            fixmeTop = $('.fix-scroll').offset().top - (7.5 * vw);
            $(window).scroll(function() {                  // assign scroll event listener
                var currentScroll = $(window).scrollTop(); // get current position
                if (currentScroll >= fixmeTop) {           // apply position: fixed if you
                    $('.fix-scroll').css({                      // scroll to that element or below it
                        position: 'fixed',
                        top: '7.5vw',
                        right: '0'
                    });
                } else {                                    // apply position: static
                    $('.fix-scroll').css({                      // if you scroll above it
                        position: 'static'
                    });
                }
            });
            $interval.cancel(elementsReady);
        }
    }, 100);


    $scope.basicAmenities = {
    "kitchen": "Kitchen",
    "tv": "TV",
    "wifi": "Wi-Fi",
    "airconditioning": "Air Conditioning",
    "washer": "Washer",
    "dryer": "Dryer",
    "heating": "Heating"
    // "pets",
    // "wheelchair",
    // "babies",
    // "smoking",
    // "bathroom"
    };

    $scope.houseFacilities = {
        "elevator": "Elevator",
        "parking": "Parking Space",
        "pool": "Pool"
    };

    var backup_profile = {
        "_id": "58ff444b241286110c78e7fe",
        "firstName": "Yair",
        "lastName": "Sterman",
        "displayName": "Yair Sterman",
        "gender": "male",
        "age": 27,
        "email": "yair.sterman@gmail.com",
        "facebookId": "10158639790345601",
        "image": "https://scontent.ftlv2-1.fna.fbcdn.net/v/t1.0-1/p160x160/1977210_10154039364980601_336080314_n.jpg?oh=751e4aa872914c8429472a5b08775ff5&oe=5A8888F7",
        "country": "Israel",
        "city": "Tel Aviv-Yafo",
        "address": "Maze St 45, Tel Aviv-Yafo, Israel",
        "swaps": 0,
        "traveling": true,
        "travelingDest": [
            "Tel Aviv",
            "Paris",
            "Paris",
            "Berlin"
        ],
        "updated_at": "2017-04-25T12:42:51.507Z",
        "photos": [
            "http://localhost:3000/images/uploads/7bdfdcb1b69211e6b2a4d23d7b8e531c.jpg",
            "http://localhost:3000/images/uploads/e01f3636d2d4f990ef4d289443431c54.jpg",
            "http://localhost:3000/images/uploads/23b0e45ae36b2f374e64f16d8d888679.jpg",
            "http://localhost:3000/images/uploads/154d10b1af139a2fb2dc028ebfdc047b.jpg",
            "http://localhost:3000/images/uploads/f05ba7156f05eb0f9d65d2c338ed1812.jpg"
        ],
        "reviews": [
            {
                "userId": "58f7846e94b427e59aec391e",
                "name": "David",
                "country": "USA",
                "city": "New York",
                "image": "http://localhost:3000/images/static/profile9.jpg",
                "date": "1274534124534",
                "review": "We had a great time in yair's; house, everything was just as expected. Yair also left our house in perfect condition and was a wonderful guest"
            },
            {
                "userId": "58f730d994b427e59aec3919",
                "name": "Noelle",
                "country": "South Africa",
                "city": "Johannesburg",
                "image": "http://localhost:3000/images/static/profile2.jpeg",
                "date": "1244534534534",
                "review": "My friends and I stayed at Yair's house and; it was amazing, he was very nice and answered any questions we had during are visit. my home was clean and neet when I retured and my roomates said they had a great time with yair. Thank You!"
            }
        ],
        "__v": 0,
        "aboutMe": "This is a short description of myself, my interests are music and art, and I like to travel",
        "ocupation": "Software Developer",
        "apptInfo": {
            "kitchen": true,
            "events": false,
            "parking": true,
            "guests": "4",
            "room": "Entire Place",
            "property": "House",
            "description": "Beautiful, comfortable Appartment",
            "essentials": true,
            "wifi": true,
            "airconditioning": true,
            "visitors": true,
            "tv": true,
            "washing": true,
            "dryer": false,
            "about": "This beautiful house sits right on the blakumstah lake, with a wonderful view of the valley. The house is great for a quiet vacation and is suitable for families.",
            "kids": true,
            "pets": true,
            "kithcen": true,
            "heating": false,
            "wheelchair": false,
            "babies": false,
            "elevator": false,
            "smoking": false,
            "pool": false,
            "bathroom": false
        },
        "rating": 5.0,
        "travelingDates": {
            "departure": "1374534124534",
            "returnDate": "1374944124534"
        },
        "messages": [
            {
                "id": "58f731c994b427e59aec391a",
                "image": "http://localhost:3000/images/static/profile3.jpg",
                "name": "Wan Ung Kuen",
                "messages": [
                    {
                        "id": "58ff444b241286110c78e7fe",
                        "date": 1494173037541.0,
                        "read": false,
                        "message": ""
                    },
                    {
                        "id": "58ff444b241286110c78e7fe",
                        "date": 1494173147709.0,
                        "read": false,
                        "message": "Hello Wan!"
                    },
                    {
                        "id": "58f731c994b427e59aec391a",
                        "date": 1494838899695.0,
                        "read": false,
                        "message": "Hello Yair, how are you?"
                    },
                    {
                        "id": "58ff444b241286110c78e7fe",
                        "date": 1494839087344.0,
                        "read": false,
                        "message": "Requested to swap on 05/09/2017 - 05/13/2017"
                    },
                    {
                        "id": "58ff444b241286110c78e7fe",
                        "date": 1494839322889.0,
                        "read": false,
                        "isRequest": true,
                        "message": "Requested to swap on 05/08/2017 - 05/14/2017"
                    },
                    {
                        "id": "58f731c994b427e59aec391a",
                        "date": 1494841974829.0,
                        "read": false,
                        "isRequest": false,
                        "message": "OK!"
                    },
                    {
                        "id": "58f731c994b427e59aec391a",
                        "date": 1494842162818.0,
                        "read": false,
                        "isRequest": false,
                        "message": "let me see if thats a good time"
                    }
                ]
            }]
    };

});
