swapsApp.service('UsersService', function($http){

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
       if(filters.dates){
           requestFilters += '&dates=' + filters.dates;
       }


      var query ='?dest=' + dest + fromCity + requestFilters + '&page=' + page;
      return $http.get('user/get-user-by-travelingDest' + query).then(function(data){
           return data;
        },
        function(err){
            return {error: true, msg: err};
        });
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

   this.fbLogin = function() {
      return $http.get('/auth/facebook/callback').then(function(data){
           return data.data;
        },
        function(){
             console.log("error")
        });
   };

});
