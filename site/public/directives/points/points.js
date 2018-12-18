swapsApp.directive('points', function() {
    return {
        restrict: 'E',
        controller: pointsController,
        scope: {
            data: '=',
            user: '=',
            hideCredits: '&?',
            request: '=?',
            missing: '=?'
        },
        templateUrl: '../../directives/points/points.html'
    }
});

function pointsController($scope, $rootScope, $sce, $timeout, $interval, UsersService, AccountService, alertify, $uibModal){

    $scope.amount = $scope.missing?$scope.missing:5;
    $scope.currentPoints = $rootScope.user.credit;

    $scope.go = function(){

    }

    $scope.buyCredits = function(){
        $scope.loading = true;
        $scope.iframeSrc = $sce.trustAsResourceUrl("https://direct.tranzila.com/swapshom/iframe.php/?hidesum=1&sum="+$scope.calculatePrice($scope.amount).toFixed(2)+"&requestType="+$scope.data.requestType.creditPurchase+"&user1="+$rootScope.user._id+"&email="+$rootScope.user.email+"&currency=2&cred_type=1&tranmode=A&trTextColor=0E5D7C&trButtonColor=0E5D7C&buttonLabel=Get Credits");
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
        var price = $scope.calculatePrice($scope.amount);
        $scope.smoothNumberTransition('cost', parseFloat((price).toFixed(2)), 0.1);
        $scope.makeItRain = true;
        $timeout(function(){
            $scope.makeItRain = false;
        },1000);
    };

    $scope.subtractAmount = function(){
        if($scope.missing){
            if($scope.amount <= $scope.missing){
                $scope.amount = $scope.missing;
                return;
            }
        }
        if($scope.amount <= 1){
            $scope.amount = 1;
            return;
        }
        $scope.amount--;
        var price = $scope.calculatePrice($scope.amount);
        $scope.smoothNumberTransition('cost', parseFloat((price).toFixed(2)), 0.1);
    };

    $scope.calculatePrice = function(amount){
        var price = 0;
        price += Math.floor(amount/15) * $scope.data.creditInfo.priceFor15;
        amount = amount % 15;
        price += Math.floor(amount/10) * $scope.data.creditInfo.priceFor10;
        amount = amount % 10;
        price += Math.floor(amount/5) * $scope.data.creditInfo.priceFor5;
        amount = amount % 5;
        price += amount * $scope.data.creditInfo.priceFor1;
        return price;
    }

    $scope.smoothNumberTransition = function(ref, final, jump){
        if($scope[ref] > final){
            jump = -jump;
        }
        var counterIntvl = $interval(function(){
            if(jump > 0 && $scope[ref] >= final){
                $interval.cancel(counterIntvl);
            }
            else if(jump < 0 && $scope[ref] <= final){
                $interval.cancel(counterIntvl);
            }
            else{
                $scope[ref] = parseFloat(($scope[ref] + jump).toFixed(2));
            }
        }, 40);
        $timeout(function(){
            $interval.cancel(counterIntvl);
            $scope[ref] = final;
        }, 2000);
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
                if($scope.missing){
                    $scope.hideCredits();
                }
            })
        }
        if(event.data == 'fail'){
            showAlert('Payment Failed!', true);
            if($scope.missing){
                $scope.hideCredits();
            }
        }
        $scope.pay = false;
    }

    $scope.openCoupon = function(){
        $scope.coupon = {};
        $scope.modelInstance = $uibModal.open({
            animation: true,
            templateUrl: '../../pages/popups/coupon.html',
            size: 'sm',
            scope: $scope
        })
    };

    $scope.redeemCoupon = function(){
        AccountService.redeemCoupon($scope.coupon.code).then(function(data){
            $rootScope.user = data.user;
            $scope.user = $rootScope.user;
            $scope.couponAmount = data.amount;
            $scope.makeItRain = true;
            $timeout(function(){
                $scope.modelInstance.close();
                $scope.makeItRain = false;
            },5000);
        },function(err){
            $scope.coupon.code = undefined;
            showAlert(err, true);
        });
    }

    $scope.cost = $scope.calculatePrice($scope.amount);
}