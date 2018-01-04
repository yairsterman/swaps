swapsApp.controller('requestController', function($scope, $rootScope, MessageService, $timeout) {
    $scope.send = {
        message: ''
    };

    $scope.discount = {
        name: 'Beginners Discount'
    }
    $scope.completeText = 'Your request has been sent';

    $scope.payment = false;

    $scope.showPayment = function(){
        $scope.depositPlan = $scope.data.securityDeposit[$scope.profile.deposit].value;
        $scope.numberOfWeeks = calculateWeeksBetween(new Date($scope.swap.from), new Date($scope.swap.to));
        $scope.percentage = {name:'4%', amount:0.04};
        $scope.totalWithoutDiscount = $scope.depositPlan * $scope.numberOfWeeks * $scope.percentage.amount;
        $scope.discount.amount = $scope.totalWithoutDiscount;
        $scope.total = $scope.totalWithoutDiscount - $scope.discount.amount;
        $scope.receipt = true;
    }

    $scope.goToPayment = function(){
        $scope.payment = true;
    }

    $scope.close = function(){
        $scope.modelInstance.close();
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
            $scope.requestSent = true;
            $timeout(function(){
                $scope.modelInstance.close();
            },5000);
        },
        function(err){
            $scope.requestComplete = true;
            $scope.completeText = err;
            $scope.error = true;
            $scope.processing = false;
        });
    }

    $scope.openDate = function(){
        $('input[name="dates"]').daterangepicker({
            autoApply: true,
            opens: 'left',
            locale: {
                format: 'MM/DD/YYYY'
            },
            minDate: (new Date()).toLocaleDateString(),
        });
        $('input[name="dates"]').on('apply.daterangepicker', function(ev, picker) {
            $scope.swap.from = picker.startDate.format('MMMM DD, YYYY');
            $scope.swap.to = picker.endDate.format('MMMM DD, YYYY');
            $scope.$apply();
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
