// configure dotenv
require('dotenv').config();

const express = require("express"),
      app = express(),
      bodyParser = require("body-parser"); 
      mongoose = require('mongoose'),
      passport = require('passport'),
      flash    =  require('connect-flash'),
      LocalStrategy = require('passport-local'),
      methodOverride = require('method-override'),
      Campground = require("./models/campground"),
      User = require('./models/user.js'),
      Comment = require("./models/comment.js"),
      seedDB = require("./seeds");

      // requiring routes
const commentRoutes = require('./routes/comments'),
      reviewRoutes     = require('./routes/reviews'),
      campgroundRoutes = require('./routes/campgrounds'),
      indexRoutes = require('./routes/index');


mongoose.connect("mongodb://localhost/yelpcamp_v8",{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify :false                                                                                  
}).then(() =>{
    console.log("connected to DB!");
}).catch(err =>{
    console.log(`DB ERROR ${err.message}`);
    process.exit(1);
});
app.use(bodyParser.urlencoded({ extended : true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());
app.locals.moment = require('moment');
// seedDB();

// PASSPORT CONFIGURATION
app.use(require('express-session')({
    secret : "Alpha 123",
    resave : false,
    saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res, next)=>{
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();  
});

app.use('/',indexRoutes);
app.use('/campgrounds/:id/comments',commentRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use('/campgrounds',campgroundRoutes);
 

app.listen(process.env.PORT || 3000, () =>{
    console.log("SERVER PORT 3000 IS LISTENING");
});