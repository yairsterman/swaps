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

function pointsController($scope, $rootScope, $sce, $timeout, $interval, UsersService, alertify){

    $scope.amount = 5;
    $scope.cost = $scope.amount * $scope.data.creditsInfo.price;
    $scope.currentPoints = $rootScope.user.credit;

    $scope.go = function(){

    }

    $scope.buyCredits = function(){
        $scope.loading = true;
        $scope.iframeSrc = $sce.trustAsResourceUrl("https://direct.tranzila.com/swapshom/iframe.php/?hidesum=1&sum="+($scope.amount * $scope.data.creditInfo.price).toFixed(2)+"&requestType="+$scope.data.requestType.creditPurchase+"&user1="+$rootScope.user._id+"&currency=2&cred_type=1&tranmode=A&trTextColor=0E5D7C&trButtonColor=0E5D7C&buttonLabel=Swap");
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
        $scope.smoothNumberTransition('cost', parseFloat(($scope.amount * $scope.data.creditInfo.price).toFixed(2)), 0.1);
        $scope.makeItRain = true;
        $timeout(function(){
            $scope.makeItRain = false;
        },1000);
    };

    $scope.subtractAmount = function(){
        if($scope.amount <= 1){
            $scope.amount = 1;
            return;
        }
        $scope.amount--;
        $scope.smoothNumberTransitionDown('cost', parseFloat(($scope.amount * $scope.data.creditInfo.price).toFixed(2)), 0.1);
    };

    $scope.smoothNumberTransition = function(ref, final, jump){
        var counterIntvl = $interval(function(){
            if($scope[ref] >= final){
                $interval.cancel(counterIntvl);
            }
            else{
                $scope[ref] = parseFloat(($scope[ref] + jump).toFixed(2));
            }
        }, 40);
    };

    $scope.smoothNumberTransitionDown = function(ref, final, jump){
        var counterIntvl = $interval(function(){
            if($scope[ref] <= final){
                $interval.cancel(counterIntvl);
            }
            else{
                $scope[ref] = parseFloat(($scope[ref] - jump).toFixed(2));
            }
        }, 40);
    };

    $scope.trustAsResourceUrl = function(html) {
        return $sce.trustAsResourceUrl(html);
    }

    function showAlert(msg, error){
        if(!error){
            alertify.success(msg);
        }
        else{
            alertify.error(msg);
        }
    }

    window.addEventListener("message", receiveMessage, false);

    function receiveMessage(event) {
        if(event.data == 'success'){
            showAlert('Purchase Successful');
            $scope.amount = 5;
            $scope.cost = $scope.amount * $scope.data.creditInfo.price;
            UsersService.getUser($rootScope.user._id).then(function(data){

                $rootScope.user = data.data;
                $scope.user = $rootScope.user;
                $scope.smoothNumberTransition('currentPoints', $rootScope.user.credit, 1);
            })
        }
        if(event.data == 'fail'){
            showAlert('Payment Failed!', true);
        }
        $scope.pay = false;
    }
}