var pro = null;
swapsApp.controller('profileController', function($scope, $rootScope, $document, $routeParams, $window, $anchorScroll, $interval, MessageService, UsersService, $location, $uibModal, $filter, AccountService) {
    pro = $scope;
    $scope.message = {};
    $scope.user = $rootScope.user;
    $scope.showMore = {
        aboutMe: {active:false},
        aboutHome: {active:false},
    }

    $scope.swap = {
        guests: 2,
        when:{}
    };

    $anchorScroll();

    UsersService.getProfile($routeParams.id).then(function(data){
    	$scope.profile = data.data;
        $scope.age = getAge($scope.profile.birthday);
    	setPhotoGalery();
    	if($scope.user._id){
            var requests = $scope.user.requests.map(function(request){
                return request.userId;
            });
            $scope.requestSent = requests.includes($scope.profile._id);
        }
    });

    $scope.go = function(path){
      $location.url('/' + path);
    }

    $scope.openRequest = function(){
        if(!$rootScope.user._id){
            $('#loginModal').modal('show');
        }
        else{
            $scope.modelInstance = $uibModal.open({
                animation: true,
                templateUrl: '../../directives/request/request.html',
                size: 'sm',
                controller: 'requestController',
                scope: $scope
            });
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
        if(!$scope.profile.travelingInfo || $scope.profile.travelingInfo.length == 0){
            $scope.notSwapping = true;
            $('input[name="swapDates"]').daterangepicker({
                autoApply: true,
                opens: 'left',
                locale: {
                    format: 'MM/DD/YYYY'
                },
                minDate: new Date().toLocaleDateString(),
            });
            $('input[name="swapDates"]').on('apply.daterangepicker', function(ev, picker) {
                $scope.swap.from = picker.startDate.format('MMMM DD, YYYY');
                $scope.swap.to = picker.endDate.format('MMMM DD, YYYY');
            });
            return;
        }
        var startDate = new Date($scope.profile.travelingInfo[0].departure).toLocaleDateString();
        var endDate = new Date($scope.profile.travelingInfo[0].returnDate).toLocaleDateString();
        $scope.swap.from = $filter('date')($scope.profile.travelingInfo[0].departure, 'MMMM dd, yyyy');
        $scope.swap.to = $filter('date')($scope.profile.travelingInfo[0].returnDate, 'MMMM dd, yyyy');
        $('input[name="swapDates"]').daterangepicker({
            autoApply: true,
            opens: 'left',
            locale: {
                format: 'MM/DD/YYYY'
            },
            startDate: startDate,
            endDate: endDate,
            minDate: startDate,
            maxDate: endDate
        });
        $('input[name="swapDates"]').on('apply.daterangepicker', function(ev, picker) {
            $scope.swap.from = picker.startDate.format('MMMM DD, YYYY');
            $scope.swap.to = picker.endDate.format('MMMM DD, YYYY');
        });
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
            fixmeTop = $('.fix-scroll').offset().top + 20;
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
            setDates();
            $interval.cancel(elementsReady);
        }
    }, 100);

    $scope.readMore = function(showMore, about) {
        showMore[about].active  = !showMore[about].active;
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

    $scope.isFavoriteFlag = false;
    $scope.isFavorite = function() {
        if (!$scope.isFavoriteFlag) {
            $scope.innerIsFavorite();
            $scope.isFavoriteFlag = true;
        }
    };

    $scope.innerIsFavorite = function() {
        var ans = AccountService.isFavorite($scope.profile._id);
        console.log("Got ans = " + JSON.stringify(ans));
        return ans;
    };

    $scope.addToFavorites = function() {
        var favorite = {
            _id: $scope.profile._id
            // displayName: $scope.profile.displayName,
            // email: $scope.profile.email,
            // image: $scope.profile.image,
            // country: $scope.profile.country,
            // city: $scope.profile.city
        };
        AccountService.addFavorite(favorite);
    };

    $scope.removeFromFavorites = function() {
        var id = $scope.profile._id;
        AccountService.removeFavorite(id);
    };

});
