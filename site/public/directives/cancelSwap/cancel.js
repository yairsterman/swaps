swapsApp.controller('cancelController', function($scope, decline, requestInfo, $rootScope, $timeout, MessageService) {

    $scope.decline = decline;
    $scope.requestInfo = requestInfo;
    $scope.subTitle = 'Are you sure you want to ' + ($scope.decline?'decline':'cancel') + ' this Swap' + ($scope.decline?' request?':'?');
    $scope.send = {};
    $scope.name = requestInfo.user1?requestInfo.user1.firstName:requestInfo.user2.firstName;

    $scope.close = function(){
        $scope.modelInstance.close();
    }

    $scope.yes = function(){
        $scope.showMessage = true;
    }

    $scope.cancelRequest = function(){
        $scope.processing = true;
        MessageService.cancelRequest(requestInfo._id, $scope.send.message).then(function(data){
            $rootScope.user = data;
            $scope.processing = false;
            $scope.cancelSent = true;
            $timeout(function(){
                $scope.modelInstance.close();
            },5000);
        },function(err){
            $scope.processing = false;
            $scope.error = err?err:'Something went wrong please try again'
        });
    }

});

