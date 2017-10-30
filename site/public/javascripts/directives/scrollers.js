
swapsApp.directive('scrollOnClick', function() {
    return {
        restrict: 'A',
        controller: 'homeController',
        link: function(scope, $elm) {
            $elm.on('click', function() {
                $("html").animate({scrollTop: $elm.offset().top}, "fast");
            });
        }
    }
});

swapsApp.directive('scrollToTop', function() {
    return {
        restrict: 'A',
        // controller: 'homeController',
        link: function(scope, $elm) {
            $elm.on('click', function() {
                $("html").animate({scrollTop: 0}, "fast");
            });
        }
    }
});

