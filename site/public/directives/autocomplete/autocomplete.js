swapsApp.directive('autocomplete', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, model) {
            var options = {
                types: attrs.city?['(cities)']:['address']
            };
            scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

            google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                scope.$apply(function() {
                    if(attrs.city){
                        model.$setViewValue(scope.gPlace.getPlace().name);
                    }
                    else{
                        if(scope.gPlace.getPlace().formatted_address){
                            model.$setViewValue(scope.gPlace.getPlace().formatted_address);
                        }
                        else{
                            model.$setViewValue(scope.gPlace.getPlace().name);
                        }
                    }
                });
            });
        }
    };
});