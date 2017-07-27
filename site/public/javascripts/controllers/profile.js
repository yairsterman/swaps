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


});
