angular.module('filters', []).
    filter('fixPath', function () {
        return function(pathString) {
            return  pathString.replace(/\\/g,"/");
        }
    });

