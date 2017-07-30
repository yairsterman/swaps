swapsApp.service('MessageService', function($http){

   this.sendMessage = function(user, recepient, message, dates) {
   	  var data = {
   	  	user: user,
   	  	recipientId: recepient,
   	  	message: message,
        dates: dates
   	  };
      return $http.post('message/sendMessage', data).then(function(data){
           return data;
        },
        function(){
             console.log("error")
        });
   };

    this.sendRequest = function(user, recepient, message, dates) {
        var data = {
            user: user,
            recipientId: recepient,
            dates: dates
        };
        return $http.post('message/sendRequest', data).then(function(data){
                return data;
            },
            function(){
                console.log("error")
            });
    };

   this.confirmRequest = function(user, recepient) {
   	  var data = {
   	  	user: user,
   	  	recipientId: recepient,
   	  };
      return $http.post('message/confirmRequest', data).then(function(data){
           return data;
        },
        function(){
             console.log("error")
        });
   };

});
