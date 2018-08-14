swapsApp.directive('inviteFriends', function() {
    return {
        restrict: 'E',
        controller: inviteFriends,
        scope: {
            closeModal: '&?'
        },
        templateUrl: '../../directives/invite-friends/invite-friends.html'
    }
});

function inviteFriends($scope, $rootScope, $location) {
    $scope.close = function(){
        if($scope.closeModal){
            $scope.closeModal();
        }
    }
}