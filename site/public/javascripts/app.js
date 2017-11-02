var swapsApp = angular.module('swapsApp', ['angularUtils.directives.dirPagination', 'filters','ngRoute', 'ui.bootstrap', 'ngMaterial', 'ngMessages', 'thatisuday.ng-image-gallery']);

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
    .when('/travelers/:city', {
        templateUrl : '/pages/travelers.html',
        controller  : 'travelersController'
    });

    // $locationProvider.html5Mode(true);
    // $locationProvider.hashPrefix('!');

});

swapsApp.run(function($http, $rootScope){
    $http.get('/reauth').then(function(data){
       $rootScope.user = data.data;
       $rootScope.$broadcast('auth-return');
    },
    function(){
        $rootScope.user = null;
    });
});
