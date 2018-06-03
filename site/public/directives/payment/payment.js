swapsApp.directive('payment', function() {
    return {
        restrict: 'E',
        controller: paymentController,
        scope: {
            data: '=',
            dates: '=',
            deposit: '=',
            userId: '=',
            recipientId: '=',
            message: '=',
            guests: '=',
            pay: '=',
            plan: '=',
            requestType: '=',
            requestId: '=',
        },
        templateUrl: '../../directives/payment/payment.html'
    }
});
let payment = null;

function paymentController($scope, $sce){
    payment = $scope;
    $scope.deposit =5;//TODO: Remove
    if($scope.requestType == $scope.data.requestType.request){
        $scope.iframeSrc = $sce.trustAsResourceUrl("https://direct.tranzila.com/swapshom/iframe.php/?hidesum=1&sum="+$scope.deposit+"&currency=1&cred_type=1&tranmode=VK&user1="+$scope.userId+"&user2="+$scope.recipientId+"&dates="+$scope.dates+"&guests="+$scope.guests+"&message="+$scope.message+"&requestType="+$scope.requestType+"&plan="+$scope.plan+"&trTextColor=0E5D7C&trButtonColor=0E5D7C&buttonLabel=pay");
    }
    else if($scope.requestType == $scope.data.requestType.confirm){
        $scope.iframeSrc = $sce.trustAsResourceUrl("https://direct.tranzila.com/swapshom/iframe.php/?hidesum=1sum="+$scope.deposit+"&currency=1&cred_type=1&tranmode=VK&requestId="+$scope.requestId+"&guests="+$scope.guests+"&message="+$scope.message+"&requestType="+$scope.requestType+"&trTextColor=0E5D7C&trButtonColor=0E5D7C&buttonLabel=pay");
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