var pro = null;
swapsApp.controller('profileController', function($scope, $rootScope, $document, $routeParams, $window, $anchorScroll, $interval, MessageService, UsersService, $location, $window) {
    pro = $scope;
    $scope.message = {};
    $scope.user = $rootScope.user;

    $anchorScroll();

    UsersService.getProfile($routeParams.id).then(function(data){
    	$scope.profile = data.data;
        $scope.age = getAge($scope.profile.birthday);
    	setPhotoGalery();
    });

    $scope.go = function(path){
      $location.url('/' + path);
    }

    $scope.openRequest = function(){
        if(!$rootScope.user._id){
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
            var startDate = new Date($scope.profile.travelingInfo[i].departure).toLocaleDateString();
            var endDate = new Date($scope.profile.travelingInfo[i].returnDate).toLocaleDateString();
            $('#datepicker' + i).daterangepicker({
                autoApply: true,
                opens: 'center',
                startDate: startDate,
                endDate: endDate,
                minDate: startDate,
                maxDate: endDate,
                singleDatePicker: true,
                drops: "up"
            });
            $('#datepicker' + i).on('showCalendar.daterangepicker', function(ev, picker) {
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
            setDates();
            // fixmeTop = $('.fix-scroll').offset().top - 25;
            fixmeTop = $('.fix-scroll').offset().top + 70;
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
            $('input[name="swapDates"]').daterangepicker({
                autoApply: true,
                opens: 'center',
                locale: {
                    format: 'MM/DD/YYYY'
                },
            });
            $interval.cancel(elementsReady);
        }
    }, 100);

    $scope.more = true;
    $scope.readMore = function() {
        if ($scope.more) {
            $('.grab-read-more').removeClass('read-more-activation');
            $('.plain-text.read-more-button').html('Read less');
            $scope.more = false;
        } else {
            $('.grab-read-more').addClass('read-more-activation');
            $('.plain-text.read-more-button').html('Read more');
            $scope.more = true;
        }
    };

    $scope.isCheckedAmenity = function(index){
        if($scope.profile && $scope.profile.apptInfo && $scope.profile.apptInfo.amenities){
            return $scope.profile.apptInfo.amenities.includes(index);
        }
        else{
            return false;
        }
    }

    //  Generates a boolean array of length 5 according to the rating:
    //  5 stars will generate [true, true, true, true, true]
    //  3 stars will generate [true, true, true, false, false] etc.
    $scope.generateStars = function(rating) {
        var ret = [];
        var i = 1;
        while (i <= rating) {
            ret.push(true);
            ++i;
        }
        while (i <= 5) {
            ret.push(false);
            ++i;
        }
        return ret;
    };
});
