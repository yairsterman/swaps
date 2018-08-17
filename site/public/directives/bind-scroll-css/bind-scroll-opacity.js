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

            if((elemTop <= docViewBottom) && (docViewBottom < elemBottom + 100) && (percentage > 0.4)){

                // elm.css({'background-color':'rgba(255,255,255,'+ (1 - (percentage - 0.3)/ 0.7) +')'});
                elm.css({'background-color':'rgba(255,255,255,0)'});
            }

            if((elemTop <= docViewBottom) && (docViewBottom < elemBottom + 100) && (percentage < 0.4)){

                // elm.css({'background-color':'rgba(255,255,255,'+ (1 - (percentage - 0.3)/ 0.7) +')'});
                elm.css({'background-color':'rgba(255,255,255,1)'});
            }


            return false;
        });
    };
});