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

function paymentController($scope, $sce){
    $scope.iframeSrc = $sce.trustAsResourceUrl("https://direct.tranzila.com/ttxswaps/iframe.php/?sum="+$scope.amount+"&currency=2&cred_type=1&buttonLabel=Pay&trTextColor=0E5D7C&trButtonColor=0E5D7C");

    $scope.go = function(){

    }

    $scope.doAction = function(){
        $scope.action();
    }

    $scope.trustAsResourceUrl = function(html) {
        return $sce.trustAsResourceUrl(html);
    }
}