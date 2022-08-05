if(process.env.NODE_ENV !=="production"){
    require('dotenv').config()
   
 }


// console.log(process.env.CLOUDINARY_CLOUD_NAME)
// console.log(process.env.CLOUDINARY_KEY)
// console.log(process.env.CLOUDINARY_SECRET)
// console.log(process.env.MAPBOX_TOKEN)

const express = require('express');
const path = require('path');
const mongoose=require('mongoose');
const ejsMate =require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash')
const ExpressError =require('./utilities/ExpressError');
const methodOverride= require('method-override');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user')


const campgroundRoutes =require('./routes/campgrounds');
const reviewRoutes =require('./routes/reviews');
const userRoutes = require('./routes/users');



mongoose.connect('mongodb://localhost:27017/myapp',{
     useNewUrlParser:true,
     //useCreateIndex:true,
     useUnifiedTopology:true,
});

mongoose.connection.on("error",console.error.bind(console, "connection error:"));
mongoose.connection.once('open',()=>{
    console.log("database connected");
})

const app = express();

app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, 'views'));


app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));


app.use(express.static(path.join(__dirname,"public")))
const sessionConfig={
    secret:'thisshouldbebettersecret!',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize())
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())



app.use((req,res,next)=>{
    res.locals.currentUser= req.user;
   res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
   next();
})



app.use('/',userRoutes)
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)

app.get('/',(req,res)=>{
    res.render('home')
})


app.all('*', (req,res,next)=>{
    next(new ExpressError('Page Not Found', 404));
})

app.use((err,req,res,next)=>{
    const {statusCode = 500, message='Something Went Wrong'}= err;
    if(!err.message) err.message='Oh No, Something Went Wrong!!!'
    res.status(statusCode).render('error',{err});
})

app.listen(3000,()=>{
    console.log('serving on port 3000')
})