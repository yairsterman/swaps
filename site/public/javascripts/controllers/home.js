var ho = null;
swapsApp.controller('homeController', function($scope, $rootScope, $location, $window, $document,$timeout, $interval, $uibModal, UsersService, HomeService) {
    ho = $scope;
    $scope.user = $rootScope.user;
    $scope.map = null;
    $scope.slideIndex = 0;
    $scope.featured = [];
    $scope.options = ['cities'];
	  $scope.range3 = [
	    { value: 0, text: '+ day before'},
      { value: 1, text: '+ day after'},
      { value: 2, text: '± 1 day'},
      { value: 3, text: '± 2 days'},
      { value: 4, text: '± 3 days'},
      { value: 5, text: 'exact dates'},
    ];
    $scope.rangeOptions1 = [];
	  $scope.rangeOptions2 = [];
	  $scope.duration = '';
    $rootScope.homepage = true;
    $scope.localeFormat = 'MMM DD';
    $scope.modelFormat = 'MM/DD/YYYY';
    $rootScope.search.range1 = "5";
    $rootScope.search.range2 = "5";
    $scope.rangeLabel = 'Custom range';
	  $scope.weekdays = [
	    ["Sunday", "Sun"],
      ["Monday", "Mon"],
		  ["Tuesday", "Tue"],
		  ["Wednesday", "Wen"],
		  ["Thursday", "Thu"],
		  ["Friday", "Fri"],
		  ["Saturday", "Sat"]
    ];

	  $scope.cities = [
        {
            "name": "Venice",
            "normal": "../images/cities/updated/venice.jpg",
            "faded": "../images/cities/updated/venice2.jpg"
        },
        {
            "name": "Miami",
            "normal": "../images/cities/updated/miami.jpg",
            "faded": "../images/cities/updated/miami2.jpg"
        },
        {
            "name": "London",
            "normal": "../images/cities/updated/london.jpg",
            "faded": "../images/cities/updated/london2.jpg"
        },
        {
            "name": "Sydney",
            "normal": "../images/cities/updated/sydney.jpg",
            "faded": "../images/cities/updated/sydney2.jpg"
        },
        {
            "name": "Paris",
            "normal": "../images/cities/updated/paris.jpg",
            "faded": "../images/cities/updated/paris2.jpg"
        },
    ];

    init();

    $scope.rangeOptions1 = $scope.range3;
    $scope.rangeOptions2 = $scope.range3;

    $scope.datesRange = function (startDate, endDate) {
	    var dates = [],
        currentDate = startDate,
		    addDays = function(days) {
			    var date = new Date(this.valueOf());
			    date.setDate(date.getDate() + days);
			    return date;
		    };
	    while (currentDate <= endDate) {
		    dates.push(currentDate);
		    currentDate = addDays.call(currentDate, 1);
	    }
	    return dates;
    };

    $scope.changeDates = function () {
      if($rootScope.search.when) {
	      var depart = new Date($rootScope.search.when.split('-')[0]);
	      var sat = new Date($rootScope.search.when.split('-')[0]);
	      var Saturday = new Date(sat.setDate(sat.getDate() - sat.getDay() + 6));
	      var range1 = $scope.datesRange(depart, Saturday);
	      $timeout(function() {
		      $scope.rangeLabel = $rootScope.search.chosenLabel;
		      if($scope.rangeLabel === 'Weekends') {
			      $scope.rangeOptions1 = [];
			      $scope.rangeOptions2 = [];
			      range1.forEach(function (item) {
				      if($scope.weekdays[item.getDay()][0] !== "Saturday") {
					      $scope.rangeOptions1.push(
						      {value: $scope.weekdays[item.getDay()][0], text: $scope.weekdays[item.getDay()][0]},
						      {value: $scope.weekdays[item.getDay()][1] + ' AM', text: $scope.weekdays[item.getDay()][1] + ' AM'},
						      {value: $scope.weekdays[item.getDay()][1] + ' PM', text: $scope.weekdays[item.getDay()][1] + ' PM'});
				      }
				      else {
					      $scope.rangeOptions1.push(
						      {value: $scope.weekdays[item.getDay()][0], text: $scope.weekdays[item.getDay()][0]},
						      {value: $scope.weekdays[item.getDay()][1] + ' AM', text: $scope.weekdays[item.getDay()][1] + ' AM'});
				      }
			      });
			      $rootScope.search.range1 = $scope.weekdays[depart.getDay()][0];
			      $scope.rangeOptions2.push(
				      {value: $scope.weekdays[0][0], text: $scope.weekdays[0][0]},
				      {value: $scope.weekdays[0][1] + ' PM', text: $scope.weekdays[0][1] + ' PM'},
				      {value: $scope.weekdays[0][1] + ' AM', text: $scope.weekdays[0][1] + ' AM'},
				      {value: $scope.weekdays[1][1] + ' PM', text: $scope.weekdays[1][0] + ' PM'},
				      {value: $scope.weekdays[1][1] + ' AM', text: $scope.weekdays[1][1] + ' AM'}
			      );

			      $rootScope.search.range2 = $scope.weekdays[0][0];
		      }
		      else if($scope.rangeLabel === 'Custom Range') {
			      $scope.rangeOptions1 = [];
			      $scope.rangeOptions2 = [];
			      $rootScope.search.range1 = "5";
			      $rootScope.search.range2 = "5";
			      $scope.range3.forEach(function (item) {
				      $scope.rangeOptions1.push(item)
				      $scope.rangeOptions2.push(item)
			      });
		      }
		      else {
			      $scope.rangeOptions1 = [];
			      $scope.rangeOptions2 = [];
		      }
	      },300);
      }
    };

    $scope.searchSwap = function(e){
        e.preventDefault();
        var where = $rootScope.search.where;
        // if(!where || where == ''){
        //     where	= 'Anywhere';
        // }
        // else{
        //     where = where.split(',')[0]
        // }
      var searchData = {
          where: where,
          dates: $rootScope.search.when,
          guests: $rootScope.search.guests,
          range: {
              type: $scope.rangeLabel,
              departureRange: $rootScope.search.range1,
              returnRange: $rootScope.search.range2,
              duration: $scope.duration
          }
      };

	    HomeService.search('request-link', searchData).then(function(data) {
		    if (data.data.error) {
			    console.log("search error");
			    return;
		    }
		    else {
			    $scope.go(`travelers${where?'/'+where:''}?dates=${$rootScope.search.when}&guests=${$rootScope.search.guests}`);
		    }
	    });
    }

    $scope.go = function(path){
        $(window).unbind('scroll');
        $('.navbar').removeClass('sticky');
        $rootScope.homepage = false;
        $location.url(path);
    }

    $scope.changeImage = function(index){
        $scope.featured[index] = $scope.cities[index].faded;
    };

    $scope.changeImageBack = function(index){
        $scope.featured[index] = $scope.cities[index].normal;
    };

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

    $scope.choosePlan = function(plan){
        if(!$scope.user || !$scope.user._id){
            $scope.go('/faq#securityDeposit');
        }
        else{
            $scope.go('/account/listing?plan='+plan);
        }
    };

    function init(){
        angular.forEach($scope.cities, function(value, key) {
            $scope.featured[key] = value.faded;
            $scope.featured[key] = value.normal;
        });

        if(($rootScope.geolocationComplete && !$rootScope.geolocationComplete.failed) || $rootScope.userCity){
            getUsers();
        }
        else{
            UsersService.getFeaturedUsers().then(function(data) {
                if (data.data.error) {
                    console.log("error");
                    return;
                }
                $scope.travelers = data.data.users;
                $scope.swapperTitle = 'new';
            });
        }
    }

    $rootScope.$on('geolocation-complete', function(event, args) {
        if($rootScope.geolocationComplete){
            return;
        }
        $rootScope.geolocationComplete = {failed: args.failed};
        if(args.failed){
            UsersService.getFeaturedUsers().then(function(data) {
                if(data.data.error){
                    console.log("error");
                    return;
                }
                $scope.travelers = data.data.users;
            });
        }
        else{
            getUsers();
        }
    });

    $.fn.scrollBottom = function() {
        return $document.height() - this.scrollTop() - this.height();
    };


    $scope.removeDates = function(){
        $rootScope.search.when = undefined;
        $rootScope.search.date = undefined;
    }

    $scope.openLogin = function(signin){
        $scope.modelInstance = $uibModal.open({
            animation: true,
            templateUrl: '../../directives/login/login.html',
            size: 'sm',
            controller: 'loginController',
            resolve: {
                signin: function () {
                    return signin;
                }
            },
            scope:$scope
        });
    }

    function getUsers(){
        UsersService.getUsers({page:0, destination:$rootScope.userCity}).then(function(data) {
            if(data.error){
                console.log("error");
                return;
            }
            $scope.travelers = data.users;
            $scope.swapperTitle = 'city';
            if($scope.travelers.length < 3){
                UsersService.getFeaturedUsers().then(function(data) {
                    if (data.data.error) {
                        console.log("error");
                        return;
                    }
                    $scope.travelers = data.data.users;
                    $scope.swapperTitle = 'new';
                });
            }
        });
    }

    var fixmeTop;     // get initial position of the element

    var elementsReady = $interval(function() {
        var input = $('.navbar');
        if (input.length > 0) {
            fixmeTop = $('.search-area').offset().top + 80;
            $(window).scroll(function() {                  // assign scroll event listener
                var currentScroll = $(window).scrollTop(); // get current position
                if (currentScroll >= fixmeTop) {
                    if(!$('.navbar').hasClass('navbar-other')){
                        $('.navbar').addClass('navbar-other').addClass('no-opacity');
                        $timeout(function(){
                            if(!$('.navbar').hasClass('navbar-other')){
                                $('.navbar').addClass('navbar-other');
                            }
                            $('.navbar').addClass('sticky');
                            $('.navbar').addClass('opacity');
                            $('.navbar').removeClass('no-opacity');
                        },500)
                    }
                } else {
                    $('.navbar').removeClass('opacity');
                    $timeout(function(){
                        if($('.navbar').hasClass('opacity')){
                            $('.navbar').removeClass('opacity');
                        }
                        $('.navbar').removeClass('navbar-other');
                        $('.navbar').removeClass('sticky');
                    },500);
                }
            });
            var fixmeHomes = $('#featuredHomes').offset().top;
            $(window).scroll(function() {                  // assign scroll event listener
                var currentScroll = $(window).scrollTop(); // get current position
                if (currentScroll >= fixmeHomes) {
                    $('.description-icon').css({'animation': 'bounce 1s'});
                    $('.description-icon').css({'transform': 'scale(0.8)'});
                }
            });
            var fixmeborder = $('.points-container-border').offset().top + 20;
            $(window).scroll(function() {                  // assign scroll event listener
                var currentScroll = $(window).scrollTop(); // get current position
                if (currentScroll >= fixmeborder) {
                    $('.swappers-border').css({'width': '12%'});
                }
            });
            $interval.cancel(elementsReady);
        }
    }, 100);

    $scope.$on('login-success', function(event, args) {
        $scope.user = $rootScope.user;
    });
});

