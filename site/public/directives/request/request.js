var request = null
swapsApp.controller('requestController', function($scope, $rootScope, MessageService, UsersService, $timeout, $uibModal) {
    request = $scope;
    $scope.send = {
        message: ''
    };

    $scope.discount = {
        name: 'Beginners Discount'
    }
    $scope.completeText = $scope.confirmation?'Request Confirmed!':'Your request has been sent';
    // $scope.requestComplete = false;
    $scope.payment = false;
    $scope.isMatch = $scope.$parent.isMatch;
    $scope.localeFormat = 'MMM DD';
    $scope.modelFormat = 'MM/DD/YYYY';

    $scope.swap.guests = 2;
    $scope.exactDates = true;

    $scope.proposing = !$scope.confirmation && !$scope.accepting;

    $scope.showPayment = function(){
        if(!validateRequest()){
            return;
        }

        $scope.datesError = $scope.guestsError =  $scope.messageError = false;
        $scope.depositPlan = $scope.confirmation?$scope.data.securityDeposit[$scope.user.deposit]:$scope.data.securityDeposit[$scope.profile.deposit];
        $scope.numberOfWeeks = calculateWeeksBetween(new Date($scope.swap.from), new Date($scope.swap.to));
        $scope.numberOfNights = calculateNightsBetween(new Date($scope.swap.from), new Date($scope.swap.to));
        $scope.paymentPerNight = $scope.accepting?$scope.accepting.oneWay?0:$scope.data.roomType[$scope.accepting.roomType1].cost:$scope.data.roomType[$scope.request.roomType2].cost;
        $scope.gainPerNight = $scope.accepting?$scope.data.roomType[$scope.user.apptInfo.roomType].gain:$scope.request.oneWay?0:$scope.data.roomType[$scope.request.roomType1].gain;
        $scope.totalPayment = ($scope.paymentPerNight - $scope.gainPerNight) * $scope.numberOfNights;
        if($scope.totalPayment < 0){
            $scope.hasGain = true;
        }
        $scope.totalPayment = Math.abs($scope.totalPayment);
        $scope.totalDeposit = $scope.depositPlan.week * $scope.numberOfWeeks;
        $scope.dates = $scope.swap.from + '-' + $scope.swap.to;
        $scope.receipt = true;
        if((($scope.accepting && !$scope.accepting.oneWay) || ($scope.request)) && $rootScope.user.credit < $scope.totalPayment){
            $scope.notEnoughCredits = true;
            $scope.missing = ($scope.paymentPerNight * $scope.numberOfNights) - $rootScope.user.credit;
        }
    }

    $scope.checkSwap = function(){
        if($scope.processing){
           return;
        }
        if(!validateRequest()){
            return;
        }
        $scope.processing = true;

        $scope.swap.message = $scope.send.message;
        if(checkOneWaySwapNights()){
            $timeout(function(){
                $scope.processing = false;
                $scope.requestComplete = true;
                $scope.requestError = 'You can only use up to 14 one way swap nights without offering your home in exchange, You have already used ' +
                    $scope.user.oneWaySwapDays + ' nights and this swap will exceed the limit. This amount will be reduced for every night you offer your home either within a swap '+
                    'or by a one way swap at your home';
            }, 1000);
            return;
        }
        $scope.proposeSwap();
    }

    $scope.hideBuyCredits = function(){
        $scope.notEnoughCredits = false;
        $scope.showPayment();
    };

    $scope.goToPayment = function(){
        if($scope.hasDeposit || ($scope.confirmation && $scope.request.deposit)){
            $scope.payment = true;
        }
        else{
            $scope.processing = true;
            var action = MessageService.confirmRequest;
            var data = {};

            if($scope.accepting){
                action = MessageService.acceptRequest;
                data = {
                    requestId: $scope.accepting._id,
                    dates: $scope.dates,
                    guests: $scope.swap.guests,
                    message: $scope.send.message
                }
            }
            else if($scope.request){
                action = MessageService.confirmRequest;
                data = {
                    requestId: $scope.request._id,
                }
            }
            else{
                return;
            }
            action(data).then(function(res){
                $rootScope.user = res;
                $scope.user = $rootScope.user;
                $scope.requestComplete = true;
                if($scope.accepting){
                    $scope.completeText = 'Swap proposal accepted.';
                }
                $scope.$parent.requestSent = true;
                $scope.processing = false;
            }, function(err){
                $scope.requestComplete = true;
                $scope.processing = false;
                $scope.completeText = 'Sorry! This action cannot be completed: ' + err;

            })
        }
    };

    $scope.close = function(){
        $scope.$dismiss();
    };

    $scope.setDeposit = function(){
        $scope.hasDeposit = !$scope.hasDeposit;
    };

    $scope.setOneWaySwap = function(){
        $scope.swap.oneWay = !$scope.swap.oneWay;
    };

    $scope.removeDates = function(swap){
        $scope.swap.dates = undefined;
        $scope.swap.when = undefined;
        $scope.swap.from = undefined;
        $scope.swap.to = undefined;
        $scope.swap.rangeLabel = undefined;
        swap.removeDates = true;
    }

    $scope.changeRange = function (swap) {
        if(swap.duration) {
            $scope.exactDates = false;
            var arr =  swap.duration.split('-');
            var min = Number(arr[0]);
            var max = Number(arr[1]);
            if(isNaN(min)){
                swap.startRange = $scope.minNightsRange;
                swap.endRange = $scope.maxNightsRange;
                return;
            }
            if(min === max || isNaN(max)) {
                swap.duration = min+'';
                max = min;
            }
            if(min < 1){
                min = 1;
            }
            if(max < 1){
                max = 1;
            }
            if(min > $scope.maxNights){
                min = $scope.maxNights;
            }
            if(max > $scope.maxNights){
                max = $scope.maxNights;
            }
            if(min > max){
                swap.startRange = max;
                swap.endRange = min;
                return;
            }
            swap.startRange = min;
            swap.endRange = max;
        }
        else {
            // $scope.duration = '6-8';
            swap.startRange = $scope.minNightsRange;
            swap.endRange = $scope.maxNightsRange;
        }

    };

    $scope.changeDates = function (swap) {
        if(swap.dates) {
            $timeout(function() {
                if(swap.rangeLabel === 'Weekends') {
                    swap.startRange = swap.startRange?swap.startRange.toString():$scope.data.weekendStart[0].id.toString();
                    swap.endRange = swap.endRange?swap.endRange.toString():$scope.data.weekendEnd[1].id.toString();
                }
                else if(swap.rangeLabel === 'Date Range'){
                    var start = new Date(swap.from);
                    var end = new Date(swap.to);
                    $scope.maxNights = calculateNightsBetween(start, end);
                    $scope.maxNightsRange = $scope.maxNights > 8?8:$scope.maxNights;
                    $scope.minNightsRange = $scope.maxNights === 1?1:$scope.maxNights === 2?2:$scope.maxNightsRange - 2;

                    if($scope.exactDates){
                        swap.startRange = $scope.maxNights;
                        swap.endRange = $scope.maxNights;
                    }
                    else{
                        swap.startRange = swap.startRange?swap.startRange:$scope.minNightsRange;
                        swap.endRange = swap.endRange?swap.endRange:$scope.maxNightsRange;
                    }
                    swap.duration = $scope.minNightsRange+'-'+$scope.maxNightsRange;
                }
            },300);
        }
    };

    $scope.setExactDates = function(swap){
        if($scope.exactDates){
            swap.startRange = $scope.minNightsRange;
            swap.endRange = $scope.maxNightsRange;
            swap.duration = $scope.minNightsRange+'-'+$scope.maxNightsRange;
            $scope.exactDates = false;
            return;
        }
        swap.startRange = $scope.maxNights;
        swap.endRange = $scope.maxNights;
        $scope.exactDates = true;
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

    $scope.validateDates = function(){
        $scope.datesError = false;
    }

    function validateRequest(){
        if($scope.confirmation){
            return true;
        }
        $scope.datesError = $scope.guestsError =  $scope.messageError = false;

        if(!$scope.swap.when){
            $scope.datesError = true;
            return false;
        }
        if(!$scope.swap.guests){
            $scope.swap.guests = 2;
            $scope.guestsError = true;
            return false;
        }
        if(!$scope.send.message || $scope.send.message == ''){
            $scope.messageError = true;
            return false;
        }

        return true;
    }

    function checkOneWaySwapNights(){
        if(!$scope.swap.oneWay){
            return false;
        }
        var nights;
        if($scope.swap.rangeLabel == 'Date Range'){
            nights = $scope.swap.endRange;
        }
        if($scope.swap.rangeLabel == 'Weekends'){
            nights = 4;
        }

        return ($scope.user.oneWaySwapDays + nights > 14)
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
            if($scope.missing){ // returned from purchasing credits
                $scope.processing = false;
                $scope.requestComplete = false;
                return;
            }
            if($scope.accepting){
                $scope.completeText = 'Swap proposal accepted.';
            }
            $scope.$parent.requestSent = true;
            $scope.processing = false;
            //get updated user
            UsersService.getUser($scope.user._id).then(function(data){
                $rootScope.user = data.data;
                $scope.user = $rootScope.user;
            })
        }
        else{
            if(event.data == 'fail'){
                $scope.completeText = 'Sorry! something went wrong, please try again later';
                $scope.$apply();
            }
            $scope.completeText = 'Sorry! This action cannot be completed: ' + decodeURI((event.data).substring(1));
            $scope.$apply();
        }
    }

});


