//requires
const express=require('express');
const app=express();
const mongoose=require('mongoose');
const path=require('path');
const {mongoDbUrl}=require('./config/database');
const exphbs=require('express-handlebars');
const bodyParser=require('body-parser');


//use handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));


//body parser setup
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());




//add up promises
mongoose.Promise=global.Promise;

mongoose.connect(mongoDbUrl).then((db)=>{
    console.log('connected');
}).catch((err)=>{
    console.log(err);
});

//exphbs setup
app.use(express.static(path.resolve(__dirname,'public')));

//setup view engine
app.set('view engine','handlebars');

//load routes
const home=require('./routes/index');

app.use('/',home);

app.listen(3000,()=>{
    console.log('listening on port 3000');
});








