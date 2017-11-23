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

   this.addTravelInfo = function(info) {
      return $http.post('account/add-travel-info', {info: info}).then(function(data){
           return data;
        },
        function(){
             console.log("error");
        });
   };

    this.updateTravelInfo = function(info) {
        return $http.post('account/update-travel-info', {info: info}).then(function(data){
                return data;
            },
            function(err){
                return err;
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

    this.getRequests = function() {
        return $http.get('account/get-requests').then(function(data){
                return data.data;
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
