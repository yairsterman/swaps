swapsApp.directive('swaps', function() {
    return {
        restrict: 'E',
        controller: swapsController,
        scope: {
            swaps: '=',
            popup: '='
        },
        templateUrl: '../../directives/swaps/swaps.html'
    }
});

function swapsController($scope, $rootScope, $filter, AccountService){
    // var autocompleteSearch;
    $scope.addSwap = {
        guests:2
    };

    var confirmedDates = [];
    var today = (new Date()).toLocaleDateString('en-US');
    var minDate;

    $scope.popup?$scope.limit = 4:$scope.limit = $scope.swaps.length;

    $scope.title = $scope.swaps.length != 0?'Edit and Add Swap Locations':'Tell us where you want to go, so other Swappers can see your home.';

    if($rootScope.user){
        $rootScope.user.requests.forEach(function(request){
            if(request.status === $rootScope.data.requestStatus.confirmed){
                confirmedDates = confirmedDates.concat(getConfirmedDates(request.departure, request.returnDate));
            }
        });
    }

    getMinDate(new Date());

    $scope.openDate = function(name, swap){
        $('input[name=' + name + ']').daterangepicker({
            autoApply: true,
            opens: 'center',
            locale: {
                format: 'MMM DD'
            },
            isInvalidDate: function(arg){
                return isInvalidDate(arg);
            },
            minDate: minDate,
            startDate: minDate,
            endDate: minDate,
        });
        $('input[name=' + name + ']').on('apply.daterangepicker', function(ev, picker) {
            if(!checkClearInput(name, picker.startDate.format('MM/DD/YY'), picker.endDate.format('MM/DD/YY'))) {
                swap.when = picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY');
            }
        });
    }

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
        swap._id = $scope.currentSwap._id;
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
        });
    }

    $scope.update = function(swap){
        $scope.saving = true;
        AccountService.updateTravelInfo(swap).then(function(data){
            $rootScope.user = data;
            updateUser();
        });
    }

    $scope.removeTravelInfo = function(swap){
        $scope.saving = true;
        AccountService.removeTravelInfo(swap).then(function(data){
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
    };

    $scope.close = function(){
        $dismiss;
    };

    function updateUser(){
        $scope.user = $rootScope.user;
        $scope.swaps = $scope.user.travelingInfo;
        $scope.editing = false;
        $scope.saving = false;
        $scope.editingField = -1;
    }

    function getMinDate(date){
        date._d = date;
        if(isInvalidDate(date)){
            return getMinDate(addDays(date, 1));
        }
        else{
            minDate = $filter('date')(date.getTime(), "MMM dd");
            return minDate;
        }
    }

    function getConfirmedDates(startDate, stopDate) {
        var dateArray = [];
        var currentDate = startDate;
        while (currentDate <= stopDate) {
            var date = new Date (currentDate);
            dateArray.push(date.toLocaleDateString('en-US'));
            currentDate = addDays(date, 1).getTime();
        }
        return dateArray;
    }

    function addDays(date, days) {
        date.setDate(date.getDate() + days);
        return date;
    }

    function isInvalidDate(date){
        var thisMonth = date._d.getMonth()+1;   // Months are 0 based
        var thisDate = date._d.getDate();
        var thisYear = date._d.getYear()+1900;   // Years are 1900 based

        var thisCompare = thisMonth +"/"+ thisDate +"/"+ thisYear;
        if(confirmedDates.includes(thisCompare) || new Date(thisCompare).getTime() < new Date(today).getTime()){
            return true;
        }
    }

    function checkClearInput(name, startDate, endDate){
        // Compare the dates again.
        var clearInput = false;
        startDate = new Date(startDate).getTime();
        endDate = new Date(endDate).getTime();
        for(var i = 0; i < confirmedDates.length; i++){
            var confirmedDate = new Date(confirmedDates[i]).getTime()
            if(startDate < confirmedDate && endDate > confirmedDate){
                clearInput = true;
                break;
            }
        }

        // If a disabled date is in between the bounds, clear the range.
        if(clearInput){

            // To clear selected range (on the calendar).
            var currentDate = new Date(startDate);
            $('input[name=' + name + ']').data('daterangepicker').setStartDate(currentDate);
            $('input[name=' + name + ']').data('daterangepicker').setEndDate(currentDate);

            // To clear input field and keep calendar opened.
            $('input[name=' + name + ']').focus();

        }
        return clearInput;
    }

}