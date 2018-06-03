swapsApp.directive('autocomplete', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, model) {
            var options = {
                types: attrs.city?['(regions)']:['address']
            };
            var gPlace = new google.maps.places.Autocomplete(element[0], options);

            google.maps.event.addListener(gPlace, 'place_changed', function() {
                scope.$apply(function() {
                    if(attrs.city){
                        model.$setViewValue(gPlace.getPlace().formatted_address);
                    }
                    else{
                        if(gPlace.getPlace().formatted_address){
                            model.$setViewValue(gPlace.getPlace().formatted_address);
                        }
                        else{
                            model.$setViewValue(gPlace.getPlace().name);
                        }
                    }
                });
            });
        }
    };
});