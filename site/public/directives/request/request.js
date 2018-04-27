let request = null
swapsApp.controller('requestController', function($scope, $rootScope, MessageService, UsersService, $timeout) {
    request = $scope;
    $scope.send = {
        message: ''
    };

    $scope.discount = {
        name: 'Beginners Discount'
    }
    $scope.completeText = 'Your request has been sent';

    $scope.payment = false;
    $scope.isMatch = $scope.$parent.isMatch;
    $scope.localeFormat = 'MMM DD';
    $scope.modelFormat = 'MMMM DD, YYYY';
    $scope.recipientId = $scope.profile._id;
    $scope.userId = $scope.user._id;

    $scope.showPayment = function(){
        if(!validateRequest()){
            return;
        }
        $scope.datesError = $scope.guestsError =  $scope.messageError = false;
        $scope.depositPlan = $scope.data.securityDeposit[$scope.profile.deposit];
        $scope.numberOfWeeks = calculateWeeksBetween(new Date($scope.swap.from), new Date($scope.swap.to));
        $scope.numberOfNights = calculateNightsBetween(new Date($scope.swap.from), new Date($scope.swap.to));
        $scope.totalPayment = $scope.depositPlan.night * $scope.numberOfNights;
        $scope.totalDeposit = $scope.depositPlan.week * $scope.numberOfWeeks;
        $scope.dates = $scope.swap.from + '-' + $scope.swap.to;
        $scope.receipt = true;
    }

    $scope.goToPayment = function(){
        $scope.payment = true;
    }

    $scope.close = function(){
        $scope.$dismiss();
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

    function validateRequest(){
        $scope.datesError = $scope.guestsError =  $scope.messageError = false;

        if(!$scope.swap.to || !$scope.swap.from || ($scope.swap.to == $scope.swap.from)){
            $scope.datesError = true;
            return false;
        }
        if(!$scope.swap.guests){
            $scope.swap.guests = 2;
            $scope.guestsError = true;
            return false;
        }
        if($scope.send.message == ''){
            $scope.messageError = true;
            return false;
        }

        return true;
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

    window.addEventListener("message", receiveMessage, false);

    function receiveMessage(event) {
        $scope.requestComplete = true;
        if(event.data == 'success'){
            $scope.$parent.requestSent = true;
            //get updated user
            UsersService.getUser($scope.user._id).then(function(data){
                $rootScope.user = data.data;
                $scope.user = $rootScope.user;
            })
        }
        if(event.data == 'fail'){
            $scope.completeText = 'Sorry! the payment failed, please try again later';
            $scope.$apply();
        }
    }

});


