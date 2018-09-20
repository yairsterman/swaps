swapsApp.controller('reviewController', function($scope, $rootScope, $routeParams, $uibModal, ReviewsService, alertify) {

    var token = $routeParams.token;
    $scope.rating = 4;
    $scope.review = {
        text: ''
    };

    ReviewsService.getUser().then(function(user){
        ReviewsService.verifyToken(token).then(function(data){
            $scope.isVerified = data.verified;
            $scope.notVerified = !$scope.isVerified;
            $scope.reviewed = data.user;
        });
    },function(){
        $scope.openLogin('You must log in to write a review');
    });

    $scope.$on('login-success', function(event, args) {
        ReviewsService.verifyToken(token).then(function(data){
            $scope.isVerified = data.verified;
            $scope.notVerified = !$scope.isVerified;
            $scope.reviewed = data.user;
        });
    });

    $scope.setRating = function(rating){
        $scope.rating = rating;
    };

    $scope.postReview = function(){
        ReviewsService.postReview($scope.review.text, $scope.rating, token).then(function(data){
            $scope.reviewSent = true;
        },function(err){
            if(err.code == 411){
                alertify.error(err.message);
            }
            else{
                alertify.error('Review token expired, you are not able to write a review anymore');
            }
            $scope.error = 'Something went wrong, please try sending your review again'
        });
    }

    $scope.openLogin = function(title){
        $scope.title = title;
        $scope.modelInstance = $uibModal.open({
            animation: true,
            templateUrl: '../../directives/login/login.html',
            size: 'sm',
            controller: 'loginController',
            scope:$scope
        });
    }
});
