
const ACCOUNT = 'https://swapshome.com/account/edit';
const MY_SWAPS = 'https://swapshome.com/account/upcoming-swaps';
const SET_SWAPS = 'https://swapshome.com/account/set-up-swaps';
const SEARCH = 'https://swapshome.com/travelers/Anywhere';
const MESSAGES = 'https://swapshome.com/account/messages';
// const REVIEW = 'https://swapshome.com/review/get-data?token=';
const REVIEW = 'https://localhost:3000/review/get-data?token=';

const SIGNITURE = '<div class="swaps-signature" style="width:60vw;margin:50px auto;line-height: 1.4"><div><a class="no-decoration pointer" style="cursor:pointer;text-decoration: none;" href="https://swapshome.com">Swapshome.com</a></div>' +
    '<div>Tel Aviv, Israel</div></div>';
const STYLE = '<style type="text/css">' +
    '.swap-wrapper{width:60vw;margin:auto;padding:2vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4);}' +
    '.swap-title{text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px}' +
    '.swap-text{word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;}' +
    '.no-decoration{text-decoration: none;}' +
    '.swap-action-button{text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 230px;;margin-top: 20px;font-size: 20px; border-radius: 5px;}' +
    '.pointer{cursor:pointer}' +
    '.swaps-signature{60vw;margin:50px auto;line-height: 1.4}' +
    '@media (max-width: 564px){.swap-wrapper{width:90%}.title{font-size:24px;}.swap-text{font-size: 16px;}}'
    '</style>'


var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

var messages = {

    registration: function(user){
        return '<div class="swap-wrapper" style="width:60vw;margin:auto;padding:2vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4);"> <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Welcome To Swaps </div></br>' +
        '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Hey ' + user.firstName + ', thanks for joining Swaps. ' +
        'You are almost ready to start Swapping, be sure to complete your profile and add all the necessary information ' +
        'so you can request a Swap and allow users to view your profile. </div>' +
        '<a class="no-decoration" style="text-decoration: none;" href="' + ACCOUNT + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 230px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Complete Profile</div></a>' +
        '</div>' + SIGNITURE + STYLE
    },

    confirmation: function(user, swapper, dates){
        return '<div class="swap-wrapper" style="width:60vw;margin:auto;padding:2vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4);"> <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Swap Confirmed!</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Your Swap with ' + swapper.firstName + ' has been confirmed. </div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Arrival: ' + new Date(dates.departure).toLocaleDateString("en-US",options) + '</div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Checkout: ' + new Date(dates.returnDate + 1000*60*60*24).toLocaleDateString("en-US",options) + '</div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Address: ' + swapper.address + '</div><br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">' + "Don't forget to give each other all the necessary information needed to access your homes. </div>" +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Have a pleasant Swap!</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + MY_SWAPS + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 230px;margin-top: 20px;font-size: 20px; border-radius: 5px;">View upcoming swaps</div></a>' +
            '</div>' + SIGNITURE + STYLE
    },

    request: function(user, swapper, dates, nights, message){
        return '<div class="swap-wrapper" style="width:60vw;margin:auto;padding:2vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4);"> <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">New Swap Request!</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">' + swapper.firstName + ' from ' + swapper.city + ' has requested to Swap with you for ' + nights + (nights>1?' nights':' night') + '. </div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Arrival: ' + new Date(dates.departure).toLocaleDateString("en-US",options) + '</div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Checkout: ' + new Date(dates.returnDate).toLocaleDateString("en-US",options) + '</div>' +
            (message?'<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">'+swapper.firstName+ ' says: ' + '<div class="message" style="font-size: 18px; color:black;">"' + message +'"</div></div>':'') +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">' + "Be sure to replay as soon as possible in order to allow " + swapper.firstName + ' to plan accordingly.' + "</div>" +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Have a pleasant Swap!</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + MY_SWAPS + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 230px;margin-top: 20px;font-size: 20px; border-radius: 5px;">View upcoming swaps</div></a>' +
            '</div>' + SIGNITURE + STYLE
    },

    requestSent: function(user, swapper){
        return '<div class="swap-wrapper" style="width:60vw;margin:auto;padding:2vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4);"> <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Swap Request Sent</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Your Swap request to ' + swapper.firstName + ' has been sent</div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Check out your Swap request status</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + MY_SWAPS + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 230px;margin-top: 20px;font-size: 20px; border-radius: 5px;">View upcoming swaps</div></a>' +
            '</div>' + SIGNITURE + STYLE
    },

    canceled: function(user, swapper, message){
        return '<div class="swap-wrapper" style="width:60vw;margin:auto;padding:2vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4);"> <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Swap Canceled</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">We are sorry to inform you that your Swap with ' + swapper.firstName + ' has been canceled. </div>' +
            (message?'<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">'+swapper.firstName+ ' says: ' + '<div class="message" style="font-size: 18px; color:black;">"' + message +'"</div></div>':'') +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">If you are still planning on swapping between these dates you should <a href="'+ SET_SWAPS +'">update your swap dates.</div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Please continue searching for your perfect Swapper.</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + SEARCH + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 230px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Find Swap</div></a>' +
            '</div>' + SIGNITURE + STYLE
    },

    canceledSent: function(user, swapper){
        return '<div class="swap-wrapper" style="width:60vw;margin:auto;padding:2vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4);"> <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Swap Canceled</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">We have canceled your swap with ' + swapper.firstName + '. </div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">All payments and deposits will be returned to you.</div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Please continue searching for your perfect Swap.</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + SEARCH + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 230px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Find Swap</div></a>' +
            '</div>' + SIGNITURE + STYLE
    },

    declined: function(user, swapper, message){
        return '<div class="swap-wrapper" style="width:60vw;margin:auto;padding:2vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4);"> <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Swap Declined</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">We are sorry to inform you that your Swap with ' + swapper.firstName + ' has been declined. </div>' +
            (message?'<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">'+swapper.firstName+ ' says: ' + '<div class="message" style="font-size: 18px; color:black;">"' + message +'"</div></div>':'') +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Please continue searching for your perfect Swapper.</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + SEARCH + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 230px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Find Swap</div></a>' +
            '</div>' + SIGNITURE + STYLE
    },

    message: function(user, swapper){
        return '<div class="swap-wrapper" style="width:60vw;margin:auto;padding:2vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4);"> <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">New Message</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">You have a new message from ' + swapper.firstName + ' </div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">You can view this message in your Swaps inbox.</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + MESSAGES + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 230px;margin-top: 20px;font-size: 20px; border-radius: 5px;">My Messages</div></a>' +
            '</div>' + SIGNITURE + STYLE
    },

    eran: function(user, token){
        return '<div class="swap-wrapper" style="width:60vw;margin:auto;padding:2vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4);"> <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">How Was Your Swap? </div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Hey ' + user.firstName + ', hope you liked your swap please send a review.</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + REVIEW + token + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 230px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Review Swap</div></a>' +
            '</div>' + SIGNITURE + STYLE
    }
};

module.exports = messages;