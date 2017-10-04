var ho = null;
swapsApp.controller('homeController', function($scope, $rootScope, $location, $window, $document,$timeout, $interval, UsersService) {
    ho = $scope;
    $scope.user = $rootScope.user;
    $scope.map = null;
    $scope.slideIndex = 0;
    $scope.featured = [];
    $scope.search = {
        guests: 1
    };

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

    $scope.travel = "Travel anywhere you want.";
    $scope.switch = "Switch homes with fellow travellers.";
    $scope.experience = "Experience living as a local.";
    $scope.underline = "___________";
    $scope.findSwap = "Find a swap!";
    $scope.where = "Where do you want to go?";
    $scope.when = "When do you want to go?";
    $scope.howmany = "How many travellers?";

    $scope.tseList = [$scope.travel, $scope.switch, $scope.experience];

    init();

    $scope.searchSwap = function(){
        var where = $scope.search.where;
        if(!where || where == ''){
            where	= 'Anywhere';
        }
        $location.url('/travelers/' + where + '?dates=' + $scope.search.when + '&guests=' + $scope.search.guests);
    }

    $scope.changeImage = function(index){
        $scope.featured[index] = $scope.cities[index].faded;
    };

    $scope.changeImageBack = function(index){
        $scope.featured[index] = $scope.cities[index].normal;
    };

    $scope.autocompleteCities = function(){
        autocompleteSearch = new google.maps.places.Autocomplete($document[0].getElementById('searchCity'), {
            types: ['(cities)']
        });
        autocompleteSearch.addListener('place_changed', function() {
            $scope.search.where = autocompleteSearch.getPlace().name;
        });
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
            $scope.search.when = picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY');
        });
    }

    function init(){
        angular.forEach($scope.cities, function(value, key) {
            $scope.featured[key] = value.faded;
            $scope.featured[key] = value.normal;
        });
    }
});

swapsApp.directive('scrollOnClick', function() {
    return {
        restrict: 'A',
        link: function(scope, $elm) {
            $elm.on('click', function() {
                $("body").animate({scrollTop: $elm.offset().top}, "slow");
                $("body").animate({scrollBottom: 100}, "fast");
            });
        }
    }
});

swapsApp.directive('scrollToTop', function() {
    return {
        restrict: 'A',
        link: function(scope, $elm) {
            $elm.on('click', function() {
                $("body").animate({scrollTop: 0}, "slow");
        });
        }
    }
});