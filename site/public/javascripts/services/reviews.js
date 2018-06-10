swapsApp.service('ReviewsService', function($http, $q) {

    this.verifyToken = function(token) {
        var defer = $q.defer();
        $http.get('review/verifyToken?token=' + token).then(function(data){
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

    this.postReview = function(review, token) {
        var defer = $q.defer();
        $http.post('review/postReview', {review: review, token: token}).then(function(data){
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
