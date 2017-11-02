angular.module('filters', []).
    filter('fixPath', function () {
        return function(pathString) {
            return  pathString.replace(/\\/g,"/");
        }
    });

angular.module('filters', []).
filter('startFrom', function () {
    return function(data, start) {
        return data.slice(start);
    }
});