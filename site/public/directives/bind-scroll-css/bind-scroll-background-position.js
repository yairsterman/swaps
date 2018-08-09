swapsApp.directive('bindScrollBackgroundPosition', function() {
    /* this directive binds scroll to a css property and changes
    it depending on the
     */

    return function(scope, elm, attr) {
        $(window).scroll(function(){

            var docViewTop = $(window).scrollTop();
            var docViewBottom = docViewTop + ($(window).outerHeight());
            var elemTop = elm.offset().top;
            var elemBottom = elemTop + elm.innerHeight();

            var size = (elemBottom - elemTop) * 1.5;

            var percentage = (docViewBottom - elemTop) / (size);

            if((elemTop <= docViewBottom) && (docViewBottom < elemBottom + (0.5 * size)) && percentage <= 1){

                elm.css({'background-position':-40 * percentage + 'px ' + -20 * (1 - percentage)+ 'px'});
            }


            return false;
        });
    };
});