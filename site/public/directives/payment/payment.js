swapsApp.directive('payment', function() {
    return {
        restrict: 'E',
        controller: paymentController,
        scope: {
            show: '=',
            dates: '=',
            amount: '='
        },
        templateUrl: '../../directives/payment/payment.html'
    }
});

function paymentController($scope){
    $scope.go = function(){
        console.log($scope.data);

    }
}