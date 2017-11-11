swapsApp.service('MessageService', function($http){

   this.sendMessage = function(user, recipient, message, dates) {
   	  var data = {
   	  	user: user,
   	  	recipientId: recipient,
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

    this.sendRequest = function(user, recipient, message, dates) {
        var data = {
            user: user,
            recipientId: recipient,
            dates: dates
        };
        return $http.post('message/sendRequest', data).then(function(data){
                return data;
            },
            function(){
                console.log("error")
            });
    };

   this.confirmRequest = function(user, recipient) {
        var data = {
            user: user,
            recipientId: recipient,
        };
        return $http.post('message/confirmRequest', data).then(function(data){
                return data;
            },
            function(){
                console.log("error")
            });
    };

    this.readMessage = function(user, recipient) {
        var data = {
            user: user,
            recipientId: recipient,
        };
        return $http.post('message/readMessage', data).then(function(data){
                return data;
            },
            function(){
                console.log("error")
            });
    };

});
