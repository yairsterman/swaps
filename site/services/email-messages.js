let config = require('../config');
let utils = require('../utils/util');

const ACCOUNT = config.baseUrl + '/account/edit';
const MY_SWAPS = config.baseUrl + '/account/upcoming-swaps';
const SET_SWAPS = config.baseUrl + '/account/set-swap-dates';
const SEARCH = config.baseUrl + '/travelers/Anywhere';
const MESSAGES = config.baseUrl + '/account/messages/';
const LOGO = 'http://res.cloudinary.com/swaps/image/upload/v1529335715/logo/logo500.png';
const REVIEW = config.baseUrl + '/review/';
const VERIFY_EMAIL = config.baseUrl + '/verify-email/';
const INVITE_FRIENDS = config.baseUrl + '/invite-friends';
const PROFILE = config.baseUrl + '/profile/';


const SIGNITURE = '<div class="swaps-signature" style="padding:6vw;line-height: 1.4"><div><a class="no-decoration pointer" style="cursor:pointer;text-decoration: none;" href="https://swapshome.com">Swapshome.com</a></div>' +
    '<div>Tel Aviv, Israel</div></div>';
const INVITE = '<div class="swaps-invite" style="text-align:center; background: rgb(14,93,124); background: -moz-linear-gradient(-55deg, rgba(14,93,124,1) 40%, rgba(11,143,76,1) 100%);  background: -webkit-linear-gradient(-55deg, rgba(14,93,124,1) 40%,rgba(11,143,76,1) 100%); background: linear-gradient(145deg, rgba(14,93,124,1) 40%,rgba(11,143,76,1) 100%); padding:2vw 6vw;line-height: 1.4"><div><a class="no-decoration pointer" style="cursor:pointer;text-decoration: none;" href="'+INVITE_FRIENDS+'">'+
    '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 22px;color: #ffffff;">Get Swap Credits!</div>' +
    '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #ffffff;">Up to 2 Swap Credits for every friend you invite</div>' +
    '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #FACC5C;">Log in to invite friends</div>' +
    ' </a></div></div>';
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
        return '<div style="background-color: #f3f4f5; padding: 6vw;"><div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + '<div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Welcome To Swaps </div></br>' +
        '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Hey ' + user.firstName + ', thanks for joining Swaps. <br>' +
        'You are almost ready to start Swapping, be sure to complete your profile and add all the necessary information ' +
        'so you can request a Swap and allow users to view your profile.' +
        (token?'<br><br>Please verify your email bellow':'') + '</div>' +
        '<a class="no-decoration" style="text-decoration: none;" href="' + (token?VERIFY_EMAIL + token: ACCOUNT) + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">'+(token?'Verify Email':'Complete Profile')+'</div></a>' +
        '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },

    confirmation: function(user, swapper, dates, showAddress){
        return '<div style="background-color: #f3f4f5; padding: 6vw;"><div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Swap Confirmed!</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Your Swap with ' + swapper.firstName + ' has been confirmed. </div><br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Check in: <strong>' + new Date(dates.departure).toLocaleDateString("en-US",options) + '</strong></div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Check out: <strong>' + new Date(dates.returnDate).toLocaleDateString("en-US",options) + '</strong></div><br>' +
            (showAddress?'<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Address: <strong>' + swapper.address + '</strong></div><br>':'') +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">' + "Don't forget to give each other all the necessary information needed to access your homes. </div><br>" +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Have a pleasant Swap!</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + MY_SWAPS + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">View swaps</div></a>' +
            '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },

    request: function(user, swapper, dates, range, guests, message, oneWay){
        return '<div style="background-color: #f3f4f5; padding: 6vw;"><div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">New Swap Request!</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">' + swapper.firstName + ' from ' + swapper.city + ` has requested ${oneWay?'a one-way Swap at your home':'to Swap with you'} ` + utils.getRangeText(range) + '. </div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">From: <strong>' + new Date(dates.departure).toLocaleDateString("en-US",options) + '</strong></div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">To: <strong>' + new Date(dates.returnDate).toLocaleDateString("en-US",options) + '</strong></div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">' + swapper.firstName + ' will be arriving ' + (guests > 1?' with ' + (guests - 1) + ' other ' + (guests - 1 > 1?'guests':'guest'):' alone') +':</div>' +
            (message?'<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;"><br><div class="message" style="font-size: 18px; color:black;">"' + message +'"</div><br></div>':'') +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">' + "Be sure to reply as soon as possible in order to allow " + swapper.firstName + ' to plan accordingly.' + "</div>" +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Have a pleasant Swap!</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + MESSAGES + swapper._id +'"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Accept Swap</div></a>' +
            '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },

    requestAccepted: function(user, swapper, dates, guests, message){
        return '<div style="background-color: #f3f4f5; padding: 6vw;"><div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Swap request accepted</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">' + swapper.firstName + ' from ' + swapper.city + ' has accepted your swap request and finalized the dates. </div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Check in: <strong>' + new Date(dates.departure).toLocaleDateString("en-US",options) + '</strong></div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Check out: <strong>' + new Date(dates.returnDate).toLocaleDateString("en-US",options) + '</strong></div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">' + swapper.firstName + ' will be arriving ' + (guests > 1?' with ' + (guests - 1) + ' other ' + (guests - 1 > 1?'guests':'guest'):' alone') +':</div>' +
            (message?'<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;"><br><div class="message" style="font-size: 18px; color:black;">"' + message +'"</div><br></div>':'') +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">You must confirm the swap in order to complete the process, then you can start getting ready for your trip</div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Have a pleasant Swap!</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + MESSAGES  + swapper._id +'"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Confirm Swap</div></a>' +
            '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },

    requestAcceptanceSent: function(user, swapper, dates){
        return '<div style="background-color: #f3f4f5; padding: 6vw;"><div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Swap request accepted</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">You have accepted the swap request of ' + swapper.firstName +' from ' + swapper.city + '. </div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Check in: <strong>' + new Date(dates.departure).toLocaleDateString("en-US",options) + '</strong></div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Check out: <strong>' + new Date(dates.returnDate).toLocaleDateString("en-US",options) + '</strong></div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">We are now waiting for ' + swapper.firstName + ' to confirm the swap and then you\'ll be on your way.</div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;"></div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + MESSAGES  + swapper._id +'"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Request status</div></a>' +
            '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },

    requestSent: function(user, swapper){
        return '<div style="background-color: #f3f4f5; padding: 6vw;"><div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Swap Request Sent</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Your Swap request to ' + swapper.firstName + ' has been sent</div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Check out your Swap request status</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + MY_SWAPS + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">View swaps</div></a>' +
            '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },

    canceled: function(user, swapper, message){
        return '<div style="background-color: #f3f4f5; padding: 6vw;"><div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Swap Canceled</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">We are sorry to inform you that your Swap with ' + swapper.firstName + ' has been canceled. </div>' +
            (message?'<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">'+swapper.firstName+ ' says: ' + '<div class="message" style="font-size: 18px; color:black;">"' + message +'"</div></div>':'') +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">If you are still planning on swapping between these dates you should <a href="'+ SET_SWAPS +'">update your swap dates.</div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Please continue searching for your perfect Swapper.</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + SEARCH + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Find Swap</div></a>' +
            '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },

    canceledSent: function(user, swapper){
        return '<div style="background-color: #f3f4f5; padding: 6vw;"><div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Swap Canceled</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">We have canceled your swap with ' + swapper.firstName + '. </div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">All payments and deposits will be returned to you.</div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Please continue searching for your perfect Swap.</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + SEARCH + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Find Swap</div></a>' +
            '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },

    declined: function(user, swapper, message){
        return '<div style="background-color: #f3f4f5; padding: 6vw;"><div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Swap Declined</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">We are sorry to inform you that your Swap with ' + swapper.firstName + ' has been declined. </div>' +
            (message?'<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">'+swapper.firstName+ ' says: ' + '<div class="message" style="font-size: 18px; color:black;">"' + message +'"</div></div>':'') +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Please continue searching for your perfect Swapper.</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + SEARCH + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Find Swap</div></a>' +
            '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },

    message: function(user, swapper){
        return '<div style="background-color: #f3f4f5; padding: 6vw;"><div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">New Message</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">You have a new message from ' + swapper.firstName + ' </div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">You can view this message in your Swaps inbox.</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + MESSAGES + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">My Messages</div></a>' +
            '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },

    matchFound: function(user){
        return '<div style="background-color: #f3f4f5; padding: 6vw;"><div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Match Found!</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">You and another Swapper have liked each others homes,</div>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Why waste time? set up a Swap now.</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + PROFILE + user._id + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">View Swapper</div></a>' +
            '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },

    emailVerified: function(user){
        return '<div style="background-color: #f3f4f5; padding: 6vw;">' + '<div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Email Verified </div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Thank you, your email has been successfully verified.</div>' +
            '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },

    emailVerification: function(user, token){
        return '<div style="background-color: #f3f4f5; padding: 6vw;"><div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + '<div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Verify new email </div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Hey ' + user.firstName + ', we see you have changed your email address, <br>' +
            'Please verify that this is indeed your email. <br>' +
            'Verifying your email is mandatory in order to send and receive swap requests.' +
            '<br><br>Verify email bellow</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + VERIFY_EMAIL + token + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Verify Email</div></a>' +
            '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },

    passwordRecovery: function(user, password){
        return '<div style="background-color: #f3f4f5; padding: 6vw;">' + '<div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Password Recovery </div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">So you forgot your password...  <br>'+
            'Well, here is a new one for now:<br>' +
            `<strong>${password}<strong><br></div>` +
            '<a class="no-decoration" style="text-decoration: none;" href="' + config.baseUrl + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Go to site</div></a>' +
            '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },

    completeProfile: function(user, password){
        return '<div style="background-color: #f3f4f5; padding: 6vw;">' + '<div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Complete your profile </div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Hey ' + user.firstName + ', thanks for using Swaps. <br>'+
            'Well, here is a new one for now:<br>' +
            `<strong>${password}<strong><br></div>` +
            '<a class="no-decoration" style="text-decoration: none;" href="' + config.baseUrl + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Go to site</div></a>' +
            '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },

    review: function(user, token){
        return '<div style="background-color: #f3f4f5; padding: 6vw;">' + '<div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Review your Swap</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">We hope you enjoyed your Swap with ' + user.firstName + ' and the rest of your trip. <br><br>' +
            'Swaps is a community built on trust and mutual assistance, please take time to write a helpful review so other Swappers will know what to expect and ' + user.firstName + ' will know how your experience was.</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + REVIEW + token + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Review Swap</div></a>' +
            '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },

    reviewReminder: function(user, token){
        return '<div style="background-color: #f3f4f5; padding: 6vw;">' + '<div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Review your Swap</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">You still haven\'t given ' + user.firstName + ' a review.<br>Please take a moment to review your Swap<br><strong>If you do not complete your review by tomorrow you will miss your chance to review this Swap.</strong></div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + REVIEW + token + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Review Swap</div></a>' +
            '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },

    referralComplete: function(referrer, user){
        return '<div style="background-color: #f3f4f5; padding: 6vw;"><div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + '<div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Referral complete </div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Hey ' + referrer.firstName + ', Thanks for referring your friend '+user.firstName+' to Swaps<br>' +
            'we are glad to inform you that ' + user.firstName + ' has successfully posted their home!<br>' +
            '1 Swap Credit will be added to your credit.' +
            '<br><br>Keep on spreading the word!</div>' +
            '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },

    invitation: function(user, link){
        return '<div style="background-color: #f3f4f5; padding: 6vw;"><div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + '<div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Invitation to Swaps </div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">Hi there, your friend ' + user.firstName + ', invited you to join Swaps!<br>' +
            'You’ll get 1 Swap Credit when you post your home on Swaps.<br>' +
            user.firstName + ' will also get 1 Swap Credit.<br></div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + link + '"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Join</div></a>' +
            '</div>' + SIGNITURE + STYLE + '</div>'
    },

    userInterested: function(email, city){
        return '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">New user left his email: ' + email + ', searched for: '+ city+'</div>'
    },

    /**
     * Reminder emails
     */

    pendingRequestReminder: function(user, last){
        return '<div style="background-color: #f3f4f5; padding: 6vw;">' + '<div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Swap Request Pending</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">You still haven\'t responded to ' + user.firstName + '\'s swap request.<br>Please take a moment to respond so ' + user.firstName + ' can prepare accordingly.<br><strong>' + (last?'This is your last chance to respond to this request':'If you do not respond to this request within a week, we will automatically cancel the request') + '.</strong></div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + MESSAGES +  '/' + user._id +'"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Respond</div></a>' +
            '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },

    acceptedRequestReminder: function(user, last){
        return '<div style="background-color: #f3f4f5; padding: 6vw;">' + '<div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">Swap Request Unconfirmed</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">You haven\'t confirmed your swap with ' + user.firstName + '.<br>This swap can not take place until you confirm!<br>Please take a moment to confirm the swap.<br><strong>' + (last?'This is your last chance to confirm this swap':'If you do not confirm this swap within a week, we will automatically cancel the swap') + '.</strong></div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + MESSAGES +  '/' + user._id +'"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Respond</div></a>' +
            '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },

    confirmedRequestReminder: function(user, city, weeks, days, oneWay){
        let title = '';
        let text = '';
        switch(weeks){
            case 1:
                title = 'Scheduled Swap next week';
                text = `We are glad to remind you that you have a planned ${oneWay?'one way swap at your home':'swap in '+ city} coming up next week.` +
                    'If there is anything important you think your guest should know, now is the time to inform them.' +
                    'Here are some things you should make sure of when swapping homes: ' +
                    '<br><strong>1.</strong> Does your guest know how to find the place?' +
                    '<br><strong>2.</strong> Does your guest know how to enter your home? (e.i. keys, passwords)' +
                    '<br><strong>3.</strong> Did you make sure all essentials and facilities you offered are still available? (WiFi working, towels and sheets will be clean)';
                break;
            case 0:
                if(days == 3){
                    title = 'Getting ready for your swap';
                    text = `Only three days left! <br>We hope you already have everything ready for ${oneWay?'your guest':'your trip to ' + city}. ` +
                         `Make sure you\'ve exchanged all necessary details with your ${oneWay?'guest':'host'}`;
                }
                if(days == 1){
                    title = 'Last Preparations for Tomorrow';
                    text = `Nothing left to say but wish you a pleasant experience with ${user.firstName} ${oneWay?'':'and a great trip to '+ city}!`;
                }
                break;
        }
        return '<div style="background-color: #f3f4f5; padding: 6vw;">' + '<div class="swap-wrapper" style="text-align: center; padding:0 6vw 6vw 6vw;border-bottom: 1px solid rgba(199, 167, 104, 0.4); background-color: #ffffff;">' + TOP + ' <div class="swap-title" style="text-align:center;font-size:30px;font-weight:bold;color:#0E5D7C;margin-bottom:15px">'+ title + '</div></br>' +
            '<div class="swap-text" style="word-break: normal;line-height: 1.4;font-size: 18px;color: #484848;">' + text + '</div>' +
            '<a class="no-decoration" style="text-decoration: none;" href="' + MESSAGES +  '/' + user._id +'"><div class="swap-action-button" style="text-decoration: none;padding: 15px;color: white;text-align: center;margin: auto;background-color:#0E5D7C;width: 200px;margin-top: 20px;font-size: 20px; border-radius: 5px;">Message ' + user.firstName + '</div></a>' +
            '</div>' + INVITE + SIGNITURE + STYLE + '</div>'
    },
};


module.exports = messages;