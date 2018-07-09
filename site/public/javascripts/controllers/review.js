swapsApp.controller('reviewController', function ($scope, $uibModal, $timeout, $rootScope, $routeParams, ReviewsService, MessageService, $location) {


    var token = $routeParams.token;
    $scope.user = $rootScope.user;

    ReviewsService.verifyToken(token).then(function (data) {
        if (!data.verified) {
            $scope.error = data.message;
            console.log(data.message);
            if(data.message === "already gave review"){
                $scope.case1 = true;
            }
        }
        else {
            $timeout(function () {
                if (!$rootScope.user || !$rootScope.user._id) {
                    $scope.openLogin();
                }
                $scope.user = $rootScope.user;
                $scope.isVerified = true;
                $scope.firstName = data.user.firstName;
                $scope.recipient = data.user._id;
            }, 1000);

            $scope.message = {
                text: ''
            };
        }
    });

    $scope.setRating = function (rating) {
        $scope.message.rating = rating;
    };

    $scope.postReview = function () {
        if (!$scope.message.rating) {
            $scope.message.rating = 1
        }
        ReviewsService.postReview($scope.message.review, $scope.message.rating, token).then(function (data) {
            if (!data.verified) {
                $scope.error = data.message;
                console.log(data.message);
                if(data.message === "you must log in first"){
                    $scope.openLogin();
                }
                if(data.message.includes("you must log in as")){
                    $scope.message.review = "WRONG USER!";
                }
            }
            else {
                $scope.reviewSent = true;
                $scope.case1 = true;
            }
        }, function (err) {
            $scope.error = 'Something went wrong, please try sending your review again'
        });
    };

    $scope.sendMessage = function () {
        ReviewsService.sendMessage(token).then(function (data) {
            if (!data.verified) {
                $scope.error = data.message;
                console.log(data.message);
                if(data.message === "you must log in first"){
                    $scope.openLogin();
                }
                if(data.message.includes("you must log in as")){
                    $scope.message.text = "WRONG USER!";
                }
            }
            else {
                MessageService.sendMessage($rootScope.user, data.recipient, $scope.message.text).then(function (data) {
                    if (!data.error) {
                        $rootScope.user = data.data;
                        $scope.user = $rootScope.user;
                        $scope.firstName = data.data.firstName;
                        $scope.showmessage = true;
                    }
                    else{
                        $scope.error = 'Something went wrong, please try sending your review again'
                    }
                });
            }
        }, function (err) {
            $scope.error = 'Something went wrong, please try sending your review again'
        });
    };

    $scope.skip = function () {
        $scope.showmessage = true;
    };

    $scope.home = function () {
            $(window).unbind('scroll');
            $location.url('/');
        }

    $scope.openLogin = function (signin) {
        $scope.modelInstance = $uibModal.open({
            animation: true,
            templateUrl: '../../directives/login/login.html',
            size: 'sm',
            controller: 'loginController',
            resolve: {
                signin: function () {
                    return signin;
                }
            },
            scope: $scope
        });
    }
});
