swapsApp.service('UsersService', function($http, $q){

   this.getUser = function(id) {
      return $http.get('user/get-user?id=' + id).then(function(data){
           return data;
        },
        function(){
             console.log("error")
        });
   };

   this.getProfile = function(id) {
      return $http.get('user/get-profile?id=' + id).then(function(data){
           return data;
        },
        function(){
             console.log("error")
        });
   };

   this.getUserByTravelingDest = function(dest, from, page, filters) {
        var fromCity = '';
        var requestFilters = '';
        if(from){
          fromCity = '&from=' + from;
        }
        if(filters.amenities){
          requestFilters += '&amenities=' + filters.amenities;
        }
       if(filters.room){
           requestFilters += '&room=' + filters.room;
       }
       if(filters.guests){
           requestFilters += '&guests=' + filters.guests;
       }
       if(filters.when){
           requestFilters += '&dates=' + filters.when;
       }

       var dfr = $q.defer();
      var query ='?dest=' + dest + fromCity + requestFilters + '&page=' + page;
      $http.get('user/get-user-by-travelingDest' + query).then(function(data){
          if(data.data && data.data.err){
              dfr.reject({error: true, msg: data.data.err});
          }
          else{
              dfr.resolve(data.data);
          }
        },
        function(err){
            dfr.reject({error: true, msg: err});
        });
      return dfr.promise;
   };

    this.getFeaturedUsers = function() {
        return $http.get('user/get-featured-users').then(function(data){
            return data;
        },
        function(err){
            return {error: true, msg: err};
        });
    };

    this.getNewUsers = function() {
        return $http.get('user/get-new-users').then(function(data){
            return data;
        },
        function(err){
            return {error: true, msg: err};
        });
    };

    this.getAllUsers = function() {
        return $http.get('user/get-all-users').then(function(data){
                return data;
            },
            function(err){
                return {error: true, msg: err};
            });
    };


});
