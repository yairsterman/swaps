swapsApp.directive('swapperHome', function() {
    return {
        restrict: 'E',
        controller: swapperHomeController,
        scope: {
          traveler: '='
        },
        templateUrl: '../directives/swappers/swapper-home.html'
    }
});

function swapperHomeController($scope, $rootScope, $location, $uibModal, AccountService){
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
        $(window).unbind('scroll');
        $rootScope.homepage = false;
        $location.url(path);
    }

    $scope.openLogin = function(){
            $scope.modelInstance = $uibModal.open({
                animation: true,
                templateUrl: '../directives/login/login.html',
                size: 'sm',
                controller: 'loginController',
                resolve: {
                    signin: function () {
                        return false;
                    }
                },
                scope:$scope
            });
        }

    $scope.isFavorite = function() {
        if($rootScope.user && $rootScope.user._id && $scope.traveler && $scope.traveler._id) {
            return $rootScope.user.favorites.includes($scope.traveler._id);
        }
        return false;
    };

     $scope.setFavorite = function(event){
        event.preventDefault();
        event.stopPropagation();
        if($scope.adding){
            return;
        }
        if(!$rootScope.user._id){
            $scope.openLogin();
            return;
        }
        $scope.adding = true;
        if(!$scope.isFavorite()){
            addToFavorites();
        }
        else{
            removeFromFavorites();
        }
    }

    function addToFavorites() {
        var favorite = $scope.traveler._id;
        $scope.addedFavorite = false;
        AccountService.addFavorite(favorite).then(function(data){
            $rootScope.user = data;
            $scope.user = $rootScope.user;
            $scope.adding = false;
            $scope.addedFavorite = true;
        },function(){
            $scope.adding = false;
        });
    };

    function removeFromFavorites() {
        var id = $scope.traveler._id;
        AccountService.removeFavorite(id).then(function(data){
            $rootScope.user = data;
            $scope.user = $rootScope.user;
            $scope.adding = false;
        },function(){
            $scope.adding = false;
        });
    };
}
