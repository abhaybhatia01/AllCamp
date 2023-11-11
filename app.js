if(process.env.NODE_ENV !=="production"){
    require('dotenv').config()
   
 }


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
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const fs = require('fs')

const campgroundRoutes =require('./routes/campgrounds');
const reviewRoutes =require('./routes/reviews');
const userRoutes = require('./routes/users');

const MongoDBStore= require("connect-mongo")(session);


const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/myapp' ;
mongoose.connect(dbUrl,{
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
app.use(
    mongoSanitize({
      replaceWith: '_',
    }),
  );

const secret = process.env.SECRET || 'thisshouldbebettersecret!';

const store = new MongoDBStore({
    url:dbUrl,
    secret,
    touchAfter:24*60*60
})
store.on("error",function(e){
    console.log('SESSION STORE ERROR', e)
})

const sessionConfig={
    store,
    name:'session',
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        // secure:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig));
app.use(flash());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css",

];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://api.mapbox.com/mapbox-gl-js/v2.9.2/mapbox-gl.js",
    "https://res.cloudinary.com/dxbvukq5a/",

];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dxbvukq5a/", 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);






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

// performance logs stuff
const logDir = path.join(__dirname, "/logs");
const logFile = path.join(logDir, "perf.log.csv");

// Setup logfile
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
if (!fs.existsSync(logFile)) {
  fs.writeFileSync(logFile, "time,url,dcl,load,fcp,lcp,cls,fid\n", { flag: "wx" });
}
// write log file
app.post("/api/perf",express.json({ type: "*/*" }),(req, res) => {
    const now = new Date().getTime() / 1000;
    const record = `${now},${req.body.url},${req.body.dcl},${req.body.load},${req.body.fcp},${req.body.lcp},${req.body.cls},${req.body.fid}`;
    console.log(record);
    
    // // Check if the file exists
    // if (fs.existsSync(logFile)) {
    //     // Read the file contents
    //     fs.readFile(logFile, 'utf8', (err, data) => {
    //         if (err) {
    //             console.error('Error reading the file:', err);
    //         } else {
    //             console.log('File contents:');
    //             console.log(logFile)
    //             console.log(data);
    //         }
    //     });
    // } else {
    //     console.error('File not found:', logFile);
    // }

    fs.appendFile(logFile, `${record}\n`, (err) => {
      if (err) {
        console.error(err);
        res.sendStatus(500);
      }
      else {
        res.sendStatus(200);
      }
    });
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

const port = process.env.PORT ||3000
app.listen(port,()=>{
    console.log(`http://localhost:${port}`)
})