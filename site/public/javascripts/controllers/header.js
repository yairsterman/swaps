var he = null;
swapsApp.controller('headerController', function($scope, $rootScope, $location, $document, UsersService, AccountService, $interval) {
	he = $scope;
	$scope.user = $rootScope.user;
	$scope.homepage = $rootScope.homepage;
	if($rootScope.user && $rootScope.user.city){
		$rootScope.userCity = $rootScope.user.city;
    }
	$scope.fly ={
		guests: 1
	};
	if(!$rootScope.search){
        $rootScope.search ={
            guests: 1
        };
	}

    var autocompleteSearch;

	function successFunction(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        codeLatLng(lat, lng);
    }

    function errorFunction(){
        alert("Geocoder failed");
    }

	var geocoder =  new google.maps.Geocoder();

	var address = {
      types: ['address']
    };

    var elementsReady = $interval(function() {
        var input = $('#searchCityHeader');
        if (input.length > 0) {
            autocompleteSearch = new google.maps.places.Autocomplete($document[0].getElementById('searchCityHeader'), {
                types: ['(cities)']
            });
            $interval.cancel(elementsReady);
        }
    }, 100);


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

	$scope.autocompleteCities = function(){
        autocompleteSearch.addListener('place_changed', function() {
            $rootScope.search.where = autocompleteSearch.getPlace().name;
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

	$scope.openFlyNow = function(){
		if(!$scope.user._id){
			$('#loginModal').modal('show');
		}
		else{
			$('#flyNowModal').modal('show');
			$('input[name="datefilter"]').daterangepicker({
				autoApply: true,
				opens: 'center',
				locale: {
		            format: 'MMM DD'
		        }
			});
			$('input[name="datefilter"]').val('');
			$('input[name="datefilter"]').on('apply.daterangepicker', function(ev, picker) {
		      $scope.fly.when = picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY');
		  	});
			$scope.fly.date = null;
			var autocomplete = new google.maps.places.Autocomplete($document[0].getElementById('where'), {
		      types: ['(cities)']
		    });
			autocomplete.addListener('place_changed', function() {
				$scope.fly.where = autocomplete.getPlace().name;
			});
		}
	}

	$scope.saveTravelInfo = function(){
		if(!$scope.fly.where){
			$scope.fly.where = 'Anywhere'
		}
		if(!$scope.fly.date){
			$scope.fly.date = 'Anytime'
		}
	   AccountService.saveTravelInfo($scope.user._id, $scope.fly).then(function(data){
		   $rootScope.user = data.data;
		   $scope.user = $rootScope.user;
	   });
	}

	$scope.logout = function(){
	   AccountService.logout().then(function(data){
		   	$scope.user = null;
		   	$rootScope.user = null;
		   	$location.url('/');
	   });
	}

	$scope.FBLogin = function(){
		window.popup = window.open('http://swapshome.com:3000/auth/facebook', 'newwindow', 'width=640, height=400');
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
								// $rootScope.$broadcast('geolocation-found', $rootScope.userCity);
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


	// var elementsReady = $interval(function() {
    //   var input = $document[0].getElementById('address');
    //   if (input) {
    //     autocomplete = new google.maps.places.Autocomplete($document[0].getElementById('address'), address);
    //     $interval.cancel(elementsReady);
    //   }
    // }, 100);

});
