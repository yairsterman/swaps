swapsApp.service('CommunityService', function($http, $q){

    this.getCommunity = function(code) {
        var defer = $q.defer();
        $http.get('community/getCommunity/' + code).then(function(data){
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
    };
});