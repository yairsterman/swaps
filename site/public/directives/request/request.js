swapsApp.controller('requestController', function($scope, $rootScope, MessageService, $timeout) {
    $scope.send = {
        message: ''
    };

    $scope.discount = {
        name: 'Beginners Discount'
    }

    $scope.payment = false;
    $scope.depositPlan = $scope.data.securityDeposit[$scope.profile.deposit].value;
    $scope.numberOfWeeks = calculateWeeksBetween(new Date($scope.swap.from), new Date($scope.swap.to));
    $scope.totalWithoutDiscount = $scope.depositPlan * $scope.numberOfWeeks;
    $scope.discount.amount = $scope.depositPlan * $scope.numberOfWeeks;
    $scope.total = $scope.depositPlan * $scope.numberOfWeeks - $scope.discount.amount;


    $scope.showPayment = function(){
        $scope.receipt = true;
    }

    $scope.goToPayment = function(){
        $scope.payment = true;
    }

    $scope.close = function(){
        $scope.modelInstance.close();
    }

    $scope.sendRequest = function(){
        var data = {
            user: $scope.user,
            recipientId: $scope.profile._id,
            dates: $scope.swap.dates,
            message: $scope.send.message,
            guests: $scope.swap.guests
        }
        MessageService.sendRequest(data.user, data.recipientId, data.message, data.dates, data.guests)
        .then(function(response){
            $scope.requestComplete = true;
            $rootScope.user = data.data;
            $scope.user = $rootScope.user;
            $timeout(function(){
                $scope.modelInstance.close();
            },5000);
        },
        function(err){

        });
    }

    $scope.goBack = function(){
        if($scope.receipt){
            $scope.receipt = false;
            return;
        }
        if($scope.payment){
            $scope.payment = false;
            return;
        }
    }

    function calculateWeeksBetween(date1, date2) {
        // The number of milliseconds in one week
        var ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
        // Convert both dates to milliseconds
        var date1_ms = date1.getTime();
        var date2_ms = date2.getTime();
        // Calculate the difference in milliseconds
        var difference_ms = Math.abs(date1_ms - date2_ms);
        // Convert back to weeks and return hole weeks
        return Math.ceil(difference_ms / ONE_WEEK);
    }
    // return {
    //     restrict: 'E',
    //     controller: requestController,
    //     scope: {
    //         swapper: '=',
    //         details: '=',
    //     },
    //     templateUrl: '../directives/request/request.html'
    // }
});

// function requestController($scope, $rootScope, $location){
//     $scope.send = {}
// }
