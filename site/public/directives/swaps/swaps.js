swapsApp.controller('swapsController' , function ($scope, $rootScope, $filter, $timeout, $location, AccountService){
    $scope.addSwap = {
        guests:2,
        duration:'6-8'
    };
    $scope.user = $rootScope.user;
    $scope.data = $rootScope.data;
    $scope.swaps = $rootScope.user.travelingInformation;

    $scope.localeFormat = 'MMM DD';
    $scope.modelFormat = 'MM/DD/YYYY';
    $scope.rangeLabel = 'Date Range';

    $scope.exactDates = true;

    $scope.popup?$scope.limit = 4:$scope.limit = $scope.swaps.length;



    $scope.edit = function(index, swap){
        $scope.currentSwap = angular.copy(swap);
        swap.editing = true;
        $scope.editing = true;
        $scope.editingField = index;
    }

    $scope.cancel = function(swap){
        swap._id = $scope.currentSwap._id;
        swap.dates = $scope.currentSwap.dates;
        swap.departure = $scope.currentSwap.departure;
        swap.returnDate = $scope.currentSwap.returnDate;
        swap.rangeLabel = $scope.currentSwap.rangeLabel;
        swap.startRange = $scope.currentSwap.startRange;
        swap.endRange = $scope.currentSwap.endRange;
        swap.duration = $scope.currentSwap.duration;
        swap.destination = $scope.currentSwap.destination;
        swap.fullDestination = $scope.currentSwap.fullDestination;
        swap.guests = $scope.currentSwap.guests;
        delete swap.editing;
        $scope.editedSwap = {};
        $scope.editing = false;
        $scope.editingField = -1;
    }

    $scope.add = function(){
        $scope.saving = true;
        AccountService.addTravelInfo($scope.addSwap).then(function(data){
            $rootScope.user = data;
            $scope.addSwap = {};
            updateUser();
            $scope.addSwap = {
                guests:2
            };
            if($scope.swaps > 5){
                $scope.toMany = true;
            }
            if($scope.onboarding){
                $scope.closeModel();
                $location.url('/account/set-swap-dates');
            }
        },function(){
            updateUser();
        });
    }

    $scope.update = function(swap){
        $scope.saving = true;
        var toEdit = {};
        if(swap.fullDestination != $scope.currentSwap.fullDestination){
            toEdit.fullDestination = swap.fullDestination;
        }
        if(swap.guests != $scope.currentSwap.guests)
            toEdit.guests = swap.guests;
        if(swap.when != $scope.currentSwap.when)
            toEdit.when = swap.when;
        if(swap.rangeLabel != $scope.currentSwap.rangeLabel)
            toEdit.rangeLabel = swap.rangeLabel;
        if(swap.startRange != $scope.currentSwap.startRange)
            toEdit.startRange = swap.startRange;
        if(swap.endRange != $scope.currentSwap.endRange)
            toEdit.endRange = swap.endRange;
        toEdit._id = swap._id;
        toEdit.removeDates = swap.removeDates;
        AccountService.updateTravelInfo(toEdit).then(function(data){
            $rootScope.user = data;
            updateUser();
        },function(){
            updateUser();
        });
    }


    $scope.removeTravelInfo = function(swap){
        $scope.saving = true;
        AccountService.removeTravelInfo(swap._id).then(function(data){
            $rootScope.user = data;
            updateUser();
            // showAlert(SUCCESS, false);
        },function(err){
            // showAlert('Error deleting photos', true);
        });
    }

    $scope.removeDates = function(swap){
        swap.dates = undefined;
        swap.when = undefined;
        swap.from = undefined;
        swap.to = undefined;
        swap.rangeLabel = undefined;
        swap.startRange = undefined;
        swap.endRange = undefined;
        swap.removeDates = true;
    }

    $scope.close = function(){
        if($scope.closeModel){
            $scope.closeModel();
            return;
        }
        $scope.modelInstance.close();
    };

    $scope.orderByDeparture = function(swap){
        return (swap.departure);
    };

    $scope.setAllowViewHome = function(){
        $scope.user.allowViewHome = !$scope.user.allowViewHome;
        AccountService.setAllowViewHome($scope.user.allowViewHome).then(function(data){
            $rootScope.user = data;
            updateUser();
        },function(err){
            $scope.user.allowViewHome = !$scope.user.allowViewHome;
            showAlert('Error setting open to suggestions', true);
        });
    }

    function updateUser(){
        $scope.user = $rootScope.user;
        $scope.swaps = $scope.user.travelingInformation;
        $scope.editing = false;
        $scope.saving = false;
        $scope.editingField = -1;
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
                    if(!swap.editing && swap.departure){ // dates and ranges already set
                        swap.duration = swap.startRange+'-'+swap.endRange;
                        return;
                    }
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

    function showAlert(msg, error){
        if(!error){
            alertify.success(msg);
        }
        else{
            alertify.error(msg);
        }
    }

    function calculateNightsBetween(date1, date2) {
        var DAYS = 1000 * 60 * 60 * 24;
        var date1_ms = date1.getTime();
        var date2_ms = date2.getTime();
        var difference_ms = Math.abs(date1_ms - date2_ms);
        return Math.ceil(difference_ms / DAYS);
    }

});

swapsApp.directive('swaps', function() {
    return {
        restrict: 'E',
        controller: 'swapsController',
        scope: {
            swaps: '=',
            popup: '=',
            onboarding: '=',
            closeModel: '&'
        },
        templateUrl: '../../directives/swaps/swaps.html'
    }
});