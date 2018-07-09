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
    $scope.rangeLabel = 'Dates';

    $scope.popup?$scope.limit = 4:$scope.limit = $scope.swaps.length;



    $scope.edit = function(index, swap){
        $scope.currentSwap = angular.copy(swap);
        $scope.editing = true;
        $scope.editingField = index;
    }

    $scope.cancel = function(swap){
        swap.destination = $scope.currentSwap.destination;
        swap.dates = $scope.currentSwap.dates;
        swap.departure = $scope.currentSwap.departure;
        swap.returnDate = $scope.currentSwap.returnDate;
        swap.guests = $scope.currentSwap.guests;
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
        swap.rangeLabel = undefined;
        swap.removeDates = true;
    };

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

    function updateUser(){
        $scope.user = $rootScope.user;
        $scope.swaps = $scope.user.travelingInformation;
        $scope.editing = false;
        $scope.saving = false;
        $scope.editingField = -1;
    }

    $scope.changeRange = function (swap) {
        if(swap.duration) {
            var arr =  swap.duration.split('-');
            var min = Number(arr[0]);
            var max = Number(arr[1]);
            if(isNaN(min)){
                swap.startRange = 6;
                swap.endRange = 8;
                return;
            }
            if(min === max || isNaN(max)) {
                swap.duration = min+'';
                max = min;
            }
            if(min < 1){
                min = 1;
            }
            if(min > 58){
                min = 58;
            }
            if(max > 58){
                max = 58;
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
            swap.startRange = 6;
            swap.endRange = 8;
        }

    };

    $scope.changeDates = function (swap) {
        if(swap.dates) {
            $timeout(function() {
                if(swap.rangeLabel === 'Weekends') {
                    swap.startRange = swap.startRange?swap.startRange.toString():$scope.data.weekendStart[0].id.toString();
                    swap.endRange = swap.endRange?swap.endRange.toString():$scope.data.weekendEnd[1].id.toString();
                }
                else if(swap.rangeLabel === 'Dates') {
                    swap.startRange = swap.startRange?swap.startRange.toString():$scope.data.flexibleDates[0].id.toString();
                    swap.endRange = swap.endRange?swap.endRange.toString():$scope.data.flexibleDates[0].id.toString();
                }
                else if(swap.rangeLabel === 'Within Range'){
                    swap.startRange = swap.startRange?swap.startRange:6;
                    swap.endRange = swap.endRange?swap.endRange:8;
                    swap.duration = swap.startRange?swap.startRange+'-'+swap.endRange:'6-8';
                }
            },300);
        }
    };

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