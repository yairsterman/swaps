swapsApp.service('Utils', function($http){

    this.getData = function() {
        return $http.get('utils/get-data').then(function(data){
                return data.data;
            },
            function(){
                console.log("error")
            });
    };

});

