swapsApp.directive('payment', function() {
    return {
        restrict: 'E',
        controller: paymentController,
        scope: {
            show: '=',
            dates: '=',
            amount: '=',
            action: '&'
        },
        templateUrl: '../../directives/payment/payment.html'
    }
});

function paymentController($scope){
    $scope.go = function(){
        console.log($scope.data);

    }

    $scope.doAction = function(){
        $scope.action();
    }
}