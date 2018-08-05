var he = null;
swapsApp.controller('headerController', function($scope, $rootScope, $location, $document, UsersService, AccountService, $uibModal) {
	he = $scope;
	$scope.user = $rootScope.user;
	$scope.homepage = $rootScope.homepage;
    $scope.localeFormat = 'MMM DD';
    $scope.modelFormat = 'MM/DD/YYYY';

	if($rootScope.user && $rootScope.user.city){
		$rootScope.userCity = $rootScope.user.city;
    }
	$scope.fly ={
		guests: 2
	};
	if(!$rootScope.search){
        $rootScope.search ={
            guests: 2
        };
	}

	function successFunction(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        codeLatLng(lat, lng);
    }

    function errorFunction(){
        $rootScope.$broadcast('geolocation-complete', {failed: true});
    }

	var geocoder =  new google.maps.Geocoder();

	var address = {
      types: ['address']
    };

    $scope.openLogin = function(signin){
        $scope.signin = signin;
        $scope.modelInstance = $uibModal.open({
            animation: true,
            templateUrl: '../../directives/login/login.html',
            size: 'sm',
            controller: 'loginController',
            scope:$scope
        });
    }

    $scope.searchSwap = function(e){
        e.preventDefault();
        var where = $rootScope.search.where;
        // if(!where || where == ''){
        //     where	= 'Anywhere';
        // }
        // else{
        //     where = where.split(',')[0]
        // }
        $scope.go(`travelers${where?'/'+where:''}?dates=${$rootScope.search.when}&guests=${$rootScope.search.guests}`);
    }

    $scope.autoSearch = function(){
        var where = $rootScope.search.where;
        $scope.go(`travelers${where?'/'+where:''}?dates=${$rootScope.search.when}&guests=${$rootScope.search.guests}`);
    }

    $scope.openSwapDates = function (){
        $scope.popup = true;
        $scope.swaps = $scope.user.travelingInfo;
        $scope.modelInstance = $uibModal.open({
            animation: true,
            templateUrl: '../../directives/swaps/swaps.html',
            size: 'lg',
            controller: 'swapsController',
            scope: $scope
        });
    }

    $scope.$on('auth-return', function(event, args) {
	    $scope.user = $rootScope.user;
		if($scope.user && $scope.user.city){
			$rootScope.userCity = $scope.user.city;
	    }
		else{
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
			}
		}
        getUnreadMessages();
	});

	$scope.go = function(path){
        $(window).unbind('scroll');
        $('.navbar').removeClass('sticky');
        $('.fb-messenger-icon').removeClass('hide');
        $rootScope.searchPage = false;
        if(path == 'account/messages'){
            $scope.unread = 0;
        }
	   $location.url('/' + path);
	}

	$scope.logout = function(){
	   AccountService.logout().then(function(data){
		   	$scope.user = null;
		   	$rootScope.user = null;
		   	$location.url('/');
	   });
	}

    $scope.$on('gmPlacesAutocomplete::placeChanged', function(){
        console.log('Place has changed');
    });


    $scope.removeDates = function(){
        $rootScope.search.when = undefined;
        $rootScope.search.date = undefined;
    }

    $scope.$on('login-success', function(event, args) {
        $scope.user = $rootScope.user;
        $rootScope.userCity = $scope.user.city;
        getUnreadMessages();
    });

    function getUnreadMessages(){
        if(!$scope.user._id){
            $scope.unread = 0;
            return;
        }
        $scope.unread = $scope.user.messages.filter(function(message){
            return !message.read;
        }).length;
    }

	function codeLatLng(lat, lng) {
        var latlng = new google.maps.LatLng(lat, lng);
        geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    var flag = false;
                    //find country name
                    for (var i=0; i<results[0].address_components.length; i++) {
                        for (var b=0;b<results[0].address_components[i].types.length;b++) {
                            //there are different types that might hold a city admin_area_lvl_1 usually does in some cases looking for sublocality type will be more appropriate
                            if (results[0].address_components[i].types[b] == 'locality' || results[0].address_components[i].types[b] == "administrative_area_level_1") {
                                //this is the object you are looking for
                                $rootScope.userCity = results[0].address_components[i].short_name;
								$scope.$apply();
                                flag = true;
                                break;
                            }
                        }
                        if(flag){
                            $rootScope.$broadcast('geolocation-complete', $rootScope.userCity);
                            break;
                        }
                    }
                }
            }
        });
    }
});
