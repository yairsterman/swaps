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
      angular.forEach(filters, function(value, key) {
          requestFilters += '&' + key + '=' +  value;
      });
      var query ='?dest=' + dest + fromCity + requestFilters + '&page=' + page;
      return $http.get('user/get-user-by-travelingDest' + query).then(function(data){
           return data;
        },
        function(){
             console.log("error")
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
