swapsApp.service('AccountService', function($http){

   this.editProfile = function(user) {
      return $http.post('account/edit-profile', user).then(function(data){
           return data;
        },
        function(){
             console.log("error")
        });
   };

   this.editListing = function(user) {
      return $http.post('account/edit-listing', user).then(function(data){
           return data;
        },
        function(){
             console.log("error")
        });
   };

   this.saveTravelInfo = function(id, info) {
      return $http.post('account/update-travel-info', {id: id, info: info}).then(function(data){
           return data;
        },
        function(){
             console.log("error");
        });
   };

   this.deletePhoto = function(img) {
      return $http.post('account/delete-photo', img).then(function(data){
           return data;
        },
        function(){
             console.log("error");
        });
   };

   this.logout = function(user) {
      return $http.post('/logout', user).then(function(data){
           return data;
        },
        function(){
             console.log("error");
        });
   };

});
