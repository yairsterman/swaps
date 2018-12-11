
swapsApp.directive('scrollOnClick', function() {
    return {
        restrict: 'A',
        // controller: 'homeController',
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

swapsApp.directive('scrollAction', function() {
    return {
        restrict: 'A',
        scope:{
            action: '&?'
        },
        link: function(scope, $elm) {
            $elm.scroll(function() {
                if($elm.scrollTop() >= ($elm[0].scrollHeight - $elm[0].offsetHeight) ){
                    scope.action();
                }
            })
        }
    }
});

swapsApp.directive('afterRender', ['$timeout', function ($timeout) {
    var def = {
        restrict: 'A',
        terminal: true,
        transclude: false,
        link: function (scope, element, attrs) {
            $timeout(scope.$eval(attrs.afterRender), 10);  //Calling a scoped method
        }
    };
    return def;
}]);

swapsApp.directive('lazyLoadImage', function () {
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            const observer = new IntersectionObserver(loadImg);
            const img = angular.element(element)[0];
            observer.observe(img);

            function loadImg(changes){
                changes.forEach(change => {
                    if(change.intersectionRatio > 0 && !change.target.style.backgroundImage){
                        if(change.target.tagName === "IMG")
                            change.target.src = attrs.img;
                        else
                            change.target.style.backgroundImage = 'url('+attrs.img+')';
                    }
                })
            }

        }
    }
});

swapsApp.directive('stickyHeader', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            if(!$rootScope.isMobile) {
                var fixmeTop = element.offset().top + 80;
                $(window).scroll(function () {                  // assign scroll event listener
                    var currentScroll = $(window).scrollTop(); // get current position
                    if (currentScroll >= fixmeTop) {
                        if (!angular.element('.navbar').hasClass('navbar-other')) {
                            angular.element('.navbar').addClass('navbar-other')
                        }
                        angular.element('.navbar').addClass('no-opacity');
                        $timeout(function () {
                            if (!angular.element('.navbar').hasClass('navbar-other')) {
                                angular.element('.navbar').addClass('navbar-other');
                            }
                            angular.element('.navbar').addClass('sticky');
                            angular.element('.navbar').addClass('opacity');
                            angular.element('.navbar').removeClass('no-opacity');
                        }, 500);
                    } else {
                        if (!$rootScope.user || !$rootScope.user._id) {
                            angular.element('.navbar').removeClass('opacity');
                            $timeout(function () {
                                if (angular.element('.navbar').hasClass('opacity')) {
                                    angular.element('.navbar').removeClass('opacity');
                                }
                                angular.element('.navbar').removeClass('navbar-other');
                                angular.element('.navbar').removeClass('sticky');
                            }, 500);
                        }
                    }
                });
            }
        }
    }
}]);

