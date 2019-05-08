swapsApp.service('Utils', function($http){

    this.getData = function() {
        return $http.get('utils/get-data').then(function(data){
                return data.data;
            },
            function(){
                console.log("error")
            });
    };

    this.sendMailToInfo = function(email,city) {
        var data = {
            email: email,
            city: city
        };
        return $http.post('utils/sendMailToInfo', data).then(function(data){
                return data.data;
            },
            function(){
                console.log("error")
            });
    };

});



