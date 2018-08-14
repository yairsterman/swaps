swapsApp.directive('inviteFriends', function() {
    return {
        restrict: 'E',
        controller: inviteFriends,
        scope: {
        },
        templateUrl: '../../directives/invite-friends/invite-friends.html'
    }
});

function inviteFriends($scope, $rootScope, $location) {

}