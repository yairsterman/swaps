var swapsApp = angular.module('swapsApp', ['filters','ngRoute', 'ui.bootstrap', 'ngMaterial', 'ngAlertify', 'ngMessages', 'ngSanitize','thatisuday.ng-image-gallery']);

// configure our routes
swapsApp.config(function($routeProvider, $locationProvider) {
$routeProvider
    .when('/', {
        templateUrl : '/pages/home.html',
        controller  : 'homeController'
    })
    .when('/profile/:id', {
        templateUrl : '/pages/profile.html',
        controller  : 'profileController'
    })
    .when('/account/:tab', {
        templateUrl : '/pages/account.html',
        controller  : 'accountController'
    })
    .when('/travelers', {
        templateUrl : '/pages/travelers.html',
        controller  : 'travelersController'
    })
    .when('/privacy-policy', {
        templateUrl : '/pages/privacy.html',
        controller  : 'mainController'
    })
    .when('/terms-and-conditions', {
        templateUrl : '/pages/terms.html',
        controller  : 'mainController'
    })
    .when('/faq', {
        templateUrl : '/pages/faq.html',
        controller  : 'mainController'
    })
    .when('/how-it-works', {
        templateUrl : '/pages/how-it-works.html',
        controller  : 'mainController'
    })
    .when('/travelers/:city', {
        templateUrl : '/pages/travelers.html',
        controller  : 'travelersController'
    });

    $locationProvider.html5Mode(true);
    // $locationProvider.hashPrefix('!');

});

swapsApp.run(function($http, $rootScope, $location, $window){

    // initialise google analytics
    $window.ga('create', 'UA-111632373-1', 'auto');

    // track pageview on state change
    $rootScope.$on('$routeChangeSuccess', function (event) {
        $window.ga('send', 'pageview', $location.path());
    });

    $http.get('/reauth').then(function(data){
       $rootScope.user = data.data;
       $rootScope.$broadcast('auth-return');
    },
    function(){
        $rootScope.user = null;
    });
});
