
const ACCOUNT = 'https://swapshome.com/account/edit';
const MY_SWAPS = 'https://swapshome.com/account/swaps';
const SIGNITURE = '<div style="width:65%;margin:50px auto;line-height: 1.4"><div><a style="text-decoration: none;cursor: pointer" href="https://swapshome.com">Swapshome.com</a></div>' +
    '<div>Tel Aviv, Israel</div></div>';


var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

var messages = {

    registration: function(user){
        return '<div style="width:65%;margin:auto;padding:3%;border-bottom: 1px solid rgba(199, 167, 104, 0.4);"> <div style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Welcome To Swaps </div></br>' +
        '<div style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Hey ' + user.firstName + ', thanks for joining Swaps. ' +
        'You are almost ready to start Swapping, be sure to complete your profile and add all the necessary information ' +
        'so you can request a Swap and allow users to view your profile. </div>' +
        '<a style="text-decoration: none;" href="' + ACCOUNT + '"><div style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 33%;margin-top: 20px;font-size: 20px; border-radius: 5px;">Complete Profile</div></a>' +
        '</div>' + SIGNITURE
    },

    confirmation: function(user, swapper, dates){
        return '<div style="width:65%;margin:auto;padding:3%;border-bottom: 1px solid rgba(199, 167, 104, 0.4);"> <div style="font-size:30px;font-weight:bold;color:#484848;margin-bottom:15px">Swap Confirmed!</div></br>' +
            '<div style="word-break:normal;line-height: 1.4;font-size: 18px;color: #484848;">Your Swap with ' + swapper.firstName + ' has been confirmed. </div>' +
            '<div style="word-break:normal;line-height: 1.4;font-size: 18px;color: #484848;">Arrival: ' + new Date(dates.departure).toLocaleDateString("en-US",options) + '</div>' +
            '<div style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Checkout: ' + new Date(dates.returnDate + 1000*60*60*24).toLocaleDateString("en-US",options) + '</div>' +
            '<div style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Address: ' + swapper.address + '</div><br>' +
            '<div style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">' + "Don't forget to give each other all the necessary information needed to access your homes. </div>" +
            '<div style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Have a pleasant Swap!</div>' +
            '<a style="text-decoration: none;" href="' + MY_SWAPS + '"><div style="text-decoration: none;padding: 15px;margin: auto;width: 33%;margin-top: 20px;font-size: 18px;">View my swaps</div></a>' +
            '</div>' + SIGNITURE
    }

}

module.exports = messages;