var ho = null;
swapsApp.controller('homeController', function($scope, $rootScope, $location, $window, $document,$timeout, $interval, UsersService) {
    ho = $scope;
    $scope.user = $rootScope.user;
    $scope.map = null;
    $scope.slideIndex = 0;

    $scope.cities = [
        "../images/cities/london.jpg",
        "../images/cities/paris.jpg",
        "../images/cities/newyork.jpeg",
        "../images/cities/sydney.jpg",
        "../images/cities/rome.jpeg",
    ]
});
