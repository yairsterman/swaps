swapsApp.controller('blogController', function($scope, $routeParams, $rootScope, $location, BlogService) {

    $scope.slug = $routeParams.slug;

    $scope.init = function(){

        if($scope.slug){
            BlogService.getPost($scope.slug).then(function(post){
                $scope.post = post;
            },function(err){
                $scope.error = 'No post found'
            });
        }
        else{
            BlogService.getAllPosts().then(function(posts){
                $scope.posts = posts;
            },function(err){
                $scope.error = 'No post found'
            });
        }
    }

});