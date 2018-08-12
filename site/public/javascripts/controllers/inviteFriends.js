swapsApp.controller('inviteFriendsController', function($scope, $rootScope, $routeParams, $interval, $timeout, $document, $location, $uibModal, alertify, AccountService, MessageService, UsersService, $sce) {

    $scope.user = $rootScope.user;
    $scope.inputs = {};

    $scope.getReferralToken = function(){
        $scope.loading = true;
        $scope.referralError = false;
        AccountService.getReferralToken().then(function(token){
            $scope.referralToken = token;
            // $scope.referralLink = 'http://localhost:3000/login?external=true&referer=' + token;
            $scope.referralLink = 'http://swapshome.com/login?external=true&referer=' + token;
        },function(err){
            $scope.referralError = true;
        }).finally(function(){
            $scope.loading = false;
        });
    };

    $scope.copyText = function(id){
        var copyText = document.getElementById(id);
        copyText.select();
        document.execCommand("copy");
    };

    $scope.sendInvites = function(){
        if($scope.sending){
            return;
        }
        $scope.sending = true;
        AccountService.sendInvites($scope.inputs.emails).then(function(){
            showAlert('Invitations sent');
            $scope.inputs = {};
        },function(err){
            showAlert('Failed to send invites', true);
        }).finally(function(){
            $scope.sending = false;
        })
    }

    $scope.postFacebook = function(){
        FB.login(function(response) {
            if (response.authResponse) {
                FB.api(
                    "/me/feed",
                    "POST",
                    {
                        "message": "This is a test message"
                    },
                    function (response) {
                        if (response && !response.error) {
                            /* handle the result */
                        }
                    }
                );
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        });
    }

    $scope.init = function(){
        if($scope.user && $scope.user._id){
            $scope.getReferralToken();
        }
        else{
            $scope.openLogin();
        }
    }

    $scope.$on('login-success', function(event, args) {
        $scope.user = $rootScope.user;
        $scope.init();
    });

    $scope.$on('auth-return', function(event, args) {
        $scope.user = $rootScope.user;
        $scope.modelInstance.close();
        $scope.init();
    });

    function showAlert(msg, error){
        if(!error){
            alertify.success(msg);
        }
        else{
            alertify.error(msg);
        }
    }
});
