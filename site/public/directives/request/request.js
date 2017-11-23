swapsApp.directive('request', function() {
    return {
        restrict: 'E',
        controller: requestController,
        scope: {
            swapper: '=',
            details: '=',
        },
        templateUrl: '../directives/request/request.html'
    }
});

function requestController($scope, $rootScope, $location){
    $scope.send = {}
}
