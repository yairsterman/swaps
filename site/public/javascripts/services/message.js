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

    this.sendRequest = function(user, recipient, message, dates, guests) {
        var data = {
            user: user,
            recipientId: recipient,
            dates: dates,
            message: message,
            guests: guests
        };
        return $http.post('message/sendRequest', data).then(function(data){
                return data;
            },
            function(){
                console.log("error")
            });
    };

   this.confirmRequest = function(recipient, departure, returnDate) {
        var data = {
            recipientId: recipient,
            departure: departure,
            returnDate:returnDate
        };
        return $http.post('message/confirmRequest', data).then(function(data){
                return data;
            },
            function(){
                console.log("error")
            });
    };

    this.cancelRequest = function(recipient, departure, returnDate) {
        var data = {
            recipientId: recipient,
            departure: departure,
            returnDate:returnDate
        };
        return $http.post('message/cancelRequest', data).then(function(data){
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
