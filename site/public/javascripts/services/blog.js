swapsApp.service('BlogService', function($http, $q){

    this.getPost = function(slug) {
        var defer = $q.defer();
        $http.get('blog/getPost?slug=' + slug).then(function(data){
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

    this.getAllPosts = function() {
        var defer = $q.defer();
        $http.get('blog/getAllPost').then(function(data){
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