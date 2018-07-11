swapsApp.directive('scrollAnimate', function() {
    /* this directive indicates when an element 
     is scrolled into view, and adds the `animated`
     class to the element which triggers the animate.css
     animations
     */

    function isScrolledIntoView(elem)
    {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + ($(window).outerHeight());
        var elemTop = elem.offset().top;
        var elemBottom = elemTop + elem.innerHeight();

        return (elemTop <= docViewBottom) && (elemTop > docViewTop);
    }

    return function(scope, elm, attr) {
        var raw = elm[0];
        $(window).scroll(function(){
            if (isScrolledIntoView(elm)) {
                elm.addClass("animated");
                // if (!scope.busy){
                //     setTimeout(function(){
                //         scope.$apply(attr.whenVisible);
                //     },500);
                // }
            }
            else {
                // elm.removeClass("animated");
            }
            return false;
        });
    };
});