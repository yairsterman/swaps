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

function swapsController($scope, $rootScope, AccountService){
    // var autocompleteSearch;
    $scope.addSwap = {
        guests:2
    };

    $scope.popup?$scope.limit = 4:$scope.limit = $scope.swaps.length;

    $scope.title = $scope.swaps.length != 0?'Edit and Add Swap Locations':'Tell us where you want to go, so other Swappers can see your home.';

    $scope.openDate = function(name, swap){
        $('input[name=' + name + ']').daterangepicker({
            autoApply: true,
            opens: 'center',
            locale: {
                format: 'MMM DD'
            }
        });
        $('input[name=' + name + ']').on('apply.daterangepicker', function(ev, picker) {
            swap.when = picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY');
        });
    }

    $scope.edit = function(index, swap){
        $scope.currentSwap = swap;
        $scope.editing = true;
        $scope.editingField = index;
    }

    $scope.cancel = function(swap){
        swap = $scope.currentSwap;
        $scope.editing = false;
        $scope.editingField = -1;
    }

    $scope.add = function(){
        $scope.saving = true;
        AccountService.addTravelInfo($scope.addSwap).then(function(data){
            $rootScope.user = data.data;
            $scope.user = $rootScope.user;
            $scope.swaps = $scope.user.travelingInfo;
            $scope.addSwap = {};
            $scope.saving = false;
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
            $rootScope.user = data.data;
            $scope.user = $rootScope.user;
            $scope.editing = false;
            $scope.saving = false;
            $scope.cancel();
        });
    }

    $scope.removeDates = function(swap){
        swap.dates = undefined;
        swap.when = undefined;
    }

}