swapsApp.service('MessageService', function($http, $q){

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

    this.sendRequest = function(recipient, swap) {
        var data = {
            user2: recipient,
            dates: swap.when,
            message: swap.message,
            guests: swap.guests,
            rangeLabel: swap.rangeLabel,
            startRange: swap.startRange,
            endRange: swap.endRange,
            oneWay: swap.oneWay,
        };
        var dfr = $q.defer();
        $http.post('message/sendRequest', data).then(function(res){
                if(res.data.code && (res.data.code === 409 || res.data.code === 411)){
                    return dfr.reject(res.data.msg);
                }
                if(res.data.error){
                    return dfr.reject(res.data.message);
                }
                dfr.resolve(res.data);
            },
            function(err){
               dfr.reject('Error processing request, Please try again later');
            });
        return dfr.promise;
    };

    this.acceptRequest = function(data) {
        var dfr = $q.defer();
        $http.post('message/acceptRequest', data).then(function(res){
                if(res.data.code && (res.data.code === 409 || res.data.code === 411)){
                    return dfr.reject(res.data.msg);
                }
                if(res.data.error){
                    return dfr.reject(res.data.message);
                }
                dfr.resolve(res.data);
            },
            function(err){
                dfr.reject('Error processing request, Please try again later');
            });
        return dfr.promise;
    };

   this.confirmRequest = function(data) {
        var dfr = $q.defer();
        $http.post('message/confirmRequest', data).then(function(res){
            if(res.data.code && (res.data.code === 409 || res.data.code === 411)){
                return dfr.reject(res.data.msg);
            }
            if(res.data.error){
                return dfr.reject(res.data.message);
            }
            dfr.resolve(res.data);
            },
            function(err){
               dfr.reject('Error processing request, Please try again later');
            });
        return dfr.promise;
    };

    this.cancelRequest = function(requestId, message) {
        var data = {
            requestId: requestId,
            message: message,
        };
        var dfr = $q.defer();
        $http.post('message/cancelRequest', data).then(function(res){
                if(res.data.error){
                    dfr.reject(res.data.msg);
                }
                else{
                    dfr.resolve(res.data);
                }
            },
            function(){
                dfr.reject("Error");
            });
        return dfr.promise;
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
