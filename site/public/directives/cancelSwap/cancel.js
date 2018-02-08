swapsApp.controller('cancelController', function($scope, decline, requestInfo, $rootScope, $timeout, MessageService) {

    $scope.decline = decline;
    $scope.requestInfo = requestInfo;
    $scope.subTitle = 'Are you sure you want to ' + ($scope.decline?'decline':'cancel') + ' this Swap' + ($scope.decline?' request?':'?');
    $scope.send = {};

    $scope.close = function(){
        $scope.modelInstance.close();
    }

    $scope.yes = function(){
        $scope.showMessage = true;
    }

    $scope.cancelRequest = function(){
        $scope.processing = true;
        MessageService.cancelRequest(requestInfo.userId, requestInfo.departure, requestInfo.returnDate, $scope.send.message).then(function(data){
            $scope.processing = false;
            $scope.cancelSent = true;
            $timeout(function(){
                $scope.modelInstance.close();
            },5000);
        },function(err){
            $scope.processing = false;
            $scope.error = err
        });
    }

});

