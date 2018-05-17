swapsApp.directive('birthdayPicker', function() {
    return {
        require: 'ngModel',
        scope:{
            birthday: '=',
        },
        link: function(scope, element, attrs, model) {
            element.daterangepicker({
                autoApply: true,
                opens: 'center',
                locale: {
                    format: 'MM/DD/YYYY'
                },
                singleDatePicker: true,
                showDropdowns: true,
                startDate: scope.birthday
            });
            element.on('apply.daterangepicker', function(ev, picker) {
                scope.birthday = picker.startDate.format('MM/DD/YYYY');
            });
        }
    }
});