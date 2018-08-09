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

            var size = elemBottom - elemTop;

            var percentage = (docViewBottom - elemTop) / (size);

            if((elemTop <= docViewBottom) && (docViewBottom < elemBottom) && (percentage > 0.3)){

                elm.css({'background-color':'rgba(255,255,255,'+(1 - (Math.pow((percentage - 0.3)/ 0.6,2)))+')'});
            }


            return false;
        });
    };
});