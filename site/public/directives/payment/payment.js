swapsApp.directive('payment', function() {
    return {
        restrict: 'E',
        controller: paymentController,
        scope: {
            data: '=',
            show: '=',
            dates: '=',
            deposit: '=',
            pay: '=',
            userId: '=',
            recipientId: '=',
            message: '=',
            guests: '=',
            requestType: '=',
            action: '&'
        },
        templateUrl: '../../directives/payment/payment.html'
    }
});
let payment = null;

function paymentController($scope, $sce){
    payment = $scope;
    $scope.deposit = 5;
    $scope.pay = 5;

    if($scope.requestType == $scope.data.requestType.request){
        $scope.iframeSrc = $sce.trustAsResourceUrl("https://direct.tranzila.com/ttxswaps/iframe.php/?sum="+$scope.deposit+"&amount="+$scope.pay+"&currency=1&cred_type=1&tranmode=VK&user1="+$scope.userId+"&user2="+$scope.recipientId+"&dates="+$scope.dates+"&guests="+$scope.guests+"&message="+$scope.message+"&requestType="+$scope.requestType+"&trTextColor=0E5D7C&trButtonColor=0E5D7C&buttonLabel=pay");
    }
    else if($scope.requestType == $scope.data.requestType.confirm){

    }

    $scope.go = function(){

    }

    $scope.doAction = function(){
        $scope.action();
    }

    $scope.trustAsResourceUrl = function(html) {
        return $sce.trustAsResourceUrl(html);
    }
}