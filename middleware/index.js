const Campground = require('../models/campground');
const Comment = require('../models/comment');
const Review = require("../models/review");
let middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function (req, res, next){
    if(req.isAuthenticated()){
        //find Id
        Campground.findById(req.params.id, (err,foundCampground)=>{
            if(err || !foundCampground) {
                req.flash('error', 'Campground not found');
                res.redirect("back");
            } else {
                // Does user Own the campground
                //foundcampground.author.id is mongoose object 
                if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                }else {
                    req.flash('error', 'You do not have permission to do that');
                    res.redirect('back');
                }     
            }
        }) 
    } else{
        req.flash('error', 'You need to be Logged in to do that');
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function (req, res, next){
    if(req.isAuthenticated()){
        //find Id
        Comment.findById(req.params.comment_id, (err,foundComment)=>{
            if(err || !foundComment){
                req.flash('error', 'Comment is not found');
                res.redirect("back");
            }
            else {
                // Does user Own the campground
                //foundcampground.author.id is mongoose object 
                if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                }else {
                    req.flash('error', 'You do not have permission to do that');
                    res.redirect('back');
                }
                
            }
        }) 
    } else{
        req.flash('error', 'Yo need to be logged into do that');
        res.redirect("back");
    }
}

// middlewareObj.checkUserCampground = function (req, res, next){
//     Campground.findById(req.params.id, function(err, foundCampground){
//       if(err || !foundCampground){
//           console.log(err);
//           req.flash('error', 'Sorry, that campground does not exist!');
//           res.redirect('/campgrounds');
//       } else if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
//           req.campground = foundCampground;
//           next();
//       } else {
//           req.flash('error', 'You don\'t have permission to do that!');
//           res.redirect('/campgrounds/' + req.params.id);
//       }
//     });
//   }

// middlewareObj.checkUserComment = function(req, res, next){
//     Comment.findById(req.params.commentId, function(err, foundComment){
//        if(err || !foundComment){
//            console.log(err);
//            req.flash('error', 'Sorry, that comment does not exist!');
//            res.redirect('/campgrounds');
//        } else if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
//             req.comment = foundComment;
//             next();
//        } else {
//            req.flash('error', 'You don\'t have permission to do that!');
//            res.redirect('/campgrounds/' + req.params.id);
//        }
//     });
// }
middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'You need to be Logged in to do that');
    res.redirect("/login");
}

middlewareObj.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                res.redirect("back");
            }  else {
                // does user own the comment?
                if(foundReview.author.id.equals(req.user._id) || (req.user.isAdmin) ) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id).populate("reviews").exec(function (err, foundCampground) {
            if (err || !foundCampground) {
                req.flash("error", "Campground not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundCampground.reviews
                var foundUserReview = foundCampground.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/campgrounds/" + foundCampground._id);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};
module.exports = middlewareObj;