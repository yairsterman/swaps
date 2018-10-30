swapsApp.directive('points', function() {
    return {
        restrict: 'E',
        controller: pointsController,
        scope: {
            data: '='
        },
        templateUrl: '../../directives/points/points.html'
    }
});

function pointsController($scope, $rootScope, $sce, $timeout){

    $scope.amount = 5;

    $scope.go = function(){

    }

    $scope.buyCredits = function(){
        $scope.loading = true;
        $scope.iframeSrc = $sce.trustAsResourceUrl("https://direct.tranzila.com/swapshom/iframe.php/?hidesum=1&sum="+($scope.amount * $scope.data.creditPrice).toFixed(2)+"&currency=2&cred_type=1&tranmode=A&trTextColor=0E5D7C&trButtonColor=0E5D7C&buttonLabel=Swap");
        $scope.pay = true;
        $timeout(function(){
            $scope.loading = false;
        },1000);
    }

    $scope.back = function(){
        $scope.pay = false;
    }

    $scope.addAmount = function(){
        $scope.amount++;
    }

    $scope.distractAmount = function(){
        $scope.amount--;
    }

    $scope.trustAsResourceUrl = function(html) {
        return $sce.trustAsResourceUrl(html);
    }
}