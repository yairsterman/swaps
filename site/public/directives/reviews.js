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
    //  Generates a boolean array of length 5 according to the rating:
    //  5 stars will generate [true, true, true, true, true]
    //  3 stars will generate [true, true, true, false, false] etc.
    $scope.generateStars = function(rating) {
        var ret = [];
        var i = 1;
        while (i <= rating) {
            ret.push(true);
            ++i;
        }
        while (i <= 5) {
            ret.push(false);
            ++i;
        }
        return ret;
    };
}