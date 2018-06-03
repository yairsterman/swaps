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
        },
        link: function(scope, element, attrs, model) {

            var confirmedDates = [];
            var travelingDates = [];
            var today = (new Date()).getTime();
            var minDate = today;
            var maxDate = today;
            var openAllDates = scope.setUpSwap || false;

            if(scope.findTravel){ //from profile or set up swap page
                findTravelInfo();
            }
            else{ //from home page
                // setting daterangepicker causes date to default to today,
                // so save the dates that are set and override the defaults
                scope.currentDatesWhen = scope.swapDates.when;
                scope.currentDates = scope.swapDates.date;
                element.daterangepicker({
                    autoApply: true,
                    opens: 'center',
                    locale: {
                        format: scope.localeFormat
                    },
                    minDate: formatDate(new Date(minDate), scope.localeFormat),
                });
                element.on('apply.daterangepicker', function(ev, picker) {
                    scope.swapDates.when = picker.startDate.format(scope.modelFormat) + ' - ' + picker.endDate.format(scope.modelFormat);
                });
                scope.swapDates.when= scope.currentDatesWhen;
                scope.swapDates.date= scope.currentDates;
            }

            function setDates(){
                if(scope.setUpSwap){
                    // setting daterangepicker causes date to default to today,
                    // so save the dates that are set and override the defaults
                    scope.currentDates = scope.swapDates.dates;
                }
                if(!scope.userCity || !scope.profile.travelingInformation || scope.profile.travelingInformation.length === 0){
                    scope.notSwapping = true;
                    element.daterangepicker({
                        autoApply: true,
                        opens: 'left',
                        locale: {
                            format: scope.localeFormat
                        },
                        isInvalidDate: function(arg){
                            return isInvalidDate(arg);
                        },
                        minDate: minDate,
                        startDate: minDate,
                        endDate: minDate
                    });
                }
                else{
                    element.daterangepicker({
                        autoApply: true,
                        opens: 'left',
                        locale: {
                            format: scope.localeFormat
                        },
                        isInvalidDate: function(arg){
                            return isInvalidDate(arg);
                        },
                        startDate: minDate,
                        endDate: minDate,
                        minDate: minDate,
                        maxDate: maxDate
                    });
                }
                element.on('apply.daterangepicker', function(ev, picker) {
                    if(!checkClearInput(picker.startDate.format('MM/DD/YY'), picker.endDate.format('MM/DD/YY'))){
                        if(scope.setUpSwap){
                            scope.swapDates.when = picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY');
                        }
                        else{
                            scope.swapDates.from = picker.startDate.format(scope.modelFormat);
                            scope.swapDates.to = picker.endDate.format(scope.modelFormat);
                            if(scope.canSendRequest){
                                scope.canSendRequest.status = true;
                            }
                            scope.$apply();
                        }
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
                if(scope.userCity && scope.profile.travelingInformation && scope.profile.travelingInformation.length > 0){
                    for(var i = 0; i < scope.profile.travelingInformation.length; i++){
                        if(!scope.profile.travelingInformation[i].destination || (scope.profile.travelingInformation[i].destination && scope.profile.travelingInformation[i].destination.city == scope.userCity)){ // if cities match or user chose Anywhere as destination
                            if(!scope.profile.travelingInformation[i].departure){ // if user has chosen anytime then open all dates
                                openAllDates = true;
                                break;
                            }
                            if(minDate > scope.profile.travelingInformation[i].departure){ // find min date in travel info
                                minDate = scope.profile.travelingInformation[i].departure;
                                if(minDate < today){
                                    minDate = today;
                                }
                            }
                            if(maxDate < scope.profile.travelingInformation[i].returnDate){// find max date in travel info
                                maxDate = scope.profile.travelingInformation[i].returnDate
                            }
                            // add all traveling dates to array
                            travelingDates = travelingDates.concat(getDatesBetween(scope.profile.travelingInformation[i].departure, scope.profile.travelingInformation[i].returnDate));
                        }
                    }
                }
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
                        confirmedDates = confirmedDates.concat(getDatesBetween(request.departure, request.returnDate));
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
            }

            function checkClearInput(startDate, endDate){
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

                // If a disabled date is in between the bounds, clear the range.
                if(clearInput){

                    // To clear selected range (on the calendar).
                    var currentDate = new Date(startDate);
                    element.data('daterangepicker').setStartDate(currentDate);
                    element.data('daterangepicker').setEndDate(currentDate);

                    // To clear input field and keep calendar opened.
                    element.focus();

                }
                return clearInput;
            }
        }
    };
});