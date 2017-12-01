swapsApp.directive('reviewElm', function() {
    return {
        restrict: 'E',
        controller: swapperReview,
        scope: {
            commenter: '=',
            isProfile: '='
        },
        templateUrl: '../directives/reviews.html'
    }
});

function swapperReview($scope, $rootScope, $location) {

}