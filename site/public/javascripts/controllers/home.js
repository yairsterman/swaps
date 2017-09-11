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
});

