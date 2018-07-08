swapsApp.service('HomeService', function($http, $q){
    this.search = function(postData) {
        var defer = $q.defer();
	      $http.post('request-url', postData).then(function(data){
            if(data.data.error){
                defer.reject(data.data.error);
            }
            else{
                defer.resolve(data.data);
            }
        }, function(err){
            defer.reject(err);
        });
        return defer.promise;
    }

});
