var nodemailer = require('nodemailer');

var transporter;

var emailService = {

    init: function(){
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'info@swapshome.com',
                pass: 'ANightAtTheOpera1975'
            }
        });
    },

    sendMail: function(emails, subject, body){
        var mailOptions = {
            from: 'swaps@noreplay.com',
            to: emails,
            subject: subject,
            html: body
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if(err)
                console.log(err)
            else
                console.log(info);
        });
    }



};

module.exports = emailService;