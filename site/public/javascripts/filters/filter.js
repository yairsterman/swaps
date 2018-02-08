angular.module('filters', [])
    .filter('fixPath', function () {
        return function(pathString) {
            return  pathString.replace(/\\/g,"/");
        }
    })
    .filter('searchMessages', function () {
        return function(items, term) {
            if(!term){
                return items;
            }
            term = term.toLowerCase();
            return items.filter(function(item){
                var found = false;
                if(item.name.toLowerCase().indexOf(term) != -1){
                    return true;
                }
                item.messages.some(function(message){
                    if(message.message.toLowerCase().indexOf(term) != -1) {
                        found = true;
                        return;
                    }
                });
                return found;
            });
        }
    })
    .filter('dateFilter', function () {
        return function(date) {
            var d = new Date();
            var td = new Date(date);
            d.setHours(0);
            d.setMinutes(0);
            d.setSeconds(0, 0);

            td.setHours(0);
            td.setMinutes(0);
            td.setSeconds(0, 0);

            if (d.getTime() == td.getTime())
                return "Today";
            else if (d.getTime() == td.getTime())
                return "Yesterday";
            return td.getDate() +'/'+ (td.getMonth() + 1) +'/'+ td.getFullYear();
        };
    });

