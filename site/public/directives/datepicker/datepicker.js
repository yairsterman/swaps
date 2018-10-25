swapsApp.directive('datepicker', function() {
    return {
        require: 'ngModel',
        scope:{
            localeFormat: '=',
            modelFormat: '=',
            swapDates: '=',
            data: '=?',
            canSendRequest: '=?',
            user: '=?',
            userCity: '=?',
            profile: '=?',
            findTravel: '=?',
            notSwapping: '=?',
            setUpSwap: '=?',
            readOnlyCheck: '=?',
            start: '=?',
            end: '=?',
            request: '=?',
            parentEl: '=?',
        },
        link: function(scope, element, attrs, model) {

            var confirmedDates = [];
            var travelingDates = [];
            var today = (new Date()).getTime();
            var tomorrow = formatDate(new Date((new Date()).setDate((new Date()).getDate() + 1)), scope.localeFormat);
            var minDate = today;
            var maxDate = today;
            var openAllDates = scope.setUpSwap || false;

            if(scope.user && scope.user.city){
                scope.userCity = scope.user.city;
            }

            // ranges
            var now = new Date();
            var startOfNextMonth = formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 1), scope.localeFormat);
            var endOfNextMonth = formatDate(new Date(now.getFullYear(), now.getMonth() + 2, 0), scope.localeFormat);
            var next4weeks = formatDate(new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7 * 4), scope.localeFormat);
            var next2Months = formatDate(new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7 * 8), scope.localeFormat);
	          var curr = new Date();
	          var endOfTheWeek = formatDate(new Date(curr.setDate(curr.getDate() - curr.getDay() + 7)), scope.localeFormat);
	          var date = new Date();
	          var yesterday = formatDate(new Date(date.setDate(date.getDate() - 1)), scope.localeFormat);

            if(scope.findTravel){ //from profile or set up swap page
                findTravelInfo();
            }
            else{
                if(scope.readOnlyCheck){
                    travelingDates = travelingDates.concat(getDatesBetween(scope.start, scope.end));
                    element.daterangepicker({
                        autoApply: true,
                        opens: 'center',
                        startDate: formatDate(new Date(scope.start), scope.localeFormat),
                        endDate: formatDate(new Date(scope.end), scope.localeFormat),
                        // isInvalidDate: function(arg){
                        //     return isInvalidDateReadOnly(arg);
                        // },
                        locale: {
                            format: scope.localeFormat,
                        },
                        parentEl: '.' + scope.parentEl
                    });
                    if(scope.swapDates){
                        scope.swapDates.when = true; // to allow accepting a request with exact dates
                    }
                }
                else{
                    //from home page
                    // setting daterangepicker causes date to default to today,
                    // so save the dates that are set and override the defaults
                    scope.currentDatesWhen = scope.swapDates.when;
                    scope.currentDates = scope.swapDates.date;
                    element.daterangepicker({
                        autoApply: true,
                        opens: 'right',
                        startDate: now,
                        locale: {
                            format: scope.localeFormat,
                            customRangeLabel: "Date Range",
                        },
                        minDate: formatDate(new Date(minDate), scope.localeFormat),
                        ranges: {
                            'Weekends': [minDate, next4weeks],
                        },
                        showCustomRangeLabel: true,
                        alwaysShowCalendars: true,
                        autoUpdateInput: true
                    });
                    element.on('apply.daterangepicker', function(ev, picker) {
                        scope.swapDates.when = picker.startDate.format(scope.modelFormat) + ' - ' + picker.endDate.format(scope.modelFormat);
                        if(picker.chosenLabel == 'Weekends'){
                            scope.swapDates.rangeLabel = 'Weekends'
                        }
                        else if(picker.chosenLabel == 'Date Range') {
                            scope.swapDates.rangeLabel = 'Date Range';
                            if(!scope.currentDatesWhen) {
                                scope.swapDates.when = picker.startDate.format(scope.modelFormat) + ' - ' + picker.endDate.format(scope.modelFormat);
                            }
                        }
                        scope.swapDates.startRange = undefined;
                        scope.swapDates.endRange = undefined;
                        scope.$parent.$apply();
                    });
                    scope.swapDates.when= scope.currentDatesWhen;
                    scope.swapDates.date= scope.currentDates;
                }
            }

            function setDates(){
                var options = {
                    autoApply: true,
                    opens: 'left',
                    locale: {
                        format: scope.localeFormat
                    },
                    isInvalidDate: function(arg){
                        return isInvalidDate(arg);
                    },
                    minDate: minDate,
                    startDate: dateGreaterThan(minDate,tomorrow)?minDate:tomorrow,
                    endDate: dateGreaterThan(minDate,tomorrow)?minDate:tomorrow,
                };
                if(scope.setUpSwap){
                    // setting daterangepicker causes date to default to today,
                    // so save the dates that are set and override the defaults
                    scope.currentDates = scope.swapDates.dates;

                    options.ranges =  {
                        'Weekends': [minDate, next4weeks],
                    };
                    options.locale.customRangeLabel = "Date Range";
                    options.autoUpdateInput = true;
                    options.showCustomRangeLabel = true;
                    options.alwaysShowCalendars = true;
                    options.opens = 'right';
                }
                if(scope.request){
                    options.startDate = new Date(scope.request.proposition.checkin);
                    options.endDate = new Date(scope.request.proposition.checkin);
                }
                if(!scope.userCity || !scope.profile.travelingInformation || scope.profile.travelingInformation.length === 0){
                    scope.notSwapping = true;
                    options.maxDate = maxDate;
                    // options.endDate = minDate;
                }
                else{
                    options.maxDate = maxDate;
                }
                element.daterangepicker(options);
                element.on('apply.daterangepicker', function(ev, picker) {
                    if(!checkClearInput(picker.startDate.format('MM/DD/YY'), picker.endDate.format('MM/DD/YY'), picker.chosenLabel)){
                        if(picker.startDate.format('MM/DD/YYYY') === picker.endDate.format('MM/DD/YYYY')){
                            scope.swapDates.when = undefined;
                            return;
                        }
                        if(scope.setUpSwap){
                            scope.swapDates.when = picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY');
                            if(picker.chosenLabel == 'Weekends'){
                                scope.swapDates.rangeLabel = 'Weekends'
                            }
                            else if(picker.chosenLabel == 'Date Range') {
                                scope.swapDates.rangeLabel = 'Date Range';
                                if(!scope.currentDatesWhen) {
                                    scope.swapDates.when = picker.startDate.format(scope.modelFormat) + ' - ' + picker.endDate.format(scope.modelFormat);
                                }
                            }
                            scope.swapDates.from = picker.startDate.format(scope.modelFormat);
                            scope.swapDates.to = picker.endDate.format(scope.modelFormat);
                            scope.swapDates.startRange = undefined;
                            scope.swapDates.endRange = undefined;
                        }
                        else{
                            scope.swapDates.when = picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY');

                            scope.swapDates.from = picker.startDate.format(scope.modelFormat);
                            scope.swapDates.to = picker.endDate.format(scope.modelFormat);
                            if(scope.canSendRequest){
                                scope.canSendRequest.status = true;
                            }
                            scope.$apply();
                        }
                    }
                    else{
                        scope.swapDates.when = undefined;
                    }
                });
                if(scope.setUpSwap){
                    // setting daterangepicker causes date to default to today,
                    // so save the dates that are set and override the defaults
                    scope.swapDates.dates = scope.currentDates;
                }
            }

            function findTravelInfo(){
                if(scope.user){
                    getUserConfirmedDates();
                }
                if(scope.profile){
                    getProfileConfirmedDates();
                }
                if(scope.user){
                    scope.userCity = scope.user.city;
                }
                //-----------
                openAllDates = true;
                //-----------------
                // if(scope.userCity && scope.profile.travelingInformation && scope.profile.travelingInformation.length > 0){
                //     for(var i = 0; i < scope.profile.travelingInformation.length; i++){
                //         if(!scope.profile.travelingInformation[i].destination || (scope.profile.travelingInformation[i].destination && scope.profile.travelingInformation[i].destination.city == scope.userCity)){ // if cities match or user chose Anywhere as destination
                //             if(!scope.profile.travelingInformation[i].departure){ // if user has chosen anytime then open all dates
                //                 openAllDates = true;
                //                 break;
                //             }
                //             if(minDate > scope.profile.travelingInformation[i].departure){ // find min date in travel info
                //                 minDate = scope.profile.travelingInformation[i].departure;
                //                 if(minDate < today){
                //                     minDate = today;
                //                 }
                //             }
                //             if(maxDate < scope.profile.travelingInformation[i].returnDate){// find max date in travel info
                //                 maxDate = scope.profile.travelingInformation[i].returnDate
                //             }
                //             // add all traveling dates to array
                //             travelingDates = travelingDates.concat(getDatesBetween(scope.profile.travelingInformation[i].departure, scope.profile.travelingInformation[i].returnDate));
                //         }
                //     }
                // }
                if(openAllDates){ //set maxDate to false in order to stop looking for minDate
                    maxDate = false;
                }
                minDate = getMinDate(new Date(minDate));
                if(openAllDates){ // now set the max date to the right locale string
                    maxDate = false;
                }
                else{
                    maxDate = formatDate(new Date(maxDate), scope.localeFormat);
                }
                setDates();
            }

            function getUserConfirmedDates(){
                scope.user.requests.forEach(function(request){
                    if(request.status === scope.data.requestStatus.confirmed){
                        confirmedDates = confirmedDates.concat(getDatesBetween(request.checkin, request.checkout));
                    }
                });
            }

            function getProfileConfirmedDates(){
                scope.profile.requests.forEach(function(request){
                    if(request.status === scope.data.requestStatus.confirmed){
                        confirmedDates = confirmedDates.concat(getDatesBetween(request.checkin, request.checkout));
                    }
                });
            }

            function getMinDate(date){
                date._d = date;
                if(isInvalidDate(date)){// if minDate is invalid, start looking for next valid date
                    if(maxDate && date.getTime() >= maxDate){// if reached the last available date
                        return formatDate(new Date(maxDate), scope.localeFormat);
                    }
                    return getMinDate(addDays(date, 1));
                }
                else{
                    return formatDate(date, scope.localeFormat);
                }
            }

            function getDatesBetween(startDate, stopDate) {
                var dateArray = [];
                var currentDate = startDate;
                while (currentDate <= stopDate) {
                    var date = new Date (currentDate);
                    dateArray.push(formatDate(date, 'MM/DD/YYYY'));
                    currentDate = addDays(date, 1).getTime();
                }
                return dateArray;
            }

            function addDays(date, days) {
                date.setDate(date.getDate() + days);
                return date;
            }

            function formatDate(date, format){
                switch(format){
                    case 'MMM DD':
                        return date.toLocaleDateString('en-us', {month: 'short', day: 'numeric',});
                        break;
                    case 'MM/DD/YYYY':
                        return date.toLocaleDateString('en-US');
                        break;
                    default:
                        return date.toLocaleDateString('en-US');
                        break;
                }
            }

            function isInvalidDate(date){
                var thisMonth = date._d.getMonth()+1;   // Months are 0 based
                var thisDate = date._d.getDate();
                var thisYear = date._d.getYear()+1900;   // Years are 1900 based

                var thisCompare = thisMonth +"/"+ thisDate +"/"+ thisYear;
                // date is already confirmed in another swap
                if(confirmedDates.includes(thisCompare) || new Date(thisCompare).getTime() < new Date(today).getTime()){
                    return true;
                }
                // not in other users' traveling dates
                if(!openAllDates && !travelingDates.includes(thisCompare)){
                    return true;
                }

                // when accepting a proposed swap date, invalidate all dates that are out of the proposed range
                if(scope.request){
                    var time = Date.UTC(thisYear, thisMonth - 1, thisDate);
                    if(scope.request.proposition.rangeLabel == 'Weekends'){
                        var weekDay = date._d.getDay();
                        return scope.data.weekendEnd[scope.request.proposition.endRange].calendarDay === 6?weekDay < scope.data.weekendStart[scope.request.proposition.startRange].calendarDay: scope.data.weekendEnd[scope.request.proposition.endRange].calendarDay < weekDay && weekDay < scope.data.weekendStart[scope.request.proposition.startRange].calendarDay
                            || (time < scope.request.proposition.checkin || time > scope.request.proposition.checkout)
                    }
                    else if(scope.request.proposition.rangeLabel == 'Date Range'){ // range label is 'Date Range'
                        return time < scope.request.proposition.checkin || time > scope.request.proposition.checkout;
                    }
                }
            }

            function isInvalidDateReadOnly(date){
                var thisMonth = date._d.getMonth()+1;   // Months are 0 based
                var thisDate = date._d.getDate();
                var thisYear = date._d.getYear()+1900;   // Years are 1900 based

                var thisCompare = thisMonth +"/"+ thisDate +"/"+ thisYear;

                if(scope.start && !travelingDates.includes(thisCompare)){
                    return true;
                }
            }

            function checkClearInput(startDate, endDate, rangeLabel){
                scope.swapDates.error = false;
                // Compare the dates again.
                var clearInput = false;
                startDate = new Date(startDate).getTime();
                endDate = new Date(endDate).getTime();
                var chosenDates = getDatesBetween(startDate, endDate);
                for(var i = 0; i < chosenDates.length; i++){
                    var date = new Date(chosenDates[i]);
                    date._d = date; // for isInvalidDate
                    if(isInvalidDate(date)){
                        clearInput = true;
                        break;
                    }
                }

                // if accepting request check if the number of
                // nights chosen is within the proposed number of nights
                if(scope.request && !clearInput){
                    if(scope.request.proposition.rangeLabel == 'Date Range'){
                        clearInput = (chosenDates.length - 1)  < scope.request.proposition.startRange
                            || (chosenDates.length - 1) > scope.request.proposition.endRange;
                    }
                }

                // check if when choosing the weekend range, the range includes a weekend
                if(rangeLabel && rangeLabel == 'Weekends'){
                    if(chosenDates.length < 8){

                        element.data('daterangepicker').setStartDate(new Date(startDate));
                        element.data('daterangepicker').setEndDate(new Date(startDate + (8 * 24 * 60 * 60 * 1000)));

                        // To clear input field and keep calendar opened.
                        element.focus();
                        return;
                    }
                }

                // If a disabled date is in between the bounds, clear the range.
                if(clearInput){
                    scope.swapDates.error = true;

                    // To clear selected range (on the calendar).
                    var currentDate = new Date(startDate);
                    element.data('daterangepicker').setStartDate(currentDate);
                    element.data('daterangepicker').setEndDate(currentDate);

                    // To clear input field and keep calendar opened.
                    element.focus();

                }
                return clearInput;
            }

            function dateGreaterThan(first, second){
                var date_1 = new Date(first).setFullYear(new Date().getFullYear());
                var date_2 = new Date(second).setFullYear(new Date().getFullYear());

                return date_1 > date_2;

            }
        }
    };
});