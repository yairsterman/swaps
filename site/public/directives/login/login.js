swapsApp.controller('loginController', function($scope, signin, $rootScope, MessageService, $timeout) {

    $scope.signin = signin;
    $scope.title = $scope.signin?'Join Swaps':'Log In';
    $scope.subTitle = $scope.signin?'In just a few steps you could find your next Swap':'';

    $scope.FBLogin = function(){
        // window.popup = window.open('http://localhost:3000/auth/facebook', 'newwindow', 'width=640, height=400');
        window.popup = window.open('http://swapshome.com:3000/auth/facebook', 'newwindow', 'width=640, height=400');
    };

    $scope.close = function(){
        $scope.modelInstance.close();
    }
});

