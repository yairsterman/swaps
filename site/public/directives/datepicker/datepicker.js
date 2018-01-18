swapsApp.directive('datepicker', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, model) {
            element.daterangepicker({
                autoApply: true,
                opens: 'left',
                locale: {
                    format: 'MM/DD/YYYY'
                }
            });
        }
    };
});