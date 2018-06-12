swapsApp.controller('swapsController' , function ($scope, $rootScope, $filter, $location, AccountService){
    $scope.addSwap = {
        guests:2
    };
    $scope.user = $rootScope.user;
    $scope.data = $rootScope.data;
    $scope.swaps = $rootScope.user.travelingInformation;

    $scope.localeFormat = 'MMM DD';
    $scope.modelFormat = 'MM/DD/YYYY';

    $scope.popup?$scope.limit = 4:$scope.limit = $scope.swaps.length;

    $scope.title = $scope.swaps.length != 0?'Edit and Add Swap Locations':'Tell us where you want to go, so other Swappers can see your home.';


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
        toEdit._id = swap._id;
        toEdit.removeDates = swap.removeDates;
        AccountService.updateTravelInfo(toEdit).then(function(data){
            $rootScope.user = data;
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
        swap.removeDates = true;
    };

    $scope.close = function(){
        if($scope.closeModel){
            $scope.closeModel();
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