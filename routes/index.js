const express=require('express');
const router=express.Router();
const Ticket=require('../models/ticket');
const Bags=require('../models/Bags');
const faker=require('faker');
var nodemailer = require('nodemailer');


var firebase=require('firebase');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'gstino060@gmail.com',
        pass: 'smart123!@#'
    }
});




firebase.initializeApp({
    serviceAccount: "testing-eb3a3f6683ae.json",
    databaseURL: "https://testing-200101.firebaseio.com/"

});

var ref=firebase.database().ref('sih');
var newRef = firebase.database().ref('EmailMap');

router.all('/*',(req,res,next)=>{

    req.app.locals.layout='main';
    next();

});

router.get('/',(req,res)=>{
    req.app.locals.layout='background';

    res.render('home');

});

router.get('/book',(req,res)=>{
    req.app.locals.layout='main';

    res.render('home');

});


router.post('/generate-ticket',(req,res)=> {

    let passenger=new Ticket();
    let ticket=new Ticket();

    ticket.passengerName=req.body.name;
    ticket.source=req.body.source;
    ticket.destination=req.body.destination;
    ticket.phoneNumber=req.body.number;
    ticket.BookingId=req.body.id;
    ticket.numberOfBags=req.body.numberOfBags;
    ticket.TicketNumber=faker.random.number();
    ticket.Email=req.body.PassengerEmail;
    ticket.save().then((newTicket)=>{

        //var messageRef=messagesRef.push();

        var messageKey=newTicket.TicketNumber;
        var numberOfBags=newTicket.numberOfBags;
        var payload={};
        var message={
            numberOfBags: numberOfBags,
            src: newTicket.source,
            dest: newTicket.destination,
            name: newTicket.passengerName


        };

        //payload['tickets/'+messageKey]=message;


        //console.log(messageRef.key);

       // ref.update(payload);

        var messagesRef=ref.child(messageKey);
        messagesRef.set(message);

        var mapRef = newRef.child(newTicket.TicketNumber);
        mapRef.set({email : newTicket.Email});

        var message2={

            1: { status: false},
            2: { status: false},
            3: { status: false}
        };


        for(var i=0;i<numberOfBags;i++){
            var childOfmessagesRef=messagesRef.child(i);
            var child=childOfmessagesRef.child('Status');
            child.set(message2);




        }


        // var messagesRefChild=messagesRef.child('status');
        // messagesRefChild.push({1:true});


        var emailMapping = firebase.database().ref('EmailMapping');
        var active=firebase.database().ref('Active');

        var obj={

            value: true,
            num_bags: numberOfBags,
            generated_num: messageKey

        };

        active.set(obj);

        console.log(newTicket.TicketNumber);
        console.log(newTicket.Email);
        var mailOptions = {
            from: 'gstino060@gmail.com',
            to: newTicket.Email,
            subject: 'Your booking id for ticket',
            text: newTicket.TicketNumber.toString()
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });


    });
    

    res.redirect('/book');
});




module.exports=router;
