var ho = null;
swapsApp.controller('homeController', function($scope, $rootScope, $location, $window, $document,$timeout, $interval, UsersService) {
    ho = $scope;
    $scope.user = $rootScope.user;
    $scope.map = null;
    $scope.slideIndex = 0;

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
});

