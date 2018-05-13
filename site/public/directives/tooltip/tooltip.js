swapsApp.directive('tooltip', function() {
    return {
        link: function(scope, element, attrs, model) {
            element.tooltip();
        }
    };
});