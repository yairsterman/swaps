swapsApp.service('ReviewsService', function($http, $q, ) {

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

    this.postReview = function(review, rating, token) {
        var defer = $q.defer();
        $http.post('review/postReview', {review: review, rating: rating, token: token}).then(function(data){
            if(data.data.error){
                defer.reject(data.data);
            }
            else{
                defer.resolve(data.data);
            }
        }, function(err){
            defer.reject(err);
        });
        return defer.promise;
    };

    this.getUser = function() {
        var defer = $q.defer();
        $http.get('/user/get-user').then(function(data){
            if(data.data.error){
                defer.reject(null);
            }
            else{
                defer.resolve(data.data);
            }
        },
        function(){
            defer.reject(null);
        });
        return defer.promise;
    };

});
