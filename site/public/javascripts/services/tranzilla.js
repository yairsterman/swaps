swapsApp.service('Tranzilla', function($http){

    this.getToken = function() {
        return $http.get('transactions/get-token').then(function(data){
                return data.data;
            },
            function(){
                console.log("error")
            });
    };

});



