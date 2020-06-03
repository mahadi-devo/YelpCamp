const express = require('express'),
      router = express.Router(),
      passport = require('passport'),
      User = require('../models/user'),
      Campground = require('../models/campground'),
      async = require('async'),
      nodemailer = require('nodemailer'),
      crypto = require('crypto');

router.get("/", (req,res)=>{
    res.render('landing');
});

// About page
router.get("/about",(req, res)=>{
  res.render("about");
})

// show register form
router.get('/register',(req, res)=>{
    res.render('register', {page: 'register'});
});
// handle Sign Up Logic
router.post('/register',(req,res)=>{
    let newUser = new User({
        username : req.body.username,
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        email : req.body.email,
        avatar : req.body.avatar
    });
    if(req.body.adminCode === process.env.ADMIN_CODE){
        newUser.isAdmin = true;
    }
    if(req.body.password2 !== req.body.password){
        // req.flash('error', "Password does not match");
        return res.render("register", {"error": "Password does not match"});
    }
    User.register(newUser, req.body.password, (err, user) =>{
        if(err){
            console.log(err);
            return res.render("register", {"error": err.message});
            // req.flash('error', err.message);
            // return res.redirect('register');
        } 
        passport.authenticate('local')(req,res, ()=>{
            console.log(user);
            req.flash('success', 'Welcome to Yelpcamp ' + user.username);
            res.redirect('/campgrounds');
        });
        
    })
});

// Show Login Form
router.get('/login', (req,res)=>{
    res.render('login', {message : req.flash('error'), page : 'login'});
});
// Login logic
router.post('/login',passport.authenticate('local', 
    {
        successRedirect : '/campgrounds',
        failureRedirect : '/login',
        failureFlash: true
    }),(req, res)=>{
});
// Logout
router.get('/logout', (req,res)=>{
    req.logout();
    req.flash('success', 'Logged you out');
    res.redirect('/campgrounds');
});

// Users Profile
router.get('/users/:id', (req, res)=>{
    User.findById(req.params.id, (err, foundUser)=>{
        if(err){
            req.flash('error', "Something went wrong!");
            return res.redirect("/");
        }
        Campground.find().where('author.id').equals(foundUser._id).exec((err, campgrounds)=>{
            if(err){
                req.flash('error', "Something went wrong!");
                return res.redirect("/");
            }
            res.render('users/show', { user: foundUser, campgrounds : campgrounds });
        });
    });

});

// forgot password
router.get('/forgot', function(req, res) {
    res.render('forgot');
  });
  
  router.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'mahadihassanonline@gmail.com',
            pass: process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'mahadihassanonline@gmail.com',
          subject: 'Node.js Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          console.log('mail sent');
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });
  
  router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset', {token: req.params.token});
    });
  });
  
  router.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }
          if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
  
              user.save(function(err) {
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
            })
          } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect('back');
          }
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'mahadihassanonline@gmail.com',
            pass: process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'mahadihassanonline@mail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      res.redirect('/campgrounds');
    });
  });
  
module.exports = router;
