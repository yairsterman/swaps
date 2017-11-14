swapsApp.service('Utils', function($http){

    this.getAmenities = function() {
        return $http.get('utils/get-amenities').then(function(data){
                return data.data;
            },
            function(){
                console.log("error")
            });
    };

    this.getPropertyType = function() {
        return $http.get('utils/get-property-type').then(function(data){
                return data.data;
            },
            function(){
                console.log("error")
            });
    };

    this.getThingsToDo = function() {
        return $http.get('utils/get-things-to-do').then(function(data){
                return data.data;
            },
            function(){
                console.log("error")
            });
    };

    this.getGenders = function() {
        return $http.get('utils/get-genders').then(function(data){
                return data.data;
            },
            function(){
                console.log("error")
            });
    };

    this.getSecurityDeposit = function() {
        return $http.get('utils/get-deposits').then(function(data){
                return data.data;
            },
            function(){
                console.log("error")
            });
    };

});

