swapsApp.service('AccountService', function($http, $q){

    this.editProfile = function(user) {
        var defer = $q.defer();
        $http.post('account/edit-profile', user).then(function(data){
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

   this.editListing = function(user) {
       var defer = $q.defer();
       $http.post('account/edit-listing', user).then(function(data){
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

   this.addTravelInfo = function(info) {
       var defer = $q.defer();
       $http.post('account/add-travel-info', {info: info}).then(function(data){
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

    this.updateTravelInfo = function(info) {
        var defer = $q.defer();
        $http.post('account/update-travel-info', {info: info}).then(function(data){
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

    this.removeTravelInfo = function(info) {
        var defer = $q.defer();
        $http.post('account/remove-travel-info', {info: info}).then(function(data){
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

   this.deletePhoto = function(img) {
       var defer = $q.defer();
       $http.post('account/delete-photo', img).then(function(data){
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

    this.getRequests = function() {
        var defer = $q.defer();
        $http.get('account/get-requests').then(function(data){
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

   this.logout = function(user) {
      return $http.post('/logout', user).then(function(data){
           return data;
        },
        function(){
             console.log("error");
        });
   };

    this.addFavorite = function(favorite) {
        var defer = $q.defer();
        $http.put('/account/add-favorite', {favorite: favorite}).then(function(data){
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

    this.removeFavorite = function(id) {
        var defer = $q.defer();
        $http.put('/account/unset-favorite', {id: id}).then(function(data){
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

    this.isFavorite = function(id) {
        var query = "?id=" + id;
        var defer = $q.defer();
        $http.get('/account/is-favorite' + query).then(function(data){
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

    this.getFavorites = function() {
        var defer = $q.defer();
        $http.get('/account/get-favorites').then(function(data){
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
