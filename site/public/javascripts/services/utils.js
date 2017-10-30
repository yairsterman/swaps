swapsApp.service('Utils', function($http){

    this.getAmenities = function(id) {
        return $http.get('utils/get-amenities').then(function(data){
                return data.data;
            },
            function(){
                console.log("error")
            });
    };

    this.getPropertyType = function(id) {
        return $http.get('utils/get-property-type').then(function(data){
                return data.data;
            },
            function(){
                console.log("error")
            });
    };

});

