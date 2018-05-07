let User = require('../models/User.js');
let Q = require('q');
let dateFormat = require('dateformat');
let email = require('../services/email.js');
let emailMessages = require('../services/email-messages.js');
let Data = require('../user_data/data.js');

let error = {
    error: true,
    message: ''
};

module.exports.saveMessage = function(senderId, recipientId, messageId, message, markedRead){
    var defferd = Q.defer();
    message.id = messageId;
    User.findOne({_id: senderId}, function (err, sender) {
        if (err){
            error.message = "Message not sent";
            defferd.reject(error);
        }
        else{
            if(sender._id){
                User.findOne({_id: recipientId}, function (err, user) {
                    if (err){
                        error.message = "Message not sent";
                        defferd.reject(error);
                    }
                    else{
                        if(user){
                            var messages = user.messages;
                            var index = -1;
                            // find messages by sender
                            for(var i = 0; i < messages.length; i++){
                                if(messages[i].id.toString() === sender._id.toString()){
                                    messages[i].messages.push(message);
                                    messages[i].read = markedRead;
                                    index = i;
                                    break;
                                }
                            }
                            // no messages found by that user, create new chat
                            if(index == -1){
                                messages.unshift({
                                    id: sender._id,
                                    image: sender.image,
                                    name: sender.firstName,
                                    read: markedRead,
                                    messages: [message]
                                });
                            }
                            User.update({_id: recipientId}, { $set: { messages: messages}}, function (err, updated) {
                                if (err){
                                    console.log("Message not sent" + err);
                                    error.message = "Message not sent";
                                    defferd.reject(error);
                                }
                                else{
                                    console.log("updated DB");
                                    defferd.resolve(user);
                                }
                            });
                        }
                        else{
                            error.message = "Message not sent";
                            defferd.reject(error);
                        }
                    }
                });
            }
        }
    });
    return defferd.promise;
};
