swapsApp.controller('requestController', function($scope, $rootScope, MessageService, $timeout) {
    $scope.send = {
        message: ''
    };

    $scope.discount = {
        name: 'Beginners Discount'
    }
    $scope.completeText = 'Your request has been sent';

    $scope.payment = false;
    $scope.isMatch = $scope.$parent.isMatch;
    $scope.localeFormat = 'MM/DD/YYYY';
    $scope.modelFormat = 'MMMM DD, YYYY';

    $scope.showPayment = function(){
        $scope.depositPlan = $scope.data.securityDeposit[$scope.profile.deposit];
        $scope.numberOfWeeks = calculateWeeksBetween(new Date($scope.swap.from), new Date($scope.swap.to));
        $scope.numberOfNights = calculateNightsBetween(new Date($scope.swap.from), new Date($scope.swap.to));
        $scope.totalPayment = $scope.depositPlan.night * $scope.numberOfNights;
        $scope.totalDeposit = $scope.depositPlan.week * $scope.numberOfWeeks;
        $scope.receipt = true;
    }

    $scope.goToPayment = function(){
        $scope.payment = true;
    }

    $scope.close = function(){
        $scope.$dismiss();
    }

    $scope.sendRequest = function(){
        $scope.processing = true;
        var data = {
            user: $scope.user,
            recipientId: $scope.profile._id,
            dates: $scope.swap.dates,
            message: $scope.send.message,
            guests: $scope.swap.guests
        }
        MessageService.sendRequest(data.user, data.recipientId, data.message, data.dates, data.guests)
        .then(function(response){
            $scope.processing = false;
            $scope.requestComplete = true;
            $rootScope.user = response;
            $scope.user = $rootScope.user;
            $scope.$parent.requestSent = true;
            $timeout(function(){
                $scope.close();
            },5000);
        },
        function(err){
            $scope.requestComplete = true;
            $scope.completeText = err;
            $scope.error = true;
            $scope.processing = false;
        });
    }

    $scope.removeDates = function(swap){
        $scope.swap.dates = undefined;
        $scope.swap.from = undefined;
        $scope.swap.to = undefined;
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

    $scope.showRequest = function(){
        $scope.isMatch = false;
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

    function calculateNightsBetween(date1, date2) {
        var DAYS = 1000 * 60 * 60 * 24;
        var date1_ms = date1.getTime();
        var date2_ms = date2.getTime();
        var difference_ms = Math.abs(date1_ms - date2_ms);
        return Math.ceil(difference_ms / DAYS);
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
