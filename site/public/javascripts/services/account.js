swapsApp.service('AccountService', function($http, $rootScope, $q){

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

    this.setCommunity = function(code) {
        var defer = $q.defer();
        $http.post('account/set-community', {code:code}).then(function(data){
            if(data.data.error){
                defer.reject(data.data.message);
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

    this.removeTravelInfo = function(id) {
        var defer = $q.defer();
        $http.post('account/remove-travel-info', {id: id}).then(function(data){
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

   this.reorderPhotos = function(photos) {
       var defer = $q.defer();
       $http.post('account/reorderPhotos', {photos:photos}).then(function(data){
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

	this.getUploadToken = function() {
        var defer = $q.defer();
        $http.get('account/get-upload-token').then(function(data){
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

    this.getProfileUploadToken = function() {
        var defer = $q.defer();
        $http.get('account/get-profile-upload-token').then(function(data){
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

    this.forgotPassword = function(email) {
        var defer = $q.defer();

        $http.post('auth/forgotPassword', {email:email}).then(function(data){
            if(data.data.error){
                defer.reject(data.data.message);
            }
            else{
                defer.resolve(data.data);
            }
        }, function(err){
            defer.reject(err);
        });

        return defer.promise;
    };

    this.changePassword = function(passwords) {
        var defer = $q.defer();

        $http.post('account/changePassword', passwords).then(function(data){
            if(data.data.error){
                defer.reject(data.data.message);
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

    this.emailSignup = function(credentials) {
        var defer = $q.defer();
        $http.post('/auth/signup', credentials).then(function(data){
            if(data.data.error){
                defer.reject(data.data.message);
            }
            else{
                defer.resolve(data.data);
            }
        }, function(data){
            defer.reject(data.data.message);
        });
        return defer.promise;
    };

    this.addFavorite = function(favorite) {
        var defer = $q.defer();
        $http.put('/account/add-favorite', {favorite: favorite}).then(function(data){
            if(data.data.error){
                defer.reject(data.data.message);
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

    this.uploadCompleted = function(public_id) {
        var defer = $q.defer();
        $http.post('/account/uploadCompleted', public_id).then(function(data){
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

    this.profileUploadCompleted = function(public_id) {
        var defer = $q.defer();
        $http.post('/account/profileUploadCompleted', public_id).then(function(data){
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

    this.verifyEmail = function(token) {
        var defer = $q.defer();
        $http.get('/account/verifyEmail?token=' + token).then(function(data){
            if(data.data.error){
                defer.reject(data.data.message);
            }
            else{
                defer.resolve(data.data);
            }
        }, function(err){
            defer.reject('Something went wrong');
        });
        return defer.promise;
    }

    this.setReferral = function(token) {
        var defer = $q.defer();
        $http.post('/account/setReferral',{token: token}).then(function(data){
            if(data.data.error){
                defer.reject(data.data.message);
            }
            else{
                defer.resolve(data.data);
            }
        }, function(err){
            defer.reject('Something went wrong');
        });
        return defer.promise;
    }

    this.getReferralToken = function() {
        var defer = $q.defer();
        $http.get('/account/getReferralToken').then(function(data){
            if(data.data.error){
                defer.reject(data.data.message);
            }
            else{
                defer.resolve(data.data.token);
            }
        }, function(err){
            defer.reject('Something went wrong');
        });
        return defer.promise;
    }

    this.sendInvites = function(emails) {
        var defer = $q.defer();
        $http.post('/account/sendInvites', {emails:emails}).then(function(data){
            if(data.data.error){
                defer.reject(data.data.message);
            }
            else{
                defer.resolve(data.data);
            }
        }, function(err){
            defer.reject('Something went wrong');
        });
        return defer.promise;
    }

    this.setAllowViewHome = function(allowViewHome) {
        var defer = $q.defer();
        $http.post('/account/setAllowViewHome', {allowViewHome:allowViewHome}).then(function(data){
            if(data.data.error){
                defer.reject(data.data.message);
            }
            else{
                defer.resolve(data.data);
            }
        }, function(err){
            defer.reject('Something went wrong');
        });
        return defer.promise;
    };

    this.getUser = function() {
        var defer = $q.defer();
        $http.get('/user/get-user').then(function(data){
            if(data.data.error){
                defer.reject();
            }
            else{
                defer.resolve(data.data);
            }
        },
        function(){
            defer.reject();
        });
        return defer.promise;
    };

});
