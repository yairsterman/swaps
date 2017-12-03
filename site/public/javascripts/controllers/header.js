var he = null;
swapsApp.controller('headerController', function($scope, $rootScope, $location, $document, UsersService, AccountService, $interval) {
	he = $scope;
	$scope.user = $rootScope.user;
	$scope.homepage = $rootScope.homepage;
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

    $scope.loginCallBack = function(userId){
		UsersService.getUser(userId).then(function(data){
			$rootScope.user = data.data;
			$scope.user = $rootScope.user;
			$rootScope.userCity = $scope.user.city;
			$('#loginModal').modal('hide');
			$rootScope.$broadcast('login-success');
	    });
    };

    $scope.searchSwap = function(){
        var where = $rootScope.search.where;
        if(!where || where == ''){
            where	= 'Anywhere';
        }
        else{
            where = where.split(',')[0]
        }
        $scope.go('travelers/' + where + '?dates=' + $rootScope.search.when + '&guests=' + $rootScope.search.guests);
    }

	$scope.openDate = function(){
		$('input[name="searchDate"]').daterangepicker({
			autoApply: true,
			opens: 'center',
			locale: {
	            format: 'MMM DD'
	        }
		});
		$('input[name="searchDate"]').on('apply.daterangepicker', function(ev, picker) {
            $rootScope.search.when = picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY');
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
	});

	$scope.go = function(path){
        $(window).unbind('scroll');
		$('#flyNowModal').modal('hide');
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

	$scope.FBLogin = function(){
		window.popup = window.open('http://localhost:3000/auth/facebook', 'newwindow', 'width=640, height=400');
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
