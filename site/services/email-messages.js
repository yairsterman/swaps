let config = require('../config');

const ACCOUNT = config.baseUrl + '/account/edit';
const MY_SWAPS = config.baseUrl + '/account/upcoming-swaps';
const SET_SWAPS = config.baseUrl + '/account/set-up-swaps';
const SEARCH = config.baseUrl + '/travelers/Anywhere';
const MESSAGES = config.baseUrl + '/account/messages';
const LOGO = 'http://res.cloudinary.com/swaps/image/upload/v1529335715/logo/logo500.png';
const REVIEW = config.baseUrl + '/review/';
const VERIFY_EMAIL = config.baseUrl + '/verify-email/';


const SIGNITURE = '<div class="swaps-signature" style="padding:6vw;line-height: 1.4"><div><a class="no-decoration pointer" style="cursor:pointer;text-decoration: none;" href="https://swapshome.com">Swapshome.com</a></div>' +
    '<div>Tel Aviv, Israel</div></div>';
const TOP = `<div class="swaps-logo" style="width:100px; height: 100px; margin:auto; padding: 20px 0;"><img style="width:100px; height: 100px;" src="${LOGO}"></div>`;
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

    registration: function(user, token){
        return '<div style="background-color: #f3f4f5; padding: 6vw;"><div class="swap-wrapper" style="padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + '<div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Welcome To Swaps </div></br>' +
        '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Hey ' + user.firstName + ', thanks for joining Swaps. <br>' +
        'You are almost ready to start Swapping, be sure to complete your profile and add all the necessary information ' +
        'so you can request a Swap and allow users to view your profile.' +
        (token?'<br><br>Please verify your email bellow</div>':'') +
        '<a class="no-decoration" style="text-decoration: none;" href="' + (token?VERIFY_EMAIL + token: ACCOUNT) + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">'+(token?'Verify Email':'Complete Profile')+'</div></a>' +
        '</div>' + SIGNITURE + STYLE + '</div>'
    },

    confirmation: function(user, swapper, dates){
        return '<div style="background-color: #f3f4f5; padding: 6vw;">' + TOP + '<div class="swap-wrapper" style="padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Swap Confirmed!</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Your Swap with ' + swapper.firstName + ' has been confirmed. </div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Arrival: ' + new Date(dates.departure).toLocaleDateString("en-US",options) + '</div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Checkout: ' + new Date(dates.returnDate + 1000*60*60*24).toLocaleDateString("en-US",options) + '</div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Address: ' + swapper.address + '</div><br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">' + "Don't forget to give each other all the necessary information needed to access your homes. </div>" +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Have a pleasant Swap!</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + MY_SWAPS + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">View swaps</div></a>' +
            '</div>' + SIGNITURE + STYLE + '</div>'
    },

    request: function(user, swapper, dates, nights, message){
        return '<div style="background-color: #f3f4f5; padding: 6vw;">' + TOP + '<div class="swap-wrapper" style="padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">New Swap Request!</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">' + swapper.firstName + ' from ' + swapper.city + ' has requested to Swap with you for ' + nights + (nights>1?' nights':' night') + '. </div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Arrival: ' + new Date(dates.departure).toLocaleDateString("en-US",options) + '</div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Checkout: ' + new Date(dates.returnDate).toLocaleDateString("en-US",options) + '</div>' +
            (message?'<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">'+swapper.firstName+ ' says: ' + '<div class="message" style="font-size: 18px; color:black;">"' + message +'"</div></div>':'') +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">' + "Be sure to replay as soon as possible in order to allow " + swapper.firstName + ' to plan accordingly.' + "</div>" +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Have a pleasant Swap!</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + MY_SWAPS + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">View swaps</div></a>' +
            '</div>' + SIGNITURE + STYLE + '</div>'
    },

    requestSent: function(user, swapper){
        return '<div style="background-color: #f3f4f5; padding: 6vw;">' + TOP + '<div class="swap-wrapper" style="padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Swap Request Sent</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Your Swap request to ' + swapper.firstName + ' has been sent</div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Check out your Swap request status</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + MY_SWAPS + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">View swaps</div></a>' +
            '</div>' + SIGNITURE + STYLE + '</div>'
    },

    canceled: function(user, swapper, message){
        return '<div style="background-color: #f3f4f5; padding: 6vw;">' + TOP + '<div class="swap-wrapper" style="padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Swap Canceled</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">We are sorry to inform you that your Swap with ' + swapper.firstName + ' has been canceled. </div>' +
            (message?'<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">'+swapper.firstName+ ' says: ' + '<div class="message" style="font-size: 18px; color:black;">"' + message +'"</div></div>':'') +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">If you are still planning on swapping between these dates you should <a href="'+ SET_SWAPS +'">update your swap dates.</div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Please continue searching for your perfect Swapper.</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + SEARCH + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Find Swap</div></a>' +
            '</div>' + SIGNITURE + STYLE + '</div>'
    },

    canceledSent: function(user, swapper){
        return '<div style="background-color: #f3f4f5; padding: 6vw;">' + TOP + '<div class="swap-wrapper" style="padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Swap Canceled</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">We have canceled your swap with ' + swapper.firstName + '. </div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">All payments and deposits will be returned to you.</div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Please continue searching for your perfect Swap.</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + SEARCH + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Find Swap</div></a>' +
            '</div>' + SIGNITURE + STYLE + '</div>'
    },

    declined: function(user, swapper, message){
        return '<div style="background-color: #f3f4f5; padding: 6vw;">' + TOP + '<div class="swap-wrapper" style="padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Swap Declined</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">We are sorry to inform you that your Swap with ' + swapper.firstName + ' has been declined. </div>' +
            (message?'<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">'+swapper.firstName+ ' says: ' + '<div class="message" style="font-size: 18px; color:black;">"' + message +'"</div></div>':'') +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Please continue searching for your perfect Swapper.</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + SEARCH + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Find Swap</div></a>' +
            '</div>' + SIGNITURE + STYLE + '</div>'
    },

    message: function(user, swapper){
        return '<div style="background-color: #f3f4f5; padding: 6vw;">' + TOP + '<div class="swap-wrapper" style="padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">New Message</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">You have a new message from ' + swapper.firstName + ' </div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">You can view this message in your Swaps inbox.</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + MESSAGES + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">My Messages</div></a>' +
            '</div>' + SIGNITURE + STYLE + '</div>'
    },

    emailVerified: function(user){
        return '<div style="background-color: #f3f4f5; padding: 6vw;">' + '<div class="swap-wrapper" style="padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Email Verified </div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Thank you, your email has been successfully verified.</div>' +
            '</div>' + SIGNITURE + STYLE + '</div>'
    },

    emailVerification: function(user, token){
        return '<div style="background-color: #f3f4f5; padding: 6vw;"><div class="swap-wrapper" style="padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + '<div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Verify new email </div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Hey ' + user.firstName + ', we see you have changed your email address, <br>' +
            'Please verify that this is indeed your email. <br>' +
            'Verifying your email is mandatory in order to send and receive swap requests.' +
            '<br><br>Verify email bellow</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + VERIFY_EMAIL + token + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Verify Email</div></a>' +
            '</div>' + SIGNITURE + STYLE + '</div>'
    },

    passwordRecovery: function(user, password){
        return '<div style="background-color: #f3f4f5; padding: 6vw;">' + '<div class="swap-wrapper" style="padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Password Recovery </div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">So you forgot your password...  <br>'+
            'Well, here is a new one for now:<br>' +
            `<strong>${password}<strong><br></div>` +
            '<a class="no-decoration" style="text-decoration: none;" href="' + config.baseUrl + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Go to site</div></a>' +
            '</div>' + SIGNITURE + STYLE + '</div>'
    },

    review: function(user, token){
        return '<div style="background-color: #f3f4f5; padding: 6vw;">' + '<div class="swap-wrapper" style="padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">How Was Your Swap? </div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Hey ' + user.firstName + ', hope you liked your swap please send a review.</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + REVIEW + token + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Review Swap</div></a>' +
            '</div>' + SIGNITURE + STYLE + '</div>'
    },

    userInterested: function(email, city){
        return '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">New user left his email: ' + email + ', searched for: '+ city+'</div>'
    }
};

module.exports = messages;