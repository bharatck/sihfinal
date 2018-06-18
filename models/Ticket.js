const mongoose=require('mongoose');

const Schema=mongoose.Schema;


const TicketSchema=new Schema({

    passengerName: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },

    phoneNumber: {
        type: String,
        required: true
    },
    BookingId: {
        type: String,
        required: true
    },
    TicketNumber: {
        type: Number,
        required: true
    },

    numberOfBags: {
        type: Number,
        required: true
    },
    Email: {
        type: String,
        required: true
    }

});


module.exports=mongoose.model('tickets', TicketSchema);
