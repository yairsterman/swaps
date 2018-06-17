swapsApp.controller('blogController', function($scope, $routeParams, $rootScope, $location, BlogService) {

    $scope.postName = $routeParams.post;

    $scope.init = function(){

        BlogService.getPost($scope.postName).then(function(post){
            $scope.post = post;
        },function(err){
            $scope.error = 'No post found'
        });
    }

});