swapsApp.directive('swaps', function() {
    return {
        restrict: 'E',
        controller: swapsController,
        scope: {
            swaps: '='
        },
        templateUrl: '../../directives/swaps/swaps.html'
    }
});

function swapsController($scope, $rootScope, $document, AccountService){
    var autocompleteSearch;
    $scope.addSwap = {
        guests:2
    };

    $scope.autocompleteCities = function(id, swap){
        autocompleteSearch = new google.maps.places.Autocomplete($document[0].getElementById(id), {
            types: ['(cities)']
        });
        autocompleteSearch.addListener('place_changed', function() {
            swap.destination = autocompleteSearch.getPlace().formatted_address;
        });
    }

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

    $scope.edit = function(index){
        $scope.editing = true;
        $scope.editingField = index;
    }

    $scope.cancel = function(){
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