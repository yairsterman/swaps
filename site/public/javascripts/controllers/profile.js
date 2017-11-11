var pro = null;
swapsApp.controller('profileController', function($scope, $rootScope, $document, $routeParams, $window, $anchorScroll, $interval, MessageService, UsersService, $location, $window) {
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

    var fixmeTop;     // get initial position of the element

    $.fn.scrollBottom = function() {
        return $document.height() - this.scrollTop() - this.height();
    };

    // var elementsReady = $interval(function() {
    //     // $('.circle-profile-pic').hide();
    //     var input = $('.fix-scroll');
    //     if (input && $scope.profile) {
    //         // setDates();
    //         // fixmeTop = $('.fix-scroll').offset().top - 25;
    //         fixmeTop = $('.fix-scroll').offset().top;
    //         var bottom = $(window).height() - fixmeTop - $('.fix-scroll').height();
    //         $(window).scroll(function() {                  // assign scroll event listener
    //             var currentScroll = $(window).scrollBottom(); // get current position
    //             if ($(this).scrollTop() >= -bottom) {           // apply position: fixed if you
    //                 $('.profile-description').css({                      // scroll to that element or below it
    //                     position: 'fixed',
    //                     bottom: '10px',
    //                     right: '0'
    //                 });
    //                 // console.log(window.innerWidth);
    //                 if (window.innerWidth > 768) {
    //                     // $('.circle-profile-pic').fadeIn(500);
    //                     $('.circle-profile-pic').css({
    //                         'transition': 'all 0.4s ease',
    //                         '-webkit-transition': 'all 0.4s ease',
    //                         '-moz-transition': 'all 0.4s ease',
    //                         '-o-transition': 'all 0.4s ease',
    //                         width: '100px',
    //                         height: '100px',
    //                         opacity: '1',
    //                         'margin-top': '0',
    //                         'margin-right': '0'
    //                     }, 200);
    //                 } else {
    //                     $('.circle-profile-pic').fadeIn(500);
    //                 }
    //             } else {                                    // apply position: static
    //                 $('.profile-description').css({                      // if you scroll above it
    //                     position: 'static'
    //                 });
    //                 // $('.circle-profile-pic').fadeOut(500);
    //                 if (window.innerWidth > 768) {
    //                     $('.circle-profile-pic').css({
    //                         'transition': 'all 0.4s ease',
    //                         '-webkit-transition': 'all 0.4s ease',
    //                         '-moz-transition': 'all 0.4s ease',
    //                         '-o-transition': 'all 0.4s ease',
    //                         'width': '10px',
    //                         'height': '10px',
    //                         opacity: '0',
    //                         'margin-top': '-270px',
    //                         'margin-right': '200px'
    //                     }, 200);
    //                 } else {
    //                     $('.circle-profile-pic').fadeOut(500);
    //                 }
    //                 // $('.circle-profile-pic').text("@media (max-width: @screen-xs-max) {width: 50px; height: 50px; margin-right: 10px;}")
    //             }
    //         });
    //         $interval.cancel(elementsReady);
    //     }
    // }, 100);

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

    $(document).ready(function(){
        $('.icon').waypoint(function() {
            $('.icon').addClass('spinner');
            }, { offset: '100%'});
    });


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
