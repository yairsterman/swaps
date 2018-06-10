swapsApp.controller('reviewController', function($scope, $rootScope, $routeParams, ReviewsService) {

    var token = $routeParams.token;

    ReviewsService.verifyToken(token).then(function(data){
        $scope.isVerified = data.verified;
        $scope.firstName = data.user.firstName;
    });

    $scope.setRating = function(rating){
        $scope.rating = rating;
    };

    $scope.postReview = function(){
        ReviewsService.postReview($scope.review, $scope.rating, token).then(function(data){
            $scope.reviewSent = true;
        },function(err){
            $scope.error = 'Something went wrong, please try sending your review again'
        });
    }
});
