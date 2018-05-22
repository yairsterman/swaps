var ho = null;
swapsApp.controller('homeController', function($scope, $rootScope, $location, $window, $document,$timeout, $interval, $uibModal, UsersService) {
    ho = $scope;
    $scope.user = $rootScope.user;
    $scope.map = null;
    $scope.slideIndex = 0;
    $scope.featured = [];
    $scope.options = ['cities'];

    $rootScope.homepage = true;
    $scope.localeFormat = 'MMM DD';
    $scope.modelFormat = 'MM/DD/YYYY';

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

        if($rootScope.geolocationComplete || $rootScope.userCity){
            if($rootScope.geolocationComplete && $rootScope.geolocationComplete.failed){
                UsersService.getFeaturedUsers().then(function(data) {
                    if(data.data.error){
                        console.log("error");
                        return;
                    }
                    $scope.travelers = data.data.users;
                    $scope.swapperTitle = 'featured';
                    if($scope.travelers.length < 3){
                        UsersService.getNewUsers().then(function(data) {
                            if(data.data.error){
                                console.log("error");
                            }
                            else{
                                $scope.travelers = data.data.users;
                                $scope.swapperTitle = 'new';
                            }
                        });
                    }
                });
            }
            else{
                UsersService.getUserByTravelingDest($rootScope.userCity, 'Anywhere', 0,{}).then(function(data) {
                    if(data.error){
                        console.log("error");
                        return;
                    }
                    $scope.travelers = data.users;
                    $scope.swapperTitle = 'city';
                });
            }
        }
        else{
            UsersService.getNewUsers().then(function(data) {
                if(data.data.error){
                    console.log("error");
                }
                else{
                    $scope.travelers = data.data.users;
                    $scope.swapperTitle = 'new';
                }
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
                if($scope.travelers.length < 3){
                    $scope.swapperTitle = 'featured';
                    UsersService.getNewUsers().then(function(data) {
                        if(data.data.error){
                            console.log("error");
                            return;
                        }
                        $scope.travelers = data.data.users;
                        $scope.swapperTitle = 'new';
                    });
                }
            });
        }
        else{
            UsersService.getUserByTravelingDest($rootScope.userCity, 'Anywhere', 0,{}).then(function(data) {
                if(data.error){
                    console.log("error");
                    return;
                }
                $scope.travelers = data.users;
                $scope.swapperTitle = 'city';
            });
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

