swapsApp.directive('payment', function() {
    return {
        restrict: 'E',
        controller: paymentController,
        scope: {
            show: '=',
            dates: '=',
            deposit: '=',
            pay: '=',
            action: '&'
        },
        templateUrl: '../../directives/payment/payment.html'
    }
});
let payment = null;

function paymentController($scope, $sce){
    payment = $scope;
    $scope.deposit = 1;
    $scope.pay = 1;

    $scope.iframeSrc = $sce.trustAsResourceUrl("https://direct.tranzila.com/ttxswaps/iframe.php/?sum="+$scope.deposit+"&currency=1&cred_type=1&tranmode=VK&trTextColor=0E5D7C&trButtonColor=0E5D7C&buttonLabel=pay");

    $scope.go = function(){

    }

    $scope.doAction = function(){
        $scope.action();
    }

    $scope.trustAsResourceUrl = function(html) {
        return $sce.trustAsResourceUrl(html);
    }
}