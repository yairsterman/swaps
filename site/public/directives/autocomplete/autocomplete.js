swapsApp.directive('autocomplete', function() {
    return {
        require: 'ngModel',
        scope:{
            autoSearch: '&?',
        },
        link: function(scope, element, attrs, model) {
            var options = {
                types: attrs.city?['(regions)']:['address']
            };
            var gPlace;


            scope.$watch('google', function(){
                gPlace = new google.maps.places.Autocomplete(element[0], options);

                google.maps.event.addListener(gPlace, 'place_changed', function() {
                    scope.$apply(function() {
                        if(gPlace.getPlace().formatted_address){
                            model.$setViewValue(gPlace.getPlace().formatted_address);
                        }
                        else{
                            model.$setViewValue(gPlace.getPlace().name);
                        }
                        if(scope.autoSearch){
                            scope.autoSearch();
                        }
                    });
                });
            });
        }
    };
});