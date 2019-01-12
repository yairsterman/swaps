swapsApp.directive('bindScrollOpacity', function() {
    /* this directive binds scroll to a css property and changes
    it depending on the
     */

    return function(scope, elm, attr) {
        $(window).scroll(function(){

            var docViewTop = $(window).scrollTop();
            var docViewBottom = docViewTop + ($(window).outerHeight());
            var elemTop = elm.offset().top;
            var elemBottom = elemTop + elm.innerHeight();

            var size = elemBottom - elemTop + 100;

            var percentage = (docViewBottom - elemTop) / (size);

            if((elemTop <= docViewBottom) && (docViewBottom < elemBottom + 100)){

                // elm.css({'background-color':'rgba(255,255,255,'+ (1 - (percentage - 0.3)/ 0.7) +')'});
                var num = percentage * 10;
                elm.css({'box-shadow':(-6 +num) +'px '+(-4 +num)+'px 29px -10px'});
            }

            return false;
        });
    };
});