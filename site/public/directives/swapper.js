swapsApp.directive('swapperHome', function() {
    return {
        restrict: 'E',
        controller: swapperHomeController,
        scope: {
          traveler: '='
        },
        templateUrl: '../directives/swapper-home.html'
    }
});

function swapperHomeController($scope, $location){
    $scope.carouselPrev = function (id, event) {
        event.preventDefault();
        event.stopPropagation();
        $('#myCarousel' + id).carousel('prev');
    };

    $scope.carouselNext = function (id, event) {
        event.preventDefault();
        event.stopPropagation();
        $('#myCarousel' + id).carousel('next');
    };

    $scope.go = function(path){
        $location.url(path);
    }
}
